'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'

interface JupiterSwapWidgetProps {
  fromToken: string
  toToken: string
}

const JupiterSwapWidget: React.FC<JupiterSwapWidgetProps> = ({ fromToken, toToken }) => {
  return (
    <Card className="bg-white border border-gray-200 shadow-lg">
      <CardHeader>
        <CardTitle>Jupiter Swap</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-4">
            Swap {fromToken} → {toToken}
          </p>
          <Button 
            onClick={() => window.open('https://jup.ag/swap/SOL-AURA', '_blank')}
            className="w-full"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open Jupiter
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default JupiterSwapWidget
export { JupiterSwapWidget } 