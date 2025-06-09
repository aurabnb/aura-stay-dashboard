'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3 } from 'lucide-react'

interface PriceChartProps {
  tokenAddress: string
  tokenSymbol: string
}

const PriceChart: React.FC<PriceChartProps> = ({ tokenAddress, tokenSymbol }) => {
  return (
    <Card className="bg-white border border-gray-200 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          {tokenSymbol} Price Chart
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Price chart coming soon</p>
            <p className="text-sm text-gray-400">Token: {tokenSymbol}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default PriceChart
export { PriceChart } 