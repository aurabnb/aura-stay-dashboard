
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface LPDetails {
  poolAddress: string;
  token1: { symbol: string; amount: number; usdValue: number };
  token2: { symbol: string; amount: number; usdValue: number };
  priceRange: { min: number; max: number };
  totalUsdValue: number;
}

interface WalletBalance {
  token_symbol: string;
  token_name: string;
  balance: number;
  usd_value: number;
  token_address?: string;
  is_lp_token: boolean;
  platform: string;
  lp_details?: LPDetails;
}

interface WalletData {
  wallet_id: string;
  name: string;
  address: string;
  blockchain: string;
  balances: WalletBalance[];
  totalUsdValue: number;
}

interface TreasuryMetrics {
  totalMarketCap: number;
  volatileAssets: number;
  hardAssets: number;
  lastUpdated: string;
}

interface ConsolidatedData {
  treasury: TreasuryMetrics;
  wallets: WalletData[];
  solPrice: number;
}

interface ApiStatus {
  solPrice: 'loading' | 'success' | 'error';
  wallets: 'loading' | 'success' | 'error';
  auraMarketCap: 'loading' | 'success' | 'error';
}

export const useTreasuryData = () => {
  const [data, setData] = useState<ConsolidatedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [apiStatus, setApiStatus] = useState<ApiStatus>({
    solPrice: 'loading',
    wallets: 'loading',
    auraMarketCap: 'loading'
  });

  const fetchData = async () => {
    try {
      console.log('Fetching consolidated data...');
      setError(null);
      setApiStatus({
        solPrice: 'loading',
        wallets: 'loading',
        auraMarketCap: 'loading'
      });

      const { data: responseData, error: fetchError } = await supabase.functions.invoke('fetch-wallet-balances');
      
      if (fetchError) throw fetchError;
      
      console.log('Received consolidated data:', responseData);
      
      if (!responseData || !responseData.wallets || !Array.isArray(responseData.wallets)) {
        console.error('Invalid response structure:', responseData);
        throw new Error('Invalid response structure from server');
      }
      
      setData(responseData);
      setLastRefresh(new Date());
      
      // Update API status based on data quality
      setApiStatus({
        solPrice: responseData.solPrice > 0 ? 'success' : 'error',
        wallets: responseData.wallets.length > 0 ? 'success' : 'error',
        auraMarketCap: responseData.treasury.totalMarketCap > 0 ? 'success' : 'error'
      });

      // Show success toast
      toast({
        title: "Data Updated",
        description: `Successfully fetched data for ${responseData.wallets.length} wallets`,
      });

    } catch (error) {
      console.error('Error fetching consolidated data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch data';
      setError(errorMessage);
      
      setApiStatus({
        solPrice: 'error',
        wallets: 'error',
        auraMarketCap: 'error'
      });

      // Show error toast
      toast({
        title: "Data Fetch Failed", 
        description: errorMessage,
        variant: "destructive",
      });

      setData({
        treasury: {
          totalMarketCap: 0,
          volatileAssets: 0,
          hardAssets: 0,
          lastUpdated: new Date().toISOString()
        },
        wallets: [],
        solPrice: 0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Set up periodic refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return {
    data,
    loading,
    error,
    lastRefresh,
    apiStatus,
    fetchData
  };
};
