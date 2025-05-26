
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
      console.log('Failed to fetch SOL price from CoinGecko, using fallback')
      return 180 // Fallback price
    }
    const data = await response.json()
    return data.solana?.usd || 180
  } catch (error) {
    console.error('Error fetching SOL price:', error)
    return 180 // Fallback price
  }
}

async function fetchTokenPrices(tokens: string[]): Promise<Record<string, number>> {
  try {
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const tokenIds = tokens.map(token => {
      const mapping: Record<string, string> = {
        'SOL': 'solana',
        'USDC': 'usd-coin',
        'USDT': 'tether',
        'BTC': 'bitcoin',
        'ETH': 'ethereum',
        'AURA': 'aurad', // Updated to correct CoinGecko ID
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
      console.log(`CoinGecko API failed with status: ${response.status}`)
      // Return fallback prices
      return {
        'SOL': 180,
        'USDC': 1,
        'USDT': 1,
        'AURA': 0.01,
        'ETH': 3000,
        'WETH': 3000,
        'WBTC': 42000,
        'WSOL': 180,
        'CULT': 0.000001,
        'DCULT': 0.000001
      }
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
          'aurad': 'AURA', // Updated mapping
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
    // Return fallback prices on error
    return {
      'SOL': 180,
      'USDC': 1,
      'USDT': 1,
      'AURA': 0.01,
      'ETH': 3000,
      'WETH': 3000,
      'WBTC': 42000,
      'WSOL': 180,
      'CULT': 0.000001,
      'DCULT': 0.000001
    }
  }
}

async function fetchTokenMetadata(mint: string): Promise<{symbol: string, name: string} | null> {
  try {
    console.log(`Fetching metadata for token: ${mint}`)
    
    // Try Solscan API first with proper headers and handle nested responses
    try {
      const solscanResponse = await fetch(`https://api.solscan.io/token/meta?token=${mint}`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; TreasuryBot/1.0)'
        }
      })
      if (solscanResponse.ok) {
        const data = await solscanResponse.json()
        // Handle nested response structure
        const tokenData = data.data || data
        if (tokenData.symbol && tokenData.name) {
          console.log(`Found metadata via Solscan: ${tokenData.symbol} - ${tokenData.name}`)
          return { symbol: tokenData.symbol, name: tokenData.name }
        }
      }
    } catch (solscanError) {
      console.log('Solscan API failed, trying Metaplex fallback')
    }

    // Fallback to Metaplex metadata program
    try {
      const metaplexResponse = await fetch('https://api.mainnet-beta.solana.com', {
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
      
      if (metaplexResponse.ok) {
        const data = await metaplexResponse.json()
        if (data.result?.value?.data?.parsed?.info) {
          const info = data.result.value.data.parsed.info
          if (info.symbol && info.name) {
            console.log(`Found metadata via Metaplex: ${info.symbol} - ${info.name}`)
            return { symbol: info.symbol, name: info.name }
          }
        }
      }
    } catch (metaplexError) {
      console.log('Metaplex API failed, using known tokens')
    }

    // Check for known tokens with updated mapping
    const knownTokens: Record<string, {symbol: string, name: string}> = {
      '3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe': {symbol: 'UNK', name: 'Unknown Token'}
    }
    
    if (knownTokens[mint]) {
      return knownTokens[mint]
    }
    
    return { symbol: mint.slice(0, 8) + '...', name: 'Unknown Token' }
  } catch (error) {
    console.error(`Error fetching metadata for ${mint}:`, error)
    return null
  }
}

async function fetchMeteoraDLMMPositions(address: string): Promise<TokenBalance[]> {
  try {
    console.log(`Fetching Meteora DLMM positions for address: ${address}`)
    
    // Fetch user LP positions from Meteora DLMM API
    const dlmmResponse = await fetch(`https://dlmm-api.meteora.ag/user/positions/${address}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; TreasuryBot/1.0)'
      }
    })

    if (!dlmmResponse.ok) {
      console.log(`Meteora DLMM API failed with status: ${dlmmResponse.status}`)
      // Fallback to on-chain data
      return await fetchMeteoraDLMMOnChain(address)
    }

    const dlmmData = await dlmmResponse.json()
    console.log('DLMM API Response:', JSON.stringify(dlmmData, null, 2))

    if (!dlmmData.positions || !Array.isArray(dlmmData.positions)) {
      console.log('No DLMM positions found in API response')
      return await fetchMeteoraDLMMOnChain(address)
    }

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

    console.log(`Found ${positions.length} Meteora DLMM positions for address: ${address}`)
    return positions
  } catch (error) {
    console.error('Error in fetchMeteoraDLMMPositions:', error)
    return await fetchMeteoraDLMMOnChain(address)
  }
}

async function fetchMeteoraDLMMOnChain(address: string): Promise<TokenBalance[]> {
  try {
    console.log(`Fetching Meteora DLMM positions on-chain for address: ${address}`)
    
    // Meteora DLMM program ID
    const meteoraDLMMProgramId = 'LBUZKhRxPF3XUpuy1G2ZvtvZjkzQ3TS4gGycGJkyv1S'
    
    const response = await fetch('https://api.mainnet-beta.solana.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getProgramAccounts',
        params: [
          meteoraDLMMProgramId,
          {
            filters: [
              { dataSize: 304 }, // Adjust if needed based on account structure
              { memcmp: { offset: 8, bytes: address } } // Look for user address in account data
            ],
            encoding: 'base64'
          }
        ]
      })
    })

    const data = await response.json()
    console.log(`Found ${data.result?.length || 0} on-chain DLMM accounts`)

    if (!data.result || data.result.length === 0) {
      return []
    }

    // Parse account data to extract position information
    // This is a simplified parser - actual implementation would need proper binary parsing
    const positions: TokenBalance[] = []
    
    for (const account of data.result.slice(0, 5)) { // Limit to prevent timeout
      try {
        // This is a placeholder for actual account data parsing
        // In reality, you'd need to decode the binary data according to Meteora's account structure
        positions.push({
          symbol: 'LP_TOKEN',
          name: 'Meteora DLMM Position',
          balance: 1,
          usdValue: 0,
          tokenAddress: account.pubkey,
          isLpToken: true,
          platform: 'meteora-dlmm-onchain',
          lpDetails: {
            poolAddress: account.pubkey,
            token1: { symbol: 'TOKEN_A', amount: 0, usdValue: 0 },
            token2: { symbol: 'TOKEN_B', amount: 0, usdValue: 0 },
            priceRange: { min: 0, max: 0 },
            totalUsdValue: 0
          }
        })
      } catch (parseError) {
        console.error('Error parsing DLMM account data:', parseError)
        continue
      }
    }

    return positions
  } catch (error) {
    console.error('Error in fetchMeteoraDLMMOnChain:', error)
    return []
  }
}

async function fetchAuraMarketCapFromSolana(): Promise<number> {
  try {
    // Updated AURA token mint address
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
          
          // Enhanced known tokens mapping
          const knownTokens: Record<string, {symbol: string, name: string}> = {
            'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': {symbol: 'USDC', name: 'USD Coin'},
            'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': {symbol: 'USDT', name: 'Tether USD'},
            'AURYydfxJib1ZkTir1Jn1J9ECnpjNzasxqcooGdh1V1': {symbol: 'AURA', name: 'Aura Token'}, // Updated AURA mint
            'So11111111111111111111111111111111111111112': {symbol: 'WSOL', name: 'Wrapped SOL'},
            '3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe': {symbol: 'UNK', name: 'Unknown Token'}
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

    // Fetch Meteora DLMM positions
    const dlmmPositions = await fetchMeteoraDLMMPositions(address)
    balances.push(...dlmmPositions)

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

      console.log(`Ethereum balance fetch completed for ${address}`)
    }

    return balances
  } catch (error) {
    console.error('Error fetching Ethereum balances:', error)
    return []
  }
}
