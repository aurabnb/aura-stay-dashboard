'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  TrendingUp, 
  Wallet, 
  Clock, 
  Gift, 
  Star, 
  Zap, 
  Shield, 
  Users,
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react'
import { useWallet } from '@solana/wallet-adapter-react'
import { toast } from 'sonner'

interface StakingPool {
  id: string
  name: string
  token: string
  apy: number
  totalStaked: number
  myStaked: number
  rewards: number
  lockPeriod: number
  minStake: number
  icon: string
  status: 'active' | 'paused' | 'ended'
}

interface RewardToken {
  symbol: string
  apy: string
  earned: number
  icon: string
  totalValue: number
}

export function StakingDashboard() {
  const { connected, publicKey } = useWallet()
  const [stakeAmount, setStakeAmount] = useState('')
  const [unstakeAmount, setUnstakeAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [claiming, setClaiming] = useState(false)
  
  // Mock data - would come from API/blockchain in real implementation
  const [userStats, setUserStats] = useState({
    totalStaked: 1250,
    availableBalance: 500,
    totalRewards: 62.5,
    stakingDuration: 45,
    votingPower: 1250,
    tier: 'Gold'
  })

  const stakingPools: StakingPool[] = [
    {
      id: '1',
      name: 'AURA Staking Pool',
      token: 'AURA',
      apy: 12.5,
      totalStaked: 25000000,
      myStaked: 1250,
      rewards: 45.2,
      lockPeriod: 0,
      minStake: 10,
      icon: '🌟',
      status: 'active'
    },
    {
      id: '2', 
      name: 'AURA-SOL LP Pool',
      token: 'AURA-SOL',
      apy: 18.7,
      totalStaked: 5000000,
      myStaked: 0,
      rewards: 0,
      lockPeriod: 14,
      minStake: 50,
      icon: '⚡',
      status: 'active'
    },
    {
      id: '3',
      name: 'Treasury Rewards Pool',
      token: 'AURA',
      apy: 8.3,
      totalStaked: 15000000,
      myStaked: 0,
      rewards: 0,
      lockPeriod: 7,
      minStake: 100,
      icon: '🏛️',
      status: 'active'
    }
  ]

  const rewardTokens: RewardToken[] = [
    { symbol: 'AURA', apy: '12%', earned: 45.2, icon: '🌟', totalValue: 45.2 * 2.1 },
    { symbol: 'SOL', apy: '8%', earned: 0.15, icon: '◎', totalValue: 0.15 * 120 },
    { symbol: 'USDC', apy: '5%', earned: 17.1, icon: '💵', totalValue: 17.1 }
  ]

  const handleStake = async (poolId: string, amount: string) => {
    if (!connected || !publicKey) {
      toast.error('Please connect your wallet to stake')
      return
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    try {
      setLoading(true)
      
      // Mock staking transaction
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success(`Successfully staked ${amount} tokens!`)
      setStakeAmount('')
      
      // Update user stats
      setUserStats(prev => ({
        ...prev,
        totalStaked: prev.totalStaked + parseFloat(amount),
        availableBalance: prev.availableBalance - parseFloat(amount)
      }))
      
    } catch (error) {
      console.error('Staking error:', error)
      toast.error('Failed to stake tokens')
    } finally {
      setLoading(false)
    }
  }

  const handleUnstake = async (poolId: string, amount: string) => {
    if (!connected || !publicKey) {
      toast.error('Please connect your wallet to unstake')
      return
    }

    try {
      setLoading(true)
      
      // Mock unstaking transaction
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success(`Successfully unstaked ${amount} tokens!`)
      setUnstakeAmount('')
      
    } catch (error) {
      console.error('Unstaking error:', error)
      toast.error('Failed to unstake tokens')
    } finally {
      setLoading(false)
    }
  }

  const handleClaimRewards = async () => {
    if (!connected || !publicKey) {
      toast.error('Please connect your wallet to claim rewards')
      return
    }

    try {
      setClaiming(true)
      
      // Mock claim transaction
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success('Successfully claimed all rewards!')
      
      // Reset rewards
      setUserStats(prev => ({ ...prev, totalRewards: 0 }))
      
    } catch (error) {
      console.error('Claim error:', error)
      toast.error('Failed to claim rewards')
    } finally {
      setClaiming(false)
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Bronze': return 'bg-orange-100 text-orange-800'
      case 'Silver': return 'bg-gray-100 text-gray-800'
      case 'Gold': return 'bg-yellow-100 text-yellow-800'
      case 'Platinum': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (!connected) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staking Dashboard</h1>
          <p className="text-muted-foreground">
            Stake AURA tokens to earn rewards and participate in governance
          </p>
        </div>
        
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Wallet className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Connect Your Wallet
            </h3>
            <p className="text-gray-600 text-center max-w-md">
              Connect your Solana wallet to start staking AURA tokens and earning rewards.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Staking Dashboard</h1>
        <p className="text-muted-foreground">
          Stake AURA tokens to earn rewards and participate in governance
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Wallet className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Staked</p>
                <p className="text-2xl font-bold">{userStats.totalStaked.toLocaleString()}</p>
                <p className="text-xs text-gray-500">AURA tokens</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Rewards</p>
                <p className="text-2xl font-bold">${userStats.totalRewards.toFixed(2)}</p>
                <p className="text-xs text-gray-500">Claimable now</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Staking Duration</p>
                <p className="text-2xl font-bold">{userStats.stakingDuration}</p>
                <p className="text-xs text-gray-500">Days active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Voting Power</p>
                <p className="text-2xl font-bold">{userStats.votingPower.toLocaleString()}</p>
                <Badge className={getTierColor(userStats.tier)}>
                  {userStats.tier} Tier
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pools" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pools">Staking Pools</TabsTrigger>
          <TabsTrigger value="rewards">My Rewards</TabsTrigger>
          <TabsTrigger value="governance">Governance</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pools" className="space-y-6">
          <div className="grid gap-6">
            {stakingPools.map((pool) => (
              <Card key={pool.id} className={`border-l-4 ${pool.status === 'active' ? 'border-l-green-500' : 'border-l-gray-400'}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{pool.icon}</span>
                      <div>
                        <CardTitle className="text-lg">{pool.name}</CardTitle>
                        <CardDescription>
                          {pool.lockPeriod === 0 ? 'No lock period' : `${pool.lockPeriod} day lock period`}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={pool.status === 'active' ? 'default' : 'secondary'}>
                        {pool.status}
                      </Badge>
                      <Badge variant="outline" className="text-green-600">
                        {pool.apy}% APY
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Total Staked</p>
                      <p className="font-semibold">{(pool.totalStaked / 1000000).toFixed(1)}M {pool.token}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">My Staked</p>
                      <p className="font-semibold">{pool.myStaked.toLocaleString()} {pool.token}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">My Rewards</p>
                      <p className="font-semibold text-green-600">{pool.rewards.toFixed(2)} {pool.token}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Min Stake</p>
                      <p className="font-semibold">{pool.minStake} {pool.token}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <label className="text-sm font-medium">
                        Available: {userStats.availableBalance} AURA
                      </label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="Amount to stake"
                          value={stakeAmount}
                          onChange={(e) => setStakeAmount(e.target.value)}
                          min={pool.minStake}
                          max={userStats.availableBalance}
                        />
                        <Button 
                          onClick={() => handleStake(pool.id, stakeAmount)}
                          disabled={loading || !stakeAmount || parseFloat(stakeAmount) < pool.minStake}
                          className="min-w-24"
                        >
                          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Stake'}
                        </Button>
                      </div>
                      <div className="flex gap-1">
                        {[25, 50, 75, 100].map((percent) => (
                          <Button
                            key={percent}
                            variant="outline"
                            size="sm"
                            onClick={() => setStakeAmount((userStats.availableBalance * percent / 100).toString())}
                          >
                            {percent}%
                          </Button>
                        ))}
                      </div>
                    </div>

                    {pool.myStaked > 0 && (
                      <div className="space-y-3">
                        <label className="text-sm font-medium">
                          Staked: {pool.myStaked} {pool.token}
                        </label>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            placeholder="Amount to unstake"
                            value={unstakeAmount}
                            onChange={(e) => setUnstakeAmount(e.target.value)}
                            max={pool.myStaked}
                          />
                          <Button 
                            variant="outline"
                            onClick={() => handleUnstake(pool.id, unstakeAmount)}
                            disabled={loading || !unstakeAmount}
                            className="min-w-24"
                          >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Unstake'}
                          </Button>
                        </div>
                        {pool.rewards > 0 && (
                          <Button 
                            onClick={handleClaimRewards}
                            disabled={claiming}
                            className="w-full"
                            variant="secondary"
                          >
                            {claiming ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Gift className="h-4 w-4 mr-2" />}
                            Claim {pool.rewards.toFixed(2)} {pool.token}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  {pool.lockPeriod > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <p className="text-sm text-yellow-800">
                          This pool has a {pool.lockPeriod} day lock period. Early withdrawal may incur penalties.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="rewards" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Reward Summary
              </CardTitle>
              <CardDescription>
                Your accumulated rewards across all staking pools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {rewardTokens.map((token, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{token.icon}</span>
                      <div>
                        <p className="font-semibold">{token.symbol}</p>
                        <p className="text-sm text-gray-600">APY: {token.apy}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{token.earned.toFixed(4)} {token.symbol}</p>
                      <p className="text-sm text-gray-600">${token.totalValue.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <Separator className="my-6" />
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold">Total Rewards Value</p>
                  <p className="text-sm text-gray-600">Across all tokens</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">${rewardTokens.reduce((sum, token) => sum + token.totalValue, 0).toFixed(2)}</p>
                  <Button 
                    onClick={handleClaimRewards}
                    disabled={claiming || userStats.totalRewards === 0}
                    className="mt-2"
                  >
                    {claiming ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Gift className="h-4 w-4 mr-2" />}
                    Claim All Rewards
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="governance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Governance Participation
              </CardTitle>
              <CardDescription>
                Your staking position grants you voting power in DAO governance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Shield className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                  <p className="text-2xl font-bold">{userStats.votingPower.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Voting Power</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="h-8 w-8 mx-auto text-green-600 mb-2" />
                  <p className="text-2xl font-bold">3</p>
                  <p className="text-sm text-gray-600">Proposals Voted</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Star className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                  <p className="text-2xl font-bold">{userStats.tier}</p>
                  <p className="text-sm text-gray-600">Governance Tier</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Governance Benefits</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Vote on treasury allocation proposals</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Participate in property acquisition decisions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Submit governance proposals ({userStats.tier} tier+)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Early access to new features</span>
                  </div>
                </div>
              </div>

              <Button className="w-full" asChild>
                <a href="/dashboard/governance">
                  View Active Proposals
                </a>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Staking Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Total ROI</span>
                      <span className="font-medium">+12.5%</span>
                    </div>
                    <Progress value={12.5} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Annual Yield</span>
                      <span className="font-medium">8.3%</span>
                    </div>
                    <Progress value={8.3} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Portfolio Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">AURA Staking</span>
                    <span className="text-sm font-medium">100%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">LP Tokens</span>
                    <span className="text-sm font-medium">0%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Treasury Pool</span>
                    <span className="text-sm font-medium">0%</span>
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