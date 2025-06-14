
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ShyftTokenBalance {
  address: string
  balance: number
  info: {
    name: string
    symbol: string
    decimals: number
    image?: string
  }
  ui_amount: number
}

interface ShyftWalletResponse {
  result: {
    native_balance: {
      balance: number
      ui_amount: number
    }
    token_balances: ShyftTokenBalance[]
  }
}

async function fetchWalletData(apiKey: string, walletAddress: string): Promise<ShyftWalletResponse> {
  const response = await fetch(`https://api.shyft.to/sol/v1/wallet/balance?network=mainnet-beta&wallet=${walletAddress}`, {
    headers: {
      'x-api-key': apiKey,
    },
  })

  if (!response.ok) {
    throw new Error(`Shyft API error: ${response.statusText}`)
  }

  return response.json()
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const shyftApiKey = Deno.env.get('SHYFT_API_KEY')!

    if (!shyftApiKey) {
      return new Response(
        JSON.stringify({ error: 'SHYFT_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get monitored wallets from the existing wallets table
    const { data: wallets, error: walletsError } = await supabase
      .from('wallets')
      .select('address, name')
      .eq('blockchain', 'solana')

    if (walletsError) {
      throw new Error(`Database error: ${walletsError.message}`)
    }

    const results = []

    for (const wallet of wallets || []) {
      try {
        console.log(`Syncing wallet: ${wallet.address}`)
        
        const walletData = await fetchWalletData(shyftApiKey, wallet.address)
        const result = walletData.result

        // Calculate total USD value (this would need price data from another API)
        // For now, we'll just use SOL balance * estimated price
        const estimatedSolPrice = 100 // This should come from a price API
        const totalUsdValue = result.native_balance.ui_amount * estimatedSolPrice

        // Upsert wallet cache data
        const { error: cacheError } = await supabase
          .from('shyft_wallet_cache')
          .upsert({
            wallet_address: wallet.address,
            wallet_name: wallet.name,
            raw_data: walletData,
            sol_balance: result.native_balance.ui_amount,
            total_usd_value: totalUsdValue,
            token_count: result.token_balances.length + 1, // +1 for SOL
            last_updated: new Date().toISOString(),
          })

        if (cacheError) {
          console.error(`Error caching wallet ${wallet.address}:`, cacheError)
          continue
        }

        // Clear existing token balances for this wallet
        await supabase
          .from('shyft_token_balances')
          .delete()
          .eq('wallet_address', wallet.address)

        // Insert SOL balance
        await supabase
          .from('shyft_token_balances')
          .insert({
            wallet_address: wallet.address,
            token_address: 'So11111111111111111111111111111111111111112',
            token_symbol: 'SOL',
            token_name: 'Solana',
            balance: result.native_balance.balance,
            ui_amount: result.native_balance.ui_amount,
            decimals: 9,
            usd_value: result.native_balance.ui_amount * estimatedSolPrice,
            is_native: true,
            metadata: {},
          })

        // Insert token balances
        for (const token of result.token_balances) {
          await supabase
            .from('shyft_token_balances')
            .insert({
              wallet_address: wallet.address,
              token_address: token.address,
              token_symbol: token.info.symbol,
              token_name: token.info.name,
              balance: token.balance,
              ui_amount: token.ui_amount,
              decimals: token.info.decimals,
              usd_value: 0, // Would need price data
              is_native: false,
              metadata: {
                image: token.info.image,
              },
            })
        }

        results.push({
          wallet: wallet.address,
          status: 'success',
          tokenCount: result.token_balances.length + 1,
          solBalance: result.native_balance.ui_amount,
        })

      } catch (error) {
        console.error(`Error syncing wallet ${wallet.address}:`, error)
        results.push({
          wallet: wallet.address,
          status: 'error',
          error: (error as Error).message,
        })
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Wallet sync completed',
        results,
        syncedAt: new Date().toISOString(),
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in sync-shyft-wallets function:', error)
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
