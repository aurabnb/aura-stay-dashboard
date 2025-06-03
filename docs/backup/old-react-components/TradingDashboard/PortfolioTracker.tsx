import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Wallet, DollarSign, Activity, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTreasuryData } from '@/hooks/useTreasuryData';

const PortfolioTracker: React.FC = () => {
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const { data, loading, error, fetchData } = useTreasuryData();

  const formatCurrency = (amount: number) => {
    return isBalanceVisible ? `$${amount.toFixed(2)}` : '****';
  };

  const formatToken = (amount: number) => {
    return isBalanceVisible ? amount.toLocaleString() : '****';
  };

  // Calculate totals from real wallet data
  const calculatePortfolioTotals = () => {
    if (!data?.wallets) {
      return {
        totalValue: 0,
        auraBalance: 0,
        auraValue: 0,
        solBalance: 0,
        solValue: 0,
        otherTokensValue: 0
      };
    }

    let totalValue = 0;
    let auraBalance = 0;
    let auraValue = 0;
    let solBalance = 0;
    let solValue = 0;
    let otherTokensValue = 0;

    data.wallets.forEach(wallet => {
      wallet.balances.forEach(balance => {
        totalValue += balance.usd_value;
        
        if (balance.token_symbol === 'AURA') {
          auraBalance += balance.balance;
          auraValue += balance.usd_value;
        } else if (balance.token_symbol === 'SOL') {
          solBalance += balance.balance;
          solValue += balance.usd_value;
        } else {
          otherTokensValue += balance.usd_value;
        }
      });
    });

    return {
      totalValue,
      auraBalance,
      auraValue,
      solBalance,
      solValue,
      otherTokensValue
    };
  };

  const portfolio = calculatePortfolioTotals();

  if (loading) {
    return (
      <Card className="bg-white border border-gray-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-black font-urbanist flex items-center gap-2">
            <Wallet className="h-6 w-6 text-black" />
            Portfolio Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-gray-200 rounded-xl"></div>
            <div className="space-y-3">
              <div className="h-16 bg-gray-200 rounded-lg"></div>
              <div className="h-16 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-white border border-gray-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-black font-urbanist flex items-center gap-2">
            <Wallet className="h-6 w-6 text-black" />
            Portfolio Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">Error loading portfolio data</p>
            <Button onClick={fetchData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border border-gray-200 shadow-lg">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-black font-urbanist flex items-center gap-2">
              <Wallet className="h-6 w-6 text-black" />
              Portfolio Tracker
            </CardTitle>
            <CardDescription className="text-gray-600 font-urbanist mt-2">
              Live treasury holdings across all wallets
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsBalanceVisible(!isBalanceVisible)}
              className="text-gray-600 hover:text-black"
            >
              {isBalanceVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
            <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300 font-urbanist">
              <Activity className="h-3 w-3 mr-1" />
              Live
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Total Portfolio Value */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 font-urbanist">Total Treasury Value</h3>
            <div className="text-right">
              <p className="text-3xl font-bold text-black font-urbanist">{formatCurrency(portfolio.totalValue)}</p>
              <div className="flex items-center gap-2 justify-end mt-1">
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100">
                  <Activity className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-600">
                    {data?.wallets?.length || 0} Wallets
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Token Holdings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 font-urbanist">Holdings</h3>
          
          {/* AURA Token */}
          {portfolio.auraBalance > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center text-lg">
                    🌟
                  </div>
                  <div>
                    <p className="font-bold text-black font-urbanist">AURA</p>
                    <p className="text-sm text-gray-600 font-urbanist">Aura Token</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-black font-urbanist">{formatCurrency(portfolio.auraValue)}</p>
                  <p className="text-sm text-gray-600 font-urbanist">{formatToken(portfolio.auraBalance)} AURA</p>
                </div>
              </div>
            </div>
          )}

          {/* SOL Token */}
          {portfolio.solBalance > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center text-lg text-white font-bold">
                    S
                  </div>
                  <div>
                    <p className="font-bold text-black font-urbanist">SOL</p>
                    <p className="text-sm text-gray-600 font-urbanist">Solana</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-black font-urbanist">{formatCurrency(portfolio.solValue)}</p>
                  <p className="text-sm text-gray-600 font-urbanist">{formatToken(portfolio.solBalance)} SOL</p>
                </div>
              </div>
            </div>
          )}

          {/* Other Tokens */}
          {portfolio.otherTokensValue > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center text-lg text-white font-bold">
                    +
                  </div>
                  <div>
                    <p className="font-bold text-black font-urbanist">Other Tokens</p>
                    <p className="text-sm text-gray-600 font-urbanist">USDC, CULT, etc.</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-black font-urbanist">{formatCurrency(portfolio.otherTokensValue)}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200">
          <Button 
            variant="outline" 
            className="bg-black text-white border-black hover:bg-gray-800 hover:border-gray-800 font-urbanist"
            onClick={() => window.open('https://jup.ag/swap/SOL-3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe', '_blank')}
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Buy AURA
          </Button>
          <Button 
            variant="outline" 
            className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-urbanist"
            onClick={fetchData}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>

        <div className="text-center pt-2">
          <p className="text-xs text-gray-500 font-urbanist">
            Data updates every 5 minutes • Last updated: {data ? new Date().toLocaleTimeString() : 'Never'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PortfolioTracker;
