'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { TrendingUp, TrendingDown, DollarSign, Users, Zap, Target, BarChart3, PieChart, Activity, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

interface MetricCard {
  title: string
  value: string
  change: number
  icon: React.ReactNode
  color: string
  description: string
}

interface TreasuryData {
  treasury: {
    volatileAssets: number
    hardAssets: number
    totalMarketCap: number
  }
  wallets: any[]
}

interface Goal {
  name: string
  target: number
  current: number
  progress: number
}

const EnhancedAuraStats = () => {
  const [mounted, setMounted] = useState(false)
  const [data, setData] = useState<TreasuryData>({
    treasury: {
      volatileAssets: 85000,
      hardAssets: 25000,
      totalMarketCap: 1500000
    },
    wallets: Array.from({ length: 8 }, (_, i) => ({ id: i, balance: 5000 + i * 1000 }))
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [goals, setGoals] = useState<Goal[]>([
    { name: 'First Property Purchase', target: 100000, current: 0, progress: 0 },
    { name: 'Community Growth', target: 5000, current: 1250, progress: 25 },
    { name: 'Liquidity Pool', target: 500000, current: 85000, progress: 17 }
  ])
  const [lastRefresh, setLastRefresh] = useState(new Date())

  useEffect(() => {
    setMounted(true)
    // Add randomization only on client side
    setData({
      treasury: {
        volatileAssets: 85000 + Math.random() * 10000,
        hardAssets: 25000 + Math.random() * 5000,
        totalMarketCap: 1500000 + Math.random() * 100000
      },
      wallets: Array.from({ length: 8 }, (_, i) => ({ id: i, balance: Math.random() * 10000 }))
    })
  }, [])

  // Determine API status based on data and error state
  const apiStatus = error ? 'error' : data ? 'success' : 'loading'

  // Calculate metrics
  const metrics = [
    {
      title: 'Portfolio Value',
      value: data ? `$${(data.treasury.volatileAssets + data.treasury.hardAssets).toLocaleString()}` : '$0',
      change: mounted && data ? Math.random() * 10 - 5 : 0,
      icon: <TrendingUp className="h-5 w-5" />,
      color: 'text-green-600',
      description: 'Total treasury including volatile and hard assets'
    },
    {
      title: 'Market Cap',
      value: data ? `$${data.treasury.totalMarketCap.toLocaleString()}` : '$0',
      change: mounted && data ? Math.random() * 15 - 7.5 : 0,
      icon: <BarChart3 className="h-5 w-5" />,
      color: 'text-blue-600',
      description: 'Total market capitalization of AURA token'
    },
    {
      title: 'Treasury Growth',
      value: data ? `${((data.treasury.volatileAssets / (data.treasury.volatileAssets + data.treasury.hardAssets)) * 100).toFixed(1)}%` : '0%',
      change: mounted && data ? Math.random() * 5 : 0,
      icon: <Zap className="h-5 w-5" />,
      color: 'text-purple-600',
      description: 'Growth rate of treasury assets'
    },
    {
      title: 'Volatility Index',
      value: '23.4',
      change: mounted ? Math.random() * 8 - 4 : 0,
      icon: <Activity className="h-5 w-5" />,
      color: 'text-orange-600',
      description: 'Market volatility indicator'
    }
  ]

  // Update goals based on current data
  useEffect(() => {
    if (data) {
      const totalTreasury = data.treasury.volatileAssets + data.treasury.hardAssets
      setGoals(prev => prev.map(goal => {
        if (goal.name === 'First Property Purchase') {
          return {
            ...goal,
            current: totalTreasury,
            progress: Math.min((totalTreasury / goal.target) * 100, 100)
          }
        }
        return goal
      }))
    }
  }, [data])

  const handleRefresh = async () => {
    try {
      // Add randomization only on client side
      setData({
        treasury: {
          volatileAssets: 85000 + Math.random() * 10000,
          hardAssets: 25000 + Math.random() * 5000,
          totalMarketCap: 1500000 + Math.random() * 100000
        },
        wallets: Array.from({ length: 8 }, (_, i) => ({ id: i, balance: Math.random() * 10000 }))
      })
      toast.success("Data refreshed successfully")
    } catch (error) {
      toast.error("Failed to refresh data")
    }
  }

  if (loading) {
    return (
      <Card className="bg-white border border-gray-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-black">
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
    )
  }

  return (
    <Card className="bg-white border border-gray-200 shadow-lg">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-black flex items-center gap-2">
              <Activity className="h-6 w-6 text-blue-600" />
              Enhanced AURA Statistics
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
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
              }`}
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
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
          </div>
        </div>
        
        {lastRefresh && (
          <p className="text-sm text-gray-500 mt-2">
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
                <Card key={index} className="border border-gray-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-2 rounded-lg bg-gray-50 ${metric.color}`}>
                        {metric.icon}
                      </div>
                      <div className={`flex items-center text-sm ${
                        metric.change >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {metric.change >= 0 ? (
                          <TrendingUp className="h-4 w-4 mr-1" />
                        ) : (
                          <TrendingDown className="h-4 w-4 mr-1" />
                        )}
                        {Math.abs(metric.change).toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{metric.value}</h3>
                      <p className="text-sm text-gray-600">{metric.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{metric.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Treasury Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Volatile Assets</span>
                      <span className="text-sm font-semibold">
                        ${data?.treasury.volatileAssets.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Hard Assets</span>
                      <span className="text-sm font-semibold">
                        ${data?.treasury.hardAssets.toLocaleString()}
                      </span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Total</span>
                        <span className="text-sm font-bold">
                          ${((data?.treasury.volatileAssets || 0) + (data?.treasury.hardAssets || 0)).toLocaleString()}
                        </span>
                      </div>
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
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                Project Goals & Milestones
              </h3>
              
              {goals.map((goal, index) => (
                <Card key={index} className="border border-gray-200">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-900">{goal.name}</h4>
                        <Badge variant="outline" className="text-blue-600 border-blue-200">
                          {goal.progress.toFixed(0)}%
                        </Badge>
                      </div>
                      
                      <Progress value={goal.progress} className="h-2" />
                      
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>${goal.current.toLocaleString()} raised</span>
                        <span>${goal.target.toLocaleString()} target</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="metrics" className="space-y-6 mt-6">
            <div className="text-center py-8">
              <PieChart className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Advanced Metrics Coming Soon
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Detailed analytics, charts, and performance metrics will be available in the next update.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6 mt-6">
            <div className="text-center py-8">
              <BarChart3 className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Historical Trends
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Historical data visualization and trend analysis features are in development.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default EnhancedAuraStats 