
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

const MONITORED_WALLETS = [
  { name: "Operations", address: "fa1ro8lT7gSdZSn7XTz6a3zNquphpGlEh7omB2f6GTh" },
  { name: "Business Costs", address: "Hxa3IlrmJq2fEDmc4gETZDdAPhQ6HyWqn2Es3vVKkFg" },
  { name: "Marketing", address: "7QapFoyM5VPGMuycCCdaYUoe29c8EzadJkJYBDKKFf4DN2" },
  { name: "Project Funding", address: "Aftv2wfPusikfHFwdklFNpsmrFEgrBheHXo6jS4LkM8i" }
]

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const shyftApiKey = Deno.env.get('SHYFT_API_KEY')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    if (!shyftApiKey) {
      throw new Error('SHYFT_API_KEY not configured')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log('=== Starting Shyft wallet sync ===')
    
    let totalVolatileAssets = 0
    const walletResults = []

    for (const wallet of MONITORED_WALLETS) {
      try {
        console.log(`Fetching data for ${wallet.name}: ${wallet.address}`)
        
        const response = await fetch(
          `https://api.shyft.to/sol/v1/wallet/balance?network=mainnet-beta&wallet=${wallet.address}`,
          {
            headers: {
              'x-api-key': shyftApiKey,
            },
          }
        )

        if (!response.ok) {
          throw new Error(`Shyft API error: ${response.status}`)
        }

        const data: ShyftWalletResponse = await response.json()
        
        if (!data.success) {
          throw new Error(`Shyft API error: ${data.message}`)
        }

        const solBalance = data.result.balance / 1e9 // Convert lamports to SOL
        const tokens = data.result.tokens || []
        
        // Calculate USD values (simplified - would need price API integration)
        const solPrice = 180 // Fallback SOL price
        const solUsdValue = solBalance * solPrice
        
        let totalTokenValue = 0
        const tokenBalances = []

        for (const token of tokens) {
          const balance = token.balance / Math.pow(10, token.info.decimals)
          // For now, we'll use simplified pricing
          const usdValue = token.info.symbol === 'USDC' ? balance : 0
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

        const totalUsdValue = solUsdValue + totalTokenValue
        totalVolatileAssets += totalUsdValue

        // Store in cache table
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

        walletResults.push({
          name: wallet.name,
          address: wallet.address,
          balances: tokenBalances,
          totalUsdValue: totalUsdValue,
          blockchain: 'Solana'
        })

        console.log(`${wallet.name}: $${totalUsdValue.toFixed(2)} total value`)

      } catch (error) {
        console.error(`Error fetching ${wallet.name}:`, error)
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
      solPrice: 180
    }

    console.log(`=== Sync completed: $${totalVolatileAssets.toFixed(2)} volatile assets ===`)

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
