'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'
import { 
  BarChart3, 
  TrendingUp, 
  Wallet, 
  Home, 
  Users, 
  Settings,
  PieChart,
  Activity,
  Coins,
  Shield,
  Zap,
  Percent,
  Calculator,
  RefreshCw,
  Award,
  Target,
  ArrowRight,
  Clock,
  Info,
  DollarSign,
  TrendingDown
} from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from '@/components/ui/use-toast'

// Dynamically import wallet components to prevent SSR issues
const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then((mod) => ({ default: mod.WalletMultiButton })),
  { ssr: false }
)

// Import staking hook
import { useStaking } from '@/hooks/useStaking'
import { useWallet } from '@solana/wallet-adapter-react'

export default function DashboardPage() {
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

  const [stakeAmount, setStakeAmount] = useState('')
  const [unstakeAmount, setUnstakeAmount] = useState('')
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    setMounted(true)
    
    // Handle URL hash for tab navigation
    const hash = window.location.hash.replace('#', '')
    if (hash && ['overview', 'staking', 'wallet', 'treasury'].includes(hash)) {
      setActiveTab(hash)
    }
  }, [])

  // Update URL hash when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    window.location.hash = value
  }

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

  const quickAccessItems = [
    {
      title: 'Analytics',
      description: 'Comprehensive analytics and insights',
      icon: BarChart3,
      href: '/dashboard/analytics',
      color: 'bg-blue-500',
      stats: '47 metrics tracked'
    },
    {
      title: 'Trading',
      description: 'Advanced trading interface',
      icon: TrendingUp,
      href: '/dashboard/trading',
      color: 'bg-green-500',
      stats: '23 active trades'
    },
    {
      title: 'Properties',
      description: 'Browse and manage property listings',
      icon: Home,
      href: '/dashboard/properties',
      color: 'bg-cyan-500',
      stats: '12 properties'
    },
    {
      title: 'Governance',
      description: 'Participate in DAO governance',
      icon: Users,
      href: '/dashboard/governance',
      color: 'bg-indigo-500',
      stats: '5 active proposals'
    }
  ]

  const treasuryFeatures = [
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
      {mounted && !isContractIntegrated && (
        <div className="bg-orange-600 text-white text-center py-3 px-4 relative z-50">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-orange-300 rounded-full animate-pulse"></div>
            <span className="font-semibold">🚧 DEVNET VERSION - Using test tokens 🚧</span>
            <div className="w-2 h-2 bg-orange-300 rounded-full animate-pulse"></div>
          </div>
        </div>
      )}

      <Header />
      
      <div className="container mx-auto px-4 py-8 pt-28 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            User Dashboard
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your comprehensive AuraBNB control center. Manage your portfolio, stake tokens, and access all platform features.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Portfolio</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$12,543.21</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+5.2%</span> from yesterday
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AURA Staked</CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mounted && userStake?.amount ? formatAmount(userStake.amount) : '5,420'} AURA
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+{stakingStats.apy || '12.5'}%</span> APY
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Rewards</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mounted && userStake?.pendingRewards ? formatAmount(userStake.pendingRewards) : '125.5'} AURA
              </div>
              <p className="text-xs text-muted-foreground">
                Ready to claim
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Treasury Health</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">98%</div>
              <p className="text-xs text-muted-foreground">
                Excellent performance
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="staking">Staking</TabsTrigger>
            <TabsTrigger value="wallet">Wallet</TabsTrigger>
            <TabsTrigger value="treasury">Treasury</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            {/* Quick Access */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Access</CardTitle>
                <CardDescription>Jump to your most used features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {quickAccessItems.map((item) => {
                    const IconComponent = item.icon
                    return (
                      <Link key={item.href} href={item.href}>
                        <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer h-full group">
                          <CardContent className="p-4">
                            <div className="flex items-center space-x-3 mb-3">
                              <div className={`p-2 rounded-lg ${item.color} group-hover:scale-110 transition-transform`}>
                                <IconComponent className="h-5 w-5 text-white" />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-sm">{item.title}</h3>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">
                              {item.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                {item.stats}
                              </span>
                              <ArrowRight className="h-3 w-3 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest transactions and interactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Award className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">Staking Rewards Claimed</div>
                      <div className="text-sm text-muted-foreground">2 hours ago</div>
                    </div>
                    <div className="text-green-600 font-medium">+125.5 AURA</div>
                  </div>

                  <div className="flex items-center space-x-4 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">Tokens Swapped</div>
                      <div className="text-sm text-muted-foreground">1 day ago</div>
                    </div>
                    <div className="text-blue-600 font-medium">1000 AURA → 2.5 SOL</div>
                  </div>

                  <div className="flex items-center space-x-4 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">Governance Vote Cast</div>
                      <div className="text-sm text-muted-foreground">3 days ago</div>
                    </div>
                    <div className="text-purple-600 font-medium">Proposal #42</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="staking" className="space-y-6">
            {/* Staking Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Your Stake</CardTitle>
                  <Coins className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {mounted && userStake?.amount ? formatAmount(userStake.amount) : '5,420'} AURA
                  </div>
                  <p className="text-xs text-muted-foreground">
                    ≈ ${mounted && userStake?.amount && auraPrice ? (parseFloat(userStake.amount) * auraPrice).toFixed(2) : '12,543'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Rewards</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {mounted && userStake?.pendingRewards ? formatAmount(userStake.pendingRewards) : '125.5'} AURA
                  </div>
                  <Button
                    onClick={handleClaimRewards}
                    className="mt-2 w-full"
                    size="sm"
                    disabled={!connected || loading}
                  >
                    Claim Rewards
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current APY</CardTitle>
                  <Percent className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {stakingStats.apy || '12.5'}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Time-weighted rewards
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Staking Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Coins className="h-5 w-5" />
                    <span>Stake AURA</span>
                  </CardTitle>
                  <CardDescription>Stake your AURA tokens to earn rewards</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Amount to stake</label>
                    <Input
                      type="number"
                      placeholder="Enter AURA amount"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                    />
                  </div>
                  
                  {mounted && (
                    <div className="flex justify-center">
                      {!connected ? (
                        <WalletMultiButton className="!bg-blue-600 hover:!bg-blue-700" />
                      ) : (
                        <Button
                          onClick={handleStake}
                          className="w-full"
                          disabled={loading || !stakeAmount}
                        >
                          {loading ? (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                              Staking...
                            </>
                          ) : (
                            'Stake AURA'
                          )}
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingDown className="h-5 w-5" />
                    <span>Unstake AURA</span>
                  </CardTitle>
                  <CardDescription>Withdraw your staked tokens</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Amount to unstake</label>
                    <Input
                      type="number"
                      placeholder="Enter AURA amount"
                      value={unstakeAmount}
                      onChange={(e) => setUnstakeAmount(e.target.value)}
                    />
                  </div>
                  
                  <Button
                    onClick={handleUnstake}
                    variant="outline"
                    className="w-full"
                    disabled={!connected || loading || !unstakeAmount}
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Unstaking...
                      </>
                    ) : (
                      'Unstake AURA'
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Staking Features */}
            <Card>
              <CardHeader>
                <CardTitle>Staking Features</CardTitle>
                <CardDescription>Why stake with AuraBNB</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {treasuryFeatures.map((feature, index) => {
                    const IconComponent = feature.icon
                    return (
                      <motion.div
                        key={feature.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="text-center p-4 border rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <IconComponent className="h-6 w-6 text-blue-600" />
                        </div>
                        <h3 className="font-semibold text-sm mb-2">{feature.title}</h3>
                        <p className="text-xs text-muted-foreground">
                          {feature.description}
                        </p>
                      </motion.div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wallet" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Wallet Management</CardTitle>
                <CardDescription>Manage your portfolio and view transaction history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Wallet className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">Connect your wallet to view balances and transaction history</p>
                  {mounted && (
                    <WalletMultiButton className="!bg-blue-600 hover:!bg-blue-700" />
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="treasury" className="space-y-6">
            {/* Treasury Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Value Locked</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${typeof stakingStats.totalValueLocked === 'string' 
                      ? stakingStats.totalValueLocked 
                      : stakingStats.totalValueLocked.toFixed(2)}M
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+8.2%</span> this month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Treasury Health</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">98%</div>
                  <Progress value={98} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Stakers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2,847</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+156</span> this week
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Treasury Actions</CardTitle>
                <CardDescription>Advanced treasury management features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link href="/dashboard/treasury">
                    <Button variant="outline" className="w-full justify-start">
                      <PieChart className="mr-2 h-4 w-4" />
                      View Full Treasury Dashboard
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full justify-start" disabled>
                    <Settings className="mr-2 h-4 w-4" />
                    Treasury Settings (Admin Only)
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  )
} 