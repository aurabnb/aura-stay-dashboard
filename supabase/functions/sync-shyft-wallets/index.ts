
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getLiveWalletData } from './wallet-processing.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Wallet configs for live processing: update as needed
const MONITORED_WALLETS = [
  { name: "Operations", address: "Hxa31irnLJq2fEDm64gE7ZDAcPNQ6HyWqn2sE3vVKvfg" },
  { name: "Business Costs", address: "Hxa31irnLJq2fEDm64gE7ZDAcPNQ6HyWqn2sE3vVKvfg" },
  { name: "Marketing", address: "7QpFeyM5VPGMuycCCdaYUeez9c8EzaDkJYBDKKFr4DN2" },
  { name: "Project Funding", address: "Aftv2wFpusiKHfHWdkiFNPsmrFEgrBheHX6ejS4LkM8i" }
];

const TOKEN_PRICES: Record<string, number> = {
  'SOL': 147.04,
  'AURA': 0.00011566,
  // ...add new tokens as needed
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const shyftApiKey = Deno.env.get('SHYFT_API_KEY')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    if (!shyftApiKey) {
      return new Response(JSON.stringify({
        error: 'SHYFT_API_KEY not set'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    let totalVolatileAssets = 0;
    const walletResults = [];

    // Process all wallets live via the Shyft API
    for (const wallet of MONITORED_WALLETS) {
      try {
        const walletData = await getLiveWalletData(wallet, shyftApiKey);
        totalVolatileAssets += walletData.totalUsdValue;

        // Upsert to db cache (for analytics)
        await supabase
          .from('shyft_wallet_cache')
          .upsert({
            wallet_address: wallet.address,
            wallet_name: wallet.name,
            raw_data: null, // refactored: live-only, not caching Shyft response blob
            sol_balance: walletData.balances.find(b => b.token_symbol === 'SOL')?.balance ?? 0,
            total_usd_value: walletData.totalUsdValue,
            token_count: walletData.balances.length,
            last_updated: new Date().toISOString()
          })

        walletResults.push({
          name: walletData.name,
          address: walletData.address,
          balances: walletData.balances,
          totalUsdValue: walletData.totalUsdValue,
          blockchain: 'Solana'
        });
      } catch (err) {
        walletResults.push({
          name: wallet.name,
          address: wallet.address,
          balances: [],
          totalUsdValue: 0,
          blockchain: 'Solana'
        });
      }
    }

    // Treasury/Market cap static fallback
    const auraMarketCap = 115651; // replace with live calculation if available
    const hardAssets = 607.87;

    return new Response(JSON.stringify({
      treasury: {
        totalMarketCap: auraMarketCap,
        volatileAssets: totalVolatileAssets,
        hardAssets: hardAssets,
        lastUpdated: new Date().toISOString()
      },
      wallets: walletResults,
      solPrice: TOKEN_PRICES.SOL
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
});

