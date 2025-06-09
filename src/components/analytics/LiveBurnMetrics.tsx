'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Flame, TrendingUp, Users, Timer, Zap } from 'lucide-react'
import Link from 'next/link'

interface BurnMetrics {
  totalBurned: number
  currentBurnRate: number
  totalRewardsDistributed: number
  nextDistribution: string
  totalStakers: number
  averageStake: number
}

interface Transaction {
  id: number
  type: 'buy' | 'sell'
  amount: number
  timestamp: string
}

const LiveBurnMetrics: React.FC = () => {
  const [mounted, setMounted] = useState(false)
  const [metrics, setMetrics] = useState<BurnMetrics>({
    totalBurned: 2847635.25,
    currentBurnRate: 45.7,
    totalRewardsDistributed: 12450.5,
    nextDistribution: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    totalStakers: 2847,
    averageStake: 4250.75
  })

  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([
    { id: 1, type: 'buy', amount: 25, timestamp: new Date(Date.now() - 60000).toISOString() },
    { id: 2, type: 'sell', amount: 15, timestamp: new Date(Date.now() - 120000).toISOString() },
    { id: 3, type: 'buy', amount: 35, timestamp: new Date(Date.now() - 180000).toISOString() },
    { id: 4, type: 'sell', amount: 20, timestamp: new Date(Date.now() - 240000).toISOString() },
    { id: 5, type: 'buy', amount: 40, timestamp: new Date(Date.now() - 300000).toISOString() }
  ])

  useEffect(() => {
    setMounted(true)
    
    // Add randomization only on client side
    setMetrics(prev => ({
      ...prev,
      totalRewardsDistributed: 12450.5 + Math.random() * 100,
      totalStakers: 2847 + Math.floor(Math.random() * 20),
      averageStake: 4250.75 + Math.random() * 500
    }))

    // Generate more realistic recent transactions
    const newTransactions = Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      type: Math.random() > 0.5 ? 'buy' : 'sell' as 'buy' | 'sell',
      amount: Math.random() * 50 + 5,
      timestamp: new Date(Date.now() - i * 60000).toISOString()
    }))
    setRecentTransactions(newTransactions)
  }, [])

  // Calculate time until next distribution
  const getTimeUntilDistribution = () => {
    if (!mounted) return { hours: 6, minutes: 0 }
    
    const nextDistribution = new Date(metrics.nextDistribution)
    const timeUntil = Math.max(0, nextDistribution.getTime() - Date.now())
    const hours = Math.floor(timeUntil / (1000 * 60 * 60))
    const minutes = Math.floor((timeUntil % (1000 * 60 * 60)) / (1000 * 60))
    return { hours, minutes }
  }

  const timeUntil = getTimeUntilDistribution()

  const formatTimestamp = (timestamp: string) => {
    if (!mounted) return 'Loading...'
    return new Date(timestamp).toLocaleTimeString()
  }

  return (
    <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-200 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-red-900">
              <Flame className="h-6 w-6" />
              2% Burn & Redistribution
            </CardTitle>
            <CardDescription className="text-red-700">
              Live token burning and staking rewards system
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
            <Zap className="h-3 w-3 mr-1" />
            LIVE
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-red-700">Total Rewards</p>
            <p className="text-lg font-bold text-red-900">
              {metrics?.totalRewardsDistributed.toFixed(2) || '0.00'} AURA
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-red-700">Active Stakers</p>
            <p className="text-lg font-bold text-red-900">
              {metrics?.totalStakers.toLocaleString() || '0'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-red-700">Next Distribution</p>
            <p className="text-lg font-bold text-red-900">
              {timeUntil.hours}h {timeUntil.minutes}m
            </p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/60 p-4 rounded-lg border border-red-200">
          <h4 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Recent Burns
          </h4>
          <div className="space-y-2">
            {recentTransactions.slice(0, 3).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={tx.type === 'buy' ? 'default' : 'secondary'}
                  >
                    {tx.type.toUpperCase()}
                  </Badge>
                  <span className="text-gray-600">
                    {formatTimestamp(tx.timestamp)}
                  </span>
                </div>
                <span className="font-semibold text-red-900">
                  {tx.amount.toFixed(4)} AURA
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white/60 p-4 rounded-lg border border-red-200">
          <h4 className="font-semibold text-red-900 mb-2">How It Works</h4>
          <ul className="text-sm text-red-800 space-y-1">
            <li>• 2% of every transaction is automatically burned</li>
            <li>• Burned tokens are redistributed to stakers</li>
            <li>• Rewards distributed 4 times daily</li>
            <li>• Proportional to your staking amount</li>
          </ul>
        </div>

        {/* CTA Buttons */}
        <div className="flex gap-3">
          <Button asChild className="flex-1 bg-red-600 hover:bg-red-700">
                          <Link href="/user-dashboard#staking">
              Start Staking
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex-1 border-red-300 text-red-700 hover:bg-red-50">
            <Link href="/burn-tracking">
              View Full Dashboard
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default LiveBurnMetrics 