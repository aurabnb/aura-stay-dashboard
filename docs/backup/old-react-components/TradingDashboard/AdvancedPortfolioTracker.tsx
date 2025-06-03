
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, Wallet, DollarSign, Activity, Eye, EyeOff, RefreshCw, PieChart, BarChart3, Calendar, Target, AlertCircle } from 'lucide-react';
import { useTreasuryData } from '@/hooks/useTreasuryData';
import { useToast } from '@/hooks/use-toast';

interface PortfolioAnalytics {
  totalValue: number;
  dailyChange: number;
  weeklyChange: number;
  monthlyChange: number;
  bestPerformer: string;
  worstPerformer: string;
  diversificationScore: number;
  riskLevel: 'Low' | 'Medium' | 'High';
}

const AdvancedPortfolioTracker: React.FC = () => {
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [analytics, setAnalytics] = useState<PortfolioAnalytics | null>(null);
  const [historicalData, setHistoricalData] = useState<Array<{date: string, value: number}>>([]);
  const [alerts, setAlerts] = useState<Array<{id: string, message: string, type: 'warning' | 'info' | 'success'}>>([]);
  const { data, loading, error, fetchData } = useTreasuryData();
  const { toast } = useToast();

  // Calculate portfolio analytics
  useEffect(() => {
    if (data?.wallets) {
      const totalValue = data.wallets.reduce((sum, wallet) => sum + wallet.totalUsdValue, 0);
      
      // Simulate analytics calculation
      const mockAnalytics: PortfolioAnalytics = {
        totalValue,
        dailyChange: Math.random() * 10 - 5, // -5% to +5%
        weeklyChange: Math.random() * 20 - 10, // -10% to +10%
        monthlyChange: Math.random() * 40 - 20, // -20% to +20%
        bestPerformer: 'AURA',
        worstPerformer: 'SOL',
        diversificationScore: Math.round(Math.random() * 40 + 60), // 60-100
        riskLevel: totalValue > 5000 ? 'High' : totalValue > 2000 ? 'Medium' : 'Low'
      };
      
      setAnalytics(mockAnalytics);
      
      // Generate historical data for the past 30 days
      const historical = Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        value: totalValue * (1 + (Math.random() * 0.4 - 0.2))
      }));
      setHistoricalData(historical);
      
      // Generate portfolio alerts
      const newAlerts = [];
      if (mockAnalytics.dailyChange < -5) {
        newAlerts.push({
          id: '1',
          message: 'Portfolio down more than 5% today',
          type: 'warning' as const
        });
      }
      if (mockAnalytics.diversificationScore < 70) {
        newAlerts.push({
          id: '2',
          message: 'Consider diversifying your portfolio',
          type: 'info' as const
        });
      }
      if (totalValue > 10000) {
        newAlerts.push({
          id: '3',
          message: 'Portfolio value exceeds $10k milestone!',
          type: 'success' as const
        });
      }
      setAlerts(newAlerts);
    }
  }, [data]);

  const formatCurrency = (amount: number) => {
    return isBalanceVisible ? `$${amount.toFixed(2)}` : '****';
  };

  const formatPercentage = (percentage: number) => {
    return isBalanceVisible ? `${percentage > 0 ? '+' : ''}${percentage.toFixed(2)}%` : '**%';
  };

  if (loading) {
    return (
      <Card className="bg-white border border-gray-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-black font-urbanist flex items-center gap-2">
            <Wallet className="h-6 w-6 text-black" />
            Advanced Portfolio Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-gray-200 rounded-xl"></div>
            <div className="space-y-3">
              <div className="h-20 bg-gray-200 rounded-lg"></div>
              <div className="h-20 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !analytics) {
    return (
      <Card className="bg-white border border-gray-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-black font-urbanist flex items-center gap-2">
            <Wallet className="h-6 w-6 text-black" />
            Advanced Portfolio Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
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
              Advanced Portfolio Tracker
            </CardTitle>
            <CardDescription className="text-gray-600 font-urbanist mt-2">
              Comprehensive portfolio analytics and insights
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

      <CardContent>
        {/* Portfolio Alerts */}
        {alerts.length > 0 && (
          <div className="mb-6 space-y-2">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border ${
                  alert.type === 'warning' 
                    ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
                    : alert.type === 'success'
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : 'bg-blue-50 border-blue-200 text-blue-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">{alert.message}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="allocation">Allocation</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Total Portfolio Value */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 font-urbanist">Total Portfolio Value</h3>
                <div className="text-right">
                  <p className="text-3xl font-bold text-black font-urbanist">{formatCurrency(analytics.totalValue)}</p>
                  <div className="flex items-center gap-2 justify-end mt-1">
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                      analytics.dailyChange >= 0 ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {analytics.dailyChange >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                      <span className={`text-sm font-semibold ${
                        analytics.dailyChange >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatPercentage(analytics.dailyChange)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Weekly</span>
                </div>
                <p className={`text-lg font-bold ${analytics.weeklyChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercentage(analytics.weeklyChange)}
                </p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-gray-700">Monthly</span>
                </div>
                <p className={`text-lg font-bold ${analytics.monthlyChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercentage(analytics.monthlyChange)}
                </p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">Best</span>
                </div>
                <p className="text-lg font-bold text-gray-900">{analytics.bestPerformer}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium text-gray-700">Risk</span>
                </div>
                <p className={`text-lg font-bold ${
                  analytics.riskLevel === 'Low' ? 'text-green-600' :
                  analytics.riskLevel === 'Medium' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {analytics.riskLevel}
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6 mt-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Performance Chart</h3>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Chart visualization would appear here</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="allocation" className="space-y-6 mt-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Asset Allocation</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">SOL</span>
                    <span className="text-sm text-gray-600">45%</span>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">AURA</span>
                    <span className="text-sm text-gray-600">35%</span>
                  </div>
                  <Progress value={35} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Other</span>
                    <span className="text-sm text-gray-600">20%</span>
                  </div>
                  <Progress value={20} className="h-2" />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Diversification Score</h3>
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">{analytics.diversificationScore}</div>
                  <p className="text-sm text-gray-600">Out of 100</p>
                  <Progress value={analytics.diversificationScore} className="mt-4" />
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Risk Analysis</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Volatility</span>
                    <span className="text-sm font-medium">{analytics.riskLevel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Correlation</span>
                    <span className="text-sm font-medium">0.65</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Sharpe Ratio</span>
                    <span className="text-sm font-medium">1.2</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 pt-6 border-t border-gray-200 mt-6">
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
            Refresh
          </Button>
        </div>

        <div className="text-center pt-4">
          <p className="text-xs text-gray-500 font-urbanist">
            Advanced analytics • Last updated: {new Date().toLocaleTimeString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedPortfolioTracker;
