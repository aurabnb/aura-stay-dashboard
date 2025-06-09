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
import { useRouter } from 'next/navigation'

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

// Add hook for fetching live AURA data from DexScreener
function useAuraMarketData() {
  const [marketData, setMarketData] = useState({
    price: 0.0002700, // Fallback price
    change24h: 0,
    marketCap: 0,
    totalStaked: 0,
    stakingParticipation: 0,
    logoUrl: '/aura-logo.png', // Fallback logo
    loading: true
  })

  useEffect(() => {
    let isMounted = true

    const fetchMarketData = async () => {
      try {
        // Use the correct AURA token contract address
        const AURA_TOKEN_ADDRESS = '3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe'
        const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${AURA_TOKEN_ADDRESS}`)
        
        if (response.ok && isMounted) {
          const data = await response.json()
          console.log('DexScreener AURA data:', data) // Debug log
          
          if (data.pairs && data.pairs.length > 0) {
            const pair = data.pairs[0]
            const price = parseFloat(pair.priceUsd) || 0.0002700
            const change24h = parseFloat(pair.priceChange?.h24) || 0
            const volume24h = parseFloat(pair.volume?.h24) || 0
            const marketCap = parseFloat(pair.marketCap) || price * 1000000000 // Fallback calculation
            
            // Extract AURA logo from DexScreener
            let logoUrl = '/aura-logo.png' // Fallback
            if (pair.baseToken && pair.baseToken.address === AURA_TOKEN_ADDRESS) {
              logoUrl = pair.baseToken.logoURI || logoUrl
            } else if (pair.quoteToken && pair.quoteToken.address === AURA_TOKEN_ADDRESS) {
              logoUrl = pair.quoteToken.logoURI || logoUrl
            }
            
            // Calculate estimated staking data based on market cap
            const estimatedSupply = 1000000000 // 1B tokens estimated
            const totalStaked = estimatedSupply * 0.52 // Assume 52% staked
            
            setMarketData({
              price,
              change24h,
              marketCap,
              totalStaked,
              stakingParticipation: 52,
              logoUrl,
              loading: false
            })
          } else {
            console.warn('No trading pairs found for AURA token')
            // Use fallback data if no pairs found
            setMarketData(prev => ({ 
              ...prev, 
              marketCap: prev.price * 1000000000, // Calculate from price
              loading: false 
            }))
          }
        } else {
          console.error('DexScreener API request failed:', response.status)
          setMarketData(prev => ({ ...prev, loading: false }))
        }
      } catch (error) {
        console.error('Failed to fetch AURA market data from DexScreener:', error)
        // Use fallback data on error
        setMarketData(prev => ({ 
          ...prev, 
          marketCap: prev.price * 1000000000, // Calculate from price
          loading: false 
        }))
      }
    }

    fetchMarketData()
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchMarketData, 30000)
    
    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [])

  return marketData
}

export default function UserDashboardPageContent() {
  const { connected, publicKey, disconnect } = useWallet()
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

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
  const router = useRouter()
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button 
          className="w-full justify-start" 
          variant="outline"
          onClick={() => router.push('/staking')}
        >
          <Coins className="w-4 h-4 mr-2" />
          Stake AURA
        </Button>
        <Button 
          className="w-full justify-start" 
          variant="outline"
          onClick={() => router.push('/trading')}
        >
          <ArrowUpDown className="w-4 h-4 mr-2" />
          Swap Tokens
        </Button>
        <Button 
          className="w-full justify-start" 
          variant="outline"
          onClick={() => router.push('/staking')}
        >
          <Gift className="w-4 h-4 mr-2" />
          Claim Rewards
        </Button>
        <Button 
          className="w-full justify-start" 
          variant="outline"
          onClick={() => router.push('/dashboard/community')}
        >
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
  const marketData = useAuraMarketData()

  const formatPrice = (price: number) => {
    return price < 0.01 ? `$${price.toFixed(8)}` : `$${price.toFixed(4)}`
  }

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1000000) {
      return `$${(marketCap / 1000000).toFixed(1)}M`
    } else if (marketCap >= 1000) {
      return `$${(marketCap / 1000).toFixed(1)}K`
    }
    return `$${marketCap.toFixed(0)}`
  }

  const formatStaked = (staked: number) => {
    if (staked >= 1000000) {
      return `${(staked / 1000000).toFixed(1)}M AURA`
    } else if (staked >= 1000) {
      return `${(staked / 1000).toFixed(1)}K AURA`
    }
    return `${staked.toFixed(0)} AURA`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {marketData.logoUrl && (
            <img 
              src={marketData.logoUrl} 
              alt="AURA"
              className="w-6 h-6 rounded-full"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
          <TrendingUp className="w-5 h-5" />
          <span>AURA Market Overview</span>
          {marketData.loading && (
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse ml-2" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <p className="text-sm text-gray-600">AURA Price</p>
            <p className="text-xl font-bold">{formatPrice(marketData.price)}</p>
            <p className={`text-sm ${marketData.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {marketData.change24h >= 0 ? '+' : ''}{marketData.change24h.toFixed(2)}% (24h)
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Market Cap</p>
            <p className="text-xl font-bold">{formatMarketCap(marketData.marketCap)}</p>
            <p className="text-sm text-blue-600">Real-time data</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Total Staked</p>
            <p className="text-xl font-bold">{formatStaked(marketData.totalStaked)}</p>
            <p className="text-sm text-blue-600">{marketData.stakingParticipation}% of supply</p>
          </div>
        </div>
        
        <Separator className="my-4" />
        
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Staking Participation</span>
            <span>{marketData.stakingParticipation}%</span>
          </div>
          <Progress value={marketData.stakingParticipation} className="h-2" />
        </div>
      </CardContent>
    </Card>
  )
} 