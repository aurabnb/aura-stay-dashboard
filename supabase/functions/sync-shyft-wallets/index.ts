
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getLiveWalletData } from './wallet-processing.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Updated wallet configs (Solana + Ethereum)
const MONITORED_WALLETS = [
  { name: "Operations", address: "Hxa31irnLJq2fEDm64gE7ZDAcPNQ6HyWqn2sE3vVKvfg", blockchain: "Solana" },
  { name: "Business Costs", address: "Hxa31irnLJq2fEDm64gE7ZDAcPNQ6HyWqn2sE3vVKvfg", blockchain: "Solana" },
  { name: "Marketing", address: "7QpFeyM5VPGMuycCCdaYUeez9c8EzaDkJYBDKKFr4DN2", blockchain: "Solana" },
  { name: "Project Funding", address: "Aftv2wFpusiKHfHWdkiFNPsmrFEgrBheHX6ejS4LkM8i", blockchain: "Solana" },
  // New Ethereum Project Funding
  { name: "Project Funding - Ethereum", address: "0xf05fc9a3c6011c76eb6fe4cbb956eeac8750306d", blockchain: "Ethereum" }
];

const TOKEN_PRICES: Record<string, number> = {
  'SOL': 147.04,
  'AURA': 0.00011566,
  'WBTC': 105000,
  'ETH': 3500,
  'CULT': 0.00001,
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

    // Process all wallets live via the Shyft API and/or EVM
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
            raw_data: null, // live-only
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
          blockchain: wallet.blockchain || 'Solana'
        });
      } catch (err) {
        walletResults.push({
          name: wallet.name,
          address: wallet.address,
          balances: [],
          totalUsdValue: 0,
          blockchain: wallet.blockchain || 'Solana'
        });
      }
    }

    const auraMarketCap = 115651; // TODO: Dynamically fetch if required
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
