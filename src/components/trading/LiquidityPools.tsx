'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Droplets, ExternalLink } from 'lucide-react'

interface LiquidityPool {
  pair: string
  totalLiquidity: number
  volume24h: number
  fees24h: number
  apy: number
  userShare: number
  poolUrl: string
}

interface LiquidityPoolsProps {
  liquidityPools: LiquidityPool[]
  onAddLiquidity: (poolUrl: string) => void
}

const LiquidityPools: React.FC<LiquidityPoolsProps> = ({ liquidityPools, onAddLiquidity }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Droplets className="h-5 w-5" />
          Active Liquidity Pools
        </CardTitle>
        <CardDescription>
          AURA liquidity pools on Meteora DEX - click to add liquidity
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {liquidityPools.map((pool, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-lg">{pool.pair}</h4>
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span>APY: {pool.apy}%</span>
                    <span>Your Share: {pool.userShare}%</span>
                  </div>
                </div>
                <Button 
                  onClick={() => onAddLiquidity(pool.poolUrl)}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Add Liquidity
                </Button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Total Liquidity</p>
                  <p className="font-semibold">${pool.totalLiquidity.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Volume 24h</p>
                  <p className="font-semibold">${pool.volume24h.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Fees 24h</p>
                  <p className="font-semibold">${pool.fees24h.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Your Earnings</p>
                  <p className="font-semibold text-green-600">
                    ${((pool.fees24h * pool.userShare) / 100).toFixed(2)}
                  </p>
                </div>
              </div>
              
              <div className="mt-3 text-xs text-gray-500">
                <a 
                  href={pool.poolUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 flex items-center gap-1"
                >
                  View on Meteora <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default LiquidityPools 