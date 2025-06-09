'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { 
  Flame, 
  TrendingUp, 
  Clock, 
  Users, 
  DollarSign, 
  ExternalLink, 
  RefreshCw,
  Zap,
  Award,
  Timer
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface BurnTransaction {
  id: string
  amount: number
  timestamp: Date
  transactionHash: string
  source: string
}

interface StakingReward {
  address: string
  amount: number
  stakedAmount: number
  percentage: number
}

interface BurnDistributionData {
  totalBurned: number
  nextDistribution: string
  stakingRewards: StakingReward[]
}

const BurnRedistributionDashboard: React.FC = () => {
  const [burnHistory, setBurnHistory] = useState<BurnTransaction[]>([])
  const [stakingMetrics, setStakingMetrics] = useState<any>(null)
  const [distributionData, setDistributionData] = useState<BurnDistributionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDistributing, setIsDistributing] = useState(false)
  const { toast } = useToast()

  // Mock data - replace with real API calls
  useEffect(() => {
    const fetchBurnData = async () => {
      setLoading(true)
      
      // Mock burn history
      const mockBurnHistory: BurnTransaction[] = Array.from({ length: 20 }, (_, i) => ({
        id: `burn-${i}`,
        amount: Math.random() * 100 + 10,
        timestamp: new Date(Date.now() - i * 2 * 60 * 60 * 1000),
        transactionHash: `0x${Math.random().toString(16).slice(2, 66)}`,
        source: ['Trading', 'NFT Sales', 'Property Fees', 'Community Tax'][Math.floor(Math.random() * 4)]
      }))

      // Mock staking metrics
      const mockStakingMetrics = {
        totalStakers: 2847,
        totalStaked: 45_000_000,
        totalRewardsDistributed: 12500.5432,
        currentAPY: 12.5
      }

      // Mock distribution data
      const mockDistributionData: BurnDistributionData = {
        totalBurned: 850.4567,
        nextDistribution: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
        stakingRewards: Array.from({ length: 10 }, (_, i) => ({
          address: `0x${Math.random().toString(16).slice(2, 42)}`,
          amount: Math.random() * 50 + 1,
          stakedAmount: Math.random() * 10000 + 1000,
          percentage: Math.random() * 5 + 0.1
        }))
      }

      setBurnHistory(mockBurnHistory)
      setStakingMetrics(mockStakingMetrics)
      setDistributionData(mockDistributionData)
      setLoading(false)
    }

    fetchBurnData()
  }, [])

  // Manual reward distribution
  const handleManualDistribution = async () => {
    setIsDistributing(true)
    try {
      // Mock distribution delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast({
        title: "Rewards Distributed!",
        description: `Distributed ${distributionData?.totalBurned.toFixed(4)} AURA to ${distributionData?.stakingRewards.length} stakers`
      })
      
      // Reset distribution data
      if (distributionData) {
        setDistributionData({
          ...distributionData,
          totalBurned: 0,
          nextDistribution: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString()
        })
      }
    } catch (error) {
      toast({
        title: "Distribution Failed",
        description: "Could not distribute rewards. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsDistributing(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const nextDistributionTime = distributionData?.nextDistribution 
    ? new Date(distributionData.nextDistribution) 
    : new Date(Date.now() + 6 * 60 * 60 * 1000)

  const timeUntilDistribution = Math.max(0, nextDistributionTime.getTime() - Date.now())
  const hoursUntil = Math.floor(timeUntilDistribution / (1000 * 60 * 60))
  const minutesUntil = Math.floor((timeUntilDistribution % (1000 * 60 * 60)) / (1000 * 60))

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Burn & Redistribution</h1>
        <p className="text-muted-foreground">
          Track token burns and automatic reward distribution to stakers
        </p>
      </div>

      {/* Header Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Flame className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-sm text-red-700">Total Burned</p>
                <p className="text-2xl font-bold text-red-900">
                  {distributionData?.totalBurned.toFixed(4) || '0.0000'} AURA
                </p>
                <p className="text-xs text-red-600">2% of all transactions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-blue-700">Total Stakers</p>
                <p className="text-2xl font-bold text-blue-900">
                  {stakingMetrics?.totalStakers.toLocaleString() || '0'}
                </p>
                <p className="text-xs text-blue-600">Active staking wallets</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-teal-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Award className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-green-700">Rewards Distributed</p>
                <p className="text-2xl font-bold text-green-900">
                  {stakingMetrics?.totalRewardsDistributed.toFixed(4) || '0.0000'} AURA
                </p>
                <p className="text-xs text-green-600">From burn pool</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Timer className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-purple-700">Next Distribution</p>
                <p className="text-2xl font-bold text-purple-900">
                  {hoursUntil}h {minutesUntil}m
                </p>
                <p className="text-xs text-purple-600">Automatic (4x daily)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribution Progress */}
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-yellow-900">
                <Zap className="h-6 w-6" />
                Reward Distribution System
              </CardTitle>
              <CardDescription className="text-yellow-700">
                Automated distribution of burn rewards to stakers every 6 hours
              </CardDescription>
            </div>
            <Button
              onClick={handleManualDistribution}
              disabled={isDistributing}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              {isDistributing ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Zap className="h-4 w-4 mr-2" />
              )}
              {isDistributing ? 'Distributing...' : 'Distribute Now'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Distribution Progress</span>
              <span>{Math.max(0, 100 - (timeUntilDistribution / (6 * 60 * 60 * 1000)) * 100).toFixed(1)}%</span>
            </div>
            <Progress 
              value={Math.max(0, 100 - (timeUntilDistribution / (6 * 60 * 60 * 1000)) * 100)} 
              className="h-3 bg-yellow-100"
            />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-yellow-700">Burn Pool Balance</p>
                <p className="font-semibold">{distributionData?.totalBurned.toFixed(4)} AURA</p>
              </div>
              <div>
                <p className="text-yellow-700">Distribution Amount</p>
                <p className="font-semibold">{((distributionData?.totalBurned || 0) * 0.8).toFixed(4)} AURA</p>
              </div>
              <div>
                <p className="text-yellow-700">Treasury Reserve</p>
                <p className="font-semibold">{((distributionData?.totalBurned || 0) * 0.2).toFixed(4)} AURA</p>
              </div>
              <div>
                <p className="text-yellow-700">Current APY</p>
                <p className="font-semibold">{stakingMetrics?.currentAPY}%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Data Tabs */}
      <Tabs defaultValue="burn-history" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="burn-history">Burn History</TabsTrigger>
          <TabsTrigger value="reward-distribution">Reward Distribution</TabsTrigger>
          <TabsTrigger value="staking-stats">Staking Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="burn-history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-red-600" />
                Recent Burn Transactions
              </CardTitle>
              <CardDescription>
                Latest token burns from various ecosystem activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Amount</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Transaction</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {burnHistory.slice(0, 10).map((burn) => (
                    <TableRow key={burn.id}>
                      <TableCell className="font-medium">
                        {burn.amount.toFixed(4)} AURA
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{burn.source}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {burn.timestamp.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reward-distribution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-green-600" />
                Staking Reward Recipients
              </CardTitle>
              <CardDescription>
                Addresses receiving rewards from the current distribution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Address</TableHead>
                    <TableHead>Staked Amount</TableHead>
                    <TableHead>Reward Amount</TableHead>
                    <TableHead>Percentage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {distributionData?.stakingRewards.slice(0, 10).map((reward, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono text-sm">
                        {reward.address.slice(0, 6)}...{reward.address.slice(-4)}
                      </TableCell>
                      <TableCell>{reward.stakedAmount.toFixed(2)} AURA</TableCell>
                      <TableCell className="font-medium text-green-600">
                        {reward.amount.toFixed(4)} AURA
                      </TableCell>
                      <TableCell>{reward.percentage.toFixed(2)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staking-stats" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Staking Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total Staked</span>
                    <span className="font-medium">{stakingMetrics?.totalStaked.toLocaleString()} AURA</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Stakers</span>
                    <span className="font-medium">{stakingMetrics?.totalStakers.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Stake</span>
                    <span className="font-medium">
                      {((stakingMetrics?.totalStaked || 0) / (stakingMetrics?.totalStakers || 1)).toFixed(2)} AURA
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Current APY</span>
                    <span className="font-medium text-green-600">{stakingMetrics?.currentAPY}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-purple-600" />
                  Distribution Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Frequency</span>
                    <span className="font-medium">Every 6 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Daily Distributions</span>
                    <span className="font-medium">4</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Next Distribution</span>
                    <span className="font-medium">{hoursUntil}h {minutesUntil}m</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Distribution Rate</span>
                    <span className="font-medium">80% to stakers</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default BurnRedistributionDashboard
export { BurnRedistributionDashboard } 