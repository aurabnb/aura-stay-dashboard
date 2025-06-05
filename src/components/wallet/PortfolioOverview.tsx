'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  ArrowUpRight, 
  ArrowDownRight,
  RefreshCw,
  ExternalLink,
  Wallet,
  Coins,
  DollarSign,
  BarChart3
} from 'lucide-react'
import { useWallet } from '@/hooks/enhanced-hooks'
import { analytics } from '@/lib/analytics'

interface Token {
  symbol: string
  name: string
  balance: number
  value: number
  change24h: number
  price: number
  logo?: string
}

interface PortfolioOverviewProps {
  hideBalances: boolean
}

export function PortfolioOverview({ hideBalances }: PortfolioOverviewProps) {
  const { balance, isLoadingBalance } = useWallet()
  const [refreshing, setRefreshing] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState('24h')

  // Mock data - in real implementation, this would come from the wallet hook
  const tokens: Token[] = [
    {
      symbol: 'AURA',
      name: 'AURA Token',
      balance: 8750,
      value: 12425.50,
      change24h: 8.34,
      price: 1.42
    },
    {
      symbol: 'SOL',
      name: 'Solana',
      balance: 24.5,
      value: 4165.25,
      change24h: -2.15,
      price: 170.01
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      balance: 2500.00,
      value: 2500.00,
      change24h: 0.01,
      price: 1.00
    },
    {
      symbol: 'RAY',
      name: 'Raydium',
      balance: 156.78,
      value: 245.67,
      change24h: 12.45,
      price: 1.57
    }
  ]

  const totalValue = tokens.reduce((sum, token) => sum + token.value, 0)
  const totalChange = 8.34 // Mock total portfolio change

  const refreshPortfolio = async () => {
    setRefreshing(true)
    analytics.track('portfolio_refresh', { timestamp: Date.now() })
    
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false)
    }, 1500)
  }

  const formatCurrency = (amount: number) => {
    return hideBalances ? '•••••' : `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
  }

  const formatTokenAmount = (amount: number, symbol: string) => {
    return hideBalances ? '•••••' : `${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} ${symbol}`
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Wallet className="w-5 h-5" />
              <span>Portfolio Overview</span>
            </CardTitle>
            <CardDescription>
              Your token holdings and performance
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshPortfolio}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Total Portfolio Value */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Portfolio Value</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(totalValue)}
              </p>
            </div>
            <div className={`flex items-center space-x-1 ${
              totalChange >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {totalChange >= 0 ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
              <span className="font-medium">
                {totalChange >= 0 ? '+' : ''}{totalChange.toFixed(2)}%
              </span>
            </div>
          </div>

          {/* Period Selector */}
          <div className="flex space-x-2">
            {['24h', '7d', '30d', '1y'].map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedPeriod(period)}
              >
                {period}
              </Button>
            ))}
          </div>
        </div>

        {/* Portfolio Breakdown */}
        <Tabs defaultValue="holdings" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="holdings">Holdings</TabsTrigger>
            <TabsTrigger value="allocation">Allocation</TabsTrigger>
          </TabsList>

          <TabsContent value="holdings" className="space-y-4">
            {tokens.map((token, index) => (
              <div key={token.symbol} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {token.symbol.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{token.symbol}</p>
                    <p className="text-sm text-gray-600">{token.name}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-medium">
                    {formatTokenAmount(token.balance, token.symbol)}
                  </p>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm text-gray-600">
                      {formatCurrency(token.value)}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      token.change24h >= 0 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}

            <Button variant="ghost" className="w-full">
              <ExternalLink className="w-4 h-4 mr-2" />
              View All Tokens
            </Button>
          </TabsContent>

          <TabsContent value="allocation" className="space-y-4">
            {tokens.map((token, index) => {
              const percentage = (token.value / totalValue) * 100
              return (
                <div key={token.symbol} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {token.symbol.charAt(0)}
                      </div>
                      <span className="font-medium">{token.symbol}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-medium">{percentage.toFixed(1)}%</span>
                      <p className="text-sm text-gray-600">
                        {formatCurrency(token.value)}
                      </p>
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              )
            })}

            {/* Portfolio Insights */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <h4 className="font-medium mb-2 flex items-center">
                <BarChart3 className="w-4 h-4 mr-2" />
                Portfolio Insights
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Diversification</p>
                  <p className="font-medium">Well balanced</p>
                </div>
                <div>
                  <p className="text-gray-600">Risk Level</p>
                  <p className="font-medium text-yellow-600">Medium</p>
                </div>
                <div>
                  <p className="text-gray-600">Largest Holding</p>
                  <p className="font-medium">AURA (65.4%)</p>
                </div>
                <div>
                  <p className="text-gray-600">Stablecoins</p>
                  <p className="font-medium">13.2%</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3">
          <Button variant="outline" size="sm" className="flex-1">
            <DollarSign className="w-4 h-4 mr-1" />
            Buy
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <TrendingUp className="w-4 h-4 mr-1" />
            Sell
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Coins className="w-4 h-4 mr-1" />
            Stake
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 