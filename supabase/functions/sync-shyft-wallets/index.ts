import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getLiveWalletData } from './wallet-processing.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Updated wallet configs (Solana + Ethereum)
const MONITORED_WALLETS = [
  { name: "Operations", address: "AXYFBhYPhHt4SzGqdpSfBSMWEQmKdCyQScA1xjRvHzph", blockchain: "Solana" },
  { name: "Business Costs", address: "Hxa31irnLJq2fEDm64gE7ZDAcPNQ6HyWqn2sE3vVKvfg", blockchain: "Solana" },
  { name: "Marketing", address: "7QpFeyM5VPGMuycCCdaYUeez9c8EzaDkJYBDKKFr4DN2", blockchain: "Solana" },
  { name: "Project Funding - Solana", address: "Aftv2wFpusiKHfHWdkiFNPsmrFEgrBheHX6ejS4LkM8i", blockchain: "Solana" },
  // New Ethereum Project Funding
  { name: "Project Funding - Ethereum", address: "0xf05fc9a3c6011c76eb6fe4cbb956eeac8750306d", blockchain: "Ethereum" }
];

const TOKEN_PRICES: Record<string, number> = {
  'SOL': 147.04,
  'AURA': 0.00011566,
  'WBTC': 105000,
  'ETH': 3500,
  'CULT': 0.00001,
  'WETH': 3500,
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

    for (const wallet of MONITORED_WALLETS) {
      try {
        console.log(`[sync-shyft-wallets] Processing wallet: ${wallet.name} (${wallet.address})`);
        const walletData = await getLiveWalletData(wallet, shyftApiKey);
        totalVolatileAssets += walletData.totalUsdValue;

        console.log(`[sync-shyft-wallets] ${wallet.name} processed successfully with $${walletData.totalUsdValue} total value`);

        // Fix: Provide dummy value for raw_data to satisfy NOT NULL constraint
        const upsertPayload = {
          wallet_address: wallet.address,
          wallet_name: wallet.name,
          raw_data: {}, // Empty object to satisfy NOT NULL constraint
          sol_balance: walletData.balances.find(b => b.token_symbol === 'SOL')?.balance ?? 0,
          total_usd_value: walletData.totalUsdValue,
          token_count: walletData.balances.length,
          last_updated: new Date().toISOString()
        };

        const { error: upsertErr } = await supabase
          .from('shyft_wallet_cache')
          .upsert(upsertPayload);

        if (upsertErr) {
          console.error(`[sync-shyft-wallets] Upsert error for ${wallet.address}:${wallet.name}`, upsertErr);
        }

        walletResults.push({
          name: walletData.name,
          address: walletData.address,
          balances: walletData.balances,
          totalUsdValue: walletData.totalUsdValue,
          blockchain: wallet.blockchain || 'Solana'
        });
      } catch (err) {
        console.error(`[sync-shyft-wallets] Wallet fetch failed: ${wallet.name} (${wallet.address}) | ${err?.message || err}`);
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

    console.log(`[sync-shyft-wallets] Finished processing all wallets. Total volatile assets: $${totalVolatileAssets}`);
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
    console.error('[sync-shyft-wallets] Caught top-level error:', error?.message || error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
});
