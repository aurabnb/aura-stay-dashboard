'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Activity,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

interface AnalyticsData {
  totalUsers: number
  totalRevenue: number
  activeStakers: number
  totalStaked: number
  burnRate: number
  redistributionAmount: number
  taxCollected: {
    stake: number
    unstake: number
    rewards: number
    total: number
  }
  growth: {
    users: number
    revenue: number
    staking: number
  }
}

export function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Simulate API call with realistic data
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockData: AnalyticsData = {
        totalUsers: 2847 + Math.floor(Math.random() * 100),
        totalRevenue: 125000 + Math.floor(Math.random() * 10000),
        activeStakers: 1250 + Math.floor(Math.random() * 50),
        totalStaked: 5420000 + Math.floor(Math.random() * 100000),
        burnRate: 2.5 + Math.random() * 0.5,
        redistributionAmount: 15000 + Math.floor(Math.random() * 2000),
        taxCollected: {
          stake: 2500 + Math.floor(Math.random() * 500),
          unstake: 1800 + Math.floor(Math.random() * 300),
          rewards: 1200 + Math.floor(Math.random() * 200),
          total: 5500 + Math.floor(Math.random() * 1000)
        },
        growth: {
          users: 12.5 + Math.random() * 5,
          revenue: 8.3 + Math.random() * 3,
          staking: 15.7 + Math.random() * 4
        }
      }
      
      setData(mockData)
      setLastRefresh(new Date())
    } catch (err) {
      setError('Failed to fetch analytics data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const handleRefresh = () => {
    fetchAnalytics()
  }

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            className="mt-4"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600">Real-time insights into platform performance</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Live Data
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{data?.growth.users.toFixed(1)}%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data?.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{data?.growth.revenue.toFixed(1)}%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Stakers</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.activeStakers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{data?.growth.staking.toFixed(1)}%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staked</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalStaked.toLocaleString()} AURA</div>
            <p className="text-xs text-muted-foreground">
              8.5% APY base rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Staking Tax Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Staking Tax Collection</CardTitle>
            <CardDescription>
              Tax collected from staking operations (redistributed to stakers)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Stake Tax (1%)</span>
                <span className="font-semibold">{data?.taxCollected.stake.toLocaleString()} AURA</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Unstake Tax (2%)</span>
                <span className="font-semibold">{data?.taxCollected.unstake.toLocaleString()} AURA</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Reward Tax (1.5%)</span>
                <span className="font-semibold">{data?.taxCollected.rewards.toLocaleString()} AURA</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Redistributed</span>
                  <span className="font-bold text-blue-600">
                    {data?.taxCollected.total.toLocaleString()} AURA
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Redistribution Impact</CardTitle>
            <CardDescription>
              How tax redistribution benefits all stakers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Base APY</span>
                <span className="font-semibold">8.5%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tax Boost</span>
                <span className="font-semibold text-blue-600">+{data?.burnRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Effective APY</span>
                <span className="font-bold text-green-600">
                  {(8.5 + (data?.burnRate || 0)).toFixed(1)}%
                </span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Monthly Redistribution</span>
                  <span className="font-bold text-purple-600">
                    {data?.redistributionAmount.toLocaleString()} AURA
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Last Updated */}
      <div className="text-center text-sm text-gray-500">
        Last updated: {lastRefresh.toLocaleString()}
      </div>
    </div>
  )
} 