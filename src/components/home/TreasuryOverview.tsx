'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, DollarSign, Coins, Activity, PieChart, BarChart3, Eye } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'

interface TreasuryData {
  totalValue: number
  solBalance: number
  auraBalance: number
  lpTokens: number
  propertyInvestments: number
  monthlyInflow: number
  burnRate: number
  stakingRewards: number
  lastUpdate: string
  fundingGoal: number
  fundingProgress: number
}

// Mock data - replace with actual API call
const treasuryData: TreasuryData = {
  totalValue: 2847392.45,
  solBalance: 1423675.80,
  auraBalance: 987654.32,
  lpTokens: 234567.89,
  propertyInvestments: 201494.44,
  monthlyInflow: 187342.15,
  burnRate: 15234.67,
  stakingRewards: 45678.90,
  lastUpdate: new Date().toISOString(),
  fundingGoal: 3500000,
  fundingProgress: 81.35
}

const allocations = [
  { name: 'SOL Holdings', value: 1423675.80, percentage: 50.0, color: 'bg-blue-500' },
  { name: 'AURA Tokens', value: 987654.32, percentage: 34.7, color: 'bg-purple-500' },
  { name: 'LP Positions', value: 234567.89, percentage: 8.2, color: 'bg-green-500' },
  { name: 'Property Investments', value: 201494.44, percentage: 7.1, color: 'bg-orange-500' }
]

const recentTransactions = [
  { 
    type: 'inflow', 
    amount: 12534.50, 
    description: 'Automatic burn redistribution',
    timestamp: '2 hours ago',
    hash: '5h7k...8m9n'
  },
  { 
    type: 'outflow', 
    amount: 45000.00, 
    description: 'Costa Rica property development',
    timestamp: '1 day ago',
    hash: '3f4g...7j8k'
  },
  { 
    type: 'inflow', 
    amount: 8765.23, 
    description: 'Staking rewards distribution',
    timestamp: '2 days ago',
    hash: '1a2b...4e5f'
  }
]

export function TreasuryOverview() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="space-y-8">
      {/* Main Treasury Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Treasury Value</p>
                  <p className="text-3xl font-bold mt-2">
                    ${treasuryData.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                  <div className="flex items-center mt-2 text-blue-100">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span className="text-sm">+12.4% this month</span>
                  </div>
                </div>
                <div className="w-16 h-16 bg-blue-500/30 rounded-full flex items-center justify-center">
                  <DollarSign className="w-8 h-8 text-blue-100" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-purple-600 to-purple-700 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Monthly Inflow</p>
                  <p className="text-3xl font-bold mt-2">
                    ${treasuryData.monthlyInflow.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                  <div className="flex items-center mt-2 text-purple-100">
                    <Activity className="w-4 h-4 mr-1" />
                    <span className="text-sm">Auto-burn mechanism</span>
                  </div>
                </div>
                <div className="w-16 h-16 bg-purple-500/30 rounded-full flex items-center justify-center">
                  <Coins className="w-8 h-8 text-purple-100" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-green-600 to-green-700 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Funding Progress</p>
                  <p className="text-3xl font-bold mt-2">{treasuryData.fundingProgress}%</p>
                  <div className="flex items-center mt-2 text-green-100">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span className="text-sm">Goal: $3.5M</span>
                  </div>
                </div>
                <div className="w-16 h-16 bg-green-500/30 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-8 h-8 text-green-100" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Funding Progress Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Next Property Funding</h3>
                  <p className="text-sm text-gray-600">Bali Eco-Resort Development</p>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  81% Funded
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium">${treasuryData.totalValue.toLocaleString()} / ${treasuryData.fundingGoal.toLocaleString()}</span>
                </div>
                <Progress value={treasuryData.fundingProgress} className="h-3" />
              </div>
              
              <div className="flex justify-between items-center pt-2">
                <p className="text-sm text-gray-600">
                  ${(treasuryData.fundingGoal - treasuryData.totalValue).toLocaleString()} remaining
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/properties">
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Detailed Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Treasury Allocation</TabsTrigger>
            <TabsTrigger value="transactions">Recent Activity</TabsTrigger>
            <TabsTrigger value="analytics">Performance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChart className="w-5 h-5" />
                  <span>Asset Allocation</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {allocations.map((allocation, index) => (
                    <div key={allocation.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full ${allocation.color}`}></div>
                        <span className="font-medium">{allocation.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          ${allocation.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-sm text-gray-500">{allocation.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="transactions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTransactions.map((tx, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${tx.type === 'inflow' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <div>
                          <p className="font-medium">{tx.description}</p>
                          <p className="text-sm text-gray-500">{tx.timestamp} • {tx.hash}</p>
                        </div>
                      </div>
                      <div className={`font-semibold ${tx.type === 'inflow' ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.type === 'inflow' ? '+' : '-'}${tx.amount.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="pt-4">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/analytics">
                      View All Transactions
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monthly Growth</span>
                    <span className="font-semibold text-green-600">+12.4%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Burn Rate</span>
                    <span className="font-semibold">${treasuryData.burnRate.toLocaleString()}/day</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Staking Rewards</span>
                    <span className="font-semibold text-purple-600">${treasuryData.stakingRewards.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ROI (6 months)</span>
                    <span className="font-semibold text-blue-600">+247%</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full" asChild>
                    <Link href="/user-dashboard#staking">Start Staking</Link>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/governance">Vote on Proposals</Link>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/analytics">View Analytics</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
} 