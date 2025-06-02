
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import ValueIndicator from '../components/ValueIndicator';
import MonitoredWallets from '../components/MonitoredWallets';
import ExpenseTracker from '../components/ExpenseTracker';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Coins, 
  Building,
  RefreshCw,
  ExternalLink,
  Activity,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ValueData {
  totalValue: number;
  speculativeInterest: number;
  volatileAssets: number;
  hardAssets: number;
  lastUpdated: string;
  change24h: number;
}

interface AssetBreakdown {
  category: string;
  value: number;
  percentage: number;
  items: Array<{
    name: string;
    value: number;
    change: number;
  }>;
}

const ValueIndicatorPage = () => {
  const [valueData, setValueData] = useState<ValueData | null>(null);
  const [assetBreakdown, setAssetBreakdown] = useState<AssetBreakdown[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data - replace with actual smart contract calls
  useEffect(() => {
    const mockData: ValueData = {
      totalValue: 847500, // USD
      speculativeInterest: 425000, // Market cap from Meteora
      volatileAssets: 322500, // Tokens + LP positions
      hardAssets: 100000, // Volcano Stay property value
      lastUpdated: new Date().toISOString(),
      change24h: 5.2
    };

    const mockBreakdown: AssetBreakdown[] = [
      {
        category: "Speculative Interest",
        value: 425000,
        percentage: 50.1,
        items: [
          { name: "AURA Market Cap (Meteora)", value: 425000, change: 8.5 }
        ]
      },
      {
        category: "Volatile Assets",
        value: 322500,
        percentage: 38.1,
        items: [
          { name: "SOL Holdings", value: 150000, change: 3.2 },
          { name: "USDC Treasury", value: 120000, change: 0.0 },
          { name: "LP Positions (AURA/SOL)", value: 52500, change: -2.1 }
        ]
      },
      {
        category: "Hard Assets",
        value: 100000,
        percentage: 11.8,
        items: [
          { name: "Volcano Stay Property", value: 100000, change: 0.0 }
        ]
      }
    ];

    setTimeout(() => {
      setValueData(mockData);
      setAssetBreakdown(mockBreakdown);
      setLoading(false);
    }, 1000);
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    // In real implementation, this would refresh data from smart contract
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number): string => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  return (
    <div className="min-h-screen bg-white font-urbanist">
      <Header />
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="space-y-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-6 font-urbanist leading-tight">
              Value Indicator Dashboard
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-urbanist leading-relaxed">
              Real-time calculation of AURA's total value based on speculative interest, volatile assets, and hard assets as specified in the PRD
            </p>
          </div>
          
          <Tabs defaultValue="value-indicator" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="value-indicator">Value Indicator</TabsTrigger>
              <TabsTrigger value="treasury">Treasury Overview</TabsTrigger>
              <TabsTrigger value="wallets">Monitored Wallets</TabsTrigger>
              <TabsTrigger value="expenses">Expense Tracker</TabsTrigger>
            </TabsList>
            
            <TabsContent value="value-indicator" className="space-y-8">
              {loading ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                      <Card key={i} className="animate-pulse">
                        <CardContent className="p-6">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : valueData ? (
                <>
                  {/* Header Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                          <DollarSign className="h-8 w-8 text-blue-600" />
                          <div>
                            <p className="text-sm text-blue-700">Total Value</p>
                            <p className="text-2xl font-bold text-blue-900">
                              {formatCurrency(valueData.totalValue)}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                              {valueData.change24h >= 0 ? (
                                <TrendingUp className="h-4 w-4 text-green-600" />
                              ) : (
                                <TrendingDown className="h-4 w-4 text-red-600" />
                              )}
                              <span className={`text-sm ${
                                valueData.change24h >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {formatPercentage(valueData.change24h)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                          <Activity className="h-8 w-8 text-green-600" />
                          <div>
                            <p className="text-sm text-gray-600">Speculative Interest</p>
                            <p className="text-2xl font-bold">{formatCurrency(valueData.speculativeInterest)}</p>
                            <p className="text-xs text-gray-500">Market Cap</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                          <Coins className="h-8 w-8 text-orange-600" />
                          <div>
                            <p className="text-sm text-gray-600">Volatile Assets</p>
                            <p className="text-2xl font-bold">{formatCurrency(valueData.volatileAssets)}</p>
                            <p className="text-xs text-gray-500">Tokens + LP</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3">
                          <Building className="h-8 w-8 text-purple-600" />
                          <div>
                            <p className="text-sm text-gray-600">Hard Assets</p>
                            <p className="text-2xl font-bold">{formatCurrency(valueData.hardAssets)}</p>
                            <p className="text-xs text-gray-500">Properties</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Value Calculation */}
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            PRD Phase 1.3: Value Calculation Formula
                          </CardTitle>
                          <CardDescription>
                            Total Value = Speculative Interest + Volatile Assets + Hard Assets
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            Last Updated: {new Date(valueData.lastUpdated).toLocaleTimeString()}
                          </Badge>
                          <Button size="sm" variant="outline" onClick={handleRefresh}>
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <div className="text-center mb-4">
                          <div className="text-3xl font-bold text-gray-900">
                            {formatCurrency(valueData.speculativeInterest)} + {formatCurrency(valueData.volatileAssets)} + {formatCurrency(valueData.hardAssets)}
                          </div>
                          <div className="text-lg text-gray-600 mt-2">
                            = <span className="text-2xl font-bold text-blue-600">{formatCurrency(valueData.totalValue)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Asset Breakdown */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {assetBreakdown.map((category, index) => (
                          <Card key={index} className="border-2">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-lg">{category.category}</CardTitle>
                              <div className="flex justify-between items-center">
                                <span className="text-2xl font-bold">{formatCurrency(category.value)}</span>
                                <Badge variant="outline">{category.percentage.toFixed(1)}%</Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <Progress value={category.percentage} className="h-2" />
                              
                              <div className="space-y-2">
                                {category.items.map((item, itemIndex) => (
                                  <div key={itemIndex} className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">{item.name}</span>
                                    <div className="text-right">
                                      <div className="font-medium">{formatCurrency(item.value)}</div>
                                      {item.change !== 0 && (
                                        <div className={`text-xs ${
                                          item.change >= 0 ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                          {formatPercentage(item.change)}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <div className="text-center">
                  <p className="text-red-600">Failed to load value indicator data.</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="treasury" className="space-y-12">
              <ValueIndicator />
            </TabsContent>
            
            <TabsContent value="wallets" className="space-y-12">
              <MonitoredWallets />
            </TabsContent>
            
            <TabsContent value="expenses" className="space-y-12">
              <ExpenseTracker />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default ValueIndicatorPage;
