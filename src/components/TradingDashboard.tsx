
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, BarChart3, Droplets, ExternalLink } from 'lucide-react';

interface Token {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  icon: string;
  jupiterUrl?: string;
}

interface LiquidityPool {
  pair: string;
  totalLiquidity: number;
  volume24h: number;
  fees24h: number;
  apy: number;
  userShare: number;
  poolUrl: string;
}

const TradingDashboard = () => {
  const [selectedToken, setSelectedToken] = useState('AURA');
  const [tradeAmount, setTradeAmount] = useState('');
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');

  const tokens: Token[] = [
    {
      symbol: 'AURA',
      name: 'Aura Token',
      price: 0.00011566,
      change24h: 12.5,
      volume24h: 125000,
      marketCap: 4500000,
      icon: '🌟',
      jupiterUrl: 'https://jup.ag/swap/SOL-3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe'
    }
  ];

  const liquidityPools: LiquidityPool[] = [
    {
      pair: 'AURA/WBTC',
      totalLiquidity: 750000,
      volume24h: 125000,
      fees24h: 375,
      apy: 15.2,
      userShare: 0.5,
      poolUrl: 'https://www.meteora.ag/pools/FVtpMFtDtskHt5MmLExkjKrCkXQi8ebVZHuFhRnQL6W5'
    },
    {
      pair: 'AURA/WBTC',
      totalLiquidity: 450000,
      volume24h: 85000,
      fees24h: 255,
      apy: 12.8,
      userShare: 0.2,
      poolUrl: 'https://www.meteora.ag/pools/8trgRQFSHKSiUUY19Qba5MrcRoq6ALnbmaocvfti3ZjP'
    },
    {
      pair: 'ETH/AURA',
      totalLiquidity: 900000,
      volume24h: 200000,
      fees24h: 600,
      apy: 18.5,
      userShare: 1.2,
      poolUrl: 'https://www.meteora.ag/pools/GyQ4VWSERBxvLRJmRatxk3DMdF6GeMk4hsBo4h7jcpfX'
    },
    {
      pair: 'AURA/ETH',
      totalLiquidity: 820000,
      volume24h: 180000,
      fees24h: 540,
      apy: 16.8,
      userShare: 0.8,
      poolUrl: 'https://www.meteora.ag/pools/GTMY5eBd4cXaihz2ZB69g3WkVmvhudamf1kQn3E9preW'
    }
  ];

  const handleTrade = () => {
    console.log(`${tradeType}ing ${tradeAmount} ${selectedToken}`);
    // Redirect to Jupiter for actual trading
    const token = tokens.find(t => t.symbol === selectedToken);
    if (token?.jupiterUrl) {
      window.open(token.jupiterUrl, '_blank');
    }
  };

  const handleAddLiquidity = (poolUrl: string) => {
    window.open(poolUrl, '_blank');
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
                  <CardTitle>AURA Token Trading</CardTitle>
                  <CardDescription>Live price data and Jupiter DEX integration</CardDescription>
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
                            <p className="text-lg font-semibold">${token.price.toFixed(8)}</p>
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
                        {token.jupiterUrl && (
                          <div className="mt-3">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(token.jupiterUrl, '_blank');
                              }}
                              className="flex items-center gap-2"
                            >
                              <ExternalLink className="h-4 w-4" />
                              Trade on Jupiter
                            </Button>
                          </div>
                        )}
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
                  <CardDescription>Powered by Jupiter DEX</CardDescription>
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
                      <span>${tokens.find(t => t.symbol === selectedToken)?.price.toFixed(8)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Est. Total</span>
                      <span>${((parseFloat(tradeAmount) || 0) * (tokens.find(t => t.symbol === selectedToken)?.price || 0)).toFixed(6)}</span>
                    </div>
                  </div>

                  <Button onClick={handleTrade} className="w-full">
                    {tradeType === 'buy' ? 'Buy' : 'Sell'} {selectedToken} on Jupiter
                  </Button>

                  <div className="text-center text-sm text-gray-600">
                    <p>Trades are executed through Jupiter DEX</p>
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
                Active Liquidity Pools
              </CardTitle>
              <CardDescription>
                AURA liquidity pools on Meteora DEX - click to add liquidity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {liquidityPools.map((pool, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-lg">{pool.pair}</h4>
                        <div className="flex gap-4 text-sm text-gray-600">
                          <span>APY: {pool.apy}%</span>
                          <span>Your Share: {pool.userShare}%</span>
                        </div>
                      </div>
                      <Button 
                        onClick={() => handleAddLiquidity(pool.poolUrl)}
                        className="flex items-center gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
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
                    
                    <div className="mt-3 text-xs text-gray-500">
                      <a 
                        href={pool.poolUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:text-blue-600 flex items-center gap-1"
                      >
                        View on Meteora <ExternalLink className="h-3 w-3" />
                      </a>
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
                  AURA Trading Volume
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Volume Chart (Coming Soon)</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AURA Price Chart</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Price Chart (Coming Soon)</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>AURA Market Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total DEX Volume</p>
                  <p className="text-2xl font-bold text-blue-600">$590K</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total Liquidity</p>
                  <p className="text-2xl font-bold text-green-600">$3.0M</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600">Active LPs</p>
                  <p className="text-2xl font-bold text-purple-600">156</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-gray-600">Fees Generated</p>
                  <p className="text-2xl font-bold text-yellow-600">$1,770</p>
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
