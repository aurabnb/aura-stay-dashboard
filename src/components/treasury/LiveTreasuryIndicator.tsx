
'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, TrendingUp, Activity } from 'lucide-react'
import { useShyftTreasuryData } from '@/hooks/useShyftTreasuryData'

export function LiveTreasuryIndicator() {
  const { data, loading, syncing, error, lastRefresh, syncLiveData } = useShyftTreasuryData()

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const formatTime = (date: Date | null): string => {
    if (!date) return 'Never'
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date)
  }

  if (loading) {
    return (
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Aura Value Indicator
            <div className="animate-spin">
              <RefreshCw className="h-4 w-4" />
            </div>
          </CardTitle>
          <p className="text-sm text-gray-600">Loading real-time treasury data...</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <TrendingUp className="h-5 w-5" />
            Aura Value Indicator
          </CardTitle>
          <p className="text-sm text-red-600">Error loading treasury data</p>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-700 mb-4">{error}</p>
          <Button onClick={syncLiveData} variant="outline" size="sm" disabled={syncing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            <CardTitle>Aura Value Indicator</CardTitle>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Activity className="h-3 w-3 mr-1" />
              Live
            </Badge>
          </div>
          <Button
            onClick={syncLiveData}
            variant="outline"
            size="sm"
            disabled={syncing}
            className="border-gray-300 hover:bg-gray-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        <p className="text-sm text-gray-600">
          Real-time tracking of Aura Foundation's treasury and market value from Solana blockchain.
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="font-medium text-gray-700">Asset Category</div>
            <div className="font-medium text-gray-700">Value (USD)</div>
            <div className="font-medium text-gray-700">Last Updated</div>
          </div>
          
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-4 py-2 border-b border-gray-100">
              <div className="text-gray-600">Total Market Cap (from Solana)</div>
              <div className="font-semibold">{formatCurrency(data?.treasury.totalMarketCap || 0)}</div>
              <div className="text-green-600 text-sm">Live</div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 py-2 border-b border-gray-100">
              <div className="text-gray-600">Volatile Assets</div>
              <div className="font-semibold">{formatCurrency(data?.treasury.volatileAssets || 0)}</div>
              <div className="text-green-600 text-sm">Live</div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 py-2 border-b border-gray-100">
              <div className="text-gray-600">Hard Assets</div>
              <div className="font-semibold">{formatCurrency(data?.treasury.hardAssets || 0)}</div>
              <div className="text-green-600 text-sm">Live</div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 py-2 border-b border-gray-100">
              <div className="text-gray-600">Speculative Interest</div>
              <div className="font-semibold">{formatCurrency((data?.treasury.totalMarketCap || 0) * 0.15)}</div>
              <div className="text-green-600 text-sm">Live</div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 py-2 font-semibold border-t border-gray-200 pt-3">
              <div className="text-gray-800">Total Treasury Value</div>
              <div className="text-lg">{formatCurrency(data?.treasury.totalMarketCap || 0)}</div>
              <div className="text-green-600 text-sm">Live</div>
            </div>
          </div>
          
          {lastRefresh && (
            <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Last synced: {formatTime(lastRefresh)} • {data?.wallets.length || 0} wallets monitored
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
