'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  TrendingDown, 
  Flame, 
  Coins, 
  Users, 
  Calendar,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Target,
  Zap,
  DollarSign,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Globe
} from 'lucide-react'
import { usePerformanceTracking } from '@/services/performanceMonitor'

interface AnalyticsMetric {
  label: string
  value: string
  change: number
  trend: 'up' | 'down' | 'neutral'
  icon: React.ElementType
  color: string
}

interface BurnData {
  timestamp: number
  amount: number
  cumulativeBurn: number
  transactionCount: number
}

interface StakingData {
  totalStaked: number
  stakingApy: number
  activeStakers: number
  avgStakeAmount: number
  stakingGrowth: number
}

interface PortfolioData {
  totalValue: number
  stakedAmount: number
  unstakedAmount: number
  pendingRewards: number
  totalRewardsEarned: number
  portfolioGrowth: number
}

interface PredictiveModel {
  metric: string
  currentValue: number
  prediction7d: number
  prediction30d: number
  confidence: number
}

const AdvancedAnalytics: React.FC = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d')
  const [burnData, setBurnData] = useState<BurnData[]>([])
  const [stakingData, setStakingData] = useState<StakingData | null>(null)
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null)
  const [predictions, setPredictions] = useState<PredictiveModel[]>([])
  const { trackInteraction } = usePerformanceTracking()

  // Mock data - replace with real API calls
  useEffect(() => {
    // Simulate API calls
    const loadAnalyticsData = async () => {
      trackInteraction('analytics_load', 'AdvancedAnalytics')
      
      // Mock burn data
      const mockBurnData: BurnData[] = Array.from({ length: 30 }, (_, i) => ({
        timestamp: Date.now() - (29 - i) * 24 * 60 * 60 * 1000,
        amount: Math.random() * 1000 + 500,
        cumulativeBurn: (i + 1) * 1000 + Math.random() * 500,
        transactionCount: Math.floor(Math.random() * 100) + 50
      }))

      // Mock staking data
      const mockStakingData: StakingData = {
        totalStaked: 45_000_000,
        stakingApy: 12.5,
        activeStakers: 2847,
        avgStakeAmount: 15_800,
        stakingGrowth: 18.5
      }

      // Mock portfolio data
      const mockPortfolioData: PortfolioData = {
        totalValue: 12_450,
        stakedAmount: 8_500,
        unstakedAmount: 3_200,
        pendingRewards: 125.5,
        totalRewardsEarned: 1_847,
        portfolioGrowth: 23.8
      }

      // Mock predictions
      const mockPredictions: PredictiveModel[] = [
        {
          metric: 'Token Price',
          currentValue: 0.045,
          prediction7d: 0.052,
          prediction30d: 0.068,
          confidence: 78
        },
        {
          metric: 'Total Staked',
          currentValue: 45_000_000,
          prediction7d: 48_500_000,
          prediction30d: 56_200_000,
          confidence: 85
        },
        {
          metric: 'Burn Rate',
          currentValue: 850,
          prediction7d: 920,
          prediction30d: 1150,
          confidence: 72
        }
      ]

      setBurnData(mockBurnData)
      setStakingData(mockStakingData)
      setPortfolioData(mockPortfolioData)
      setPredictions(mockPredictions)
    }

    loadAnalyticsData()
  }, [selectedTimeframe, trackInteraction])

  const keyMetrics: AnalyticsMetric[] = [
    {
      label: 'Total Burned',
      value: '2.45M AURA',
      change: 12.5,
      trend: 'up',
      icon: Flame,
      color: 'text-red-600'
    },
    {
      label: 'Staking APY',
      value: '12.5%',
      change: 2.1,
      trend: 'up',
      icon: Percent,
      color: 'text-green-600'
    },
    {
      label: 'Active Stakers',
      value: '2,847',
      change: 18.5,
      trend: 'up',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      label: 'Avg. Transaction',
      value: '1,250 AURA',
      change: -5.2,
      trend: 'down',
      icon: Activity,
      color: 'text-purple-600'
    },
    {
      label: 'Daily Volume',
      value: '$125k',
      change: 8.7,
      trend: 'up',
      icon: DollarSign,
      color: 'text-yellow-600'
    },
    {
      label: 'Global Reach',
      value: '47 Countries',
      change: 15.2,
      trend: 'up',
      icon: Globe,
      color: 'text-indigo-600'
    }
  ]

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUpRight className="h-4 w-4 text-green-500" />
      case 'down': return <ArrowDownRight className="h-4 w-4 text-red-500" />
      default: return <div className="h-4 w-4" />
    }
  }

  const formatNumber = (num: number): string => {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M'
    if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K'
    return num.toString()
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Advanced Analytics</h2>
          <p className="text-gray-600">Real-time insights and predictive models</p>
        </div>
        <div className="flex gap-2">
          {['24h', '7d', '30d', '90d'].map((timeframe) => (
            <Button
              key={timeframe}
              variant={selectedTimeframe === timeframe ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setSelectedTimeframe(timeframe)
                trackInteraction('timeframe_change', 'AdvancedAnalytics', { timeframe })
              }}
            >
              {timeframe}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {keyMetrics.map((metric, index) => {
          const Icon = metric.icon
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{metric.label}</p>
                    <p className="text-2xl font-bold">{metric.value}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {getTrendIcon(metric.trend)}
                      <span className={`text-sm ${
                        metric.trend === 'up' ? 'text-green-600' : 
                        metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {Math.abs(metric.change)}%
                      </span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg bg-gray-50 ${metric.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="burn-tracking" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="burn-tracking">Burn Tracking</TabsTrigger>
          <TabsTrigger value="staking-insights">Staking Insights</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio Analytics</TabsTrigger>
          <TabsTrigger value="predictions">Predictive Models</TabsTrigger>
        </TabsList>

        {/* Burn Tracking Tab */}
        <TabsContent value="burn-tracking" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-red-600" />
                  Burn Rate Analysis
                </CardTitle>
                <CardDescription>
                  Real-time burn mechanism performance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Burn Rate Chart Placeholder</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <p className="text-2xl font-bold text-red-600">2.45M</p>
                    <p className="text-sm text-red-700">Total Burned</p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">850/day</p>
                    <p className="text-sm text-orange-700">Avg. Daily Burn</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Transaction Analysis
                </CardTitle>
                <CardDescription>
                  Transaction volume and frequency insights
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Transaction Volume</span>
                    <span className="font-medium">$125k</span>
                  </div>
                  <Progress value={75} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Burn Efficiency</span>
                    <span className="font-medium">98.5%</span>
                  </div>
                  <Progress value={98.5} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Network Adoption</span>
                    <span className="font-medium">67%</span>
                  </div>
                  <Progress value={67} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Staking Insights Tab */}
        <TabsContent value="staking-insights" className="space-y-6">
          {stakingData && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Coins className="h-5 w-5 text-green-600" />
                    Staking Performance
                  </CardTitle>
                  <CardDescription>
                    Comprehensive staking metrics and trends
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">Staking Performance Chart Placeholder</p>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-xl font-bold text-green-600">
                        {formatNumber(stakingData.totalStaked)}
                      </p>
                      <p className="text-sm text-green-700">Total Staked</p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-xl font-bold text-blue-600">
                        {stakingData.stakingApy}%
                      </p>
                      <p className="text-sm text-blue-700">Current APY</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <p className="text-xl font-bold text-purple-600">
                        {stakingData.activeStakers.toLocaleString()}
                      </p>
                      <p className="text-sm text-purple-700">Active Stakers</p>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <p className="text-xl font-bold text-yellow-600">
                        {formatNumber(stakingData.avgStakeAmount)}
                      </p>
                      <p className="text-sm text-yellow-700">Avg. Stake</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-purple-600" />
                    Staking Goals
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Network Security</span>
                        <span>78%</span>
                      </div>
                      <Progress value={78} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Decentralization</span>
                        <span>65%</span>
                      </div>
                      <Progress value={65} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Participation</span>
                        <span>89%</span>
                      </div>
                      <Progress value={89} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Portfolio Analytics Tab */}
        <TabsContent value="portfolio" className="space-y-6">
          {portfolioData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-blue-600" />
                    Portfolio Composition
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">Portfolio Chart Placeholder</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Staked Amount</span>
                      <span className="font-medium">{formatCurrency(portfolioData.stakedAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Unstaked Amount</span>
                      <span className="font-medium">{formatCurrency(portfolioData.unstakedAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Pending Rewards</span>
                      <span className="font-medium">{formatCurrency(portfolioData.pendingRewards)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-3xl font-bold text-green-600">
                      {formatCurrency(portfolioData.totalValue)}
                    </p>
                    <p className="text-sm text-green-700">Total Portfolio Value</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-xl font-bold text-blue-600">
                        {portfolioData.portfolioGrowth}%
                      </p>
                      <p className="text-sm text-blue-700">Growth</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <p className="text-xl font-bold text-purple-600">
                        {formatCurrency(portfolioData.totalRewardsEarned)}
                      </p>
                      <p className="text-sm text-purple-700">Total Rewards</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Predictive Models Tab */}
        <TabsContent value="predictions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {predictions.map((prediction, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="h-5 w-5 text-indigo-600" />
                    {prediction.metric}
                  </CardTitle>
                  <CardDescription>
                    AI-powered predictive analysis
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      {typeof prediction.currentValue === 'number' && prediction.currentValue < 1 
                        ? `$${prediction.currentValue.toFixed(3)}`
                        : formatNumber(prediction.currentValue)
                      }
                    </p>
                    <p className="text-sm text-gray-600">Current Value</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">7-day prediction</span>
                      <span className="font-medium text-green-600">
                        {typeof prediction.prediction7d === 'number' && prediction.prediction7d < 1 
                          ? `$${prediction.prediction7d.toFixed(3)}`
                          : formatNumber(prediction.prediction7d)
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">30-day prediction</span>
                      <span className="font-medium text-blue-600">
                        {typeof prediction.prediction30d === 'number' && prediction.prediction30d < 1 
                          ? `$${prediction.prediction30d.toFixed(3)}`
                          : formatNumber(prediction.prediction30d)
                        }
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Confidence Level</span>
                      <span>{prediction.confidence}%</span>
                    </div>
                    <Progress value={prediction.confidence} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AdvancedAnalytics
export { AdvancedAnalytics } 