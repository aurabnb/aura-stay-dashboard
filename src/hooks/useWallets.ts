
import { useEffect, useState } from "react";
import { MONITORED_WALLETS, SOL_MINT } from "@/constants";
import { fetchJupiterPrices } from "@/api";
import { supabase } from "@/integrations/supabase/client";
import {
  WalletData,
  WalletBalance,
} from "@/types";

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

        console.log('Fetching wallet data via fetch-wallet-balances edge function...');

        // Use the fetch-wallet-balances edge function instead of sync-shyft-wallets
        const { data: responseData, error: fetchError } = await supabase.functions.invoke('fetch-wallet-balances');

        // DEBUG LOG
        console.log("[useWallets] Full edge function response:", responseData, fetchError);

        if (fetchError) {
          throw new Error(`Wallet balance API error: ${fetchError.message}`);
        }

        if (!responseData || !responseData.wallets) {
          console.error("[useWallets] Invalid response structure:", responseData);
          throw new Error('Invalid response structure from wallet balance fetch');
        }

        if (cancelled) return;

        // Map the response to our wallet format
        const mapped: WalletData[] = responseData.wallets.map((wallet: any) => ({
          wallet_id: wallet.address,
          name: wallet.name,
          address: wallet.address,
          blockchain: wallet.blockchain || "Solana",
          balances: wallet.balances || [],
          totalUsdValue: wallet.totalUsdValue || 0,
        }));

        // LOG which wallets have non-zero balances
        mapped.forEach((w) => {
          if (!w.balances?.length) {
            console.warn(`[useWallets] Wallet "${w.name}" has NO balances in the response.`);
          } else {
            w.balances.forEach(b => {
              if (b.usd_value > 0) {
                console.info(`[useWallets] Wallet "${w.name}" asset "${b.token_symbol}" has balance $${b.usd_value}`);
              }
            });
          }
        });

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
