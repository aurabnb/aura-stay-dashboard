
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, ExternalLink, ChevronDown, ChevronUp, RefreshCw, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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

const MonitoredWallets = () => {
  const [data, setData] = useState<ConsolidatedData | null>(null);
  const [expandedWallets, setExpandedWallets] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      console.log('Fetching consolidated data...');
      const { data: responseData, error } = await supabase.functions.invoke('fetch-wallet-balances');
      
      if (error) throw error;
      
      console.log('Received consolidated data:', responseData);
      setData(responseData);
    } catch (error) {
      console.error('Error fetching consolidated data:', error);
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
    
    // Set up periodic refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const openExplorer = (wallet: WalletData) => {
    const explorerUrl = wallet.blockchain === 'Solana' 
      ? `https://solscan.io/account/${wallet.address}`
      : `https://etherscan.io/address/${wallet.address}`;
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

  const renderLPDetails = (lpDetails: LPDetails) => (
    <div className="mt-2 bg-blue-50 p-3 rounded-lg">
      <div className="text-sm font-medium text-blue-900 mb-2">LP Position Details</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-white p-2 rounded">
          <div className="text-xs font-medium text-gray-700">{lpDetails.token1.symbol}</div>
          <div className="text-xs text-gray-600">
            {lpDetails.token1.amount.toLocaleString(undefined, { maximumFractionDigits: 6 })} 
            (${lpDetails.token1.usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
          </div>
        </div>
        <div className="bg-white p-2 rounded">
          <div className="text-xs font-medium text-gray-700">{lpDetails.token2.symbol}</div>
          <div className="text-xs text-gray-600">
            {lpDetails.token2.amount.toLocaleString(undefined, { maximumFractionDigits: 6 })} 
            (${lpDetails.token2.usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
          </div>
        </div>
      </div>
      <div className="mt-2 bg-white p-2 rounded">
        <div className="text-xs font-medium text-gray-700">Price Range</div>
        <div className="text-xs text-gray-600">
          ${lpDetails.priceRange.min.toFixed(4)} - ${lpDetails.priceRange.max.toFixed(4)}
        </div>
      </div>
    </div>
  );

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

  const totalPortfolioValue = data?.wallets.reduce((sum, wallet) => sum + wallet.totalUsdValue, 0) || 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Monitored Wallets
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
          Real-time tracking of Aura Foundation treasury wallets including LP positions. Total Value: ${totalPortfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Solana Price Widget */}
        {data?.solPrice && (
          <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-sm font-medium text-gray-700">Solana Price</div>
                <div className="text-2xl font-bold text-purple-600">
                  ${data.solPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {data?.wallets.map((wallet) => (
            <div key={wallet.wallet_id} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 font-urbanist">{wallet.name}</h3>
                  <p className="text-xs text-gray-500">{wallet.blockchain}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="font-semibold text-lg">${wallet.totalUsdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <p className="text-xs text-gray-500">{wallet.balances.length} assets</p>
                  </div>
                  <button
                    onClick={() => openExplorer(wallet)}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm px-2 py-1 rounded"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="text-sm mb-3">
                <span className="text-gray-500">Address:</span>
                <p className="font-mono">{formatAddress(wallet.address)}</p>
              </div>

              {wallet.balances.length > 0 && (
                <button
                  onClick={() => toggleWalletExpansion(wallet.wallet_id)}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  {expandedWallets.has(wallet.wallet_id) ? (
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

              {expandedWallets.has(wallet.wallet_id) && wallet.balances.length > 0 && (
                <div className="mt-4 border-t pt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Token Symbol</TableHead>
                        <TableHead>Token Name</TableHead>
                        <TableHead className="text-right">Balance</TableHead>
                        <TableHead className="text-right">USD Value</TableHead>
                        <TableHead>Platform</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {wallet.balances.map((balance, index) => (
                        <React.Fragment key={index}>
                          <TableRow>
                            <TableCell className="font-medium">
                              {balance.token_symbol}
                              {balance.is_lp_token && (
                                <span className="ml-1 px-1 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">LP</span>
                              )}
                            </TableCell>
                            <TableCell>{balance.token_name}</TableCell>
                            <TableCell className="text-right">
                              {balance.balance.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                            </TableCell>
                            <TableCell className="text-right">
                              ${balance.usd_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </TableCell>
                            <TableCell className="capitalize">{balance.platform}</TableCell>
                          </TableRow>
                          {balance.is_lp_token && balance.lp_details && (
                            <TableRow>
                              <TableCell colSpan={5} className="p-0">
                                {renderLPDetails(balance.lp_details)}
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      ))}
                    </TableBody>
                  </Table>
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
