
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, ExternalLink, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface WalletBalance {
  id: string;
  token_symbol: string;
  token_name: string;
  balance: number;
  usd_value: number;
  token_address?: string;
  is_lp_token: boolean;
  platform: string;
  last_updated: string;
}

interface WalletData {
  id: string;
  name: string;
  description: string;
  address: string;
  blockchain: string;
  wallet_type: string;
  explorer_url: string;
  balances: WalletBalance[];
  totalValue: number;
}

const MonitoredWallets = () => {
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [expandedWallets, setExpandedWallets] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchWallets = async () => {
    try {
      // Fetch wallets
      const { data: walletsData, error: walletsError } = await supabase
        .from('wallets')
        .select('*')
        .order('name');

      if (walletsError) throw walletsError;

      // Fetch balances for all wallets
      const { data: balancesData, error: balancesError } = await supabase
        .from('wallet_balances')
        .select('*')
        .order('usd_value', { ascending: false });

      if (balancesError) throw balancesError;

      // Combine data
      const walletsWithBalances = walletsData.map(wallet => {
        const walletBalances = balancesData.filter(balance => balance.wallet_id === wallet.id);
        const totalValue = walletBalances.reduce((sum, balance) => sum + (balance.usd_value || 0), 0);
        
        return {
          ...wallet,
          balances: walletBalances,
          totalValue
        };
      });

      setWallets(walletsWithBalances);
    } catch (error) {
      console.error('Error fetching wallets:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshBalances = async () => {
    setRefreshing(true);
    try {
      const { error } = await supabase.functions.invoke('fetch-wallet-balances');
      if (error) throw error;
      
      // Refetch data after successful update
      await fetchWallets();
    } catch (error) {
      console.error('Error refreshing balances:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const openExplorer = (explorerUrl: string) => {
    window.open(explorerUrl, '_blank');
  };

  const toggleWalletExpansion = (walletId: string) => {
    const newExpanded = new Set(expandedWallets);
    if (newExpanded.has(walletId)) {
      newExpanded.delete(walletId);
    } else {
      newExpanded.add(walletId);
    }
    setExpandedWallets(newExpanded);
  };

  const totalPortfolioValue = wallets.reduce((sum, wallet) => sum + wallet.totalValue, 0);

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Monitored Wallets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
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
            <Wallet className="h-5 w-5" />
            Monitored Wallets
          </div>
          <button
            onClick={refreshBalances}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </CardTitle>
        <CardDescription>
          Real-time tracking of Aura Foundation treasury wallets. Total Value: ${totalPortfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {wallets.map((wallet) => (
            <div key={wallet.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 font-urbanist">{wallet.name}</h3>
                  <p className="text-sm text-gray-600">{wallet.description}</p>
                  <p className="text-xs text-gray-500">{wallet.blockchain}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="font-semibold text-lg">${wallet.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <p className="text-xs text-gray-500">{wallet.balances.length} assets</p>
                  </div>
                  <button
                    onClick={() => openExplorer(wallet.explorer_url)}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm px-2 py-1 rounded"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-3">
                <div>
                  <span className="text-gray-500">Address:</span>
                  <p className="font-mono">{formatAddress(wallet.address)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Type:</span>
                  <p className="capitalize">{wallet.wallet_type}</p>
                </div>
              </div>

              {wallet.balances.length > 0 && (
                <button
                  onClick={() => toggleWalletExpansion(wallet.id)}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  {expandedWallets.has(wallet.id) ? (
                    <>
                      <ChevronUp className="h-4 w-4" />
                      Hide Assets
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      Show Assets ({wallet.balances.length})
                    </>
                  )}
                </button>
              )}

              {expandedWallets.has(wallet.id) && wallet.balances.length > 0 && (
                <div className="mt-4 border-t pt-4">
                  <div className="space-y-2">
                    {wallet.balances.map((balance, index) => (
                      <div key={index} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                        <div>
                          <div className="font-medium">{balance.token_symbol}</div>
                          <div className="text-xs text-gray-500">
                            {balance.token_name} • {balance.platform}
                            {balance.is_lp_token && ' • LP Token'}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {balance.balance.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                          </div>
                          <div className="text-sm text-gray-600">
                            ${balance.usd_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {wallet.balances.length > 0 && (
                    <div className="mt-2 text-xs text-gray-400">
                      Last updated: {new Date(wallet.balances[0].last_updated).toLocaleString()}
                    </div>
                  )}
                </div>
              )}

              {wallet.balances.length === 0 && (
                <div className="mt-2 text-sm text-gray-500 italic">
                  No balance data available. Click refresh to fetch latest balances.
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MonitoredWallets;
