
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
        'ETH': 'ethereum'
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
          'ethereum': 'ETH'
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

    // Get token prices for common tokens
    const prices = await fetchTokenPrices(['SOL', 'USDC', 'USDT'])

    // Check each token account for Meteora LP tokens
    for (const tokenAccount of tokenAccountsData.result.value) {
      const tokenInfo = tokenAccount.account.data.parsed.info
      const balance = parseFloat(tokenInfo.tokenAmount.uiAmount || 0)
      
      if (balance > 0) {
        // Try to fetch pool info from Meteora API
        try {
          const poolResponse = await fetch(`https://dlmm-api.meteora.ag/pair/${tokenInfo.mint}`)
          if (poolResponse.ok) {
            const poolData = await poolResponse.json()
            
            if (poolData && poolData.name) {
              // This is a Meteora LP token
              const [token1Symbol, token2Symbol] = poolData.name.split('-')
              
              // Calculate token amounts (simplified calculation)
              const token1Price = prices[token1Symbol] || 0
              const token2Price = prices[token2Symbol] || 0
              
              // Estimate token amounts based on pool reserves and LP token balance
              const totalSupply = poolData.supply || 1
              const poolValue = poolData.tvl || 0
              const lpTokenValue = (poolValue * balance) / totalSupply
              
              const token1Amount = lpTokenValue / 2 / token1Price
              const token2Amount = lpTokenValue / 2 / token2Price
              
              lpPositions.push({
                symbol: `${token1Symbol}-${token2Symbol} LP`,
                name: `Meteora ${poolData.name} LP`,
                balance: balance,
                usdValue: lpTokenValue,
                tokenAddress: tokenInfo.mint,
                isLpToken: true,
                platform: 'meteora',
                lpDetails: {
                  poolAddress: tokenInfo.mint,
                  token1: { 
                    symbol: token1Symbol, 
                    amount: token1Amount, 
                    usdValue: token1Amount * token1Price 
                  },
                  token2: { 
                    symbol: token2Symbol, 
                    amount: token2Amount, 
                    usdValue: token2Amount * token2Price 
                  },
                  priceRange: { 
                    min: poolData.current_price * 0.9, 
                    max: poolData.current_price * 1.1 
                  },
                  totalUsdValue: lpTokenValue
                }
              })
            }
          }
        } catch (error) {
          console.log(`Could not fetch pool data for ${tokenInfo.mint}:`, error)
        }
      }
    }

    return lpPositions
  } catch (error) {
    console.error('Error fetching Meteora LP positions:', error)
    return []
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
      const priceResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd')
      const priceData = await priceResponse.json()
      const solPrice = priceData.solana?.usd || 0
      
      balances.push({
        symbol: 'SOL',
        name: 'Solana',
        balance: solBalance,
        usdValue: solBalance * solPrice,
        isLpToken: false,
        platform: 'native'
      })
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
      for (const tokenAccount of tokenData.result.value) {
        const tokenInfo = tokenAccount.account.data.parsed.info
        const balance = parseFloat(tokenInfo.tokenAmount.uiAmount || 0)
        
        if (balance > 0) {
          balances.push({
            symbol: tokenInfo.mint.slice(0, 8) + '...',
            name: 'Unknown Token',
            balance: balance,
            usdValue: 0, // Would need additional API calls to get prices
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
      const priceResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd')
      const priceData = await priceResponse.json()
      const ethPrice = priceData.ethereum?.usd || 0
      
      balances.push({
        symbol: 'ETH',
        name: 'Ethereum',
        balance: ethBalance,
        usdValue: ethBalance * ethPrice,
        isLpToken: false,
        platform: 'native'
      })
    }

    return balances
  } catch (error) {
    console.error('Error fetching Ethereum balances:', error)
    return []
  }
}
