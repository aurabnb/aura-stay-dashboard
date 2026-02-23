'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface Token {
  symbol: string
  name: string
  price: number
  change24h: number
  volume24h: number
  marketCap: number
  icon: string
}

interface TradePanelProps {
  selectedToken: string
  tradeAmount: string
  tradeType: 'buy' | 'sell'
  tokens: Token[]
  onTradeAmountChange: (amount: string) => void
  onTradeTypeChange: (type: 'buy' | 'sell') => void
  onTrade: () => void
}

const TradePanel: React.FC<TradePanelProps> = ({
  selectedToken,
  tradeAmount,
  tradeType,
  tokens,
  onTradeAmountChange,
  onTradeTypeChange,
  onTrade
}) => {
  const token = tokens.find(t => t.symbol === selectedToken)

  if (!token) return null

  return (
    <Card className="bg-white border border-gray-200 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {tradeType === 'buy' ? <TrendingUp className="h-5 w-5 text-green-600" /> : <TrendingDown className="h-5 w-5 text-red-600" />}
          {tradeType === 'buy' ? 'Buy' : 'Sell'} {selectedToken}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            variant={tradeType === 'buy' ? 'default' : 'outline'}
            onClick={() => onTradeTypeChange('buy')}
            className="flex-1"
          >
            Buy
          </Button>
          <Button
            variant={tradeType === 'sell' ? 'default' : 'outline'}
            onClick={() => onTradeTypeChange('sell')}
            className="flex-1"
          >
            Sell
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            placeholder="0.00"
            value={tradeAmount}
            onChange={(e) => onTradeAmountChange(e.target.value)}
          />
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Current Price</span>
            <span className="font-semibold">${token.price.toFixed(8)}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">24h Change</span>
            <Badge variant={token.change24h > 0 ? 'default' : 'destructive'}>
              {token.change24h > 0 ? '+' : ''}{token.change24h.toFixed(2)}%
            </Badge>
          </div>
          {tradeAmount && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Estimated Total</span>
              <span className="font-semibold">
                ${(parseFloat(tradeAmount) * token.price).toFixed(2)}
              </span>
            </div>
          )}
        </div>

        <Button 
          onClick={onTrade}
          className="w-full"
          disabled={!tradeAmount || parseFloat(tradeAmount) <= 0}
        >
          {tradeType === 'buy' ? 'Buy' : 'Sell'} {selectedToken}
        </Button>
      </CardContent>
    </Card>
  )
}

export default TradePanel
export { TradePanel } 