'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import wallet components to prevent SSR issues
const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then((mod) => ({ default: mod.WalletMultiButton })),
  { ssr: false }
)

import { useWallet } from '@solana/wallet-adapter-react'
import { useStaking } from '@/hooks/useStaking'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Coins, 
  TrendingUp, 
  Clock, 
  Users, 
  Award, 
  Target,
  ArrowRight,
  Zap,
  Shield,
  Percent,
  Calculator,
  Info,
  ExternalLink,
  Wallet,
  RefreshCw
} from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from '@/components/ui/use-toast'

export default function StakingPageContent() {
  const { publicKey } = useWallet()
  const {
    stakingStats,
    userStake,
    loading,
    error,
    connected,
    stake,
    unstake,
    claimRewards,
    calculateEstimatedRewards,
    refreshData,
    formatAmount,
    auraPrice,
    networkStats,
    isContractIntegrated
  } = useStaking()

  const [activePool, setActivePool] = useState('30-day')
  const [stakeAmount, setStakeAmount] = useState('')
  const [unstakeAmount, setUnstakeAmount] = useState('')
  const [selectedAction, setSelectedAction] = useState<'stake' | 'unstake'>('stake')
  
  // Add mounted state to prevent hydration mismatches
  const [mounted, setMounted] = useState(false)

  // Ensure client-side rendering to prevent hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  // Show demo mode banner when not using real contract
  const isDemoMode = !isContractIntegrated

  // Handle staking
  const handleStake = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid stake amount",
        variant: "destructive"
      })
      return
    }

    try {
      const signature = await stake(stakeAmount)
      toast({
        title: "Stake Successful!",
        description: `Transaction: ${signature}`,
      })
      setStakeAmount('')
    } catch (err: any) {
      toast({
        title: "Staking Failed",
        description: err.message,
        variant: "destructive"
      })
    }
  }

  // Handle unstaking
  const handleUnstake = async () => {
    if (!unstakeAmount || parseFloat(unstakeAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid unstake amount",
        variant: "destructive"
      })
      return
    }

    try {
      const signature = await unstake(unstakeAmount)
      toast({
        title: "Unstake Successful!",
        description: `Transaction: ${signature}`,
      })
      setUnstakeAmount('')
    } catch (err: any) {
      toast({
        title: "Unstaking Failed",
        description: err.message,
        variant: "destructive"
      })
    }
  }

  // Handle claim rewards
  const handleClaimRewards = async () => {
    try {
      const signature = await claimRewards()
      toast({
        title: "Rewards Claimed!",
        description: `Transaction: ${signature}`,
      })
    } catch (err: any) {
      toast({
        title: "Claim Failed",
        description: err.message,
        variant: "destructive"
      })
    }
  }

  // Updated staking pools data
  const stakingPools = [
    {
      id: '30-day',
      name: 'Time-Weighted Staking',
      apy: typeof stakingStats.apy === 'string' ? stakingStats.apy : stakingStats.apy.toString(),
      minStake: '1',
      lockPeriod: '30 days (early exit penalty)',
      totalStaked: typeof stakingStats.totalValueLocked === 'string' 
        ? stakingStats.totalValueLocked 
        : stakingStats.totalValueLocked.toFixed(2),
      participants: 'N/A',
      description: 'Time-weighted rewards with 30-day optimal lock period',
      rewards: '$AURA',
      risk: 'Low'
    }
  ]

  const features = [
    {
      icon: Shield,
      title: 'Secure Protocol',
      description: 'Audited smart contracts with multi-signature security'
    },
    {
      icon: Zap,
      title: 'Time-Weighted Rewards',
      description: 'Earn more for longer stakes with our innovative algorithm'
    },
    {
      icon: Percent,
      title: 'Competitive APY',
      description: 'Industry-leading yields up to 18.2% annually'
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Governance participation and community benefits'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* DevNet Warning Banner */}
      <div className="bg-orange-600 text-white text-center py-3 px-4 relative z-50">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-orange-300 rounded-full animate-pulse"></div>
          <span className="font-semibold">🚧 DEVNET VERSION - Time-Weighted Staking uses test tokens (Tsaura) 🚧</span>
          <div className="w-2 h-2 bg-orange-300 rounded-full animate-pulse"></div>
        </div>
      </div>

      <Header />
      
      <main className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700">
                <span className="text-sm font-medium">⚠️ Data Loading Error: {error}</span>
                <Button 
                  onClick={refreshData} 
                  size="sm" 
                  variant="outline"
                  disabled={loading}
                >
                  Retry
                </Button>
              </div>
            </div>
          )}

          {/* Demo Mode Banner */}
          {mounted && isDemoMode && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-4"
            >
              <div className="flex items-center gap-3">
                <div className="bg-amber-100 p-2 rounded-full">
                  <Info className="h-5 w-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-800">🎭 Demo Mode Active</h3>
                  <p className="text-sm text-amber-700">
                    You're in demo mode! All transactions are simulated. Connect your wallet to test the complete staking experience.
                  </p>
                </div>
                <Badge variant="outline" className="border-amber-300 text-amber-700">
                  Demo
                </Badge>
              </div>
            </motion.div>
          )}

          {/* Hero Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 rounded-full text-sm font-medium text-blue-700 mb-6">
              <Coins className="w-4 h-4" />
              AURA Staking
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              Stake Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">$AURA</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Earn competitive rewards by staking your $AURA tokens. Join our time-weighted staking protocol for sustainable DeFi yields.
            </p>
            
            {/* Key Metrics */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white mb-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-blue-100">Total Value Locked</div>
                  <div className="text-2xl font-bold">
                    {typeof stakingStats.totalValueLocked === 'string' 
                      ? stakingStats.totalValueLocked 
                      : `${stakingStats.totalValueLocked.toLocaleString('en-US', { 
                          minimumFractionDigits: 0, 
                          maximumFractionDigits: 0 
                        })} $AURA`
                    }
                  </div>
                </div>
                <div>
                  <div className="text-blue-100">Current APY</div>
                  <div className="text-2xl font-bold">
                    {typeof stakingStats.apy === 'string' 
                      ? stakingStats.apy 
                      : `${stakingStats.apy.toFixed(1)}%`
                    }
                  </div>
                </div>
                <div>
                  <div className="text-blue-100">Active Validators</div>
                  <div className="text-2xl font-bold">
                    {networkStats.totalValidators.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-blue-100">Network APY</div>
                  <div className="text-2xl font-bold">
                    {typeof networkStats.averageRewards === 'string' 
                      ? networkStats.averageRewards 
                      : `${networkStats.averageRewards.toFixed(1)}%`
                    }
                  </div>
                </div>
                <div>
                  <div className="text-blue-100">AURA Price</div>
                  <div className="text-2xl font-bold">
                    ${auraPrice.toFixed(8)}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Staking Pools */}
            <div className="lg:col-span-2">
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Staking Pool
                    <Button
                      onClick={refreshData}
                      size="sm"
                      variant="outline"
                      disabled={loading}
                      className="ml-auto"
                    >
                      <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Time-weighted rewards with flexible unstaking
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stakingPools.map((pool) => (
                      <motion.div
                        key={pool.id}
                        whileHover={{ scale: 1.02 }}
                        className="p-6 rounded-xl border-2 border-blue-500 bg-blue-50"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{pool.name}</h3>
                            <p className="text-sm text-gray-600">{pool.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600">
                              {pool.apy === 'Coming Soon' ? pool.apy : `${pool.apy}%`}
                            </div>
                            <div className="text-sm text-gray-600">APY</div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="text-gray-600">Min Stake</div>
                            <div className="font-medium">{pool.minStake} $AURA</div>
                          </div>
                          <div>
                            <div className="text-gray-600">Lock Period</div>
                            <div className="font-medium">{pool.lockPeriod}</div>
                          </div>
                          <div>
                            <div className="text-gray-600">Total Staked</div>
                            <div className="font-medium">
                              {typeof stakingStats.totalValueLocked === 'string' 
                                ? stakingStats.totalValueLocked 
                                : `${stakingStats.totalValueLocked.toLocaleString('en-US', { 
                                    minimumFractionDigits: 0, 
                                    maximumFractionDigits: 0 
                                  })} $AURA`
                              }
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-600">Your Stake</div>
                            <div className="font-medium flex items-center gap-2">
                              {stakingStats.userStaked.toLocaleString('en-US', { 
                                minimumFractionDigits: 0, 
                                maximumFractionDigits: 0 
                              })} $AURA
                              {mounted && connected && stakingStats.userStaked > 0 && (
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          <div className="flex gap-2">
                            <Badge variant="secondary">{pool.rewards} Rewards</Badge>
                            <Badge variant="default">{pool.risk} Risk</Badge>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Staking Actions */}
              {mounted && connected && (
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle>Manage Your Stake</CardTitle>
                    <CardDescription>
                      Stake, unstake, or claim your rewards
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs value={selectedAction} onValueChange={(v) => setSelectedAction(v as any)}>
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="stake">Stake</TabsTrigger>
                        <TabsTrigger value="unstake">Unstake</TabsTrigger>
                        <TabsTrigger value="claim">Claim</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="stake" className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Amount to Stake
                            </label>
                            <Input
                              type="number"
                              placeholder="Enter amount in $AURA"
                              value={stakeAmount}
                              onChange={(e) => setStakeAmount(e.target.value)}
                              className="text-lg"
                            />
                          </div>
                          <Button 
                            onClick={handleStake}
                            disabled={loading || !stakeAmount || parseFloat(stakeAmount) <= 0}
                            className="h-full"
                          >
                            {loading ? 'Processing...' : isDemoMode ? '🎭 Demo Stake $AURA' : 'Stake $AURA'}
                          </Button>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="unstake" className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Amount to Unstake
                            </label>
                            <Input
                              type="number"
                              placeholder="Enter amount in $AURA"
                              value={unstakeAmount}
                              onChange={(e) => setUnstakeAmount(e.target.value)}
                              className="text-lg"
                            />
                            <div className="text-xs text-gray-500 mt-1">
                              Available: {stakingStats.userStaked.toLocaleString()} $AURA
                            </div>
                          </div>
                          <Button 
                            onClick={handleUnstake}
                            disabled={loading || !unstakeAmount || parseFloat(unstakeAmount) <= 0}
                            className="h-full"
                          >
                            {loading ? 'Processing...' : isDemoMode ? '🎭 Demo Unstake $AURA' : 'Unstake $AURA'}
                          </Button>
                        </div>

                        {userStake && userStake.penaltyAmount.gt(0) && (
                          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                            <h4 className="font-medium text-orange-800 mb-2">Early Exit Penalty</h4>
                            <p className="text-sm text-orange-700">
                              Unstaking before the 30-day period incurs a 5% penalty to encourage long-term staking.
                            </p>
                          </div>
                        )}
                      </TabsContent>
                      
                      <TabsContent value="claim" className="space-y-6">
                        <div className="text-center py-8">
                          <div className="text-3xl font-bold text-gray-900 mb-2">
                            {stakingStats.userRewards.toFixed(2)} $AURA
                          </div>
                          <div className="text-sm text-gray-600 mb-6">
                            ≈ ${(stakingStats.userRewards * auraPrice).toFixed(2)} USD Available
                          </div>
                          <Button 
                            onClick={handleClaimRewards}
                            disabled={loading || stakingStats.userRewards <= 0}
                            className="px-8"
                          >
                            {loading ? 'Processing...' : isDemoMode ? '🎭 Demo Claim Rewards' : 'Claim Rewards'}
                          </Button>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              )}

              {/* Calculator */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="w-5 h-5" />
                    Rewards Calculator
                  </CardTitle>
                  <CardDescription>
                    Estimate your potential earnings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stake Amount ($AURA)
                      </label>
                      <Input
                        type="number"
                        placeholder="Enter amount"
                        value={stakeAmount}
                        onChange={(e) => setStakeAmount(e.target.value)}
                      />
                    </div>
                    
                    {stakeAmount && parseFloat(stakeAmount) > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-blue-50 rounded-lg"
                      >
                        <h4 className="font-medium text-gray-900 mb-3">Estimated Rewards</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-gray-600">Daily</div>
                            <div className="font-bold text-lg">
                              {calculateEstimatedRewards(stakeAmount || '0', 1).toFixed(2)} $AURA
                            </div>
                            <div className="text-xs text-gray-500">
                              ${(calculateEstimatedRewards(stakeAmount || '0', 1) * auraPrice).toFixed(2)}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-600">Monthly</div>
                            <div className="font-bold text-lg">
                              {calculateEstimatedRewards(stakeAmount || '0', 30).toFixed(2)} $AURA
                            </div>
                            <div className="text-xs text-gray-500">
                              ${(calculateEstimatedRewards(stakeAmount || '0', 30) * auraPrice).toFixed(2)}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-600">Yearly</div>
                            <div className="font-bold text-lg">
                              {calculateEstimatedRewards(stakeAmount || '0', 365).toFixed(2)} $AURA
                            </div>
                            <div className="text-xs text-gray-500">
                              ${(calculateEstimatedRewards(stakeAmount || '0', 365) * auraPrice).toFixed(2)}
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-4 text-center">
                          *Estimates based on {typeof stakingStats.apy === 'string' 
                            ? stakingStats.apy 
                            : `${stakingStats.apy}%`
                          } APY. Actual returns may vary.
                        </p>
                      </motion.div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              {/* Wallet Connection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm text-gray-600">Your Wallet</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Connection</span>
                      <div className="flex items-center gap-2">
                        {mounted ? (
                          <>
                            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                            <span className={`text-xs ${connected ? 'text-green-600' : 'text-gray-500'}`}>
                              {connected ? 'Connected' : 'Not Connected'}
                            </span>
                          </>
                        ) : (
                          <>
                            <div className="w-2 h-2 rounded-full bg-gray-300" />
                            <span className="text-xs text-gray-500">Loading...</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm">AURA Price</span>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-sm font-medium">${auraPrice.toFixed(8)}</span>
                        <span className="text-xs text-gray-400 ml-1">Live</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm">Network APY</span>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        <span className="text-sm font-medium">
                          {typeof networkStats.averageRewards === 'string' 
                            ? networkStats.averageRewards 
                            : `${networkStats.averageRewards.toFixed(1)}%`
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t">
                    <WalletMultiButton className="w-full" />
                  </div>
                </CardContent>
              </Card>

              {/* Your Position */}
              {mounted && connected && userStake && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      Your Position
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-sm">Time-Weighted Staking</div>
                          <Badge variant={userStake.isActive ? 'default' : 'secondary'}>
                            {userStake.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                          {stakingStats.userStaked.toLocaleString('en-US', { 
                            minimumFractionDigits: 0, 
                            maximumFractionDigits: 0 
                          })} $AURA
                        </div>
                        <div className="text-sm text-gray-600">
                          Weighted Stake: {formatAmount(userStake.weightedStake)} $AURA
                        </div>
                        <div className="text-sm text-gray-600 flex items-center gap-2">
                          Earned: {stakingStats.userRewards.toFixed(2)} $AURA
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                        </div>
                        <div className="text-xs text-gray-500">
                          ≈ ${(stakingStats.userRewards * auraPrice).toFixed(2)} USD
                        </div>
                        {userStake.penaltyAmount.gt(0) && (
                          <div className="text-xs text-orange-600 mt-1 p-2 bg-orange-50 rounded">
                            ⚠️ Early exit penalty: ~{(stakingStats.userStaked * 0.05).toFixed(0)} $AURA
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Features */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Why Stake with AURA?</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                          <feature.icon className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-sm text-gray-900">{feature.title}</div>
                          <div className="text-xs text-gray-600">{feature.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Learn More */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Learn More</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="text-xs text-blue-600 font-medium mb-1">AURA Token Contract</div>
                      <div className="text-xs text-blue-800 font-mono break-all">
                        3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe
                      </div>
                      <div className="text-xs text-blue-600 mt-1">Live price from DexScreener</div>
                    </div>
                    <a href="#" className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <span className="text-sm font-medium">Staking Guide</span>
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </a>
                    <a href="#" className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <span className="text-sm font-medium">Risk Factors</span>
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </a>
                    <a href="#" className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <span className="text-sm font-medium">Tokenomics</span>
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-16"
          >
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Frequently Asked Questions</CardTitle>
                <CardDescription>
                  Everything you need to know about AURA staking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">What is staking?</h4>
                      <p className="text-sm text-gray-600">
                        Staking involves locking your $AURA tokens to support the network and earn rewards. 
                        It helps secure the protocol while generating passive income.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">How are rewards calculated?</h4>
                      <p className="text-sm text-gray-600">
                        Rewards are distributed proportionally based on your stake amount and pool selection. 
                        Higher lock periods offer better APY rates.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Can I unstake anytime?</h4>
                      <p className="text-sm text-gray-600">
                        Flexible pools allow instant unstaking. Fixed-term pools have lock periods but offer 
                        higher rewards.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Is staking safe?</h4>
                      <p className="text-sm text-gray-600">
                        Our staking contracts are audited by leading security firms. However, DeFi always 
                        carries inherent risks that you should understand.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">What are the fees?</h4>
                      <p className="text-sm text-gray-600">
                        No fees for staking or claiming rewards. Only standard network transaction fees apply 
                        when interacting with the protocol.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">When do I receive rewards?</h4>
                      <p className="text-sm text-gray-600">
                        Rewards are distributed daily and automatically compound. You can claim them anytime 
                        or let them continue compounding.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
} 