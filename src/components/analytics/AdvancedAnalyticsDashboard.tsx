'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  TrendingDown,
  BarChart3, 
  PieChart,
  Users, 
  Wallet,
  Building,
  Zap,
  Globe,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from 'lucide-react'

interface AnalyticsData {
  ecosystem: {
    totalUsers: number
    activeUsers24h: number
    totalTransactions: number
    totalVolume: number
    growth: {
      users: number
      transactions: number
      volume: number
    }
  }
  treasury: {
    totalValue: number
    monthlyGrowth: number
    allocation: Array<{
      category: string
      amount: number
      percentage: number
    }>
  }
  staking: {
    totalStaked: number
    stakingAPY: number
    stakerCount: number
    rewardsDistributed: number
  }
  governance: {
    activeProposals: number
    totalVotes: number
    participationRate: number
    passedProposals: number
  }
  properties: {
    totalProperties: number
    totalInvestment: number
    averageROI: number
    occupancyRate: number
  }
}

export function AdvancedAnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState('30d')

  useEffect(() => {
    fetchAnalyticsData()
  }, [timeframe])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      
      // Mock data - in real implementation, this would come from your API
      const mockData: AnalyticsData = {
        ecosystem: {
          totalUsers: 15420,
          activeUsers24h: 3250,
          totalTransactions: 156780,
          totalVolume: 12500000,
          growth: {
            users: 12.5,
            transactions: 8.3,
            volume: 15.7
          }
        },
        treasury: {
          totalValue: 7142489,
          monthlyGrowth: 8.5,
          allocation: [
            { category: 'Operations', amount: 2500000, percentage: 35 },
            { category: 'Project Funding', amount: 2000000, percentage: 28 },
            { category: 'Marketing', amount: 1500000, percentage: 21 },
            { category: 'Reserve', amount: 1142489, percentage: 16 }
          ]
        },
        staking: {
          totalStaked: 25000000,
          stakingAPY: 12.5,
          stakerCount: 5420,
          rewardsDistributed: 3125000
        },
        governance: {
          activeProposals: 5,
          totalVotes: 12580,
          participationRate: 78.5,
          passedProposals: 23
        },
        properties: {
          totalProperties: 8,
          totalInvestment: 18500000,
          averageROI: 19.2,
          occupancyRate: 87.5
        }
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setData(mockData)
    } catch (error) {
      console.error('Error fetching analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: amount >= 1000000 ? 'compact' : 'standard',
      maximumFractionDigits: 1
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      notation: num >= 1000000 ? 'compact' : 'standard',
      maximumFractionDigits: 1
    }).format(num)
  }

  const MetricCard = ({ 
    title, 
    value, 
    growth, 
    icon: Icon, 
    format = 'number' 
  }: {
    title: string
    value: number
    growth?: number
    icon: any
    format?: 'number' | 'currency' | 'percentage'
  }) => {
    const formattedValue = format === 'currency' 
      ? formatCurrency(value)
      : format === 'percentage'
      ? `${value}%`
      : formatNumber(value)

    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">{title}</p>
                <p className="text-2xl font-bold">{formattedValue}</p>
              </div>
            </div>
            {growth !== undefined && (
              <div className={`flex items-center gap-1 ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {growth >= 0 ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : (
                  <ArrowDownRight className="h-4 w-4" />
                )}
                <span className="text-sm font-medium">{Math.abs(growth)}%</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading analytics...</span>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <div className="text-center py-16">
          <BarChart3 className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Unable to Load Analytics
          </h3>
          <p className="text-gray-600 mb-4">
            There was an error loading the analytics data.
          </p>
          <Button onClick={fetchAnalyticsData}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Advanced Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into the Aura Foundation ecosystem
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {['7d', '30d', '90d', '1y'].map((period) => (
            <Button
              key={period}
              variant={timeframe === period ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeframe(period)}
            >
              {period}
            </Button>
          ))}
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Users"
          value={data.ecosystem.totalUsers}
          growth={data.ecosystem.growth.users}
          icon={Users}
        />
        <MetricCard
          title="Treasury Value"
          value={data.treasury.totalValue}
          growth={data.treasury.monthlyGrowth}
          icon={Wallet}
          format="currency"
        />
        <MetricCard
          title="Total Staked"
          value={data.staking.totalStaked}
          icon={Zap}
          format="currency"
        />
        <MetricCard
          title="Active Proposals"
          value={data.governance.activeProposals}
          icon={BarChart3}
        />
      </div>

      <Tabs defaultValue="ecosystem" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="ecosystem">Ecosystem</TabsTrigger>
          <TabsTrigger value="treasury">Treasury</TabsTrigger>
          <TabsTrigger value="staking">Staking</TabsTrigger>
          <TabsTrigger value="governance">Governance</TabsTrigger>
          <TabsTrigger value="properties">Properties</TabsTrigger>
        </TabsList>
        
        <TabsContent value="ecosystem" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Growth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Users</span>
                    <span className="font-semibold">{formatNumber(data.ecosystem.totalUsers)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Active (24h)</span>
                    <span className="font-semibold">{formatNumber(data.ecosystem.activeUsers24h)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Growth Rate</span>
                    <Badge variant="secondary" className="text-green-600">
                      +{data.ecosystem.growth.users}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Transaction Volume
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Transactions</span>
                    <span className="font-semibold">{formatNumber(data.ecosystem.totalTransactions)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Volume</span>
                    <span className="font-semibold">{formatCurrency(data.ecosystem.totalVolume)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Growth Rate</span>
                    <Badge variant="secondary" className="text-green-600">
                      +{data.ecosystem.growth.volume}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Platform Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Avg Session</span>
                    <span className="font-semibold">12.5 min</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Retention (7d)</span>
                    <span className="font-semibold">68.5%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Engagement</span>
                    <Badge variant="secondary" className="text-blue-600">
                      High
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="treasury" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Treasury Allocation
                </CardTitle>
                <CardDescription>
                  Distribution of treasury funds across categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.treasury.allocation.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{item.category}</span>
                        <span className="text-sm text-gray-600">{item.percentage}%</span>
                      </div>
                      <Progress value={item.percentage} className="h-2" />
                      <div className="text-xs text-gray-500">
                        {formatCurrency(item.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Treasury Performance
                </CardTitle>
                <CardDescription>
                  Historical treasury growth and metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Current Value</span>
                    <span className="font-semibold text-xl">{formatCurrency(data.treasury.totalValue)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Monthly Growth</span>
                    <Badge variant="secondary" className="text-green-600">
                      +{data.treasury.monthlyGrowth}%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">YTD Performance</span>
                    <span className="font-semibold text-green-600">+45.2%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">All-time High</span>
                    <span className="font-semibold">{formatCurrency(data.treasury.totalValue * 1.15)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="staking" className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <MetricCard
              title="Total Staked"
              value={data.staking.totalStaked}
              icon={Zap}
              format="currency"
            />
            <MetricCard
              title="Staking APY"
              value={data.staking.stakingAPY}
              icon={TrendingUp}
              format="percentage"
            />
            <MetricCard
              title="Total Stakers"
              value={data.staking.stakerCount}
              icon={Users}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Staking Analytics</CardTitle>
              <CardDescription>
                Detailed staking pool performance and distribution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Pool Distribution</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">AURA Staking Pool</span>
                      <span className="text-sm font-medium">75%</span>
                    </div>
                    <Progress value={75} />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">AURA-SOL LP Pool</span>
                      <span className="text-sm font-medium">20%</span>
                    </div>
                    <Progress value={20} />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Treasury Pool</span>
                      <span className="text-sm font-medium">5%</span>
                    </div>
                    <Progress value={5} />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold">Rewards Distribution</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Distributed</span>
                      <span className="font-semibold">{formatCurrency(data.staking.rewardsDistributed)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">This Month</span>
                      <span className="font-semibold">{formatCurrency(data.staking.rewardsDistributed * 0.12)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Avg per Staker</span>
                      <span className="font-semibold">{formatCurrency(data.staking.rewardsDistributed / data.staking.stakerCount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="governance" className="space-y-6">
          <div className="grid md:grid-cols-4 gap-4">
            <MetricCard
              title="Active Proposals"
              value={data.governance.activeProposals}
              icon={BarChart3}
            />
            <MetricCard
              title="Total Votes"
              value={data.governance.totalVotes}
              icon={Users}
            />
            <MetricCard
              title="Participation Rate"
              value={data.governance.participationRate}
              icon={TrendingUp}
              format="percentage"
            />
            <MetricCard
              title="Passed Proposals"
              value={data.governance.passedProposals}
              icon={Globe}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Governance Activity</CardTitle>
              <CardDescription>
                Recent voting patterns and proposal outcomes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Proposal Success Rate</span>
                  <span className="font-semibold">82.1%</span>
                </div>
                <Progress value={82.1} />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Average Participation</span>
                  <span className="font-semibold">{data.governance.participationRate}%</span>
                </div>
                <Progress value={data.governance.participationRate} />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Quorum Achievement</span>
                  <span className="font-semibold">94.5%</span>
                </div>
                <Progress value={94.5} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="properties" className="space-y-6">
          <div className="grid md:grid-cols-4 gap-4">
            <MetricCard
              title="Total Properties"
              value={data.properties.totalProperties}
              icon={Building}
            />
            <MetricCard
              title="Total Investment"
              value={data.properties.totalInvestment}
              icon={Wallet}
              format="currency"
            />
            <MetricCard
              title="Average ROI"
              value={data.properties.averageROI}
              icon={TrendingUp}
              format="percentage"
            />
            <MetricCard
              title="Occupancy Rate"
              value={data.properties.occupancyRate}
              icon={Globe}
              format="percentage"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Property Portfolio</CardTitle>
              <CardDescription>
                Performance metrics across all property investments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Regional Distribution</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Southeast Asia</span>
                      <span className="text-sm font-medium">50%</span>
                    </div>
                    <Progress value={50} />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Europe</span>
                      <span className="text-sm font-medium">25%</span>
                    </div>
                    <Progress value={25} />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Americas</span>
                      <span className="text-sm font-medium">25%</span>
                    </div>
                    <Progress value={25} />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold">Revenue Metrics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Monthly Revenue</span>
                      <span className="font-semibold">{formatCurrency(485000)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">YTD Revenue</span>
                      <span className="font-semibold">{formatCurrency(4850000)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Revenue Growth</span>
                      <Badge variant="secondary" className="text-green-600">
                        +28.5%
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 