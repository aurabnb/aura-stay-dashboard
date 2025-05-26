
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ValueData {
  totalMarketCap: number;
  volatileAssets: number;
  hardAssets: number;
  speculativeInterest: number;
  totalValue: number;
  lastUpdated: string;
}

const ValueIndicator = () => {
  const [valueData, setValueData] = useState<ValueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchValueData = async () => {
    try {
      // Fetch wallet balances to calculate totals
      const { data: balances, error } = await supabase
        .from('wallet_balances')
        .select(`
          *,
          wallets!inner(name, wallet_type)
        `);

      if (error) throw error;

      // Calculate values based on wallet types
      let volatileAssets = 0;
      let hardAssets = 0;
      let operationalAssets = 0;

      balances.forEach(balance => {
        const walletType = balance.wallets.wallet_type;
        const usdValue = balance.usd_value || 0;

        switch (walletType) {
          case 'funding':
            // Project funding wallets contain hard assets (real estate investments)
            hardAssets += usdValue;
            break;
          case 'marketing':
          case 'business':
            // Marketing and business costs are operational/volatile
            volatileAssets += usdValue;
            break;
          case 'operations':
            // Operations wallet
            operationalAssets += usdValue;
            break;
          default:
            volatileAssets += usdValue;
        }
      });

      const totalValue = volatileAssets + hardAssets + operationalAssets;
      const totalMarketCap = totalValue; // For now, market cap equals total value
      const speculativeInterest = Math.max(0, totalMarketCap - (volatileAssets + hardAssets));

      const mockData: ValueData = {
        totalMarketCap,
        volatileAssets: volatileAssets + operationalAssets, // Include operational in volatile
        hardAssets,
        speculativeInterest,
        totalValue,
        lastUpdated: new Date().toISOString()
      };
      
      setValueData(mockData);
    } catch (err) {
      console.error('Error fetching value data:', err);
      // Set default values on error
      setValueData({
        totalMarketCap: 0,
        volatileAssets: 0,
        hardAssets: 0,
        speculativeInterest: 0,
        totalValue: 0,
        lastUpdated: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    try {
      // First refresh wallet balances
      await supabase.functions.invoke('fetch-wallet-balances');
      // Then refetch the calculated values
      await fetchValueData();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchValueData();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Aura Value Indicator
          </CardTitle>
          <CardDescription>
            Tracking of Aura Foundation's treasury and market value.
          </CardDescription>
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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Aura Value Indicator
          </div>
          <button
            onClick={refreshData}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </CardTitle>
        <CardDescription>
          Real-time tracking of Aura Foundation's treasury and market value.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Asset Category</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Value (USD)</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="py-3 px-4 text-gray-700">Total Market Cap</td>
                <td className="py-3 px-4 text-right text-gray-700">{formatCurrency(valueData?.totalMarketCap || 0)}</td>
                <td className="py-3 px-4 text-right text-green-600">Live</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-gray-700">Volatile Assets</td>
                <td className="py-3 px-4 text-right text-gray-700">{formatCurrency(valueData?.volatileAssets || 0)}</td>
                <td className="py-3 px-4 text-right text-green-600">Live</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-gray-700">Hard Assets</td>
                <td className="py-3 px-4 text-right text-gray-700">{formatCurrency(valueData?.hardAssets || 0)}</td>
                <td className="py-3 px-4 text-right text-green-600">Live</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-gray-700">Speculative Interest</td>
                <td className="py-3 px-4 text-right text-gray-700">{formatCurrency(valueData?.speculativeInterest || 0)}</td>
                <td className="py-3 px-4 text-right text-green-600">Live</td>
              </tr>
              <tr className="border-t-2 border-gray-300 bg-gray-50">
                <td className="py-3 px-4 font-semibold text-gray-900">Total Value</td>
                <td className="py-3 px-4 text-right font-semibold text-gray-900">{formatCurrency(valueData?.totalValue || 0)}</td>
                <td className="py-3 px-4 text-right text-green-600">Live</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="text-sm text-gray-500 border-t pt-4">
          <p>Live data from monitored wallets across Solana and Ethereum networks.</p>
          <p className="mt-1">
            <strong>Note:</strong> "Speculative Interest" = Total Market Cap - (Volatile Assets + Hard Assets). 
            "Total Value" = Speculative Interest + Volatile Assets + Hard Assets.
          </p>
          {valueData?.lastUpdated && (
            <p className="mt-1">
              Last calculated: {new Date(valueData.lastUpdated).toLocaleString()}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ValueIndicator;
