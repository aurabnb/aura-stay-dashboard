'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Wallet, Clock, Gift, Star, Vote, Shield } from 'lucide-react'

interface RewardToken {
  symbol: string
  apy: string
  earned: number
  icon: string
}

export function StakeToEarnDashboard() {
  const [stakeAmount, setStakeAmount] = useState('')
  const [stakedBalance] = useState(1250)
  const [availableBalance] = useState(500)
  const [earnedRewards] = useState(62.5)
  const [stakingDuration] = useState(45) // days

  const rewardTokens: RewardToken[] = [
    { symbol: 'AURA', apy: '12%', earned: 45.2, icon: '🌟' },
    { symbol: 'SOL', apy: '8%', earned: 0.15, icon: '◎' },
    { symbol: 'USDC', apy: '5%', earned: 17.1, icon: '💵' }
  ]

  const handleStake = () => {
    console.log('Staking tokens', { stakeAmount })
    // Implementation for staking
  }

  const handleUnstake = () => {
    console.log('Unstaking tokens')
    // Implementation for unstaking
  }

  const handleClaimRewards = () => {
    console.log('Claiming rewards')
    // Implementation for claiming rewards
  }

  const stakingTiers = [
    { name: 'Bronze', minStake: 100, apy: '8%', benefits: ['Basic rewards', 'Community access'] },
    { name: 'Silver', minStake: 1000, apy: '10%', benefits: ['Enhanced rewards', 'Priority support', 'Governance voting'] },
    { name: 'Gold', minStake: 5000, apy: '12%', benefits: ['Premium rewards', 'VIP access', 'Proposal creation', 'Exclusive events'] },
    { name: 'Platinum', minStake: 25000, apy: '15%', benefits: ['Maximum rewards', 'Elite status', 'Direct team access', 'Advisory role'] }
  ]

  const getCurrentTier = () => {
    for (let i = stakingTiers.length - 1; i >= 0; i--) {
      if (stakedBalance >= stakingTiers[i].minStake) {
        return stakingTiers[i]
      }
    }
    return stakingTiers[0]
  }

  const currentTier = getCurrentTier()
  const nextTier = stakingTiers[stakingTiers.findIndex(t => t.name === currentTier.name) + 1]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Stake to Earn</h1>
        <p className="text-muted-foreground">Stake AURA tokens to earn rewards and unlock governance power</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Wallet className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Staked Balance</p>
                <p className="text-2xl font-bold">{stakedBalance.toLocaleString()} AURA</p>
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
                <p className="text-2xl font-bold">${earnedRewards.toFixed(2)}</p>
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
                <p className="text-2xl font-bold">{stakingDuration} days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Star className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Current Tier</p>
                <p className="text-2xl font-bold">{currentTier.name}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Tier Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Staking Tier: {currentTier.name}
          </CardTitle>
          <CardDescription>
            Your current tier benefits and progress to next tier
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between text-sm">
            <span>Current APY: {currentTier.apy}</span>
            {nextTier && <span>Next tier: {nextTier.name} ({nextTier.minStake.toLocaleString()} AURA)</span>}
          </div>
          
          {nextTier && (
            <>
              <Progress 
                value={(stakedBalance / nextTier.minStake) * 100} 
                className="h-2"
              />
              <div className="text-xs text-gray-500">
                {nextTier.minStake - stakedBalance > 0 
                  ? `${(nextTier.minStake - stakedBalance).toLocaleString()} AURA needed for ${nextTier.name} tier`
                  : 'Tier requirement met!'
                }
              </div>
            </>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {currentTier.benefits.map((benefit, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {benefit}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="stake" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="stake">Stake & Unstake</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="governance">Governance Power</TabsTrigger>
          <TabsTrigger value="tiers">Tier Benefits</TabsTrigger>
        </TabsList>
        
        <TabsContent value="stake" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Stake AURA Tokens</CardTitle>
                <CardDescription>
                  Stake your AURA tokens to earn rewards. No lockup period required.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Available Balance: {availableBalance} AURA</label>
                  <Input
                    type="number"
                    placeholder="Enter amount to stake"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => setStakeAmount((availableBalance * 0.25).toString())}
                    variant="outline"
                    size="sm"
                  >
                    25%
                  </Button>
                  <Button 
                    onClick={() => setStakeAmount((availableBalance * 0.5).toString())}
                    variant="outline"
                    size="sm"
                  >
                    50%
                  </Button>
                  <Button 
                    onClick={() => setStakeAmount((availableBalance * 0.75).toString())}
                    variant="outline"
                    size="sm"
                  >
                    75%
                  </Button>
                  <Button 
                    onClick={() => setStakeAmount(availableBalance.toString())}
                    variant="outline"
                    size="sm"
                  >
                    Max
                  </Button>
                </div>
                <Button onClick={handleStake} className="w-full">
                  Stake AURA
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Unstake Tokens</CardTitle>
                <CardDescription>
                  Unstake your tokens anytime. No penalties or waiting periods.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Currently Staked</p>
                  <p className="text-xl font-semibold">{stakedBalance.toLocaleString()} AURA</p>
                </div>
                <Button onClick={handleUnstake} variant="outline" className="w-full">
                  Unstake All
                </Button>
                <p className="text-xs text-gray-500">
                  Note: Unstaking will stop reward accumulation for unstaked tokens
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="rewards" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Reward Tokens
              </CardTitle>
              <CardDescription>
                Earn rewards across various tokens based on your staking tier
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
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
                      <p className="text-sm text-gray-500">Earned</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-green-800">Total Rewards Available</p>
                    <p className="text-sm text-green-600">Ready to claim</p>
                  </div>
                  <Button onClick={handleClaimRewards} className="bg-green-600 hover:bg-green-700">
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
                <Vote className="h-5 w-5" />
                Governance Voting Power
              </CardTitle>
              <CardDescription>
                Your staked tokens give you voting power in DAO governance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-600">Voting Power</p>
                  <p className="text-2xl font-bold text-blue-800">{stakedBalance.toLocaleString()}</p>
                  <p className="text-xs text-blue-600">1 AURA = 1 Vote</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-600">Active Proposals</p>
                  <p className="text-2xl font-bold text-purple-800">3</p>
                  <p className="text-xs text-purple-600">Available to vote</p>
                </div>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Governance Benefits by Tier</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Proposal Voting:</span>
                    <span className="text-green-600">✓ Unlocked</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Proposal Creation:</span>
                    <span className={currentTier.name === 'Gold' || currentTier.name === 'Platinum' ? 'text-green-600' : 'text-gray-400'}>
                      {currentTier.name === 'Gold' || currentTier.name === 'Platinum' ? '✓ Unlocked' : '✗ Requires Gold Tier'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Advisory Role:</span>
                    <span className={currentTier.name === 'Platinum' ? 'text-green-600' : 'text-gray-400'}>
                      {currentTier.name === 'Platinum' ? '✓ Unlocked' : '✗ Requires Platinum Tier'}
                    </span>
                  </div>
                </div>
              </div>
              
              <Button className="w-full" variant="outline">
                View Active Proposals
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tiers" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stakingTiers.map((tier, index) => (
              <Card key={index} className={`${tier.name === currentTier.name ? 'border-blue-500 bg-blue-50' : ''}`}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {tier.name}
                    {tier.name === currentTier.name && <Badge>Current</Badge>}
                  </CardTitle>
                  <CardDescription>
                    Min: {tier.minStake.toLocaleString()} AURA
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{tier.apy}</p>
                      <p className="text-sm text-gray-600">APY</p>
                    </div>
                    <div className="space-y-1">
                      {tier.benefits.map((benefit, benefitIndex) => (
                        <div key={benefitIndex} className="text-xs text-gray-600">
                          • {benefit}
                        </div>
                      ))}
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