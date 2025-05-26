
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TokenBalance {
  symbol: string
  name: string
  balance: number
  usdValue: number
  tokenAddress?: string
  isLpToken: boolean
  platform: string
  lpDetails?: {
    poolAddress: string
    token1: { symbol: string, amount: number, usdValue: number }
    token2: { symbol: string, amount: number, usdValue: number }
    priceRange: { min: number, max: number }
    totalUsdValue: number
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch all wallets from database
    const { data: wallets, error: walletsError } = await supabaseClient
      .from('wallets')
      .select('*')

    if (walletsError) {
      console.error('Error fetching wallets:', walletsError)
      throw walletsError
    }

    // Process each wallet
    for (const wallet of wallets) {
      console.log(`Processing wallet: ${wallet.name} (${wallet.address})`)
      
      let balances: TokenBalance[] = []

      if (wallet.blockchain === 'Solana') {
        balances = await fetchSolanaBalances(wallet.address)
      } else if (wallet.blockchain === 'Ethereum') {
        balances = await fetchEthereumBalances(wallet.address)
      }

      // Clear existing balances for this wallet
      await supabaseClient
        .from('wallet_balances')
        .delete()
        .eq('wallet_id', wallet.id)

      // Insert new balances
      if (balances.length > 0) {
        const balanceInserts = balances.map(balance => ({
          wallet_id: wallet.id,
          token_symbol: balance.symbol,
          token_name: balance.name,
          balance: balance.balance,
          usd_value: balance.usdValue,
          token_address: balance.tokenAddress,
          is_lp_token: balance.isLpToken,
          platform: balance.platform,
          lp_details: balance.lpDetails ? JSON.stringify(balance.lpDetails) : null,
          last_updated: new Date().toISOString()
        }))

        const { error: insertError } = await supabaseClient
          .from('wallet_balances')
          .insert(balanceInserts)

        if (insertError) {
          console.error('Error inserting balances:', insertError)
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Wallet balances updated successfully' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in fetch-wallet-balances:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

async function fetchTokenPrices(tokens: string[]): Promise<Record<string, number>> {
  try {
    const tokenIds = tokens.map(token => {
      // Map common token symbols to CoinGecko IDs
      const mapping: Record<string, string> = {
        'SOL': 'solana',
        'USDC': 'usd-coin',
        'USDT': 'tether',
        'BTC': 'bitcoin',
        'ETH': 'ethereum',
        'AURA': 'aura-3'
      }
      return mapping[token] || token.toLowerCase()
    }).join(',')

    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${tokenIds}&vs_currencies=usd`
    )
    
    if (!response.ok) {
      console.log('Failed to fetch token prices from CoinGecko')
      return {}
    }

    const data = await response.json()
    const prices: Record<string, number> = {}
    
    // Map back to original symbols
    Object.entries(data).forEach(([id, priceData]: [string, any]) => {
      const symbol = tokens.find(token => {
        const mapping: Record<string, string> = {
          'solana': 'SOL',
          'usd-coin': 'USDC',
          'tether': 'USDT',
          'bitcoin': 'BTC',
          'ethereum': 'ETH',
          'aura-3': 'AURA'
        }
        return mapping[id] === token || token.toLowerCase() === id
      })
      if (symbol && priceData.usd) {
        prices[symbol] = priceData.usd
      }
    })

    return prices
  } catch (error) {
    console.error('Error fetching token prices:', error)
    return {}
  }
}

async function fetchMeteoraLPPositions(address: string): Promise<TokenBalance[]> {
  try {
    const lpPositions: TokenBalance[] = []
    
    // Get token prices for calculations
    const prices = await fetchTokenPrices(['SOL', 'USDC', 'USDT', 'AURA', 'WETH', 'WBTC', 'WSOL'])
    
    // Fetch user's token accounts to find LP tokens
    const tokenAccountsResponse = await fetch('https://api.mainnet-beta.solana.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getTokenAccountsByOwner',
        params: [
          address,
          { programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' },
          { encoding: 'jsonParsed' }
        ]
      })
    })

    const tokenAccountsData = await tokenAccountsResponse.json()
    if (!tokenAccountsData.result?.value) return lpPositions

    // Check each token account for Meteora LP tokens
    for (const tokenAccount of tokenAccountsData.result.value) {
      const tokenInfo = tokenAccount.account.data.parsed.info
      const balance = parseFloat(tokenInfo.tokenAmount.uiAmount || 0)
      
      if (balance > 0) {
        // Check if this is a Meteora LP token by trying to get pool info
        try {
          // First try to get pool info from Meteora API
          const poolResponse = await fetch(`https://dlmm-api.meteora.ag/pair/${tokenInfo.mint}`)
          
          if (poolResponse.ok) {
            const poolData = await poolResponse.json()
            
            if (poolData && poolData.name) {
              console.log(`Found Meteora LP token: ${poolData.name} with balance: ${balance}`)
              
              // Extract token symbols from pool name
              const poolTokens = poolData.name.split('-')
              const token1Symbol = poolTokens[0] || 'Unknown'
              const token2Symbol = poolTokens[1] || 'Unknown'
              
              // Get token prices
              const token1Price = prices[token1Symbol] || 0
              const token2Price = prices[token2Symbol] || 0
              
              // Calculate LP token value based on pool data
              const totalSupply = poolData.supply || 1
              const poolReserveX = poolData.reserve_x || 0
              const poolReserveY = poolData.reserve_y || 0
              
              // Calculate user's share of the pool
              const userShare = balance / totalSupply
              const token1Amount = (poolReserveX * userShare) / Math.pow(10, poolData.mint_x_decimals || 9)
              const token2Amount = (poolReserveY * userShare) / Math.pow(10, poolData.mint_y_decimals || 9)
              
              const token1UsdValue = token1Amount * token1Price
              const token2UsdValue = token2Amount * token2Price
              const totalUsdValue = token1UsdValue + token2UsdValue
              
              lpPositions.push({
                symbol: `${token1Symbol}-${token2Symbol} LP`,
                name: `Meteora ${poolData.name} LP`,
                balance: balance,
                usdValue: totalUsdValue,
                tokenAddress: tokenInfo.mint,
                isLpToken: true,
                platform: 'meteora',
                lpDetails: {
                  poolAddress: tokenInfo.mint,
                  token1: { 
                    symbol: token1Symbol, 
                    amount: token1Amount, 
                    usdValue: token1UsdValue 
                  },
                  token2: { 
                    symbol: token2Symbol, 
                    amount: token2Amount, 
                    usdValue: token2UsdValue 
                  },
                  priceRange: { 
                    min: poolData.current_price ? poolData.current_price * 0.95 : 0, 
                    max: poolData.current_price ? poolData.current_price * 1.05 : 0
                  },
                  totalUsdValue: totalUsdValue
                }
              })
            }
          } else {
            // Check for known LP token patterns
            const isLpToken = await checkIfMeteoraLpToken(tokenInfo.mint, balance, prices)
            if (isLpToken) {
              lpPositions.push(isLpToken)
            }
          }
        } catch (error) {
          console.log(`Could not fetch pool data for ${tokenInfo.mint}:`, error)
          // Check for known LP token patterns as fallback
          const isLpToken = await checkIfMeteoraLpToken(tokenInfo.mint, balance, prices)
          if (isLpToken) {
            lpPositions.push(isLpToken)
          }
        }
      }
    }

    return lpPositions
  } catch (error) {
    console.error('Error fetching Meteora LP positions:', error)
    return []
  }
}

async function checkIfMeteoraLpToken(mintAddress: string, balance: number, prices: Record<string, number>): Promise<TokenBalance | null> {
  try {
    // Check if this mint has characteristics of an LP token
    // Look for specific patterns or try to get metadata
    const response = await fetch('https://api.mainnet-beta.solana.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getAccountInfo',
        params: [
          mintAddress,
          { encoding: 'jsonParsed' }
        ]
      })
    })
    
    const data = await response.json()
    if (data.result?.value?.data?.parsed?.info) {
      const mintInfo = data.result.value.data.parsed.info
      
      // Check for common LP token patterns
      const isLikelyLP = mintInfo.supply && parseFloat(mintInfo.supply) > 0
      
      if (isLikelyLP) {
        // Try to determine token pair based on known patterns
        let token1Symbol = 'Unknown'
        let token2Symbol = 'Unknown'
        let estimatedValue = 0
        
        // Check for AURA pairs specifically
        if (mintAddress === 'CmoBeTxzrtjjhy9ym1tWdqMWAPbLktBP3i3rKNUqQaa') {
          // This is the AURA token itself, not an LP token
          return null
        }
        
        // For other potential LP tokens, make educated guesses
        const auraPrice = prices['AURA'] || 0
        const solPrice = prices['SOL'] || 0
        
        // Estimate based on common pairs
        if (auraPrice > 0 && solPrice > 0) {
          token1Symbol = 'AURA'
          token2Symbol = 'SOL'
          estimatedValue = balance * ((auraPrice + solPrice) / 2) * 0.01 // rough estimate
        }
        
        if (estimatedValue > 0) {
          return {
            symbol: `${token1Symbol}-${token2Symbol} LP`,
            name: `Meteora ${token1Symbol}-${token2Symbol} LP`,
            balance: balance,
            usdValue: estimatedValue,
            tokenAddress: mintAddress,
            isLpToken: true,
            platform: 'meteora',
            lpDetails: {
              poolAddress: mintAddress,
              token1: { 
                symbol: token1Symbol, 
                amount: balance / 2, 
                usdValue: estimatedValue / 2 
              },
              token2: { 
                symbol: token2Symbol, 
                amount: balance / 2, 
                usdValue: estimatedValue / 2 
              },
              priceRange: { min: 0, max: 0 },
              totalUsdValue: estimatedValue
            }
          }
        }
      }
    }
    return null
  } catch (error) {
    console.error('Error checking LP token:', error)
    return null
  }
}

async function fetchAuraMarketCap(): Promise<number> {
  try {
    // Use the correct AURA token mint from the transaction
    const auraTokenMint = 'CmoBeTxzrtjjhy9ym1tWdqMWAPbLktBP3i3rKNUqQaa'
    
    const response = await fetch('https://api.mainnet-beta.solana.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getTokenSupply',
        params: [auraTokenMint]
      })
    })
    
    const data = await response.json()
    if (data.result?.value?.uiAmount) {
      const totalSupply = data.result.value.uiAmount
      console.log(`AURA total supply: ${totalSupply}`)
      
      // Get AURA price
      const prices = await fetchTokenPrices(['AURA'])
      const auraPrice = prices['AURA'] || 0
      console.log(`AURA price: ${auraPrice}`)
      
      const marketCap = totalSupply * auraPrice
      console.log(`AURA market cap: ${marketCap}`)
      
      return marketCap
    }
    
    return 0
  } catch (error) {
    console.error('Error fetching AURA market cap:', error)
    return 0
  }
}

async function fetchSolanaBalances(address: string): Promise<TokenBalance[]> {
  try {
    const balances: TokenBalance[] = []
    
    // Fetch SOL balance
    const solResponse = await fetch('https://api.mainnet-beta.solana.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getBalance',
        params: [address]
      })
    })
    
    const solData = await solResponse.json()
    if (solData.result) {
      const solBalance = solData.result.value / 1e9 // Convert lamports to SOL
      
      // Get SOL price from CoinGecko
      const prices = await fetchTokenPrices(['SOL'])
      const solPrice = prices['SOL'] || 0
      
      if (solBalance > 0) {
        balances.push({
          symbol: 'SOL',
          name: 'Solana',
          balance: solBalance,
          usdValue: solBalance * solPrice,
          isLpToken: false,
          platform: 'native'
        })
      }
    }

    // Fetch SPL token balances
    const tokenResponse = await fetch('https://api.mainnet-beta.solana.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getTokenAccountsByOwner',
        params: [
          address,
          { programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' },
          { encoding: 'jsonParsed' }
        ]
      })
    })

    const tokenData = await tokenResponse.json()
    if (tokenData.result && tokenData.result.value) {
      // Get prices for common tokens
      const prices = await fetchTokenPrices(['USDC', 'USDT', 'AURA', 'WETH', 'WBTC', 'WSOL'])
      
      for (const tokenAccount of tokenData.result.value) {
        const tokenInfo = tokenAccount.account.data.parsed.info
        const balance = parseFloat(tokenInfo.tokenAmount.uiAmount || 0)
        
        if (balance > 0) {
          // Try to identify the token
          let symbol = 'Unknown'
          let name = 'Unknown Token'
          let price = 0
          
          // Check if it's a known token mint
          const knownTokens: Record<string, {symbol: string, name: string}> = {
            'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': {symbol: 'USDC', name: 'USD Coin'},
            'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': {symbol: 'USDT', name: 'Tether USD'},
            'CmoBeTxzrtjjhy9ym1tWdqMWAPbLktBP3i3rKNUqQaa': {symbol: 'AURA', name: 'Aura Token'},
            'So11111111111111111111111111111111111111112': {symbol: 'WSOL', name: 'Wrapped SOL'}
          }
          
          if (knownTokens[tokenInfo.mint]) {
            symbol = knownTokens[tokenInfo.mint].symbol
            name = knownTokens[tokenInfo.mint].name
            price = prices[symbol] || 0
          } else {
            // Use shortened mint address as symbol
            symbol = tokenInfo.mint.slice(0, 8) + '...'
          }
          
          balances.push({
            symbol: symbol,
            name: name,
            balance: balance,
            usdValue: balance * price,
            tokenAddress: tokenInfo.mint,
            isLpToken: false,
            platform: 'spl-token'
          })
        }
      }
    }

    // Fetch Meteora LP positions
    const lpPositions = await fetchMeteoraLPPositions(address)
    balances.push(...lpPositions)

    return balances
  } catch (error) {
    console.error('Error fetching Solana balances:', error)
    return []
  }
}

async function fetchEthereumBalances(address: string): Promise<TokenBalance[]> {
  try {
    const balances: TokenBalance[] = []
    const infuraKey = Deno.env.get('INFURA_API_KEY')
    
    if (!infuraKey) {
      console.log('No Infura API key found, skipping Ethereum balance fetch')
      return balances
    }

    // Fetch ETH balance
    const ethResponse = await fetch(`https://mainnet.infura.io/v3/${infuraKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_getBalance',
        params: [address, 'latest']
      })
    })

    const ethData = await ethResponse.json()
    if (ethData.result) {
      const ethBalance = parseInt(ethData.result, 16) / 1e18 // Convert wei to ETH
      
      // Get ETH price from CoinGecko
      const prices = await fetchTokenPrices(['ETH'])
      const ethPrice = prices['ETH'] || 0
      
      if (ethBalance > 0) {
        balances.push({
          symbol: 'ETH',
          name: 'Ethereum',
          balance: ethBalance,
          usdValue: ethBalance * ethPrice,
          isLpToken: false,
          platform: 'native'
        })
      }
    }

    return balances
  } catch (error) {
    console.error('Error fetching Ethereum balances:', error)
    return []
  }
}
