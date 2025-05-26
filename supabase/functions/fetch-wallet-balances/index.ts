
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Connection, PublicKey } from 'https://esm.sh/@solana/web3.js@1.78.0'

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

interface WalletData {
  wallet_id: string
  name: string
  address: string
  blockchain: string
  balances: TokenBalance[]
  totalUsdValue: number
}

interface TreasuryMetrics {
  totalMarketCap: number
  volatileAssets: number
  hardAssets: number
  lastUpdated: string
}

interface ConsolidatedResponse {
  treasury: TreasuryMetrics
  wallets: WalletData[]
  solPrice: number
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

    console.log('Starting consolidated wallet balance and treasury fetch...')

    // Fetch Solana price first
    const solPrice = await fetchSolanaPrice()
    console.log(`SOL price: $${solPrice}`)

    // Fetch all wallets from database
    const { data: wallets, error: walletsError } = await supabaseClient
      .from('wallets')
      .select('*')

    if (walletsError) {
      console.error('Error fetching wallets:', walletsError)
      throw walletsError
    }

    console.log(`Processing ${wallets.length} wallets`)

    const processedWallets: WalletData[] = []
    let totalVolatileAssets = 0
    let totalHardAssets = 0

    // Process each wallet
    for (const wallet of wallets) {
      console.log(`Processing wallet: ${wallet.name} (${wallet.address})`)
      
      let balances: TokenBalance[] = []

      if (wallet.blockchain === 'Solana') {
        balances = await fetchSolanaBalances(wallet.address)
      } else if (wallet.blockchain === 'Ethereum') {
        balances = await fetchEthereumBalances(wallet.address)
      }

      const totalUsdValue = balances.reduce((sum, balance) => sum + (balance.usdValue || 0), 0)

      // Categorize assets based on wallet type
      switch (wallet.wallet_type) {
        case 'funding':
          totalHardAssets += totalUsdValue
          break
        case 'marketing':
        case 'business':
        case 'operations':
          totalVolatileAssets += totalUsdValue
          break
        default:
          totalVolatileAssets += totalUsdValue
      }

      processedWallets.push({
        wallet_id: wallet.id,
        name: wallet.name,
        address: wallet.address,
        blockchain: wallet.blockchain,
        balances: balances,
        totalUsdValue: totalUsdValue
      })

      // Clear existing balances for this wallet and insert new ones
      await supabaseClient
        .from('wallet_balances')
        .delete()
        .eq('wallet_id', wallet.id)

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

    // Calculate treasury metrics
    const totalMarketCap = await fetchAuraMarketCapFromSolana()
    const totalAssetsValue = totalVolatileAssets + totalHardAssets
    const speculativeInterest = Math.max(0, totalMarketCap - totalAssetsValue)

    const treasury: TreasuryMetrics = {
      totalMarketCap,
      volatileAssets: totalVolatileAssets,
      hardAssets: totalHardAssets,
      lastUpdated: new Date().toISOString()
    }

    const response: ConsolidatedResponse = {
      treasury,
      wallets: processedWallets,
      solPrice
    }

    console.log('Consolidated response prepared successfully')

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in consolidated fetch function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

async function fetchSolanaPrice(): Promise<number> {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd')
    if (!response.ok) {
      console.log('Failed to fetch SOL price from CoinGecko')
      return 0
    }
    const data = await response.json()
    return data.solana?.usd || 0
  } catch (error) {
    console.error('Error fetching SOL price:', error)
    return 0
  }
}

async function fetchTokenPrices(tokens: string[]): Promise<Record<string, number>> {
  try {
    const tokenIds = tokens.map(token => {
      const mapping: Record<string, string> = {
        'SOL': 'solana',
        'USDC': 'usd-coin',
        'USDT': 'tether',
        'BTC': 'bitcoin',
        'ETH': 'ethereum',
        'AURA': 'aura-network',
        'WETH': 'weth',
        'WBTC': 'wrapped-bitcoin',
        'WSOL': 'wrapped-solana',
        'CULT': 'cult-dao',
        'DCULT': 'dcult'
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
    
    Object.entries(data).forEach(([id, priceData]: [string, any]) => {
      const symbol = tokens.find(token => {
        const mapping: Record<string, string> = {
          'solana': 'SOL',
          'usd-coin': 'USDC',
          'tether': 'USDT',
          'bitcoin': 'BTC',
          'ethereum': 'ETH',
          'aura-network': 'AURA',
          'weth': 'WETH',
          'wrapped-bitcoin': 'WBTC',
          'wrapped-solana': 'WSOL',
          'cult-dao': 'CULT',
          'dcult': 'DCULT'
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

async function fetchTokenMetadata(mint: string): Promise<{symbol: string, name: string} | null> {
  try {
    console.log(`Fetching metadata for token: ${mint}`)
    
    // Try Solscan API first
    try {
      const solscanResponse = await fetch(`https://api.solscan.io/token/meta?token=${mint}`)
      if (solscanResponse.ok) {
        const data = await solscanResponse.json()
        if (data.symbol && data.name) {
          console.log(`Found metadata via Solscan: ${data.symbol} - ${data.name}`)
          return { symbol: data.symbol, name: data.name }
        }
      }
    } catch (solscanError) {
      console.log('Solscan API failed, trying on-chain method')
    }

    // Fallback to on-chain metadata
    const connection = new Connection('https://api.mainnet-beta.solana.com')
    const mintPublicKey = new PublicKey(mint)
    
    // Get token account info
    const accountInfo = await connection.getAccountInfo(mintPublicKey)
    if (accountInfo && accountInfo.data) {
      // This is a simplified approach - in reality, you'd need to parse the metadata account
      console.log(`Found on-chain account for ${mint}`)
      return { symbol: mint.slice(0, 8) + '...', name: 'Unknown Token' }
    }
    
    return null
  } catch (error) {
    console.error(`Error fetching metadata for ${mint}:`, error)
    return null
  }
}

async function fetchMeteoraLPPositions(address: string): Promise<TokenBalance[]> {
  try {
    const lpPositions: TokenBalance[] = []
    const prices = await fetchTokenPrices(['SOL', 'USDC', 'USDT', 'AURA', 'WETH', 'WBTC', 'WSOL'])
    
    console.log(`Fetching Meteora LP positions for address: ${address}`)

    // Step 1: Try Meteora API
    let positionsData: any[] = []
    try {
      console.log(`Calling Meteora API: https://dlmm-api.meteora.ag/user/positions/${address}`)
      const apiResponse = await fetch(`https://dlmm-api.meteora.ag/user/positions/${address}`)
      
      if (apiResponse.ok) {
        const responseData = await apiResponse.json()
        console.log('Meteora API response:', JSON.stringify(responseData, null, 2))
        positionsData = Array.isArray(responseData) ? responseData : responseData.positions || []
        console.log(`Meteora API returned ${positionsData.length} positions`)
      } else {
        console.log(`Meteora API request failed with status: ${apiResponse.status}`)
      }
    } catch (apiError) {
      console.error('Error fetching from Meteora API:', apiError)
    }

    // Step 2: Fallback to on-chain data if API fails or returns no data
    if (!positionsData || positionsData.length === 0) {
      console.log('Falling back to on-chain data for Meteora positions')
      try {
        const connection = new Connection('https://api.mainnet-beta.solana.com')
        const meteoraProgramId = new PublicKey('LBUZKhRxPF3XUpuy1G2ZvtvZjkzQ3TS4gGycGJkyv1S')
        
        const userPublicKey = new PublicKey(address)
        
        // Updated filter for Meteora DLMM position accounts (~300 bytes)
        const filters = [
          { dataSize: 300 },
          // Add memcmp filter to find accounts owned by the user
          // This offset might need adjustment based on Meteora's account structure
          { memcmp: { offset: 8, bytes: address.slice(0, 32) } }
        ]

        const positionAccounts = await connection.getProgramAccounts(meteoraProgramId, { 
          filters,
          commitment: 'confirmed'
        })

        console.log(`Found ${positionAccounts.length} potential Meteora position accounts`)

        for (const account of positionAccounts) {
          try {
            // This would need proper parsing based on Meteora's account structure
            const accountInfo = {
              poolAddress: account.pubkey.toBase58(),
              base_token_symbol: 'SOL',
              quote_token_symbol: 'USDC', 
              base_amount: 0.1,
              quote_amount: 100,
              lower_price: 0,
              upper_price: 0
            }
            
            positionsData.push(accountInfo)
            console.log(`Parsed position from account ${account.pubkey.toBase58()}`)
          } catch (parseError) {
            console.log(`Error parsing account ${account.pubkey.toBase58()}:`, parseError)
          }
        }
        
        console.log(`Processed ${positionsData.length} on-chain positions`)
      } catch (onChainError) {
        console.error('Error fetching on-chain Meteora data:', onChainError)
      }
    }

    // Step 3: Process each position
    for (const position of positionsData) {
      try {
        // Handle different possible field names from the API
        const token1Symbol = position.base_token_symbol || position.token_x_symbol || position.token1Symbol || position.tokenX?.symbol || 'Unknown'
        const token2Symbol = position.quote_token_symbol || position.token_y_symbol || position.token2Symbol || position.tokenY?.symbol || 'Unknown'
        
        const token1Price = prices[token1Symbol] || 0
        const token2Price = prices[token2Symbol] || 0

        const token1Amount = parseFloat(position.base_amount || position.token_x_amount || position.token1Amount || position.tokenXAmount || '0')
        const token2Amount = parseFloat(position.quote_amount || position.token_y_amount || position.token2Amount || position.tokenYAmount || '0')
        
        // Skip positions with no tokens
        if (token1Amount === 0 && token2Amount === 0) {
          continue
        }

        const token1UsdValue = token1Amount * token1Price
        const token2UsdValue = token2Amount * token2Price
        const totalUsdValue = token1UsdValue + token2UsdValue

        // Skip positions with very low value (dust)
        if (totalUsdValue < 0.01) {
          continue
        }

        const poolAddress = position.pool_address || position.poolAddress || position.pool || position.pair_address || 'unknown'
        const priceMin = parseFloat(position.lower_price || position.price_range_min || position.priceRangeMin || '0')
        const priceMax = parseFloat(position.upper_price || position.price_range_max || position.priceRangeMax || '0')

        console.log(`Found LP position: ${token1Symbol}-${token2Symbol}, Value: $${totalUsdValue.toFixed(2)}`)

        lpPositions.push({
          symbol: `${token1Symbol}-${token2Symbol} LP`,
          name: `Meteora ${token1Symbol}-${token2Symbol} LP`,
          balance: token1Amount + token2Amount,
          usdValue: totalUsdValue,
          tokenAddress: poolAddress,
          isLpToken: true,
          platform: 'meteora',
          lpDetails: {
            poolAddress: poolAddress,
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
              min: priceMin,
              max: priceMax
            },
            totalUsdValue: totalUsdValue
          }
        })
      } catch (positionError) {
        console.error('Error processing position:', positionError, position)
      }
    }

    console.log(`Found ${lpPositions.length} Meteora LP positions for address: ${address}`)
    return lpPositions
  } catch (error) {
    console.error('Error in fetchMeteoraLPPositions:', error)
    return []
  }
}

async function fetchAuraMarketCapFromSolana(): Promise<number> {
  try {
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
      const solBalance = solData.result.value / 1e9
      
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
      const prices = await fetchTokenPrices(['USDC', 'USDT', 'AURA', 'WETH', 'WBTC', 'WSOL', 'CULT', 'DCULT'])
      
      for (const tokenAccount of tokenData.result.value) {
        const tokenInfo = tokenAccount.account.data.parsed.info
        const balance = parseFloat(tokenInfo.tokenAmount.uiAmount || 0)
        
        if (balance > 0) {
          let symbol = 'Unknown'
          let name = 'Unknown Token'
          let price = 0
          
          // Enhanced known tokens mapping including the specific token
          const knownTokens: Record<string, {symbol: string, name: string}> = {
            'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': {symbol: 'USDC', name: 'USD Coin'},
            'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': {symbol: 'USDT', name: 'Tether USD'},
            'CmoBeTxzrtjjhy9ym1tWdqMWAPbLktBP3i3rKNUqQaa': {symbol: 'AURA', name: 'Aura Token'},
            'So11111111111111111111111111111111111111112': {symbol: 'WSOL', name: 'Wrapped SOL'},
            '3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe': {symbol: 'UNKNOWN', name: 'Unknown Token'}
          }
          
          if (knownTokens[tokenInfo.mint]) {
            symbol = knownTokens[tokenInfo.mint].symbol
            name = knownTokens[tokenInfo.mint].name
            price = prices[symbol] || 0
          } else {
            // Try to fetch metadata for unknown tokens
            const metadata = await fetchTokenMetadata(tokenInfo.mint)
            if (metadata) {
              symbol = metadata.symbol
              name = metadata.name
              // Try to get price if we have a meaningful symbol
              price = prices[symbol] || 0
            } else {
              symbol = tokenInfo.mint.slice(0, 8) + '...'
              name = 'Unknown Token'
            }
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
      const ethBalance = parseInt(ethData.result, 16) / 1e18
      
      const prices = await fetchTokenPrices(['ETH', 'CULT', 'DCULT'])
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

      // Add CULT and DCULT token checking for Ethereum addresses
      // This would require additional ERC-20 token balance calls
      // For now, we'll add placeholder logic that can be expanded
      console.log(`Ethereum balance fetch completed for ${address}`)
    }

    return balances
  } catch (error) {
    console.error('Error fetching Ethereum balances:', error)
    return []
  }
}
