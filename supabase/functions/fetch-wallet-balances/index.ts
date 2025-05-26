
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

    // Fetch Solana price first with better error handling
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

      try {
        if (wallet.blockchain === 'Solana') {
          balances = await fetchSolanaBalances(wallet.address)
        } else if (wallet.blockchain === 'Ethereum') {
          balances = await fetchEthereumBalances(wallet.address)
        }
      } catch (error) {
        console.error(`Error fetching balances for wallet ${wallet.name}:`, error)
        balances = [] // Continue with empty balances rather than failing
      }

      const totalUsdValue = balances.reduce((sum, balance) => sum + (balance.usdValue || 0), 0)

      // Categorize assets based on wallet type
      if (wallet.wallet_type === 'funding') {
        totalHardAssets += totalUsdValue
      } else {
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

    // Calculate treasury metrics with improved AURA market cap
    const totalMarketCap = await fetchAuraMarketCapFromSolana()
    const totalAssetsValue = totalVolatileAssets + totalHardAssets

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
    console.log(`Total market cap: ${totalMarketCap}, Volatile: ${totalVolatileAssets}, Hard: ${totalHardAssets}`)

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
    console.log('Fetching SOL price from CoinGecko...')
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd', {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; TreasuryBot/1.0)'
      }
    })
    
    if (!response.ok) {
      console.log(`CoinGecko SOL price API failed with status: ${response.status}`)
      return 180 // Fallback price
    }
    
    const data = await response.json()
    const price = data.solana?.usd || 180
    console.log(`Successfully fetched SOL price: ${price}`)
    return price
  } catch (error) {
    console.error('Error fetching SOL price:', error)
    return 180 // Fallback price
  }
}

async function fetchTokenPrices(tokens: string[]): Promise<Record<string, number>> {
  try {
    console.log(`Fetching prices for tokens: ${tokens.join(', ')}`)
    await new Promise(resolve => setTimeout(resolve, 1000)) // Longer delay to avoid rate limiting
    
    const tokenIds = tokens.map(token => {
      const mapping: Record<string, string> = {
        'SOL': 'solana',
        'USDC': 'usd-coin',
        'USDT': 'tether',
        'BTC': 'bitcoin',
        'ETH': 'ethereum',
        'AURA': 'aurad', // Correct CoinGecko ID for AURA
        'WETH': 'weth',
        'WBTC': 'wrapped-bitcoin',
        'WSOL': 'wrapped-solana',
        'CULT': 'cult-dao',
        'DCULT': 'dcult'
      }
      return mapping[token] || token.toLowerCase()
    }).join(',')

    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${tokenIds}&vs_currencies=usd`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; TreasuryBot/1.0)'
        }
      }
    )
    
    if (!response.ok) {
      console.log(`CoinGecko token prices API failed with status: ${response.status}`)
      return getFallbackPrices()
    }

    const data = await response.json()
    const prices: Record<string, number> = {}
    
    Object.entries(data).forEach(([id, priceData]: [string, any]) => {
      const symbol = getSymbolFromId(id)
      if (symbol && priceData.usd) {
        prices[symbol] = priceData.usd
        console.log(`Price for ${symbol}: $${priceData.usd}`)
      }
    })

    // Fill in any missing prices with fallbacks
    const fallbacks = getFallbackPrices()
    tokens.forEach(token => {
      if (!prices[token] && fallbacks[token]) {
        prices[token] = fallbacks[token]
        console.log(`Using fallback price for ${token}: $${fallbacks[token]}`)
      }
    })

    return prices
  } catch (error) {
    console.error('Error fetching token prices:', error)
    return getFallbackPrices()
  }
}

function getSymbolFromId(id: string): string | null {
  const reverseMapping: Record<string, string> = {
    'solana': 'SOL',
    'usd-coin': 'USDC',
    'tether': 'USDT',
    'bitcoin': 'BTC',
    'ethereum': 'ETH',
    'aurad': 'AURA',
    'weth': 'WETH',
    'wrapped-bitcoin': 'WBTC',
    'wrapped-solana': 'WSOL',
    'cult-dao': 'CULT',
    'dcult': 'DCULT'
  }
  return reverseMapping[id] || null
}

function getFallbackPrices(): Record<string, number> {
  return {
    'SOL': 180,
    'USDC': 1,
    'USDT': 1,
    'AURA': 0.015,
    'ETH': 3000,
    'WETH': 3000,
    'WBTC': 42000,
    'WSOL': 180,
    'CULT': 0.000001,
    'DCULT': 0.000001
  }
}

async function fetchTokenMetadata(mint: string): Promise<{symbol: string, name: string} | null> {
  try {
    console.log(`Fetching metadata for token: ${mint}`)
    
    // Enhanced known tokens mapping with better fallbacks
    const knownTokens: Record<string, {symbol: string, name: string}> = {
      'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': {symbol: 'USDC', name: 'USD Coin'},
      'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': {symbol: 'USDT', name: 'Tether USD'},
      'AURYydfxJib1ZkTir1Jn1J9ECnpjNzasxqcooGdh1V1': {symbol: 'AURA', name: 'Aura Network'},
      'So11111111111111111111111111111111111111112': {symbol: 'WSOL', name: 'Wrapped SOL'},
      '3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe': {symbol: 'UNK', name: 'Unknown Token'}
    }
    
    // Check known tokens first
    if (knownTokens[mint]) {
      console.log(`Found token in known tokens: ${knownTokens[mint].symbol}`)
      return knownTokens[mint]
    }
    
    // Try multiple sources for metadata
    let metadata = await tryJupiterApi(mint)
    if (metadata) return metadata
    
    metadata = await trySolscanApi(mint)
    if (metadata) return metadata
    
    metadata = await tryOnChainMetadata(mint)
    if (metadata) return metadata
    
    // Final fallback
    console.log(`Could not fetch metadata for ${mint}, using generic fallback`)
    return { 
      symbol: `${mint.slice(0, 4)}...${mint.slice(-4)}`, 
      name: 'Unknown Token' 
    }
  } catch (error) {
    console.error(`Error fetching metadata for ${mint}:`, error)
    return { symbol: 'UNK', name: 'Unknown Token' }
  }
}

async function tryJupiterApi(mint: string): Promise<{symbol: string, name: string} | null> {
  try {
    await new Promise(resolve => setTimeout(resolve, 200))
    const response = await fetch(`https://quote-api.jup.ag/v6/tokens/${mint}`)
    
    if (response.ok) {
      const data = await response.json()
      if (data.symbol && data.name) {
        console.log(`Found metadata via Jupiter: ${data.symbol} - ${data.name}`)
        return { symbol: data.symbol, name: data.name }
      }
    }
  } catch (error) {
    console.log('Jupiter API failed:', error.message)
  }
  return null
}

async function trySolscanApi(mint: string): Promise<{symbol: string, name: string} | null> {
  try {
    await new Promise(resolve => setTimeout(resolve, 300))
    const response = await fetch(`https://api.solscan.io/token/meta?token=${mint}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; TreasuryBot/1.0)'
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      const tokenData = data.data || data
      
      if (tokenData && tokenData.symbol && tokenData.name) {
        console.log(`Found metadata via Solscan: ${tokenData.symbol} - ${tokenData.name}`)
        return { symbol: tokenData.symbol, name: tokenData.name }
      }
    }
  } catch (error) {
    console.log('Solscan API failed:', error.message)
  }
  return null
}

async function tryOnChainMetadata(mint: string): Promise<{symbol: string, name: string} | null> {
  try {
    const response = await fetch('https://api.mainnet-beta.solana.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getAccountInfo',
        params: [
          mint,
          { encoding: 'jsonParsed' }
        ]
      })
    })
    
    if (response.ok) {
      const data = await response.json()
      if (data.result?.value?.data?.parsed?.info) {
        const info = data.result.value.data.parsed.info
        if (info.symbol && info.name) {
          console.log(`Found metadata on-chain: ${info.symbol} - ${info.name}`)
          return { symbol: info.symbol, name: info.name }
        }
      }
    }
  } catch (error) {
    console.log('On-chain metadata failed:', error.message)
  }
  return null
}

async function fetchMeteoraDLMMPositions(address: string): Promise<TokenBalance[]> {
  try {
    console.log(`Fetching Meteora DLMM positions for address: ${address}`)
    
    await new Promise(resolve => setTimeout(resolve, 400))
    
    // Try the API endpoint
    const dlmmResponse = await fetch(`https://dlmm-api.meteora.ag/user/positions/${address}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; TreasuryBot/1.0)'
      }
    })

    if (dlmmResponse.ok) {
      const dlmmData = await dlmmResponse.json()
      console.log('DLMM API Response:', JSON.stringify(dlmmData, null, 2))

      if (dlmmData.positions && Array.isArray(dlmmData.positions)) {
        const positions: TokenBalance[] = []

        for (const position of dlmmData.positions) {
          if (position.base_amount > 0 || position.quote_amount > 0) {
            const totalUsdValue = (position.base_amount_usd || 0) + (position.quote_amount_usd || 0)
            
            positions.push({
              symbol: `${position.base_token_symbol}/${position.quote_token_symbol}`,
              name: `Meteora DLMM LP Token`,
              balance: position.liquidity || 1,
              usdValue: totalUsdValue,
              tokenAddress: position.pool_address,
              isLpToken: true,
              platform: 'meteora-dlmm',
              lpDetails: {
                poolAddress: position.pool_address,
                token1: { 
                  symbol: position.base_token_symbol, 
                  amount: position.base_amount, 
                  usdValue: position.base_amount_usd || 0
                },
                token2: { 
                  symbol: position.quote_token_symbol, 
                  amount: position.quote_amount, 
                  usdValue: position.quote_amount_usd || 0
                },
                priceRange: { 
                  min: position.lower_price || 0, 
                  max: position.upper_price || 0 
                },
                totalUsdValue: totalUsdValue
              }
            })
          }
        }

        console.log(`Found ${positions.length} Meteora DLMM positions via API`)
        return positions
      }
    } else {
      console.log(`Meteora DLMM API failed with status: ${dlmmResponse.status}`)
    }

    // Fallback to on-chain data
    return await fetchMeteoraDLMMOnChain(address)
  } catch (error) {
    console.error('Error in fetchMeteoraDLMMPositions:', error)
    return await fetchMeteoraDLMMOnChain(address)
  }
}

async function fetchMeteoraDLMMOnChain(address: string): Promise<TokenBalance[]> {
  try {
    console.log(`Fetching Meteora DLMM positions on-chain for address: ${address}`)
    
    const response = await fetch('https://api.mainnet-beta.solana.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getProgramAccounts',
        params: [
          'LBUZKhRxPF3XUpuy1G2ZvtvZjkzQ3TS4gGycGJkyv1S', // Meteora DLMM Program ID
          {
            filters: [
              { dataSize: 304 }, // Adjust based on account structure
              {
                memcmp: {
                  offset: 8, // Skip discriminator
                  bytes: address
                }
              }
            ],
            encoding: 'base64'
          }
        ]
      })
    })

    const data = await response.json()
    if (data.result && Array.isArray(data.result)) {
      console.log(`Found ${data.result.length} on-chain DLMM accounts`)
      // For now, just log the count - parsing would require understanding the exact account structure
      return []
    }

    console.log('No on-chain DLMM positions found')
    return []
  } catch (error) {
    console.error('Error fetching on-chain DLMM positions:', error)
    return []
  }
}

async function fetchAuraMarketCapFromSolana(): Promise<number> {
  try {
    console.log('Fetching AURA market cap from Solana...')
    const auraTokenMint = 'AURYydfxJib1ZkTir1Jn1J9ECnpjNzasxqcooGdh1V1'
    
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
      
      // Get AURA price with proper delay
      await new Promise(resolve => setTimeout(resolve, 800))
      const prices = await fetchTokenPrices(['AURA'])
      const auraPrice = prices['AURA'] || 0.015
      console.log(`AURA price: ${auraPrice}`)
      
      const marketCap = totalSupply * auraPrice
      console.log(`AURA market cap calculated: ${marketCap}`)
      
      return marketCap
    } else {
      console.log('Failed to get AURA token supply')
      return 0
    }
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
      
      if (solBalance > 0) {
        const prices = await fetchTokenPrices(['SOL'])
        const solPrice = prices['SOL'] || 180
        
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
      const uniqueTokens = new Set<string>()
      
      // Get prices for common tokens
      const prices = await fetchTokenPrices(['USDC', 'USDT', 'AURA', 'WETH', 'WBTC', 'WSOL'])
      
      for (const tokenAccount of tokenData.result.value) {
        const tokenInfo = tokenAccount.account.data.parsed.info
        const balance = parseFloat(tokenInfo.tokenAmount.uiAmount || 0)
        
        if (balance > 0 && !uniqueTokens.has(tokenInfo.mint)) {
          uniqueTokens.add(tokenInfo.mint)
          
          let symbol = 'UNK'
          let name = 'Unknown Token'
          let price = 0
          
          // Try to get metadata
          const metadata = await fetchTokenMetadata(tokenInfo.mint)
          if (metadata) {
            symbol = metadata.symbol
            name = metadata.name
            price = prices[symbol] || 0
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

    // Fetch Meteora DLMM positions
    const dlmmPositions = await fetchMeteoraDLMMPositions(address)
    balances.push(...dlmmPositions)

    console.log(`Total balances found for ${address}: ${balances.length}`)
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
      
      if (ethBalance > 0) {
        const prices = await fetchTokenPrices(['ETH'])
        const ethPrice = prices['ETH'] || 3000
        
        balances.push({
          symbol: 'ETH',
          name: 'Ethereum',
          balance: ethBalance,
          usdValue: ethBalance * ethPrice,
          isLpToken: false,
          platform: 'native'
        })
      }

      console.log(`Ethereum balance fetch completed for ${address}`)
    }

    return balances
  } catch (error) {
    console.error('Error fetching Ethereum balances:', error)
    return []
  }
}
