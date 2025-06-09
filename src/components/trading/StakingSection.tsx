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
  const [stakeTaxPreview, setStakeTaxPreview] = useState<any>(null)
  const [unstakeTaxPreview, setUnstakeTaxPreview] = useState<any>(null)
  const [rewardTaxPreview, setRewardTaxPreview] = useState<any>(null)
  const [isStaking, setIsStaking] = useState(false)
  const [isUnstaking, setIsUnstaking] = useState(false)
  const [isCalculatingTax, setIsCalculatingTax] = useState(false)
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

  // Calculate staking tax preview
  const calculateStakeTax = async (amount: number) => {
    if (amount <= 0) {
      setStakeTaxPreview(null)
      return
    }

    setIsCalculatingTax(true)
    try {
      const response = await fetch('/api/admin/staking-tax', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userWallet: 'demo_wallet_123', // In production, get from connected wallet
          amount: amount,
          operation: 'stake'
        })
      })

      const data = await response.json()
      if (data.success) {
        setStakeTaxPreview(data)
      }
    } catch (error) {
      console.error('Error calculating stake tax:', error)
    } finally {
      setIsCalculatingTax(false)
    }
  }

  // Calculate unstaking tax preview
  const calculateUnstakeTax = async () => {
    if (stakedAmount <= 0) {
      setUnstakeTaxPreview(null)
      return
    }

    setIsCalculatingTax(true)
    try {
      const response = await fetch('/api/admin/staking-tax', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userWallet: 'demo_wallet_123',
          amount: stakedAmount,
          operation: 'unstake'
        })
      })

      const data = await response.json()
      if (data.success) {
        setUnstakeTaxPreview(data)
      }
    } catch (error) {
      console.error('Error calculating unstake tax:', error)
    } finally {
      setIsCalculatingTax(false)
    }
  }

  // Calculate reward claiming tax preview
  const calculateRewardTax = async () => {
    if (stakingRewards <= 0) {
      setRewardTaxPreview(null)
      return
    }

    setIsCalculatingTax(true)
    try {
      const response = await fetch('/api/admin/staking-tax', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userWallet: 'demo_wallet_123',
          amount: stakingRewards,
          operation: 'claim_rewards'
        })
      })

      const data = await response.json()
      if (data.success) {
        setRewardTaxPreview(data)
      }
    } catch (error) {
      console.error('Error calculating reward tax:', error)
    } finally {
      setIsCalculatingTax(false)
    }
  }

  // Auto-calculate tax when stake amount changes
  useEffect(() => {
    if (stakeAmount && parseFloat(stakeAmount) > 0) {
      const timer = setTimeout(() => calculateStakeTax(parseFloat(stakeAmount)), 500)
      return () => clearTimeout(timer)
    } else {
      setStakeTaxPreview(null)
    }
  }, [stakeAmount])

  // Calculate unstake tax preview when component mounts
  useEffect(() => {
    calculateUnstakeTax()
    calculateRewardTax()
  }, [stakedAmount, stakingRewards])

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
                Stake AURA tokens to earn proportional payouts from the 0.8% burn redistribution
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
              {/* Tax Preview for Staking */}
              {stakeTaxPreview && !stakeTaxPreview.isExempt && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 space-y-2">
                  <h4 className="text-sm font-semibold text-orange-800">Staking Tax Preview</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-orange-700">Stake Amount:</span>
                      <span className="font-semibold">{stakeTaxPreview.grossAmount} AURA</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-orange-700">Tax ({stakeTaxPreview.taxRate}%):</span>
                      <span className="font-semibold text-blue-600">-{stakeTaxPreview.taxAmount.toFixed(4)} AURA</span>
                    </div>
                    <div className="flex justify-between col-span-2 border-t border-orange-300 pt-2">
                      <span className="text-orange-700 font-semibold">Net Staked:</span>
                      <span className="font-bold text-green-600">{stakeTaxPreview.netAmount.toFixed(4)} AURA</span>
                    </div>
                    <div className="col-span-2 text-xs text-blue-600 bg-blue-100 rounded p-2 mt-2">
                      💰 Tax goes to reward pool - redistributed to all stakers!
                    </div>
                  </div>
                </div>
              )}

              {stakeTaxPreview?.isExempt && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-800">
                    <strong>Tax Exempt:</strong> {stakeTaxPreview.exemptReason}
                  </p>
                </div>
              )}

              <div className="flex gap-4">
                <Button 
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-urbanist"
                  onClick={handleStake}
                  disabled={isStaking || isCalculatingTax}
                >
                  {isStaking ? 'Staking...' : isCalculatingTax ? 'Calculating...' : 'Stake AURA'}
                </Button>
                {stakedAmount > 0 && (
                  <Button 
                    variant="outline"
                    className="flex-1 border-purple-300 text-purple-700 hover:bg-purple-50"
                    onClick={handleUnstake}
                    disabled={isUnstaking || isCalculatingTax}
                  >
                    {isUnstaking ? 'Unstaking...' : isCalculatingTax ? 'Calculating...' : 'Unstake All'}
                  </Button>
                )}
              </div>
              {stakingRewards > 0 && (
                <>
                  {/* Tax Preview for Rewards */}
                  {rewardTaxPreview && !rewardTaxPreview.isExempt && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
                      <h4 className="text-sm font-semibold text-blue-800">Reward Claim Tax Preview</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-blue-700">Gross Rewards:</span>
                          <span className="font-semibold">{rewardTaxPreview.grossAmount.toFixed(4)} AURA</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-700">Tax ({rewardTaxPreview.taxRate}%):</span>
                          <span className="font-semibold text-purple-600">-{rewardTaxPreview.taxAmount.toFixed(4)} AURA</span>
                        </div>
                        <div className="flex justify-between col-span-2 border-t border-blue-300 pt-2">
                          <span className="text-blue-700 font-semibold">Net Received:</span>
                          <span className="font-bold text-green-600">{rewardTaxPreview.netAmount.toFixed(4)} AURA</span>
                        </div>
                        <div className="col-span-2 text-xs text-purple-600 bg-purple-100 rounded p-2 mt-2">
                          🔄 Tax recycles back as future rewards for all stakers
                        </div>
                      </div>
                    </div>
                  )}

                  {rewardTaxPreview?.isExempt && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                      <p className="text-xs text-green-800">
                        <strong>Tax Exempt:</strong> {rewardTaxPreview.exemptReason}
                      </p>
                    </div>
                  )}

                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-urbanist"
                    onClick={handleClaimRewards}
                    disabled={isCalculatingTax}
                  >
                    {isCalculatingTax ? 'Calculating...' : `Claim Rewards (${stakingRewards.toFixed(4)} AURA)`}
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Tax Redistribution Info */}
          <div className="bg-gradient-to-r from-purple-100 to-blue-100 p-4 rounded-xl border border-purple-200">
            <h4 className="font-semibold text-purple-900 mb-2 font-urbanist flex items-center gap-2">
              <Info className="h-5 w-5" />
              Staking Rewards + Tax Redistribution
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm mb-3">
              <div>
                <span className="text-purple-700">Base APY:</span>
                <span className="font-semibold ml-2 text-purple-900">8.0%</span>
              </div>
              <div>
                <span className="text-blue-700">Tax Boost:</span>
                <span className="font-semibold ml-2 text-blue-900">+2.4%</span>
              </div>
            </div>
            <div className="bg-white/70 p-3 rounded-lg border border-purple-200 mb-3">
              <p className="text-sm font-semibold text-purple-900 mb-2">💰 Tax Redistribution Model:</p>
              <ul className="text-xs text-purple-800 space-y-1">
                <li>• Stake Tax (1%) → Added to reward pool</li>
                <li>• Unstake Tax (2%) → Added to reward pool</li>
                <li>• Reward Tax (1.5%) → Added to reward pool</li>
                <li>• All taxes redistributed to stakers every 6 hours</li>
              </ul>
            </div>
            <p className="text-sm text-green-700 font-semibold">
              🚀 The more people stake/unstake, the higher your rewards become!
            </p>
          </div>

          {/* Live Burn Metrics */}
          {burnMetrics && (
            <div className="bg-gradient-to-r from-red-50 to-orange-50 p-4 rounded-xl border border-red-200">
              <h4 className="font-semibold text-red-900 mb-3 font-urbanist flex items-center gap-2">
                <Flame className="h-5 w-5" />
                Live 0.8% Burn System
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