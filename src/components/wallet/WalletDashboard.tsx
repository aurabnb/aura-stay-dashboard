'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  ExternalLink, 
  RefreshCw, 
  Eye,
  EyeOff,
  Copy,
  Send,
  Coins,
  Activity,
  BarChart3
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { 
  getWalletOverview, 
  getWalletBalances, 
  getWalletTransactions,
  getTokenMetrics
} from '@/lib/api/walletService'
import { 
  WalletBalance,
  WalletTransaction,
  WalletOverview,
  TokenMetrics 
} from '@/types/wallet'

interface WalletDashboardProps {
  walletAddress: string
  onDisconnect: () => void
}

const WalletDashboard: React.FC<WalletDashboardProps> = ({ walletAddress, onDisconnect }) => {
  const [overview, setOverview] = useState<WalletOverview | null>(null)
  const [balances, setBalances] = useState<WalletBalance[]>([])
  const [transactions, setTransactions] = useState<WalletTransaction[]>([])
  const [tokenMetrics, setTokenMetrics] = useState<TokenMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [balancesVisible, setBalancesVisible] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // Fetch all wallet data
  const fetchWalletData = async () => {
    try {
      setRefreshing(true)
      const [overviewData, balanceData, transactionData, metricsData] = await Promise.all([
        getWalletOverview(walletAddress),
        getWalletBalances(walletAddress),
        getWalletTransactions(walletAddress, 20),
        getTokenMetrics()
      ])

      setOverview(overviewData)
      setBalances(balanceData)
      setTransactions(transactionData)
      setTokenMetrics(metricsData)
    } catch (error) {
      console.error('Failed to fetch wallet data:', error)
      toast({
        title: "Data Loading Failed",
        description: "Could not load wallet information",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (walletAddress) {
      fetchWalletData()
      
      // Auto-refresh every 30 seconds
      const interval = setInterval(fetchWalletData, 30000)
      return () => clearInterval(interval)
    }
  }, [walletAddress])

  const copyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress)
      toast({ title: "Address Copied! 📋" })
    }
  }

  const openInExplorer = () => {
    if (walletAddress) {
      window.open(`https://solscan.io/account/${walletAddress}`, '_blank')
    }
  }

  const formatCurrency = (amount: number, decimals = 2) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(amount)
  }

  const formatNumber = (num: number, decimals = 2) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num)
  }

  const truncateAddress = (address: string, chars = 6) => {
    return `${address.slice(0, chars)}...${address.slice(-chars)}`
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardContent>
        </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Wallet Header */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Wallet className="h-8 w-8 text-blue-600" />
              <div>
                <CardTitle className="text-blue-900">Connected Wallet</CardTitle>
                <CardDescription className="text-blue-700">
                  {truncateAddress(walletAddress)}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={copyAddress}
                className="text-blue-700 border-blue-300"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={openInExplorer}
                className="text-blue-700 border-blue-300"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Explorer
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={fetchWalletData}
                disabled={refreshing}
                className="text-blue-700 border-blue-300"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Portfolio Overview */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold">
                  {balancesVisible ? formatCurrency(overview?.totalValueUSD || 0) : '••••••'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Coins className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">SOL Balance</p>
                <p className="text-2xl font-bold">
                  {balancesVisible ? formatNumber(overview?.solBalance || 0, 4) : '••••••'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <div className="h-6 w-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  A
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">AURA Balance</p>
                <p className="text-2xl font-bold">
                  {balancesVisible ? formatNumber(overview?.auraBalance || 0, 0) : '••••••'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <Activity className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Token Count</p>
                <p className="text-2xl font-bold">{overview?.tokenCount || 0}</p>
                <Badge 
                  variant="outline"
                  className={overview?.isActive ? 'border-green-300 text-green-700' : 'border-gray-300'}
                >
                  {overview?.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AURA Market Data */}
      {tokenMetrics && (
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <BarChart3 className="h-6 w-6" />
              AURA Market Data
            </CardTitle>
            </CardHeader>
            <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                <p className="text-sm text-purple-700">Price</p>
                <p className="text-lg font-bold text-purple-900">
                  {formatCurrency(tokenMetrics.price, 8)}
                </p>
                <div className="flex items-center gap-1">
                  {tokenMetrics.priceChange24h >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600" />
                  )}
                  <span 
                    className={`text-xs ${
                      tokenMetrics.priceChange24h >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {tokenMetrics.priceChange24h.toFixed(2)}%
                  </span>
                      </div>
                    </div>
              <div>
                <p className="text-sm text-purple-700">Market Cap</p>
                <p className="text-lg font-bold text-purple-900">
                  {formatCurrency(tokenMetrics.marketCap, 0)}
                </p>
                      </div>
              <div>
                <p className="text-sm text-purple-700">24h Volume</p>
                <p className="text-lg font-bold text-purple-900">
                  {formatCurrency(tokenMetrics.volume24h, 0)}
                </p>
                      </div>
              <div>
                <p className="text-sm text-purple-700">Holders</p>
                <p className="text-lg font-bold text-purple-900">
                  {tokenMetrics.holders.toLocaleString()}
                </p>
                  </div>
              </div>
            </CardContent>
          </Card>
      )}

      <Tabs defaultValue="balances" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="balances">Token Balances</TabsTrigger>
            <TabsTrigger value="transactions">Transaction History</TabsTrigger>
          </TabsList>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setBalancesVisible(!balancesVisible)}
            className="text-gray-600"
          >
            {balancesVisible ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {balancesVisible ? 'Hide' : 'Show'} Balances
          </Button>
        </div>

        <TabsContent value="balances">
          <Card>
            <CardHeader>
              <CardTitle>Token Holdings</CardTitle>
              <CardDescription>
                Your current token balances and values
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Token</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Value (USD)</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {balances.map((balance, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {balance.logo && (
                              <img 
                                src={balance.logo} 
                                alt={balance.symbol}
                                className="w-8 h-8 rounded-full"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            )}
                      <div>
                              <p className="font-semibold">{balance.symbol}</p>
                              <p className="text-sm text-gray-600">{balance.name}</p>
                        </div>
                      </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-semibold">
                              {balancesVisible ? formatNumber(balance.uiAmount, 4) : '••••••'}
                            </p>
                            <p className="text-sm text-gray-600">{balance.symbol}</p>
                    </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-semibold">
                            {balancesVisible ? formatCurrency(balance.valueUSD) : '••••••'}
                          </p>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {balance.symbol !== 'AURA' && (
                              <Button variant="outline" size="sm">
                                <Send className="h-3 w-3 mr-1" />
                                Send
                              </Button>
                            )}
                            {balance.symbol === 'AURA' && (
                              <>
                                <Button 
                                  variant="default" 
                                  size="sm"
                                  onClick={() => router.push('/staking')}
                                  className="bg-purple-600 hover:bg-purple-700 text-white"
                                >
                                  <Coins className="h-3 w-3 mr-1" />
                                  Stake AURA
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Send className="h-3 w-3 mr-1" />
                                  Send
                                </Button>
                              </>
                            )}
                            {balance.symbol === 'SOL' && (
                              <Button variant="outline" size="sm">
                                <Send className="h-3 w-3 mr-1" />
                                Send
                              </Button>
                            )}
                            {balance.symbol === 'USDC' && (
                              <Button variant="outline" size="sm">
                                <Send className="h-3 w-3 mr-1" />
                                Send
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                Your latest wallet activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {truncateAddress(tx.signature, 4)}
                            </code>
                            <a
                              href={`https://solscan.io/tx/${tx.signature}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                  </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                    variant="outline" 
                            className={
                              tx.type === 'receive' ? 'border-green-300 text-green-700' :
                              tx.type === 'send' ? 'border-red-300 text-red-700' :
                              tx.type === 'stake' ? 'border-purple-300 text-purple-700' :
                              'border-blue-300 text-blue-700'
                            }
                          >
                            {tx.type.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                  <div>
                            <p className="font-semibold">
                              {formatNumber(tx.amount, 4)} {tx.token}
                            </p>
                            <p className="text-xs text-gray-600">
                              Fee: {formatNumber(tx.fee, 6)} SOL
                            </p>
                  </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {new Date(tx.blockTime * 1000).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline"
                            className={tx.status === 'success' ? 'border-green-300 text-green-700' : 'border-red-300 text-red-700'}
                          >
                            {tx.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Disconnect Button */}
      <div className="text-center pt-6">
        <Button 
          variant="outline" 
          onClick={onDisconnect}
          className="text-gray-600 border-gray-300"
        >
          <Wallet className="h-4 w-4 mr-2" />
          Disconnect Wallet
        </Button>
      </div>
    </div>
  )
} 

export default WalletDashboard 
export { WalletDashboard } 