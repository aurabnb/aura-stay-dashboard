
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wallet, ExternalLink, TrendingUp, DollarSign, RefreshCw, Clock } from 'lucide-react';
import { useShyftData } from '@/hooks/useShyftData';
import { formatUsd } from '@/lib/utils';

const MonitoredWallets: React.FC = () => {
  const { data, loading, error, syncing, lastSyncTime, refetch, syncWallets } = useShyftData();

  const openWallet = (address: string) => {
    window.open(`https://solscan.io/account/${address}`, '_blank', 'noopener,noreferrer');
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Never';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  if (loading && !data) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Wallet className="h-5 w-5" />
            Monitored Wallets (Shyft API)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-4 animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Wallet className="h-5 w-5" />
            Monitored Wallets (Shyft API)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-600 text-center py-8">
            <p className="mb-4">Failed to load wallet data: {error}</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={refetch} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
              <Button onClick={syncWallets} variant="default" size="sm" disabled={syncing}>
                <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                Sync from Shyft
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const wallets = data?.wallets || [];

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <Wallet className="h-5 w-5" />
            Monitored Wallets (Shyft API)
            <Badge variant="outline" className="ml-auto">
              {wallets.length} Active
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            {lastSyncTime && (
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Clock className="h-3 w-3" />
                {formatLastSync(lastSyncTime)}
              </div>
            )}
            <Button 
              onClick={syncWallets} 
              variant="outline" 
              size="sm" 
              disabled={syncing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
              Sync
            </Button>
            <Button onClick={refetch} variant="ghost" size="sm">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {wallets.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="mb-4">No wallet data available</p>
            <Button onClick={syncWallets} variant="default" disabled={syncing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
              Sync Wallets from Shyft
            </Button>
          </div>
        ) : (
          wallets.map((wallet) => (
            <div key={wallet.wallet_id} className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold">{wallet.name}</h3>
                  <p className="text-gray-600 text-sm">
                    Solana - {formatAddress(wallet.address)}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openWallet(wallet.address)}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  View
                </Button>
              </div>
              
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span className="text-2xl font-bold text-green-600">
                  {formatUsd(wallet.totalUsdValue)}
                </span>
              </div>
              
              {wallet.balances && wallet.balances.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Assets ({wallet.balances.length})
                  </h4>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {wallet.balances.map((balance, index) => (
                      <div key={index} className="border-l-2 border-blue-200 pl-3 bg-white p-3 rounded">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-sm font-medium flex items-center gap-2">
                              {balance.token_symbol}
                              {balance.platform === 'native' && (
                                <Badge variant="secondary" className="text-xs">
                                  Native
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-gray-600">{balance.token_name}</div>
                            <div className="text-xs text-gray-500 capitalize">{balance.platform}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              {balance.balance.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                            </div>
                            <div className="text-xs text-gray-600">
                              {formatUsd(balance.usd_value || 0)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default MonitoredWallets;
