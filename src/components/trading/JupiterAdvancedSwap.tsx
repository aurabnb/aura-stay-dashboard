'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Zap, ExternalLink } from 'lucide-react'

const JupiterAdvancedSwap: React.FC = () => {
  return (
    <Card className="bg-white border border-gray-200 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-blue-600" />
          Advanced Swap
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-4">
            Access advanced trading features on Jupiter
          </p>
          <Button 
            onClick={() => window.open('https://jup.ag/swap/SOL-3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe', '_blank')}
            className="w-full"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Trade AURA on Jupiter
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default JupiterAdvancedSwap
export { JupiterAdvancedSwap } 