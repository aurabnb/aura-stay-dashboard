'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Activity,
  BarChart3,
  Calendar,
  Download
} from 'lucide-react'

interface AnalyticsData {
  taxCollected: {
    today: number
    week: number
    month: number
    total: number
  }
  swapVolume: {
    today: number
    week: number
    month: number
  }
  userStats: {
    activeUsers: number
    newUsers: number
    returningUsers: number
  }
  topPairs: Array<{
    pair: string
    volume: number
    taxCollected: number
    trades: number
  }>
  hourlyData: Array<{
    hour: string
    volume: number
    taxCollected: number
    trades: number
  }>
}

export const AdminSwapAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d')
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    taxCollected: {
      today: 12.45,
      week: 89.23,
      month: 342.67,
      total: 1567.89
    },
    swapVolume: {
      today: 15420.50,
      week: 87650.25,
      month: 345600.75
    },
    userStats: {
      activeUsers: 247,
      newUsers: 23,
      returningUsers: 224
    },
    topPairs: [
      { pair: 'SOL/AURA', volume: 45600.25, taxCollected: 67.89, trades: 156 },
      { pair: 'USDC/AURA', volume: 23400.50, taxCollected: 34.56, trades: 89 },
      { pair: 'RAY/AURA', volume: 12300.75, taxCollected: 18.45, trades: 45 },
    ],
    hourlyData: Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}:00`,
      volume: Math.random() * 1000 + 500,
      taxCollected: Math.random() * 5 + 1,
      trades: Math.floor(Math.random() * 20) + 5
    }))
  })

  const exportData = () => {
    const dataStr = JSON.stringify(analytics, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `aura-analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Calendar className="h-5 w-5 text-gray-500" />
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={exportData} variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Data
        </Button>
      </div>

      {/* Tax Collection Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Tax</p>
                <p className="text-2xl font-bold text-green-600">
                  {analytics.taxCollected.today} SOL
                </p>
                <p className="text-xs text-gray-500 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +15.2% vs yesterday
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-blue-600">
                  {analytics.taxCollected.week} SOL
                </p>
                <p className="text-xs text-gray-500 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +8.7% vs last week
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-purple-600">
                  {analytics.taxCollected.month} SOL
                </p>
                <p className="text-xs text-gray-500 flex items-center mt-1">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  -2.1% vs last month
                </p>
              </div>
              <Activity className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Collected</p>
                <p className="text-2xl font-bold text-orange-600">
                  {analytics.taxCollected.total} SOL
                </p>
                <p className="text-xs text-gray-500 flex items-center mt-1">
                  <Users className="h-3 w-3 mr-1" />
                  {analytics.userStats.activeUsers} active traders
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Staking Tax Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Staking Tax Redistribution
          </CardTitle>
          <p className="text-sm text-gray-600">
            Taxes collected from staking operations, redistributed as additional rewards
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-700">Stake Tax</p>
                  <p className="text-xl font-bold text-orange-600">8.45 AURA</p>
                  <p className="text-xs text-orange-600">From 89 stake operations</p>
                </div>
                <div className="text-orange-600">
                  <Badge variant="secondary">1.0%</Badge>
                </div>
              </div>
            </div>

            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-700">Unstake Tax</p>
                  <p className="text-xl font-bold text-red-600">12.34 AURA</p>
                  <p className="text-xs text-red-600">From 45 unstake operations</p>
                </div>
                <div className="text-red-600">
                  <Badge variant="secondary">2.0%</Badge>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Reward Tax</p>
                  <p className="text-xl font-bold text-green-600">3.88 AURA</p>
                  <p className="text-xs text-green-600">From 22 claim operations</p>
                </div>
                <div className="text-green-600">
                  <Badge variant="secondary">1.5%</Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Tax for Redistribution</span>
              <span className="text-lg font-bold text-purple-600">24.67 AURA</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-500">Total Staking Operations</span>
              <span className="text-sm font-medium">156 operations</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-green-600">Next Distribution</span>
              <span className="text-xs font-medium text-green-600">In 3.2 hours</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Trading Pairs */}
      <Card>
        <CardHeader>
          <CardTitle>Top Trading Pairs by Tax Collection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.topPairs.map((pair, index) => (
              <div key={pair.pair} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <Badge variant="secondary" className="w-8 text-center">
                    {index + 1}
                  </Badge>
                  <div>
                    <p className="font-semibold">{pair.pair}</p>
                    <p className="text-sm text-gray-600">{pair.trades} trades</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{pair.taxCollected} SOL</p>
                  <p className="text-sm text-gray-600">${pair.volume.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Volume Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>24-Hour Trading Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Interactive charts will be displayed here</p>
              <p className="text-sm text-gray-500 mt-2">
                Showing hourly volume, tax collection, and trade counts
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Active Users (24h)</span>
                <Badge variant="default">{analytics.userStats.activeUsers}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">New Users (24h)</span>
                <Badge variant="secondary">{analytics.userStats.newUsers}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Returning Users (24h)</span>
                <Badge variant="outline">{analytics.userStats.returningUsers}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tax Efficiency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Average Tax per Trade</span>
                <span className="font-semibold">0.045 SOL</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tax Collection Rate</span>
                <Badge variant="default" className="bg-green-600">99.8%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Failed Collections</span>
                <Badge variant="destructive">0.2%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 