'use client'

import React, { useState, useEffect } from 'react'
import TokenList from './TokenList'
import TradePanel from './TradePanel'
import JupiterPriceAPI from './JupiterPriceAPI'
import JupiterSwapWidget from './JupiterSwapWidget'
import JupiterAdvancedSwap from './JupiterAdvancedSwap'
import PriceChart from './PriceChart'
import EnhancedTokenList from './EnhancedTokenList'
import AdvancedPortfolioTracker from './AdvancedPortfolioTracker'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TrendingUp, Zap, BarChart3, Settings, Bell, Shield, RefreshCw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const EnhancedTradingDashboard = () => {
  const [selectedToken, setSelectedToken] = useState('AURA')
  const [tradeAmount, setTradeAmount] = useState('')
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy')
  const [activeView, setActiveView] = useState('enhanced')
  const [notifications, setNotifications] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const { toast } = useToast()

  const tokens = [
    {
      symbol: 'AURA',
      name: 'Aura Token',
      price: 0.00011566,
      change24h: 12.5,
      volume24h: 45000,
      marketCap: 115655,
      icon: '/aura-icon.png',
      jupiterUrl: 'https://jup.ag/swap/SOL-3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe',
      priceChange7d: 25.8,
      liquidity: 85000,
      isVerified: true,
      holders: 1250
    },
    {
      symbol: 'SOL',
      name: 'Solana',
      price: 178.15,
      change24h: -2.3,
      volume24h: 1500000000,
      marketCap: 85000000000,
      icon: '/sol-icon.png',
      jupiterUrl: 'https://jup.ag/swap/USDC-SOL',
      priceChange7d: 8.2,
      liquidity: 2500000000,
      isVerified: true,
      holders: 1000000
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      price: 1.0001,
      change24h: 0.01,
      volume24h: 2000000000,
      marketCap: 32000000000,
      icon: '/usdc-icon.png',
      jupiterUrl: 'https://jup.ag/swap/SOL-USDC',
      priceChange7d: 0.05,
      liquidity: 5000000000,
      isVerified: true,
      holders: 500000
    }
  ]

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        if (notifications) {
          toast({
            title: "Data Updated",
            description: "Market data refreshed automatically",
          })
        }
      }, 30000) // 30 seconds
      
      return () => clearInterval(interval)
    }
  }, [autoRefresh, notifications, toast])

  const handleTrade = () => {
    toast({
      title: "Trade Initiated",
      description: `${tradeType === 'buy' ? 'Buying' : 'Selling'} ${tradeAmount} ${selectedToken}`,
    })
  }

  const toggleNotifications = () => {
    setNotifications(!notifications)
    toast({
      title: notifications ? "Notifications Disabled" : "Notifications Enabled",
      description: notifications ? "You won't receive trading alerts" : "You'll receive trading alerts",
    })
  }

  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh)
    toast({
      title: autoRefresh ? "Auto-refresh Disabled" : "Auto-refresh Enabled",
      description: autoRefresh ? "Data will not refresh automatically" : "Data will refresh every 30 seconds",
    })
  }

  return (
    <div className="space-y-8">
      {/* Dashboard Header */}
      <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-bold text-black font-urbanist flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-blue-600" />
                Enhanced Trading Hub
              </CardTitle>
              <p className="text-gray-600 font-urbanist mt-2">
                Advanced trading tools with real-time analytics and portfolio management
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleNotifications}
                className={`font-urbanist ${notifications ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}`}
              >
                <Bell className="h-4 w-4 mr-1" />
                {notifications ? 'Alerts On' : 'Alerts Off'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleAutoRefresh}
                className={`font-urbanist ${autoRefresh ? 'bg-green-50 text-green-700 border-green-200' : ''}`}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                {autoRefresh ? 'Auto On' : 'Auto Off'}
              </Button>
              <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300 font-urbanist">
                <Shield className="h-3 w-3 mr-1" />
                Secure
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Trading Interface */}
      <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="enhanced">Enhanced View</TabsTrigger>
          <TabsTrigger value="classic">Classic View</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
        </TabsList>

        <TabsContent value="enhanced" className="space-y-8 mt-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <EnhancedTokenList
                tokens={tokens}
                selectedToken={selectedToken}
                onTokenSelect={setSelectedToken}
                showAll={true}
              />
              
              <PriceChart 
                tokenAddress="3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe"
                tokenSymbol={selectedToken}
              />
            </div>
            
            <div className="space-y-8">
              <JupiterAdvancedSwap />
              <JupiterPriceAPI />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="classic" className="space-y-8 mt-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <TokenList
                tokens={tokens}
                selectedToken={selectedToken}
                onTokenSelect={setSelectedToken}
                showAll={true}
              />
              
              <PriceChart 
                tokenAddress="3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe"
                tokenSymbol={selectedToken}
              />
            </div>
            
            <div className="space-y-8">
              <TradePanel
                selectedToken={selectedToken}
                tradeAmount={tradeAmount}
                tradeType={tradeType}
                tokens={tokens}
                onTradeAmountChange={setTradeAmount}
                onTradeTypeChange={setTradeType}
                onTrade={handleTrade}
              />
              <JupiterSwapWidget 
                fromToken="SOL"
                toToken="AURA"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-8 mt-8">
          <div className="grid lg:grid-cols-2 gap-8">
            <PriceChart 
              tokenAddress="3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe"
              tokenSymbol={selectedToken}
            />
            <Card className="bg-white border border-gray-200 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Market Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 font-medium">24h Volume</p>
                      <p className="text-xl font-bold text-black">$2.1M</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 font-medium">Market Cap</p>
                      <p className="text-xl font-bold text-black">$115.7K</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 font-medium">Liquidity</p>
                      <p className="text-xl font-bold text-black">$85K</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 font-medium">Holders</p>
                      <p className="text-xl font-bold text-black">1,250</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-8 mt-8">
          <AdvancedPortfolioTracker />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default EnhancedTradingDashboard
export { EnhancedTradingDashboard } 