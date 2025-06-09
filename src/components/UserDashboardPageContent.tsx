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
import { Separator } from '@/components/ui/separator'
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
  EyeOff,
  CheckCircle
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
    price: 0.00025070,
    change24h: -21.66,
    marketCap: 197408,
    volume24h: 19193,
    holders: 5000,
    logoUrl: '/aura-logo.png',
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
            const price = parseFloat(pair.priceUsd) || 0.00025070
            const change24h = parseFloat(pair.priceChange?.h24) || -21.66
            const marketCap = parseFloat(pair.fdv) || parseFloat(pair.marketCap) || 197408
            const volume24h = parseFloat(pair.volume?.h24) || 19193
            
            setMarketData({
              price,
              change24h,
              marketCap,
              volume24h,
              holders: 5000, // This would need to come from another API
              logoUrl: pair.baseToken?.logoURI || '/aura-logo.png',
              loading: false
            })
          } else {
            setMarketData(prev => ({ ...prev, loading: false }))
          }
        } else {
          setMarketData(prev => ({ ...prev, loading: false }))
        }
      } catch (error) {
        setMarketData(prev => ({ ...prev, loading: false }))
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

// Hook for wallet balances
function useWalletBalances() {
  const { publicKey, connected } = useWallet()
  const [balances, setBalances] = useState({
    sol: 0,
    aura: 0,
    usdc: 0,
    totalValue: 0,
    loading: true
  })

  useEffect(() => {
    if (!connected || !publicKey) {
      setBalances({ sol: 0, aura: 0, usdc: 0, totalValue: 0, loading: false })
      return
    }

    // In a real implementation, you would fetch actual balances here
    // For now, showing demo data as in the screenshot
    setBalances({
      sol: 0.0000,
      aura: 0.0000,
      usdc: 0.0000,
      totalValue: 0.00,
      loading: false
    })
  }, [connected, publicKey])

  return balances
}

export default function UserDashboardPageContent() {
  const { publicKey, connected, disconnect } = useWallet()
  const { copy, isCopied } = useClipboard()
  const marketData = useAuraMarketData()
  const balances = useWalletBalances()
  
  const {
    stakingStats,
    userStake,
    loading,
    error,
    stake,
    unstake,
    claimRewards,
    refreshData,
    formatAmount,
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
    if (hash && ['overview', 'portfolio', 'staking', 'wallet', 'treasury'].includes(hash)) {
      setActiveTab(hash)
    }
  }, [])

  // Update URL hash when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    window.location.hash = value
  }

  // Handle wallet address copy
  const handleCopyAddress = () => {
    if (publicKey) {
      copy(publicKey.toString())
      toast({
        title: "Address Copied!",
        description: "Wallet address copied to clipboard",
      })
    }
  }

  // Handle explorer link
  const handleExplorerLink = () => {
    if (publicKey) {
      window.open(`https://explorer.solana.com/address/${publicKey.toString()}`, '_blank')
    }
  }

  // Handle refresh data
  const handleRefresh = () => {
    refreshData()
    toast({
      title: "Data Refreshed",
      description: "Wallet and staking data updated",
    })
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

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  const formatPrice = (price: number) => {
    return price.toFixed(8)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`
    return num.toString()
  }

  const tokenList = [
    {
      symbol: 'SOL',
      name: 'Solana',
      balance: balances.sol,
      value: balances.sol * 150, // Approximate SOL price
      icon: '◉',
      color: 'text-blue-500'
    },
    {
      symbol: 'AURA',
      name: 'AURA Token',
      balance: balances.aura,
      value: balances.aura * marketData.price,
      icon: '⬟',
      color: 'text-purple-500',
      hasStakeAction: true
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      balance: balances.usdc,
      value: balances.usdc * 1,
      icon: '●',
      color: 'text-blue-600'
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
        {/* Connected Wallet Section */}
        {mounted && connected && publicKey && (
          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <Wallet className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Connected Wallet</CardTitle>
                    <CardDescription>{formatAddress(publicKey.toString())}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleCopyAddress}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    {isCopied ? 'Copied!' : 'Copy'}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleExplorerLink}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Explorer
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleRefresh}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <TrendingUp className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-sm text-gray-600">Total Value</span>
                  </div>
                  <div className="text-xl font-bold">{formatCurrency(balances.totalValue)}</div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-bold">◉</span>
                    </div>
                    <span className="text-sm text-gray-600">SOL Balance</span>
                  </div>
                  <div className="text-xl font-bold">{balances.sol.toFixed(4)}</div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-bold">⬟</span>
                    </div>
                    <span className="text-sm text-gray-600">AURA Balance</span>
                  </div>
                  <div className="text-xl font-bold">{balances.aura}</div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center">
                      <Target className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-sm text-gray-600">Token Count</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-xl font-bold">0</div>
                    <Badge variant="secondary" className="text-xs">Inactive</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* AURA Market Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>AURA Market Data</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <div className="text-sm text-gray-600 mb-1">Price</div>
                <div className="text-2xl font-bold">${formatPrice(marketData.price)}</div>
                <div className={`text-sm flex items-center space-x-1 ${marketData.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <span>{marketData.change24h >= 0 ? '↗' : '↘'}</span>
                  <span>{Math.abs(marketData.change24h).toFixed(2)}%</span>
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-600 mb-1">Market Cap</div>
                <div className="text-2xl font-bold">${formatNumber(marketData.marketCap)}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-600 mb-1">24h Volume</div>
                <div className="text-2xl font-bold">${formatNumber(marketData.volume24h)}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-600 mb-1">Holders</div>
                <div className="text-2xl font-bold">{formatNumber(marketData.holders)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="staking">Staking</TabsTrigger>
            <TabsTrigger value="wallet">Wallet</TabsTrigger>
            <TabsTrigger value="treasury">Treasury</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Token Holdings Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Token Holdings</CardTitle>
                    <CardDescription>Your current token balances and values</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBalanceVisible(!balanceVisible)}
                  >
                    {balanceVisible ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                    {balanceVisible ? 'Hide Balances' : 'Show Balances'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-4 text-sm font-medium text-gray-600 pb-2 border-b">
                    <div>Token</div>
                    <div>Balance</div>
                    <div>Value (USD)</div>
                    <div>Actions</div>
                  </div>
                  
                  {tokenList.map((token) => (
                    <div key={token.symbol} className="grid grid-cols-4 gap-4 items-center py-3 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${token.color === 'text-blue-500' ? 'bg-blue-100' : token.color === 'text-purple-500' ? 'bg-purple-100' : 'bg-blue-100'}`}>
                          <span className={token.color}>{token.icon}</span>
                        </div>
                        <div>
                          <div className="font-medium">{token.symbol}</div>
                          <div className="text-sm text-gray-500">{token.name}</div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="font-medium">
                          {balanceVisible ? token.balance.toFixed(4) : '••••'}
                        </div>
                        <div className="text-sm text-gray-500">{token.symbol}</div>
                      </div>
                      
                      <div>
                        <div className="font-medium">
                          {balanceVisible ? formatCurrency(token.value) : '••••'}
                        </div>
                      </div>
                      
                      <div>
                        {token.hasStakeAction && (
                          <Button 
                            size="sm" 
                            className="bg-purple-600 hover:bg-purple-700"
                            onClick={() => setActiveTab('staking')}
                          >
                            <Zap className="h-3 w-3 mr-1" />
                            Stake AURA
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Connect Wallet CTA */}
            {mounted && !connected && (
              <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
                <CardContent className="text-center py-8">
                  <Wallet className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
                  <p className="text-gray-600 mb-6">Connect your Solana wallet to access all dashboard features</p>
                  <WalletMultiButton className="!bg-blue-600 hover:!bg-blue-700" />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Overview</CardTitle>
                <CardDescription>Manage your digital asset portfolio</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <PieChart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">Portfolio management features coming soon</p>
                  <p className="text-sm text-gray-500">Track your investments, view performance charts, and manage your asset allocation</p>
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
                    {mounted && userStake?.amount ? formatAmount(userStake.amount) : '0'} AURA
                  </div>
                                     <p className="text-xs text-muted-foreground">
                     ≈ {formatCurrency((Number(userStake?.amount) || 0) * marketData.price)}
                   </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Rewards Available</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {mounted && userStake ? '125.5' : '0'} AURA
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
          </TabsContent>

          <TabsContent value="wallet" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Wallet Management</CardTitle>
                <CardDescription>Manage your wallet connection and view transaction history</CardDescription>
              </CardHeader>
              <CardContent>
                {mounted && connected ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <div>
                          <div className="font-medium">Wallet Connected</div>
                          <div className="text-sm text-gray-500">{formatAddress(publicKey!.toString())}</div>
                        </div>
                      </div>
                      <Button variant="outline" onClick={disconnect}>
                        Disconnect Wallet
                      </Button>
                    </div>
                    
                    <Separator />
                    
                    <div className="text-center py-8">
                      <Activity className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Transaction history and wallet tools coming soon</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Wallet className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">Connect your wallet to access wallet management features</p>
                    <WalletMultiButton className="!bg-blue-600 hover:!bg-blue-700" />
                  </div>
                )}
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
                      : stakingStats.totalValueLocked?.toFixed(2) || '0'}M
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
                <CardDescription>Access advanced treasury management features</CardDescription>
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