
import { useEffect, useState } from "react";
import { MONITORED_WALLETS, SOL_MINT } from "@/constants";
import { fetchJupiterPrices } from "@/api";
import { supabase } from "@/integrations/supabase/client";
import {
  WalletData,
  WalletBalance,
} from "@/types";

/* ------------------------------------------------------------------------- */
/*                                 The hook                                  */
/* ------------------------------------------------------------------------- */

export function useWallets() {
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        console.log('Fetching wallet data via Shyft API through Supabase...');
        
        // Use the Shyft edge function instead of direct API calls
        const { data: responseData, error: fetchError } = await supabase.functions.invoke('sync-shyft-wallets');

        if (fetchError) {
          throw new Error(`Shyft API error: ${fetchError.message}`);
        }

        if (!responseData || !responseData.wallets) {
          throw new Error('Invalid response structure from Shyft sync');
        }

        if (cancelled) return;

        // Map the Shyft response to our wallet format
        const mapped: WalletData[] = responseData.wallets.map((wallet: any) => ({
          wallet_id: wallet.address,
          name: wallet.name,
          address: wallet.address,
          blockchain: wallet.blockchain || "Solana",
          balances: wallet.balances || [],
          totalUsdValue: wallet.totalUsdValue || 0,
        }));

        setWallets(mapped);
      } catch (e) {
        if (!cancelled) {
          console.error('Error fetching wallet data:', e);
          setError((e as Error).message);
          
          // Provide fallback data
          setWallets(MONITORED_WALLETS.map(w => ({
            wallet_id: w.address,
            name: w.name,
            address: w.address,
            blockchain: "Solana",
            balances: [],
            totalUsdValue: 0,
          })));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return { wallets, loading, error };
}

export default useWallets;
