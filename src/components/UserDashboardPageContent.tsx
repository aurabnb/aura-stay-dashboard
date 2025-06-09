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
  TrendingDown,
  Copy,
  ExternalLink,
  Eye,
  EyeOff
} from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from '@/components/ui/use-toast'
import { useWallet } from '@solana/wallet-adapter-react'
import { useClipboard } from '@/hooks/enhanced-hooks'
import { useStaking } from '@/hooks/useStaking'

// Dynamically import wallet components to prevent SSR issues
const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then((mod) => ({ default: mod.WalletMultiButton })),
  { ssr: false }
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
        const AURA_TOKEN_ADDRESS = '3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe'
        const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${AURA_TOKEN_ADDRESS}`)
        
        if (response.ok && isMounted) {
          const data = await response.json()
          
          if (data.pairs && data.pairs.length > 0) {
            const pair = data.pairs[0]
            const price = parseFloat(pair.priceUsd) || 0.0002700
            const change24h = parseFloat(pair.priceChange?.h24) || 0
            const marketCap = parseFloat(pair.marketCap) || price * 1000000000
            
            let logoUrl = '/aura-logo.png'
            if (pair.baseToken && pair.baseToken.address === AURA_TOKEN_ADDRESS) {
              logoUrl = pair.baseToken.logoURI || logoUrl
            } else if (pair.quoteToken && pair.quoteToken.address === AURA_TOKEN_ADDRESS) {
              logoUrl = pair.quoteToken.logoURI || logoUrl
            }
            
            const estimatedSupply = 1000000000
            const totalStaked = estimatedSupply * 0.52
            
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
            setMarketData(prev => ({ 
              ...prev, 
              marketCap: prev.price * 1000000000,
              loading: false 
            }))
          }
        } else {
          setMarketData(prev => ({ ...prev, loading: false }))
        }
      } catch (error) {
        setMarketData(prev => ({ 
          ...prev, 
          marketCap: prev.price * 1000000000,
          loading: false 
        }))
      }
    }

    fetchMarketData()
    const interval = setInterval(fetchMarketData, 30000)
    
    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [])

  return marketData
}

export default function UserDashboardPageContent() {
  const { publicKey, connected } = useWallet()
  const { copyToClipboard, copied } = useClipboard()
  const marketData = useAuraMarketData()
  
  const {
    stakingStats,
    userStake,
    loading,
    error,
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
  const [balanceVisible, setBalanceVisible] = useState(true)

  useEffect(() => {
    setMounted(true)
    
    // Handle URL hash for tab navigation
    const hash = window.location.hash.replace('#', '')
    if (hash && ['overview', 'staking', 'wallet', 'treasury', 'portfolio'].includes(hash)) {
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

  const formatPrice = (price: number) => {
    return price >= 0.01 ? price.toFixed(4) : price.toExponential(2)
  }

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`
    if (marketCap >= 1e3) return `$${(marketCap / 1e3).toFixed(2)}K`
    return `$${marketCap.toFixed(2)}`
  }

  const formatStaked = (staked: number) => {
    if (staked >= 1e9) return `${(staked / 1e9).toFixed(2)}B`
    if (staked >= 1e6) return `${(staked / 1e6).toFixed(2)}M`
    if (staked >= 1e3) return `${(staked / 1e3).toFixed(2)}K`
    return staked.toFixed(0)
  }

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
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            User Dashboard
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your comprehensive AuraBNB control center. Manage your portfolio, stake tokens, and access all platform features.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User Dashboard</CardTitle>
            <CardDescription>Complete user dashboard functionality is being integrated. Please visit the new location soon.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">All user features including staking, portfolio management, and treasury overview are being consolidated here.</p>
                             <Link href="/user-dashboard#staking">
                <Button className="mr-4">
                  Access Staking Features
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline">
                  View Main Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  )
} 