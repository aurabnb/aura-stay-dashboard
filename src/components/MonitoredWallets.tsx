import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Wallet } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import MeteoraPoolsWidget from './MeteoraPoolsWidget';

interface LPDetails {
  poolAddress: string;
  token1: { symbol: string; amount: number; usdValue: number };
  token2: { symbol: string; amount: number; usdValue: number };
  priceRange: { min: number; max: number };
  totalUsdValue: number;
  meteoraData?: any;
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

interface ConsolidatedData {
  treasury: any;
  wallets: WalletData[];
  solPrice: number;
}

const MonitoredWallets = () => {
  const [data, setData] = useState<ConsolidatedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      console.log('Fetching consolidated data...');
      setError(null);
      const { data: responseData, error: fetchError } = await supabase.functions.invoke('fetch-wallet-balances');

      if (fetchError) throw fetchError;

      console.log('Received consolidated data:', responseData);

      if (!responseData || !responseData.wallets || !Array.isArray(responseData.wallets)) {
        console.error('Invalid response structure:', responseData);
        throw new Error('Invalid response structure from server');
      }

      setData(responseData);
    } catch (err) {
      console.error('Error fetching consolidated data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
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

  const refreshData = async () => {
    setRefreshing(true);
    try {
      await fetchData();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Monitored Wallets</CardTitle>
          <CardDescription>Loading wallet data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Monitored Wallets</CardTitle>
          <CardDescription>Error loading wallet data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-red-600 p-4 bg-red-50 rounded-lg">
            <p className="font-medium">Error loading wallet data</p>
            <p className="text-sm mt-1">{error}</p>
            <button
              onClick={refreshData}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  return (
    <div className="space-y-8">
      {data.wallets
        .filter(wallet => wallet.name.includes('Project Funding'))
        .map(wallet => (
          <MeteoraPoolsWidget
            key={wallet.wallet_id}
            walletBalances={wallet.balances}
            walletName={wallet.name}
            walletAddress={wallet.address}
          />
        ))}

      <div className="grid gap-6">
        {data.wallets.map((wallet) => (
          <Card key={wallet.wallet_id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    {wallet.name}
                    <Badge variant="secondary" className="ml-2">{wallet.blockchain}</Badge>
                  </CardTitle>
                  <CardDescription>
                    <div className="truncate">
                      {wallet.address}
                    </div>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 font-medium text-gray-900">Token</th>
                      <th className="text-right py-2 px-3 font-medium text-gray-900">Balance</th>
                      <th className="text-right py-2 px-3 font-medium text-gray-900">USD Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {wallet.balances.map((balance) => (
                      <tr key={balance.token_symbol}>
                        <td className="py-2 px-3 text-gray-700">{balance.token_symbol}</td>
                        <td className="py-2 px-3 text-right text-gray-700">{balance.balance.toLocaleString()}</td>
                        <td className="py-2 px-3 text-right text-gray-700">{formatCurrency(balance.usd_value)}</td>
                      </tr>
                    ))}
                    <tr className="border-t border-gray-300 bg-gray-50">
                      <td className="py-2 px-3 font-semibold text-gray-900">Total</td>
                      <td className="py-2 px-3 text-right font-semibold text-gray-900"></td>
                      <td className="py-2 px-3 text-right font-semibold text-gray-900">{formatCurrency(wallet.totalUsdValue)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-sm text-gray-500 text-center space-y-2">
        <button
          onClick={refreshData}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-3 py-1 text-sm bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
        <p>Data is updated every 5 minutes.</p>
      </div>
    </div>
  );
};

export default MonitoredWallets;
