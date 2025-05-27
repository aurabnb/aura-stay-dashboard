
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders, WALLETS_CONFIG } from './constants.ts';
import { getWalletBalances } from './wallet-service.ts';
import { getAuraMarketCap, getSolanaPrice } from './price-service.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('=== Starting wallet balance fetch ===');
    
    console.log(`Processing ${WALLETS_CONFIG.length} wallets...`);

    const walletPromises = WALLETS_CONFIG.map(async (wallet) => {
      try {
        console.log(`Processing wallet: ${wallet.name} (${wallet.blockchain})`);
        const balances = await getWalletBalances(wallet.address, wallet.blockchain);
        const totalUsdValue = balances.reduce((sum, balance) => sum + (balance.usdValue || 0), 0);
        
        console.log(`${wallet.name} total value: $${totalUsdValue.toFixed(2)}`);
        
        // Map backend response to frontend interface
        const mappedBalances = balances.map(balance => ({
          token_symbol: balance.symbol,
          token_name: balance.name,
          balance: balance.balance,
          usd_value: balance.usdValue,
          token_address: balance.tokenAddress,
          is_lp_token: balance.isLpToken,
          platform: balance.platform,
          lp_details: balance.lpDetails
        }));
        
        return {
          ...wallet,
          balances: mappedBalances,
          totalUsdValue: totalUsdValue
        };
      } catch (error) {
        console.error(`Error processing wallet ${wallet.name}:`, error);
        return {
          ...wallet,
          balances: [],
          totalUsdValue: 0
        };
      }
    });

    const processedWallets = await Promise.all(walletPromises);

    const volatileAssets = processedWallets.reduce((sum, wallet) => sum + wallet.totalUsdValue, 0);
    const hardAssets = 607.8665742658975;
    const auraMarketCap = await getAuraMarketCap();
    const solPrice = await getSolanaPrice();

    const result = {
      treasury: {
        totalMarketCap: auraMarketCap,
        volatileAssets: volatileAssets,
        hardAssets: hardAssets,
        lastUpdated: new Date().toISOString()
      },
      wallets: processedWallets,
      solPrice: solPrice
    };

    console.log('=== Fetch completed successfully ===');
    console.log(`Total wallets processed: ${processedWallets.length}`);
    console.log(`Total volatile assets: $${volatileAssets.toFixed(2)}`);
    console.log(`AURA market cap: $${auraMarketCap.toFixed(2)}`);
    console.log(`SOL price: $${solPrice.toFixed(2)}`);

    processedWallets.forEach(wallet => {
      const lpTokens = wallet.balances.filter(b => b.is_lp_token);
      if (lpTokens.length > 0) {
        console.log(`${wallet.name} LP tokens:`, lpTokens.map(lp => ({
          symbol: lp.token_symbol,
          balance: lp.balance,
          usdValue: lp.usd_value,
          hasDetails: !!lp.lp_details
        })));
      }
    });

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
    console.error('Fatal error in fetch-wallet-balances:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message,
        treasury: {
          totalMarketCap: 75000,
          volatileAssets: 0,
          hardAssets: 607.8665742658975,
          lastUpdated: new Date().toISOString()
        },
        wallets: [],
        solPrice: 180
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
