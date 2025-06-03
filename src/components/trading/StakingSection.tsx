'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Lock, Coins, TrendingUp, Clock, Info, AlertCircle, Flame } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface BurnMetrics {
  totalRewardsDistributed: number
  nextDistribution: string
  totalStakers: number
  averageStake: number
}

export function StakingSection() {
  const [stakeAmount, setStakeAmount] = useState('')
  const [userBalance] = useState(1000) // Mock user balance
  const [stakedAmount, setStakedAmount] = useState(800) // User's staked amount
  const [stakingRewards, setStakingRewards] = useState(12.5) // User's pending rewards
  const [burnMetrics, setBurnMetrics] = useState<BurnMetrics | null>(null) // Real burn data
  const [isStaking, setIsStaking] = useState(false)
  const [isUnstaking, setIsUnstaking] = useState(false)
  const { toast } = useToast()

  // Mock burn metrics data
  useEffect(() => {
    const mockMetrics: BurnMetrics = {
      totalRewardsDistributed: 15420.5832,
      nextDistribution: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours from now
      totalStakers: 2847,
      averageStake: 1250
    }
    setBurnMetrics(mockMetrics)
  }, [])

  const handleStake = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid staking amount",
        variant: "destructive"
      })
      return
    }

    if (parseFloat(stakeAmount) > userBalance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough AURA tokens",
        variant: "destructive"
      })
      return
    }

    setIsStaking(true)
    try {
      // TODO: Implement actual staking logic with smart contract
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate API call
      
      setStakedAmount(prev => prev + parseFloat(stakeAmount))
      setStakeAmount('')
      
      toast({
        title: "Staking Successful!",
        description: `Successfully staked ${stakeAmount} AURA tokens`
      })
    } catch (error) {
      toast({
        title: "Staking Failed",
        description: "Please try again later",
        variant: "destructive"
      })
    } finally {
      setIsStaking(false)
    }
  }

  const handleUnstake = async () => {
    if (stakedAmount <= 0) {
      toast({
        title: "No Staked Tokens",
        description: "You don't have any staked tokens to unstake",
        variant: "destructive"
      })
      return
    }

    setIsUnstaking(true)
    try {
      // TODO: Implement actual unstaking logic
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate API call
      
      setStakedAmount(0)
      
      toast({
        title: "Unstaking Successful!",
        description: `Successfully unstaked ${stakedAmount.toFixed(2)} AURA tokens`
      })
    } catch (error) {
      toast({
        title: "Unstaking Failed",
        description: "Please try again later",
        variant: "destructive"
      })
    } finally {
      setIsUnstaking(false)
    }
  }

  const handleClaimRewards = async () => {
    if (stakingRewards <= 0) {
      toast({
        title: "No Rewards",
        description: "You don't have any rewards to claim",
        variant: "destructive"
      })
      return
    }

    try {
      // TODO: Implement actual reward claiming logic
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setStakingRewards(0)
      
      toast({
        title: "Rewards Claimed!",
        description: `Successfully claimed ${stakingRewards.toFixed(4)} AURA rewards`
      })
    } catch (error) {
      toast({
        title: "Claiming Failed",
        description: "Please try again later",
        variant: "destructive"
      })
    }
  }

  const setMaxAmount = () => {
    setStakeAmount(userBalance.toString())
  }

  const setPercentage = (percentage: number) => {
    const amount = (userBalance * percentage / 100)
    setStakeAmount(amount.toString())
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-purple-900 font-urbanist flex items-center gap-2">
                <Lock className="h-6 w-6" />
                AURA Staking
              </CardTitle>
              <CardDescription className="text-purple-700 font-urbanist mt-2">
                Stake AURA tokens to earn proportional payouts from the 2% burn redistribution
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
              APY: ~12-18%
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Staking Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/70 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Coins className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">Total Staked</span>
              </div>
              <p className="text-xl font-bold text-purple-900">2.4M AURA</p>
            </div>
            <div className="bg-white/70 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-purple-700">Your Staked</span>
              </div>
              <p className="text-xl font-bold text-purple-900">{stakedAmount.toFixed(2)} AURA</p>
            </div>
            <div className="bg-white/70 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-purple-700">Pending Rewards</span>
              </div>
              <p className="text-xl font-bold text-purple-900">{stakingRewards.toFixed(4)} AURA</p>
            </div>
          </div>

          {/* Staking Form */}
          <div className="bg-white/50 p-6 rounded-xl border border-purple-200">
            <h4 className="font-semibold text-purple-900 mb-4 font-urbanist">Stake AURA Tokens</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-purple-700 mb-2">
                  Available Balance: {userBalance.toLocaleString()} AURA
                </label>
                <Input
                  type="number"
                  placeholder="Enter amount to stake"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  className="border-purple-300 focus:border-purple-500"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-purple-300 text-purple-700"
                  onClick={() => setPercentage(25)}
                >
                  25%
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-purple-300 text-purple-700"
                  onClick={() => setPercentage(50)}
                >
                  50%
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-purple-300 text-purple-700"
                  onClick={() => setPercentage(75)}
                >
                  75%
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-purple-300 text-purple-700"
                  onClick={setMaxAmount}
                >
                  Max
                </Button>
              </div>
              <div className="flex gap-4">
                <Button 
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-urbanist"
                  onClick={handleStake}
                  disabled={isStaking}
                >
                  {isStaking ? 'Staking...' : 'Stake AURA'}
                </Button>
                {stakedAmount > 0 && (
                  <Button 
                    variant="outline"
                    className="flex-1 border-purple-300 text-purple-700 hover:bg-purple-50"
                    onClick={handleUnstake}
                    disabled={isUnstaking}
                  >
                    {isUnstaking ? 'Unstaking...' : 'Unstake All'}
                  </Button>
                )}
              </div>
              {stakingRewards > 0 && (
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-urbanist"
                  onClick={handleClaimRewards}
                >
                  Claim Rewards ({stakingRewards.toFixed(4)} AURA)
                </Button>
              )}
            </div>
          </div>

          {/* Revenue Split Info */}
          <div className="bg-gradient-to-r from-purple-100 to-blue-100 p-4 rounded-xl border border-purple-200">
            <h4 className="font-semibold text-purple-900 mb-2 font-urbanist flex items-center gap-2">
              <Info className="h-5 w-5" />
              How 2% Burn Redistribution Works
            </h4>
            <ul className="text-sm text-purple-800 space-y-1">
              <li>• 2% of all buy/sell transactions are burned and redistributed to stakers</li>
              <li>• Rewards are distributed 4 times per day proportionally to your stake</li>
              <li>• No lock-up period - unstake anytime without penalties</li>
              <li>• System is upgradeable for future Airbnb property payment integration</li>
            </ul>
          </div>

          {/* Live Burn Metrics */}
          {burnMetrics && (
            <div className="bg-gradient-to-r from-red-50 to-orange-50 p-4 rounded-xl border border-red-200">
              <h4 className="font-semibold text-red-900 mb-3 font-urbanist flex items-center gap-2">
                <Flame className="h-5 w-5" />
                Live 2% Burn System
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-red-700">Total Rewards Distributed</p>
                  <p className="font-bold text-red-900">
                    {burnMetrics.totalRewardsDistributed.toFixed(4)} AURA
                  </p>
                </div>
                <div>
                  <p className="text-red-700">Next Distribution</p>
                  <p className="font-bold text-red-900">
                    {new Date(burnMetrics.nextDistribution).toLocaleTimeString()}
                  </p>
                </div>
                <div>
                  <p className="text-red-700">Total Stakers</p>
                  <p className="font-bold text-red-900">
                    {burnMetrics.totalStakers.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-red-700">Average Stake</p>
                  <p className="font-bold text-red-900">
                    {burnMetrics.averageStake.toLocaleString()} AURA
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-red-200">
                <a
                  href="/burn-tracking"
                  className="text-sm text-red-700 hover:text-red-900 font-medium"
                >
                  View Full Burn Dashboard →
                </a>
              </div>
            </div>
          )}

          {/* Upgrade Notice */}
          <div className="bg-gradient-to-r from-blue-100 to-green-100 p-4 rounded-xl border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2 font-urbanist flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Future Upgrade Path
            </h4>
            <p className="text-sm text-blue-800">
              This staking system is designed to be upgradeable. In the future, stakers will also receive 
              proportional payouts from actual Airbnb property revenue, creating a diversified income stream 
              from both trading activity and real estate operations.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 