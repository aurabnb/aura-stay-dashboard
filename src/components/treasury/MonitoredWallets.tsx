'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wallet, ExternalLink, TrendingUp, DollarSign } from 'lucide-react';
import { useTreasuryData } from '@/hooks/useTreasuryData';
import { MONITORED_WALLETS } from '@/lib/constants';
import { formatUsd } from '@/lib/utils';
import type { WalletData } from '@/types/treasury';

const MonitoredWallets: React.FC = () => {
  const { data, loading, error } = useTreasuryData();

  const openWallet = (address: string) => {
    window.open(`https://solscan.io/account/${address}`, '_blank', 'noopener,noreferrer');
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const renderLPDetails = (lpDetails: any) => (
    <div className="mt-2 bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg border border-blue-200">
      <div className="text-sm font-medium text-blue-900 mb-2 flex items-center gap-2">
        <TrendingUp className="h-4 w-4" />
        LP Position Details
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-white p-2 rounded border-l-2 border-blue-400">
          <div className="text-xs font-medium text-gray-700">{lpDetails.token1?.symbol || 'Token A'}</div>
          <div className="text-xs text-gray-600">
            {lpDetails.token1?.amount?.toLocaleString(undefined, { maximumFractionDigits: 6 }) || '0'} 
            <span className="text-green-600 font-medium">
              {lpDetails.token1?.usdValue ? ` ($${lpDetails.token1.usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})` : ''}
            </span>
          </div>
        </div>
        <div className="bg-white p-2 rounded border-l-2 border-purple-400">
          <div className="text-xs font-medium text-gray-700">{lpDetails.token2?.symbol || 'Token B'}</div>
          <div className="text-xs text-gray-600">
            {lpDetails.token2?.amount?.toLocaleString(undefined, { maximumFractionDigits: 6 }) || '0'} 
            <span className="text-green-600 font-medium">
              {lpDetails.token2?.usdValue ? ` ($${lpDetails.token2.usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})` : ''}
            </span>
          </div>
        </div>
      </div>
      {lpDetails.priceRange && (
        <div className="mt-2 bg-white p-2 rounded border-l-2 border-yellow-400">
          <div className="text-xs font-medium text-gray-700">Price Range</div>
          <div className="text-xs text-gray-600">
            ${lpDetails.priceRange.min?.toFixed(4) || '0'} - ${lpDetails.priceRange.max?.toFixed(4) || '0'}
          </div>
        </div>
      )}
      {lpDetails.totalUsdValue && (
        <div className="mt-2 bg-gradient-to-r from-green-50 to-emerald-50 p-2 rounded border border-green-200">
          <div className="text-xs font-medium text-green-700">Total Position Value</div>
          <div className="text-sm font-bold text-green-800">
            ${lpDetails.totalUsdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Wallet className="h-5 w-5" />
            Monitored Wallets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {MONITORED_WALLETS.map((wallet, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 animate-pulse">
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
            Monitored Wallets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-600 text-center py-8">
            Failed to load wallet data: {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  const wallets = data?.wallets || [];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Wallet className="h-5 w-5" />
          Monitored Wallets
          <Badge variant="outline" className="ml-auto">
            {wallets.length} Active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {wallets.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No wallet data available
          </div>
        ) : (
          wallets.map((wallet) => (
            <div key={wallet.wallet_id} className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold">{wallet.name}</h3>
                  <p className="text-gray-600 text-sm">
                    {wallet.blockchain} - {formatAddress(wallet.address)}
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
                              {balance.is_lp_token && (
                                <Badge variant="secondary" className="text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                                  🔗 LP
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-gray-600">{balance.token_name}</div>
                            <div className="text-xs text-gray-500 capitalize flex items-center gap-1">
                              {balance.platform}
                              {balance.is_lp_token && (
                                <span className="text-blue-600 font-medium">• Liquidity Position</span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              {balance.balance.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                            </div>
                            <div className={`text-xs ${balance.is_lp_token ? 'text-blue-600 font-semibold' : 'text-gray-600'}`}>
                              {formatUsd(balance.usd_value || 0)}
                              {balance.is_lp_token && balance.usd_value > 0 && (
                                <span className="ml-1 text-green-600">💰</span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {balance.is_lp_token && balance.lp_details && renderLPDetails(balance.lp_details)}
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