
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { log } from '@/lib/logger';

interface TreasuryMetrics {
  totalMarketCap: number;
  volatileAssets: number;
  hardAssets: number;
  lastUpdated: string;
}

interface ConsolidatedData {
  treasury: TreasuryMetrics;
  wallets: any[];
  solPrice: number;
}

const ValueIndicator = () => {
  const [data, setData] = useState<ConsolidatedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      log.dev('Fetching consolidated treasury data', {}, 'ValueIndicator');
      setError(null);
      const { data: responseData, error: fetchError } = await supabase.functions.invoke('fetch-wallet-balances');
      
      if (fetchError) throw fetchError;
      
      log.dev('Received treasury data', responseData, 'ValueIndicator');
      
      // Check if the response has the expected structure
      if (!responseData || !responseData.treasury) {
        log.error('Invalid response structure', responseData, 'ValueIndicator');
        throw new Error('Invalid response structure from server');
      }
      
      setData(responseData);
    } catch (err) {
      log.error('Error fetching treasury data', err, 'ValueIndicator');
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      // Set default values on error
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
      log.error('Error refreshing data', error, 'ValueIndicator');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
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

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Aura Value Indicator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-600 p-4 bg-red-50 rounded-lg">
            <p className="font-medium">Error loading treasury data</p>
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

  const treasury = data?.treasury;
  const totalAssetsValue = (treasury?.volatileAssets || 0) + (treasury?.hardAssets || 0);
  const speculativeInterest = Math.max(0, (treasury?.totalMarketCap || 0) - totalAssetsValue);

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
            className="flex items-center gap-2 px-3 py-1 text-sm bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </CardTitle>
        <CardDescription>
          Real-time tracking of Aura Foundation's treasury and market value from Solana blockchain.
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
                <td className="py-3 px-4 text-gray-700">Total Market Cap (from Solana)</td>
                <td className="py-3 px-4 text-right text-gray-700">{formatCurrency(treasury?.totalMarketCap || 0)}</td>
                <td className="py-3 px-4 text-right text-gray-900">Live</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-gray-700">Volatile Assets</td>
                <td className="py-3 px-4 text-right text-gray-700">{formatCurrency(treasury?.volatileAssets || 0)}</td>
                <td className="py-3 px-4 text-right text-gray-900">Live</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-gray-700">Hard Assets</td>
                <td className="py-3 px-4 text-right text-gray-700">{formatCurrency(treasury?.hardAssets || 0)}</td>
                <td className="py-3 px-4 text-right text-gray-900">Live</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-gray-700">Speculative Interest</td>
                <td className="py-3 px-4 text-right text-gray-700">{formatCurrency(speculativeInterest)}</td>
                <td className="py-3 px-4 text-right text-gray-900">Live</td>
              </tr>
              <tr className="border-t-2 border-gray-300 bg-gray-50">
                <td className="py-3 px-4 font-semibold text-gray-900">Total Treasury Value</td>
                <td className="py-3 px-4 text-right font-semibold text-gray-900">{formatCurrency(totalAssetsValue)}</td>
                <td className="py-3 px-4 text-right text-gray-900">Live</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="text-sm text-gray-500 border-t pt-4">
          <p>Live data from monitored wallets across Solana and Ethereum networks.</p>
          <p className="mt-1">
            <strong>Total Market Cap:</strong> Fetched directly from Solana blockchain using AURA token mint address.
          </p>
          <p className="mt-1">
            <strong>Speculative Interest:</strong> Total Market Cap minus all Treasury Assets (Hard + Volatile).
          </p>
          <p className="mt-1">
            <strong>Total Treasury Value:</strong> Sum of all monitored wallet assets (excluding speculative interest).
          </p>
          {treasury?.lastUpdated && (
            <p className="mt-1">
              Last calculated: {new Date(treasury.lastUpdated).toLocaleString()}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ValueIndicator;
