'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { TrendingUp, TrendingDown, Activity, DollarSign, BarChart3, Wallet, RefreshCw } from 'lucide-react'

interface TokenData {
  symbol: string
  name: string
  price: number
  change24h: number
  volume24h: number
  marketCap: number
}

interface TradingDashboardProps {
  className?: string
}

export function TradingDashboard({ className }: TradingDashboardProps) {
  const [tokens, setTokens] = useState<TokenData[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  // Mock data for now - you can replace with real API calls
  useEffect(() => {
    const mockTokens: TokenData[] = [
      {
        symbol: 'AURA',
        name: 'Aura Token',
        price: 0.12,
        change24h: 5.4,
        volume24h: 1250000,
        marketCap: 12500000
      },
      {
        symbol: 'SOL',
        name: 'Solana',
        price: 105.23,
        change24h: -2.1,
        volume24h: 892000000,
        marketCap: 45600000000
      },
      {
        symbol: 'USDC',
        name: 'USD Coin',
        price: 1.00,
        change24h: 0.0,
        volume24h: 2100000000,
        marketCap: 25000000000
      }
    ]

    setTimeout(() => {
      setTokens(mockTokens)
      setLoading(false)
    }, 1000)
  }, [])

  const refreshData = () => {
    setLoading(true)
    // Simulate API refresh
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trading Dashboard</h1>
          <p className="text-muted-foreground">Monitor markets and execute trades</p>
        </div>
        <Button onClick={refreshData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12,543.21</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+5.2%</span> from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">24h Volume</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$892.1M</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600">-2.1%</span> from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Trades</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+3</span> new trades
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">P&L Today</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+$432.18</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+3.4%</span> from yesterday
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Trading Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="spot">Spot Trading</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Market Overview</CardTitle>
              <CardDescription>Top performing tokens in your portfolio</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tokens.map((token) => (
                  <div key={token.symbol} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                        {token.symbol.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium">{token.name}</div>
                        <div className="text-sm text-muted-foreground">{token.symbol}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${token.price.toFixed(4)}</div>
                      <div className={`text-sm flex items-center ${token.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {token.change24h >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                        {Math.abs(token.change24h).toFixed(2)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="spot" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Buy Order</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Token Pair</label>
                    <select className="w-full mt-1 p-2 border rounded-md">
                      <option>AURA/USDC</option>
                      <option>SOL/USDC</option>
                      <option>SOL/AURA</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Amount</label>
                    <input type="number" placeholder="0.00" className="w-full mt-1 p-2 border rounded-md" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Price</label>
                    <input type="number" placeholder="Market Price" className="w-full mt-1 p-2 border rounded-md" />
                  </div>
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    Place Buy Order
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sell Order</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Token Pair</label>
                    <select className="w-full mt-1 p-2 border rounded-md">
                      <option>AURA/USDC</option>
                      <option>SOL/USDC</option>
                      <option>SOL/AURA</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Amount</label>
                    <input type="number" placeholder="0.00" className="w-full mt-1 p-2 border rounded-md" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Price</label>
                    <input type="number" placeholder="Market Price" className="w-full mt-1 p-2 border rounded-md" />
                  </div>
                  <Button className="w-full bg-red-600 hover:bg-red-700">
                    Place Sell Order
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Holdings</CardTitle>
              <CardDescription>Current token balances and their values</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                Portfolio tracking will be implemented with wallet connection
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trading Analytics</CardTitle>
              <CardDescription>Performance metrics and insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                Advanced analytics charts will be implemented here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 