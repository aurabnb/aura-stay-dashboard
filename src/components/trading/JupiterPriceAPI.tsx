'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Zap } from 'lucide-react'

const JupiterPriceAPI: React.FC = () => {
  const [priceData, setPriceData] = useState({
    aura: 0.00011566,
    sol: 178.15,
    change24h: 12.5
  })

  return (
    <Card className="bg-white border border-gray-200 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-600" />
          Jupiter Price Feed
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">AURA/SOL</span>
            <div className="text-right">
              <div className="font-semibold">${priceData.aura.toFixed(8)}</div>
              <Badge variant="default" className="text-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                +{priceData.change24h}%
              </Badge>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">SOL/USD</span>
            <div className="font-semibold">${priceData.sol}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default JupiterPriceAPI
export { JupiterPriceAPI } 