
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, BarChart3, Droplets } from 'lucide-react';

interface Token {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  icon: string;
}

interface LiquidityPool {
  pair: string;
  totalLiquidity: number;
  volume24h: number;
  fees24h: number;
  apy: number;
  userShare: number;
}

const TradingDashboard = () => {
  const [selectedToken, setSelectedToken] = useState('AURA');
  const [tradeAmount, setTradeAmount] = useState('');
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');

  const tokens: Token[] = [
    {
      symbol: 'AURA',
      name: 'Aura Token',
      price: 0.45,
      change24h: 12.5,
      volume24h: 125000,
      marketCap: 4500000,
      icon: '🌟'
    },
    {
      symbol: 'SAMSARA',
      name: 'Samsara Token',
      price: 1.20,
      change24h: -3.2,
      volume24h: 85000,
      marketCap: 1200000,
      icon: '🏝️'
    },
    {
      symbol: 'AIRSCAPE',
      name: 'Airscape Token',
      price: 2.15,
      change24h: 8.7,
      volume24h: 200000,
      marketCap: 8888888,
      icon: '✈️'
    }
  ];

  const liquidityPools: LiquidityPool[] = [
    {
      pair: 'AURA/USDC',
      totalLiquidity: 750000,
      volume24h: 125000,
      fees24h: 375,
      apy: 15.2,
      userShare: 0.5
    },
    {
      pair: 'SAMSARA/USDC',
      totalLiquidity: 450000,
      volume24h: 85000,
      fees24h: 255,
      apy: 12.8,
      userShare: 0.2
    },
    {
      pair: 'AIRSCAPE/AURA',
      totalLiquidity: 900000,
      volume24h: 200000,
      fees24h: 600,
      apy: 18.5,
      userShare: 1.2
    }
  ];

  const handleTrade = () => {
    console.log(`${tradeType}ing ${tradeAmount} ${selectedToken}`);
  };

  const handleAddLiquidity = (pair: string) => {
    console.log(`Adding liquidity to ${pair}`);
  };

  return (
    <div className="space-y-8">
      <Tabs defaultValue="trade" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trade">Trade</TabsTrigger>
          <TabsTrigger value="liquidity">Liquidity</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="trade" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Token List */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Token Prices</CardTitle>
                  <CardDescription>Live prices from our internal DEX</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tokens.map((token) => (
                      <div 
                        key={token.symbol}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedToken === token.symbol ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedToken(token.symbol)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{token.icon}</span>
                            <div>
                              <p className="font-semibold">{token.symbol}</p>
                              <p className="text-sm text-gray-600">{token.name}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold">${token.price.toFixed(4)}</p>
                            <div className="flex items-center gap-1">
                              {token.change24h > 0 ? (
                                <TrendingUp className="h-4 w-4 text-green-600" />
                              ) : (
                                <TrendingDown className="h-4 w-4 text-red-600" />
                              )}
                              <span className={`text-sm ${token.change24h > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {token.change24h > 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <p>Volume 24h</p>
                            <p className="font-semibold">${token.volume24h.toLocaleString()}</p>
                          </div>
                          <div>
                            <p>Market Cap</p>
                            <p className="font-semibold">${token.marketCap.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Trading Panel */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Trade {selectedToken}</CardTitle>
                  <CardDescription>Buy or sell with fiat or crypto</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Button 
                      variant={tradeType === 'buy' ? 'default' : 'outline'}
                      onClick={() => setTradeType('buy')}
                      className="flex-1"
                    >
                      Buy
                    </Button>
                    <Button 
                      variant={tradeType === 'sell' ? 'default' : 'outline'}
                      onClick={() => setTradeType('sell')}
                      className="flex-1"
                    >
                      Sell
                    </Button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Amount</label>
                    <Input
                      type="number"
                      placeholder={`Enter ${selectedToken} amount`}
                      value={tradeAmount}
                      onChange={(e) => setTradeAmount(e.target.value)}
                    />
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span>Price</span>
                      <span>${tokens.find(t => t.symbol === selectedToken)?.price.toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Est. Total</span>
                      <span>${((parseFloat(tradeAmount) || 0) * (tokens.find(t => t.symbol === selectedToken)?.price || 0)).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Trading Fee (0.3%)</span>
                      <span>${(((parseFloat(tradeAmount) || 0) * (tokens.find(t => t.symbol === selectedToken)?.price || 0)) * 0.003).toFixed(2)}</span>
                    </div>
                  </div>

                  <Button onClick={handleTrade} className="w-full">
                    {tradeType === 'buy' ? 'Buy' : 'Sell'} {selectedToken}
                  </Button>

                  <div className="text-center">
                    <Button variant="link" className="text-blue-600">
                      Buy with Fiat (MoonPay)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="liquidity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Droplets className="h-5 w-5" />
                Liquidity Pools
              </CardTitle>
              <CardDescription>
                Add liquidity to earn trading fees and rewards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {liquidityPools.map((pool, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-lg">{pool.pair}</h4>
                        <div className="flex gap-4 text-sm text-gray-600">
                          <span>APY: {pool.apy}%</span>
                          <span>Your Share: {pool.userShare}%</span>
                        </div>
                      </div>
                      <Button onClick={() => handleAddLiquidity(pool.pair)}>
                        Add Liquidity
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Total Liquidity</p>
                        <p className="font-semibold">${pool.totalLiquidity.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Volume 24h</p>
                        <p className="font-semibold">${pool.volume24h.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Fees 24h</p>
                        <p className="font-semibold">${pool.fees24h.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Your Earnings</p>
                        <p className="font-semibold text-green-600">
                          ${((pool.fees24h * pool.userShare) / 100).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Trading Volume
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Volume Chart (Integration Pending)</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Price Charts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Price Chart (Integration Pending)</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Market Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total DEX Volume</p>
                  <p className="text-2xl font-bold text-blue-600">$410K</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total Liquidity</p>
                  <p className="text-2xl font-bold text-green-600">$2.1M</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600">Active Traders</p>
                  <p className="text-2xl font-bold text-purple-600">1,234</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-gray-600">Fees Generated</p>
                  <p className="text-2xl font-bold text-yellow-600">$1,230</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TradingDashboard;
