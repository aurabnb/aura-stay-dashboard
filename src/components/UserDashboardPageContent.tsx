'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
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
import { useWallet } from '@solana/wallet-adapter-react'
import { useClipboard } from '@/hooks/enhanced-hooks'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { LoadingOverlay, SkeletonStats } from '@/components/ui/loading'

// Dynamic imports for components that may cause SSR issues
const WalletConnectModal = dynamic(
  () => import('@/components/wallet/WalletConnectModal').then(mod => ({ default: mod.WalletConnectModal })),
  { 
    ssr: false,
    loading: () => <div className="animate-pulse">Loading wallet modal...</div>
  }
)

// Alternative: Use standard Solana wallet button  
const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then(mod => ({ default: mod.WalletMultiButton })),
  { ssr: false }
)

const PortfolioOverview = dynamic(
  () => import('@/components/wallet/PortfolioOverview').then(mod => ({ default: mod.PortfolioOverview })),
  { 
    ssr: false,
    loading: () => <div className="animate-pulse h-64 bg-gray-100 rounded-lg"></div>
  }
)

// Create a safe analytics object for SSR
let analytics: any
if (typeof window !== 'undefined') {
  import('@/lib/analytics').then((mod) => {
    analytics = mod.analytics
  })
} else {
  analytics = { 
    page: () => {}, 
    trackFeatureUsage: () => {}, 
    trackWalletConnection: () => {}, 
    trackError: () => {}, 
    track: () => {} 
  }
}

// Dynamically import wallet components to prevent SSR issues
const WalletDashboard = dynamic(
  () => import('@/components/wallet/WalletDashboard').then(mod => ({ default: mod.WalletDashboard })),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-lg p-6">
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />
                <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
)

export default function UserDashboardPageContent() {
  const { connected, publicKey, disconnect } = useWallet()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-lg p-6">
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />
                <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!connected || !publicKey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
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
            <WalletMultiButton className="w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <WalletDashboard 
      walletAddress={publicKey.toString()} 
      onDisconnect={disconnect}
    />
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