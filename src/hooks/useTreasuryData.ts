'use client';

import { useState, useEffect, useCallback } from 'react';
import { getTreasuryData } from '@/lib/api/treasuryService';
import type { UseTreasuryDataReturn, ConsolidatedData, ApiStatus } from '@/types/treasury';
import { TREASURY_REFRESH_INTERVAL } from '@/lib/constants';

export const useTreasuryData = (): UseTreasuryDataReturn => {
  const [data, setData] = useState<ConsolidatedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [apiStatus, setApiStatus] = useState<ApiStatus>({
    solPrice: "loading",
    wallets: "loading",
    auraMarketCap: "loading",
  });

  const fetchData = useCallback(async () => {
    setError(null);
    setApiStatus({
      solPrice: "loading",
      wallets: "loading",
      auraMarketCap: "loading",
    });

    try {
      const responseData = await getTreasuryData();
      
      setData(responseData);
      setLastRefresh(new Date());

      setApiStatus({
        solPrice: responseData.solPrice > 0 ? "success" : "error",
        wallets: responseData.wallets.length > 0 ? "success" : "error",
        auraMarketCap: responseData.treasury.totalMarketCap > 0 ? "success" : "error",
      });

    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to fetch treasury data";
      setError(msg);
      setApiStatus({
        solPrice: "error",
        wallets: "error",
        auraMarketCap: "error",
      });

      // Provide safe fallback so components can still render
      setData({
        treasury: {
          totalMarketCap: 0,
          volatileAssets: 0,
          hardAssets: 0,
          lastUpdated: new Date().toISOString(),
        },
        wallets: [],
        solPrice: 0,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(); // Initial load
    const id = setInterval(fetchData, TREASURY_REFRESH_INTERVAL);
    return () => clearInterval(id);
  }, [fetchData]);

  return { data, loading, error, lastRefresh, apiStatus, fetchData };
}; 