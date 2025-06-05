'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users, 
  Trophy,
  Target,
  Zap,
  Calendar,
  PieChart,
  Activity,
  Award,
  Clock,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw
} from 'lucide-react'
import { useAnalytics } from '@/hooks/enhanced-hooks'
import { analytics } from '@/lib/analytics'

interface UserAnalyticsProps {}

export function UserAnalytics({}: UserAnalyticsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [refreshing, setRefreshing] = useState(false)
  
  // Mock analytics data - in real implementation, this would come from useAnalytics hook
  const analyticsData = {
    overview: {
      stakingRewards: 234.56,
      stakingRewardsChange: 12.34,
      tradingVolume: 15420.45,
      tradingVolumeChange: -5.67,
      totalTransactions: 47,
      totalTransactionsChange: 23.5,
      participationScore: 85,
      participationScoreChange: 8.2
    },
    performance: {
      stakingROI: 14.5,
      tradingPnL: 245.67,
      portfolioGrowth: 18.23,
      bestPerformingAsset: 'AURA',
      worstPerformingAsset: 'SOL'
    },
    activity: {
      daysActive: 28,
      totalSessions: 156,
      avgSessionTime: 24.5,
      featuresUsed: ['Staking', 'Trading', 'Governance', 'Analytics'],
      lastActivity: new Date().toISOString()
    },
    achievements: [
      { id: 1, name: 'Early Adopter', description: 'Joined in the first month', earned: true, rarity: 'legendary' },
      { id: 2, name: 'Staking Champion', description: 'Staked over 5,000 AURA', earned: true, rarity: 'epic' },
      { id: 3, name: 'Active Voter', description: 'Voted on 10+ proposals', earned: true, rarity: 'rare' },
      { id: 4, name: 'Trading Expert', description: 'Complete 100 trades', earned: false, rarity: 'epic', progress: 47 },
      { id: 5, name: 'Community Leader', description: 'Refer 50 users', earned: false, rarity: 'legendary', progress: 12 }
    ],
    insights: [
      { 
        type: 'positive', 
        title: 'Strong Performance', 
        description: 'Your portfolio has outperformed the market by 5.2% this month',
        action: 'Continue current strategy'
      },
      { 
        type: 'warning', 
        title: 'Diversification Opportunity', 
        description: 'Consider diversifying your holdings to reduce risk',
        action: 'Explore other tokens'
      },
      { 
        type: 'info', 
        title: 'Staking Rewards', 
        description: 'You have unclaimed rewards worth $67.89',
        action: 'Claim now'
      }
    ]
  }

  const refreshAnalytics = async () => {
    setRefreshing(true)
    analytics.track('analytics_refresh', { period: selectedPeriod, timestamp: Date.now() })
    
    setTimeout(() => {
      setRefreshing(false)
    }, 1500)
  }

  const formatCurrency = (amount: number) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
  const formatPercentage = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-6 h-6" />
                <span>Your Analytics</span>
              </CardTitle>
              <CardDescription>
                Personalized insights and performance metrics for your AURA journey
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              {/* Period Selector */}
              <div className="flex space-x-1">
                {['7d', '30d', '90d', '1y'].map((period) => (
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
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshAnalytics}
                disabled={refreshing}
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Staking Rewards"
              value={formatCurrency(analyticsData.overview.stakingRewards)}
              change={analyticsData.overview.stakingRewardsChange}
              icon={Trophy}
              color="blue"
            />
            <MetricCard
              title="Trading Volume"
              value={formatCurrency(analyticsData.overview.tradingVolume)}
              change={analyticsData.overview.tradingVolumeChange}
              icon={TrendingUp}
              color="green"
            />
            <MetricCard
              title="Transactions"
              value={analyticsData.overview.totalTransactions.toString()}
              change={analyticsData.overview.totalTransactionsChange}
              icon={Activity}
              color="purple"
            />
            <MetricCard
              title="Participation Score"
              value={`${analyticsData.overview.participationScore}/100`}
              change={analyticsData.overview.participationScoreChange}
              icon={Star}
              color="orange"
            />
          </div>

          {/* AI Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="w-5 h-5" />
                <span>AI Insights</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {analyticsData.insights.map((insight, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${
                    insight.type === 'positive' 
                      ? 'bg-green-50 border-green-500' 
                      : insight.type === 'warning'
                      ? 'bg-yellow-50 border-yellow-500'
                      : 'bg-blue-50 border-blue-500'
                  }`}
                >
                  <h4 className="font-medium mb-1">{insight.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                  <Button size="sm" variant="ghost">
                    {insight.action}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Participation Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Staking</span>
                    <span className="font-medium">95%</span>
                  </div>
                  <Progress value={95} className="h-2" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Governance</span>
                    <span className="font-medium">78%</span>
                  </div>
                  <Progress value={78} className="h-2" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Trading</span>
                    <span className="font-medium">65%</span>
                  </div>
                  <Progress value={65} className="h-2" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Community</span>
                    <span className="font-medium">82%</span>
                  </div>
                  <Progress value={82} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Milestones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3 p-2 bg-green-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">First Stake Completed</p>
                    <p className="text-xs text-gray-600">2 days ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-2 bg-blue-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Joined Community</p>
                    <p className="text-xs text-gray-600">1 week ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-2 bg-purple-50 rounded-lg">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <Target className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">First Vote Cast</p>
                    <p className="text-xs text-gray-600">2 weeks ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Staking ROI</span>
                    <span className="font-bold text-green-600">+{analyticsData.performance.stakingROI}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Trading P&L</span>
                    <span className="font-bold text-green-600">{formatCurrency(analyticsData.performance.tradingPnL)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Portfolio Growth</span>
                    <span className="font-bold text-green-600">+{analyticsData.performance.portfolioGrowth}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Asset Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium">Best Performer</p>
                    <p className="text-sm text-gray-600">{analyticsData.performance.bestPerformingAsset}</p>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium">Needs Attention</p>
                    <p className="text-sm text-gray-600">{analyticsData.performance.worstPerformingAsset}</p>
                  </div>
                  <ArrowDownRight className="w-5 h-5 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{analyticsData.activity.daysActive}</p>
                  <p className="text-sm text-gray-600">Days Active</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Activity className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{analyticsData.activity.totalSessions}</p>
                  <p className="text-sm text-gray-600">Total Sessions</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{analyticsData.activity.avgSessionTime}m</p>
                  <p className="text-sm text-gray-600">Avg Session</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Features Used</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {analyticsData.activity.featuresUsed.map((feature) => (
                  <Badge key={feature} variant="secondary" className="bg-blue-100 text-blue-800">
                    {feature}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {analyticsData.achievements.map((achievement) => (
              <Card key={achievement.id} className={achievement.earned ? 'border-green-200 bg-green-50' : 'border-gray-200'}>
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      achievement.earned 
                        ? achievement.rarity === 'legendary' 
                          ? 'bg-yellow-500' 
                          : achievement.rarity === 'epic' 
                          ? 'bg-purple-500' 
                          : 'bg-blue-500'
                        : 'bg-gray-300'
                    }`}>
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium">{achievement.name}</h3>
                        <Badge 
                          variant="outline" 
                          className={
                            achievement.rarity === 'legendary'
                              ? 'border-yellow-500 text-yellow-700'
                              : achievement.rarity === 'epic'
                              ? 'border-purple-500 text-purple-700'
                              : 'border-blue-500 text-blue-700'
                          }
                        >
                          {achievement.rarity}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                      {!achievement.earned && achievement.progress && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Progress</span>
                            <span>{achievement.progress}%</span>
                          </div>
                          <Progress value={achievement.progress} className="h-2" />
                        </div>
                      )}
                      {achievement.earned && (
                        <Badge className="bg-green-500 text-white">Earned</Badge>
                      )}
                    </div>
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

// Helper component for metric cards
function MetricCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  color 
}: { 
  title: string
  value: string
  change: number
  icon: any
  color: string
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600'
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            <p className={`text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? '+' : ''}{change.toFixed(2)}%
            </p>
          </div>
          <div className={`p-3 rounded-full ${colorClasses[color as keyof typeof colorClasses]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 