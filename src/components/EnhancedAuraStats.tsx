
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, DollarSign, Users, Zap, Target, BarChart3, PieChart, Activity, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { useTreasuryData } from '../hooks/useTreasuryData';
import { useToast } from '@/hooks/use-toast';

interface MetricCard {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  color: string;
  description: string;
}

const EnhancedAuraStats = () => {
  const { data, loading, error, fetchData, lastRefresh, apiStatus } = useTreasuryData();
  const [activeTab, setActiveTab] = useState('overview');
  const [metricsHistory, setMetricsHistory] = useState<Array<{timestamp: number, value: number}>>([]);
  const [goals, setGoals] = useState([
    { name: 'First Property Purchase', target: 100000, current: 0, progress: 0 },
    { name: 'Community Growth', target: 5000, current: 1250, progress: 25 },
    { name: 'Liquidity Pool', target: 500000, current: 85000, progress: 17 }
  ]);
  const { toast } = useToast();

  // Calculate metrics
  const metrics: MetricCard[] = [
    {
      title: 'Treasury Value',
      value: data ? `$${(data.treasury.volatileAssets + data.treasury.hardAssets).toLocaleString()}` : '$0',
      change: data ? Math.random() * 10 - 5 : 0, // Simulated change
      icon: <DollarSign className="h-5 w-5" />,
      color: 'text-green-600',
      description: 'Total treasury including volatile and hard assets'
    },
    {
      title: 'Market Cap',
      value: data ? `$${data.treasury.totalMarketCap.toLocaleString()}` : '$0',
      change: data ? Math.random() * 15 - 7.5 : 0,
      icon: <BarChart3 className="h-5 w-5" />,
      color: 'text-blue-600',
      description: 'Total market capitalization of AURA token'
    },
    {
      title: 'Active Wallets',
      value: data ? data.wallets.length.toString() : '0',
      change: data ? Math.random() * 5 : 0,
      icon: <Users className="h-5 w-5" />,
      color: 'text-purple-600',
      description: 'Number of active treasury wallets'
    },
    {
      title: 'Liquidity',
      value: '$85,000',
      change: Math.random() * 8 - 4,
      icon: <Zap className="h-5 w-5" />,
      color: 'text-orange-600',
      description: 'Available liquidity across all pools'
    }
  ];

  // Update goals based on current data
  useEffect(() => {
    if (data) {
      const totalTreasury = data.treasury.volatileAssets + data.treasury.hardAssets;
      setGoals(prev => prev.map(goal => {
        if (goal.name === 'First Property Purchase') {
          return {
            ...goal,
            current: totalTreasury,
            progress: Math.min((totalTreasury / goal.target) * 100, 100)
          };
        }
        return goal;
      }));
    }
  }, [data]);

  // Generate historical data
  useEffect(() => {
    if (data) {
      const history = Array.from({ length: 24 }, (_, i) => ({
        timestamp: Date.now() - (23 - i) * 60 * 60 * 1000,
        value: (data.treasury.volatileAssets + data.treasury.hardAssets) * (1 + (Math.random() * 0.2 - 0.1))
      }));
      setMetricsHistory(history);
    }
  }, [data]);

  const handleRefresh = async () => {
    try {
      await fetchData();
      toast({
        title: "Data Refreshed",
        description: "All metrics have been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Unable to update data. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card className="bg-white border border-gray-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-black font-urbanist">
            Enhanced AURA Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
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
              <Activity className="h-6 w-6 text-blue-600" />
              Enhanced AURA Statistics
            </CardTitle>
            <CardDescription className="text-gray-600 font-urbanist mt-2">
              Comprehensive analytics and project progress tracking
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={`${
                apiStatus === 'success' 
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : apiStatus === 'error'
                  ? 'bg-red-50 text-red-700 border-red-200'
                  : 'bg-yellow-50 text-yellow-700 border-yellow-200'
              } font-urbanist`}
            >
              {apiStatus === 'success' ? (
                <CheckCircle className="h-3 w-3 mr-1" />
              ) : (
                <AlertCircle className="h-3 w-3 mr-1" />
              )}
              {apiStatus === 'success' ? 'Live' : apiStatus === 'error' ? 'Error' : 'Loading'}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
              className="font-urbanist"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
          </div>
        </div>
        
        {lastRefresh && (
          <p className="text-sm text-gray-500 font-urbanist mt-2">
            Last updated: {lastRefresh.toLocaleString()}
          </p>
        )}
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {metrics.map((metric, index) => (
                <Card key={index} className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-2 rounded-lg bg-gray-100 ${metric.color}`}>
                        {metric.icon}
                      </div>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                        metric.change >= 0 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {metric.change >= 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {metric.change >= 0 ? '+' : ''}{metric.change.toFixed(1)}%
                      </div>
                    </div>
                    <h3 className="text-sm font-medium text-gray-600 font-urbanist mb-1">
                      {metric.title}
                    </h3>
                    <p className="text-2xl font-bold text-black font-urbanist mb-2">
                      {metric.value}
                    </p>
                    <p className="text-xs text-gray-500 font-urbanist">
                      {metric.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Treasury Breakdown */}
            {data && (
              <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-blue-600" />
                    Treasury Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        ${data.treasury.volatileAssets.toLocaleString()}
                      </div>
                      <p className="text-sm text-blue-700 font-medium">Volatile Assets</p>
                      <p className="text-xs text-blue-600 mt-1">Crypto & Tokens</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        ${data.treasury.hardAssets.toLocaleString()}
                      </div>
                      <p className="text-sm text-green-700 font-medium">Hard Assets</p>
                      <p className="text-xs text-green-600 mt-1">Real Estate & Physical</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600 mb-2">
                        ${(data.treasury.volatileAssets + data.treasury.hardAssets).toLocaleString()}
                      </div>
                      <p className="text-sm text-purple-700 font-medium">Total Treasury</p>
                      <p className="text-xs text-purple-600 mt-1">Combined Value</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="metrics" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Treasury Growth</span>
                        <span className="text-sm text-green-600 font-semibold">+15.2%</span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Community Engagement</span>
                        <span className="text-sm text-blue-600 font-semibold">82%</span>
                      </div>
                      <Progress value={82} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Liquidity Ratio</span>
                        <span className="text-sm text-purple-600 font-semibold">68%</span>
                      </div>
                      <Progress value={68} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Token Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Supply</span>
                      <span className="text-sm font-semibold">1B AURA</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Circulating</span>
                      <span className="text-sm font-semibold">750M AURA</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Holders</span>
                      <span className="text-sm font-semibold">1,250</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Avg. Transaction</span>
                      <span className="text-sm font-semibold">$147</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="goals" className="space-y-6 mt-6">
            <div className="space-y-6">
              {goals.map((goal, index) => (
                <Card key={index} className="border border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{goal.name}</h3>
                      <Badge variant="outline" className="font-urbanist">
                        {goal.progress.toFixed(0)}% Complete
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          ${goal.current.toLocaleString()} / ${goal.target.toLocaleString()}
                        </span>
                        <span className="font-medium">
                          ${(goal.target - goal.current).toLocaleString()} remaining
                        </span>
                      </div>
                      <Progress value={goal.progress} className="h-3" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Historical Trends</CardTitle>
                <CardDescription>
                  Treasury value over the past 24 hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Interactive chart would display here</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Showing {metricsHistory.length} data points
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default EnhancedAuraStats;
