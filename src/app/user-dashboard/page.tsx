'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  Wallet, 
  TrendingUp, 
  Coins, 
  Users, 
  BarChart3, 
  ArrowUpDown, 
  Gift, 
  Vote, 
  Settings,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  Zap,
  Shield,
  Trophy,
  Calendar,
  DollarSign,
  Activity,
  PieChart,
  Target,
  Flame,
  Layers
} from 'lucide-react'
import { useWallet } from '@/hooks/enhanced-hooks'
import { useClipboard } from '@/hooks/enhanced-hooks'
import { WalletConnectModal } from '@/components/wallet/WalletConnectModal'
import { PortfolioOverview } from '@/components/wallet/PortfolioOverview'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { LoadingOverlay, SkeletonStats } from '@/components/ui/loading'
import { analytics } from '@/lib/analytics'

export default function UserDashboard() {
  const { connection, connect, disconnect, balance, isConnecting, isLoadingBalance } = useWallet()
  const { copy, isCopied } = useClipboard()
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [hideBalances, setHideBalances] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  // Track page view
  useEffect(() => {
    analytics.page('User Dashboard')
    analytics.trackFeatureUsage('user_dashboard')
  }, [])

  // Redirect to connect wallet if not connected
  useEffect(() => {
    if (!connection?.isConnected) {
      setShowConnectModal(true)
    }
  }, [connection])

  const handleWalletConnect = async (walletType: string) => {
    try {
      await connect(walletType)
      setShowConnectModal(false)
      analytics.trackWalletConnection(walletType, true)
    } catch (error) {
      console.error('Wallet connection failed:', error)
      analytics.trackWalletConnection(walletType, false)
      analytics.trackError('Wallet connection failed', 'user_dashboard')
    }
  }

  const handleDisconnect = () => {
    disconnect()
    analytics.track('wallet_disconnected', { timestamp: Date.now() })
  }

  const copyAddress = () => {
    if (connection?.address) {
      copy(connection.address)
      analytics.track('address_copied', { timestamp: Date.now() })
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  if (!connection?.isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <WalletConnectModal
          isOpen={showConnectModal}
          onClose={() => setShowConnectModal(false)}
          onConnect={handleWalletConnect}
          isConnecting={isConnecting}
        />
        
        {/* Landing prompt for non-connected users */}
        <div className="flex items-center justify-center min-h-screen p-6">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Wallet className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Welcome to AURA Dashboard</CardTitle>
              <CardDescription className="text-lg">
                Connect your wallet to access your portfolio, staking, trading, and governance features.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setShowConnectModal(true)}
                className="w-full"
                size="lg"
              >
                Connect Wallet
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-gray-900">AURA Dashboard</h1>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {connection.walletType?.charAt(0).toUpperCase() + connection.walletType?.slice(1)}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Wallet Info */}
                <div className="flex items-center space-x-2 bg-gray-100 rounded-full px-4 py-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">
                    {formatAddress(connection.address)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyAddress}
                    className="p-1"
                  >
                    <Copy className={`w-3 h-3 ${isCopied ? 'text-green-600' : 'text-gray-500'}`} />
                  </Button>
                </div>

                {/* Balance Visibility Toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setHideBalances(!hideBalances)}
                >
                  {hideBalances ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>

                {/* Disconnect */}
                <Button variant="outline" size="sm" onClick={handleDisconnect}>
                  Disconnect
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            {/* Tab Navigation */}
            <TabsList className="grid w-full grid-cols-8 lg:w-auto lg:grid-cols-none lg:flex">
              <TabsTrigger value="overview" className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="staking" className="flex items-center space-x-2">
                <Coins className="w-4 h-4" />
                <span className="hidden sm:inline">Staking</span>
              </TabsTrigger>
              <TabsTrigger value="trading" className="flex items-center space-x-2">
                <ArrowUpDown className="w-4 h-4" />
                <span className="hidden sm:inline">Trading</span>
              </TabsTrigger>
              <TabsTrigger value="rewards" className="flex items-center space-x-2">
                <Gift className="w-4 h-4" />
                <span className="hidden sm:inline">Rewards</span>
              </TabsTrigger>
              <TabsTrigger value="governance" className="flex items-center space-x-2">
                <Vote className="w-4 h-4" />
                <span className="hidden sm:inline">Governance</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center space-x-2">
                <Activity className="w-4 h-4" />
                <span className="hidden sm:inline">History</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Settings</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <LoadingOverlay loading={isLoadingBalance} message="Loading portfolio...">
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard
                    title="Total Balance"
                    value={hideBalances ? "•••••" : "$12,345.67"}
                    change="+12.34%"
                    icon={DollarSign}
                    trend="up"
                  />
                  <StatCard
                    title="Staked AURA"
                    value={hideBalances ? "•••••" : "8,750 AURA"}
                    change="+5.67%"
                    icon={Coins}
                    trend="up"
                  />
                  <StatCard
                    title="Pending Rewards"
                    value={hideBalances ? "•••••" : "234.56 AURA"}
                    change="+23.45%"
                    icon={Gift}
                    trend="up"
                  />
                  <StatCard
                    title="Voting Power"
                    value="8,750 VP"
                    change="Active"
                    icon={Vote}
                    trend="stable"
                  />
                </div>

                {/* Portfolio Overview & Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <PortfolioOverview hideBalances={hideBalances} />
                  </div>
                  <div className="space-y-4">
                    <QuickActions />
                    <RecentActivity />
                  </div>
                </div>

                {/* Market Overview */}
                <MarketOverview />
              </LoadingOverlay>
            </TabsContent>

            {/* Staking Tab */}
            <TabsContent value="staking">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Coins className="w-6 h-6" />
                    <span>Staking</span>
                  </CardTitle>
                  <CardDescription>
                    Stake your AURA tokens to earn rewards and participate in governance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Available to Stake</p>
                      <p className="text-2xl font-bold">8,750 AURA</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Currently Staked</p>
                      <p className="text-2xl font-bold">5,000 AURA</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Pending Rewards</p>
                      <p className="text-2xl font-bold">234.56 AURA</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-4">
                    <Button className="flex-1">
                      <Coins className="w-4 h-4 mr-2" />
                      Stake AURA
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Gift className="w-4 h-4 mr-2" />
                      Claim Rewards
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Trading Tab */}
            <TabsContent value="trading">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <ArrowUpDown className="w-6 h-6" />
                    <span>Trading & Swaps</span>
                  </CardTitle>
                  <CardDescription>
                    Trade tokens and access DEX functionality
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-medium">Quick Swap</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-center text-gray-600">Swap interface coming soon</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-medium">Trading Pairs</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span>AURA/SOL</span>
                          <Badge>Active</Badge>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span>AURA/USDC</span>
                          <Badge>Active</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Rewards Tab */}
            <TabsContent value="rewards">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Gift className="w-6 h-6" />
                    <span>Rewards</span>
                  </CardTitle>
                  <CardDescription>
                    Track and claim your staking and participation rewards
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-green-50 rounded-lg p-6">
                      <h3 className="font-medium mb-2">Staking Rewards</h3>
                      <p className="text-2xl font-bold text-green-600 mb-1">234.56 AURA</p>
                      <p className="text-sm text-gray-600">~$332.87 USD</p>
                      <Button className="w-full mt-4">Claim Rewards</Button>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-6">
                      <h3 className="font-medium mb-2">Governance Rewards</h3>
                      <p className="text-2xl font-bold text-purple-600 mb-1">45.23 AURA</p>
                      <p className="text-sm text-gray-600">~$64.12 USD</p>
                      <Button variant="outline" className="w-full mt-4">Claim Rewards</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Governance Tab */}
            <TabsContent value="governance">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Vote className="w-6 h-6" />
                    <span>Governance</span>
                  </CardTitle>
                  <CardDescription>
                    Participate in DAO governance and vote on proposals
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Your Voting Power</p>
                        <p className="text-2xl font-bold">8,750 VP</p>
                      </div>
                      <Badge className="bg-green-500">Active</Badge>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium">Active Proposals</h3>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">Proposal #001: Increase Staking Rewards</h4>
                          <Badge variant="outline">Active</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                          Proposal to increase base staking rewards from 8% to 10% APY
                        </p>
                        <div className="flex space-x-2">
                          <Button size="sm" className="flex-1">Vote Yes</Button>
                          <Button size="sm" variant="outline" className="flex-1">Vote No</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-6 h-6" />
                    <span>Your Analytics</span>
                  </CardTitle>
                  <CardDescription>
                    Personal insights and performance metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                        <span className="text-sm text-gray-600">Portfolio Growth</span>
                      </div>
                      <p className="text-2xl font-bold">+18.23%</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Coins className="w-5 h-5 text-green-600" />
                        <span className="text-sm text-gray-600">Staking ROI</span>
                      </div>
                      <p className="text-2xl font-bold">+14.5%</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Calendar className="w-5 h-5 text-purple-600" />
                        <span className="text-sm text-gray-600">Days Active</span>
                      </div>
                      <p className="text-2xl font-bold">28</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Target className="w-5 h-5 text-orange-600" />
                        <span className="text-sm text-gray-600">Participation</span>
                      </div>
                      <p className="text-2xl font-bold">85%</p>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium mb-2">🎯 Insights</h4>
                    <p className="text-sm text-blue-800">
                      Your portfolio has outperformed the market by 5.2% this month. 
                      Consider diversifying your holdings to reduce risk.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="w-6 h-6" />
                    <span>Transaction History</span>
                  </CardTitle>
                  <CardDescription>
                    View all your transaction history and activity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { type: 'Stake', amount: '500 AURA', date: '2024-01-15 14:30', status: 'Confirmed' },
                      { type: 'Reward', amount: '+12.34 AURA', date: '2024-01-15 12:00', status: 'Confirmed' },
                      { type: 'Swap', amount: '100 SOL → AURA', date: '2024-01-14 09:15', status: 'Confirmed' },
                      { type: 'Vote', amount: 'Proposal #001', date: '2024-01-13 16:45', status: 'Confirmed' },
                    ].map((tx, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            tx.type === 'Stake' ? 'bg-blue-100' :
                            tx.type === 'Reward' ? 'bg-green-100' :
                            tx.type === 'Swap' ? 'bg-purple-100' : 'bg-orange-100'
                          }`}>
                            {tx.type === 'Stake' ? <Coins className="w-4 h-4" /> :
                             tx.type === 'Reward' ? <Gift className="w-4 h-4" /> :
                             tx.type === 'Swap' ? <ArrowUpDown className="w-4 h-4" /> :
                             <Vote className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="font-medium">{tx.type}</p>
                            <p className="text-sm text-gray-600">{tx.amount}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">{tx.date}</p>
                          <Badge className="bg-green-500">{tx.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="w-6 h-6" />
                    <span>Settings</span>
                  </CardTitle>
                  <CardDescription>
                    Manage your account preferences and security settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Theme</p>
                        <p className="text-sm text-gray-600">Choose your preferred theme</p>
                      </div>
                      <Button variant="outline" size="sm">Light</Button>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Notifications</p>
                        <p className="text-sm text-gray-600">Email and push notifications</p>
                      </div>
                      <Button variant="outline" size="sm">Enabled</Button>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Privacy</p>
                        <p className="text-sm text-gray-600">Control data sharing preferences</p>
                      </div>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Security</p>
                        <p className="text-sm text-gray-600">Two-factor authentication and more</p>
                      </div>
                      <Button variant="outline" size="sm">Manage</Button>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Button variant="destructive" className="w-full" onClick={handleDisconnect}>
                      Disconnect Wallet
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ErrorBoundary>
  )
}

// Helper Components
function StatCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  trend 
}: { 
  title: string
  value: string
  change: string
  icon: any
  trend: 'up' | 'down' | 'stable'
}) {
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className={`text-sm ${trendColor}`}>{change}</p>
          </div>
          <div className="p-3 bg-blue-100 rounded-full">
            <Icon className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button className="w-full justify-start" variant="outline">
          <Coins className="w-4 h-4 mr-2" />
          Stake AURA
        </Button>
        <Button className="w-full justify-start" variant="outline">
          <ArrowUpDown className="w-4 h-4 mr-2" />
          Swap Tokens
        </Button>
        <Button className="w-full justify-start" variant="outline">
          <Gift className="w-4 h-4 mr-2" />
          Claim Rewards
        </Button>
        <Button className="w-full justify-start" variant="outline">
          <Vote className="w-4 h-4 mr-2" />
          View Proposals
        </Button>
      </CardContent>
    </Card>
  )
}

function RecentActivity() {
  const activities = [
    { type: 'stake', amount: '500 AURA', time: '2 hours ago', status: 'confirmed' },
    { type: 'reward', amount: '+12.34 AURA', time: '1 day ago', status: 'confirmed' },
    { type: 'swap', amount: '100 SOL → AURA', time: '3 days ago', status: 'confirmed' },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                activity.type === 'stake' ? 'bg-blue-500' :
                activity.type === 'reward' ? 'bg-green-500' : 'bg-purple-500'
              }`} />
              <span className="font-medium">{activity.amount}</span>
            </div>
            <span className="text-gray-500">{activity.time}</span>
          </div>
        ))}
        <Button variant="ghost" size="sm" className="w-full">
          View All History
        </Button>
      </CardContent>
    </Card>
  )
}

function MarketOverview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5" />
          <span>Market Overview</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <p className="text-sm text-gray-600">AURA Price</p>
            <p className="text-xl font-bold">$1.42</p>
            <p className="text-sm text-green-600">+8.34% (24h)</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Market Cap</p>
            <p className="text-xl font-bold">$14.2M</p>
            <p className="text-sm text-green-600">+12.1% (24h)</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Total Staked</p>
            <p className="text-xl font-bold">5.2M AURA</p>
            <p className="text-sm text-blue-600">52% of supply</p>
          </div>
        </div>
        
        <Separator className="my-4" />
        
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Staking Participation</span>
            <span>52%</span>
          </div>
          <Progress value={52} className="h-2" />
        </div>
      </CardContent>
    </Card>
  )
} 