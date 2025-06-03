'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Users, DollarSign, Coins, Building2, Activity, Shield, Zap } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useQuery } from '@tanstack/react-query'

interface TreasuryStats {
  totalValue: number
  tokenHolders: number
  stakedTokens: number
  burnedTokens: number
  propertiesFunded: number
  monthlyGrowth: number
  apy: number
  lastUpdate: string
}

// Mock API function - replace with actual API call
async function fetchTreasuryStats(): Promise<TreasuryStats> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  return {
    totalValue: 2847392.45,
    tokenHolders: 12547,
    stakedTokens: 8934567.12,
    burnedTokens: 2345678.90,
    propertiesFunded: 3,
    monthlyGrowth: 12.4,
    apy: 24.7,
    lastUpdate: new Date().toISOString()
  }
}

const stats = [
  {
    label: 'Treasury Value',
    key: 'totalValue' as keyof TreasuryStats,
    icon: DollarSign,
    format: 'currency',
    description: 'Total community treasury',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  {
    label: 'Token Holders',
    key: 'tokenHolders' as keyof TreasuryStats,
    icon: Users,
    format: 'number',
    description: 'Active community members',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  {
    label: 'Staked Tokens',
    key: 'stakedTokens' as keyof TreasuryStats,
    icon: Coins,
    format: 'token',
    description: 'Currently staked for rewards',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  },
  {
    label: 'Monthly APY',
    key: 'apy' as keyof TreasuryStats,
    icon: TrendingUp,
    format: 'percentage',
    description: 'Current staking rewards',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200'
  },
  {
    label: 'Burned Tokens',
    key: 'burnedTokens' as keyof TreasuryStats,
    icon: Activity,
    format: 'token',
    description: 'Total tokens burned',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  },
  {
    label: 'Properties',
    key: 'propertiesFunded' as keyof TreasuryStats,
    icon: Building2,
    format: 'number',
    description: 'Community-funded stays',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200'
  },
  {
    label: 'Growth Rate',
    key: 'monthlyGrowth' as keyof TreasuryStats,
    icon: Zap,
    format: 'percentage',
    description: 'Monthly treasury growth',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200'
  },
  {
    label: 'Security Score',
    key: 'totalValue' as keyof TreasuryStats,
    icon: Shield,
    format: 'score',
    description: 'Multi-sig protection',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200'
  }
]

function formatValue(value: number, format: string): string {
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value)
    case 'token':
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value)
    case 'percentage':
      return `${value.toFixed(1)}%`
    case 'number':
      return new Intl.NumberFormat('en-US').format(value)
    case 'score':
      return '99.9%'
    default:
      return value.toString()
  }
}

export function StatsSection() {
  const { data: treasuryStats, isLoading, error } = useQuery({
    queryKey: ['treasury-stats'],
    queryFn: fetchTreasuryStats,
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  const [animatedValues, setAnimatedValues] = useState<Record<string, number>>({})

  useEffect(() => {
    if (treasuryStats) {
      // Animate number counters
      const animate = (key: string, target: number) => {
        let start = animatedValues[key] || 0
        const increment = (target - start) / 60 // 60 frames for 1 second animation
        let current = start

        const timer = setInterval(() => {
          current += increment
          if ((increment > 0 && current >= target) || (increment < 0 && current <= target)) {
            current = target
            clearInterval(timer)
          }
          setAnimatedValues(prev => ({ ...prev, [key]: current }))
        }, 16) // ~60fps
      }

      Object.entries(treasuryStats).forEach(([key, value]) => {
        if (typeof value === 'number') {
          animate(key, value)
        }
      })
    }
  }, [treasuryStats])

  if (isLoading) {
    return <StatsLoadingSkeleton />
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Failed to load treasury stats</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        const value = treasuryStats ? treasuryStats[stat.key] : 0
        const animatedValue = animatedValues[stat.key] || 0
        
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
          >
            <Card className={`group hover:shadow-lg transition-all duration-300 border-2 ${stat.borderColor} ${stat.bgColor}/30 hover:${stat.bgColor}/50`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                        <p className="text-xs text-gray-500">{stat.description}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className={`text-2xl font-bold ${stat.color}`}>
                        {formatValue(animatedValue, stat.format)}
                      </div>
                      
                      {stat.key === 'totalValue' && (
                        <div className="flex items-center space-x-1 text-xs">
                          <TrendingUp className="w-3 h-3 text-green-500" />
                          <span className="text-green-600 font-medium">
                            +{treasuryStats?.monthlyGrowth.toFixed(1)}% this month
                          </span>
                        </div>
                      )}
                      
                      {stat.key === 'tokenHolders' && (
                        <div className="text-xs text-gray-500">
                          +127 new holders this week
                        </div>
                      )}
                      
                      {stat.key === 'stakedTokens' && (
                        <div className="text-xs text-gray-500">
                          {((animatedValue / 15000000) * 100).toFixed(1)}% of total supply
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Live indicator for key metrics */}
                  {['totalValue', 'stakedTokens'].includes(stat.key) && (
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-600 font-medium">LIVE</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}

function StatsLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-3 flex-1">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-24"></div>
                <div className="h-3 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 