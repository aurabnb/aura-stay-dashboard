'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useRealTreasuryData } from '@/hooks/useRealTreasuryData'
import { 
  DollarSign, 
  TrendingUp, 
  Target, 
  MapPin, 
  Calendar,
  Coins,
  Activity,
  PieChart,
  BarChart3,
  RefreshCw,
  AlertCircle
} from 'lucide-react'

export function TreasuryDashboard() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d')
  
  // Use the real treasury data hook
  const {
    data: treasuryData,
    loading,
    error,
    totalValue,
    volatileAssets,
    hardAssets,
    wallets,
    solPrice,
    lastUpdated,
    refetch
  } = useRealTreasuryData()

  // Constants
  const VOLCANO_FUNDING_GOAL = 600000 // $600k goal

  const formatUsd = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const calculateFundingProgress = () => {
    if (!treasuryData) return { percentage: 0, raised: 0, remaining: VOLCANO_FUNDING_GOAL }
    
    const raised = hardAssets + volatileAssets // Total liquid assets
    const percentage = (raised / VOLCANO_FUNDING_GOAL) * 100
    const remaining = Math.max(0, VOLCANO_FUNDING_GOAL - raised)
    
    return { percentage, raised, remaining }
  }

  const { percentage, raised, remaining } = calculateFundingProgress()

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-64 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-4 w-48 bg-gray-200 animate-pulse rounded mt-2"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Treasury Dashboard</h1>
            <p className="text-muted-foreground">Monitor treasury health and funding progress</p>
          </div>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Error loading treasury data</span>
            </div>
            <p className="text-red-600 text-sm mt-2">{error}</p>
            <Button onClick={refetch} variant="outline" className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Treasury Dashboard</h1>
          <p className="text-muted-foreground">Monitor treasury health and funding progress</p>
        </div>
        <div className="flex items-center space-x-2">
          <select 
            value={selectedTimeframe} 
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="border rounded-md px-3 py-1 text-sm"
          >
            <option value="24h">24 Hours</option>
            <option value="7d">7 Days</option>
            <option value="30d">30 Days</option>
            <option value="90d">90 Days</option>
          </select>
          <Button onClick={refetch} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Treasury Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatUsd(totalValue)}</div>
            <p className="text-xs text-muted-foreground">
              {lastUpdated && (
                <span>Updated: {new Date(lastUpdated).toLocaleString()}</span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Liquid Assets</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatUsd(hardAssets)}</div>
            <p className="text-xs text-muted-foreground">
              Stablecoins & liquid assets
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staked Assets</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatUsd(volatileAssets)}</div>
            <p className="text-xs text-muted-foreground">
              Crypto holdings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Funding Progress</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{percentage.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              of Volcano Stay goal
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Funding Progress Section */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Target className="h-6 w-6 text-gray-600" />
            Volcano Stay Funding Progress
          </CardTitle>
          <CardDescription className="text-lg">
            Track our progress toward fully funding the first AURA eco-stay in Guayabo, Costa Rica
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-lg font-medium">Funding Progress</span>
              <span className="text-lg font-semibold text-gray-600">
                {percentage.toFixed(1)}%
              </span>
            </div>
            <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
              <div
                style={{ width: `${Math.min(percentage, 100)}%` }}
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-[width] duration-700 ease-out"
              />
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>{formatUsd(raised)}</span>
              <span>{formatUsd(VOLCANO_FUNDING_GOAL)}</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
                <span className="font-semibold text-gray-800">Raised</span>
              </div>
              <p className="text-3xl font-bold text-gray-700">{formatUsd(raised)}</p>
              <p className="text-sm text-gray-600">Total liquid assets</p>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <span className="font-semibold text-gray-800">Goal</span>
              </div>
              <p className="text-3xl font-bold text-gray-700">{formatUsd(VOLCANO_FUNDING_GOAL)}</p>
              <p className="text-sm text-gray-600">Construction cost</p>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <span className="font-semibold text-gray-800">Remaining</span>
              </div>
              <p className="text-3xl font-bold text-gray-700">{formatUsd(remaining)}</p>
              <p className="text-sm text-gray-600">Still needed</p>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-orange-600 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <span className="font-semibold text-gray-800">Location</span>
              </div>
              <p className="text-lg font-bold text-gray-700">Guayabo, CR</p>
              <p className="text-sm text-gray-600">Volcano location</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed View */}
      <Tabs defaultValue="wallets" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="wallets">Treasury Wallets</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="allocations">Allocations</TabsTrigger>
        </TabsList>

        <TabsContent value="wallets" className="space-y-4">
          <div className="grid grid-cols-1 gap-6">
            {wallets.map((wallet) => (
              <Card key={wallet.wallet_id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {wallet.name}
                    <Badge variant="secondary">{wallet.balances.length} tokens</Badge>
                  </CardTitle>
                  <CardDescription>
                    {wallet.blockchain} blockchain wallet
                  </CardDescription>
                  <p className="text-xs text-muted-foreground font-mono">{wallet.address}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {wallet.balances.map((balance, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                            {balance.token_symbol.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium">{balance.token_name}</div>
                            <div className="text-sm text-muted-foreground">{balance.token_symbol}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{balance.balance.toLocaleString()} {balance.token_symbol}</div>
                          <div className="text-sm text-muted-foreground">{formatUsd(balance.usd_value)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between items-center font-semibold">
                      <span>Total Value:</span>
                      <span>{formatUsd(wallet.totalUsdValue)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Treasury Analytics</CardTitle>
              <CardDescription>Performance metrics and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                Treasury analytics charts will be implemented here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="allocations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Asset Allocations</CardTitle>
              <CardDescription>Treasury asset distribution and allocation strategy</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                Asset allocation visualization will be implemented here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 