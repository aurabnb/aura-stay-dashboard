import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ShyftTokenBalance {
  address: string
  balance: number
  associated_account: string
  info: {
    symbol: string
    name: string
    decimals: number
    image?: string
  }
}

interface ShyftWalletResponse {
  success: boolean
  message: string
  result: {
    address: string
    balance: number
    tokens: ShyftTokenBalance[]
  }
}

// Updated wallet addresses to match the ones used in the frontend
const MONITORED_WALLETS = [
  { name: "Operations", address: "fa1ra81T7g5DzSn7XT6z36zNqupHpG1Eh7omB2F6GTh" },
  { name: "Business Costs", address: "Hxa31irnLJq2fEDm64gE7ZDAcPNQ6HyWqn2sE3vVKvfg" },
  { name: "Marketing", address: "7QpFeyM5VPGMuycCCdaYUeez9c8EzaDkJYBDKKFr4DN2" },
  { name: "Project Funding", address: "Aftv2wFpusiKHfHWdkiFNPsmrFEgrBheHX6ejS4LkM8i" }
]

// Price lookup for tokens
const TOKEN_PRICES: Record<string, number> = {
  'SOL': 147.04,
  'USDC': 1.00,
  'USDT': 1.00,
  'AURA': 0.00011566,
  'WBTC': 105000,
  'ETH': 3500
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const shyftApiKey = Deno.env.get('SHYFT_API_KEY')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    if (!shyftApiKey) {
      console.warn('SHYFT_API_KEY not configured, using fallback data')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log('=== Starting Shyft wallet sync ===')
    
    let totalVolatileAssets = 0
    const walletResults = []

    for (const wallet of MONITORED_WALLETS) {
      try {
        console.log(`Fetching data for ${wallet.name}: ${wallet.address}`)
        
        let data: ShyftWalletResponse
        
        if (shyftApiKey) {
          const response = await fetch(
            `https://api.shyft.to/sol/v1/wallet/balance?network=mainnet-beta&wallet=${wallet.address}`,
            {
              headers: {
                'x-api-key': shyftApiKey,
              },
            }
          )

          if (!response.ok) {
            throw new Error(`Shyft API error: ${response.status} - ${response.statusText}`)
          }

          data = await response.json()
          
          if (!data.success) {
            throw new Error(`Shyft API error: ${data.message}`)
          }
        } else {
          // Fallback data when API key is not available
          console.log(`Using fallback data for ${wallet.name}`)
          data = {
            success: true,
            message: 'Fallback data',
            result: {
              address: wallet.address,
              balance: 0,
              tokens: []
            }
          }
        }

        const solBalance = data.result.balance / 1e9 // Convert lamports to SOL
        const tokens = data.result.tokens || []
        
        // Calculate USD values using our price lookup
        const solUsdValue = solBalance * TOKEN_PRICES.SOL
        
        let totalTokenValue = 0
        const tokenBalances = []

        // Add SOL balance
        if (solBalance > 0) {
          tokenBalances.push({
            token_symbol: 'SOL',
            token_name: 'Solana',
            balance: solBalance,
            usd_value: solUsdValue,
            token_address: 'So11111111111111111111111111111111111111112',
            is_lp_token: false,
            platform: 'Shyft'
          })
          totalTokenValue += solUsdValue
        }

        // Process other tokens
        for (const token of tokens) {
          if (token.balance > 0) {
            const balance = token.balance / Math.pow(10, token.info.decimals)
            const price = TOKEN_PRICES[token.info.symbol] || 0
            const usdValue = balance * price
            totalTokenValue += usdValue
            
            tokenBalances.push({
              token_symbol: token.info.symbol,
              token_name: token.info.name,
              balance: balance,
              usd_value: usdValue,
              token_address: token.address,
              is_lp_token: false,
              platform: 'Shyft'
            })
          }
        }

        const totalUsdValue = totalTokenValue
        totalVolatileAssets += totalUsdValue

        // Store in cache table if we have a valid API key
        if (shyftApiKey) {
          await supabase
            .from('shyft_wallet_cache')
            .upsert({
              wallet_address: wallet.address,
              wallet_name: wallet.name,
              raw_data: data.result,
              sol_balance: solBalance,
              total_usd_value: totalUsdValue,
              token_count: tokens.length,
              last_updated: new Date().toISOString()
            })
        }

        walletResults.push({
          name: wallet.name,
          address: wallet.address,
          balances: tokenBalances,
          totalUsdValue: totalUsdValue,
          blockchain: 'Solana'
        })

        console.log(`${wallet.name}: $${totalUsdValue.toFixed(2)} total value (${tokenBalances.length} tokens)`)

      } catch (error) {
        console.error(`Error fetching ${wallet.name}:`, error)
        // Return wallet with empty balances but keep it in the list
        walletResults.push({
          name: wallet.name,
          address: wallet.address,
          balances: [],
          totalUsdValue: 0,
          blockchain: 'Solana'
        })
      }
    }

    const hardAssets = 607.87 // Static value from existing system
    const auraMarketCap = 115651 // Would fetch from token API

    const result = {
      treasury: {
        totalMarketCap: auraMarketCap,
        volatileAssets: totalVolatileAssets,
        hardAssets: hardAssets,
        lastUpdated: new Date().toISOString()
      },
      wallets: walletResults,
      solPrice: TOKEN_PRICES.SOL
    }

    console.log(`=== Sync completed: $${totalVolatileAssets.toFixed(2)} volatile assets across ${walletResults.length} wallets ===`)

    return new Response(
      JSON.stringify(result),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
        } 
      }
    )

  } catch (error) {
    console.error('Error in sync-shyft-wallets:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})
