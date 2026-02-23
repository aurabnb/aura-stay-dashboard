'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Wallet, BarChart3 } from 'lucide-react'

const AdvancedPortfolioTracker: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card className="bg-white border border-gray-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Portfolio Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-gray-600">Total Value</span>
              </div>
              <p className="text-2xl font-bold">$12,450</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm text-gray-600">24h Change</span>
              </div>
              <p className="text-2xl font-bold text-green-600">+5.2%</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-4 w-4 text-purple-600" />
                <span className="text-sm text-gray-600">Assets</span>
              </div>
              <p className="text-2xl font-bold">4</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AdvancedPortfolioTracker
export { AdvancedPortfolioTracker } 