
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Wallet, DollarSign, Activity, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PortfolioData {
  totalValue: number;
  totalPnL: number;
  totalPnLPercent: number;
  auraBalance: number;
  auraValue: number;
  auraPnL: number;
  auraPnLPercent: number;
  solBalance: number;
  solValue: number;
  lastUpdated: string;
}

const PortfolioTracker: React.FC = () => {
  const [portfolio, setPortfolio] = useState<PortfolioData>({
    totalValue: 0,
    totalPnL: 0,
    totalPnLPercent: 0,
    auraBalance: 0,
    auraValue: 0,
    auraPnL: 0,
    auraPnLPercent: 0,
    solBalance: 0,
    solValue: 0,
    lastUpdated: new Date().toLocaleTimeString()
  });
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);

  // Mock data - In real implementation, this would fetch from wallet/Jupiter API
  useEffect(() => {
    const mockPortfolio: PortfolioData = {
      totalValue: 1250.75,
      totalPnL: 185.25,
      totalPnLPercent: 17.4,
      auraBalance: 125000,
      auraValue: 14.45,
      auraPnL: 3.21,
      auraPnLPercent: 28.5,
      solBalance: 0.85,
      solValue: 195.50,
      lastUpdated: new Date().toLocaleTimeString()
    };
    setPortfolio(mockPortfolio);
  }, []);

  const formatCurrency = (amount: number) => {
    return isBalanceVisible ? `$${amount.toFixed(2)}` : '****';
  };

  const formatToken = (amount: number) => {
    return isBalanceVisible ? amount.toLocaleString() : '****';
  };

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
              Your AURA holdings and performance
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
            <h3 className="text-lg font-semibold text-gray-900 font-urbanist">Total Portfolio Value</h3>
            <div className="text-right">
              <p className="text-3xl font-bold text-black font-urbanist">{formatCurrency(portfolio.totalValue)}</p>
              <div className="flex items-center gap-2 justify-end mt-1">
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                  portfolio.totalPnL > 0 ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {portfolio.totalPnL > 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span className={`text-sm font-semibold ${
                    portfolio.totalPnL > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {portfolio.totalPnL > 0 ? '+' : ''}{isBalanceVisible ? `$${portfolio.totalPnL.toFixed(2)}` : '****'} ({portfolio.totalPnL > 0 ? '+' : ''}{portfolio.totalPnLPercent.toFixed(1)}%)
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
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 font-urbanist">P&L</span>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                portfolio.auraPnL > 0 ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <span className={`text-sm font-semibold ${
                  portfolio.auraPnL > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {portfolio.auraPnL > 0 ? '+' : ''}{formatCurrency(portfolio.auraPnL)} ({portfolio.auraPnL > 0 ? '+' : ''}{portfolio.auraPnLPercent.toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>

          {/* SOL Token */}
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
          >
            <Activity className="h-4 w-4 mr-2" />
            View History
          </Button>
        </div>

        <div className="text-center pt-2">
          <p className="text-xs text-gray-500 font-urbanist">
            Last updated: {portfolio.lastUpdated}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PortfolioTracker;
