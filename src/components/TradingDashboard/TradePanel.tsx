
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Token {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  icon: string;
  jupiterUrl?: string;
}

interface TradePanelProps {
  selectedToken: string;
  tradeAmount: string;
  tradeType: 'buy' | 'sell';
  tokens: Token[];
  onTradeAmountChange: (amount: string) => void;
  onTradeTypeChange: (type: 'buy' | 'sell') => void;
  onTrade: () => void;
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
  return (
    <Card>
      <CardHeader>
        <CardTitle>Trade {selectedToken}</CardTitle>
        <CardDescription>Powered by Jupiter DEX</CardDescription>
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

        <div>
          <label className="block text-sm font-medium mb-2">Amount</label>
          <Input
            type="number"
            placeholder={`Enter ${selectedToken} amount`}
            value={tradeAmount}
            onChange={(e) => onTradeAmountChange(e.target.value)}
          />
        </div>

        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex justify-between text-sm">
            <span>Price</span>
            <span>${tokens.find(t => t.symbol === selectedToken)?.price.toFixed(8)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Est. Total</span>
            <span>${((parseFloat(tradeAmount) || 0) * (tokens.find(t => t.symbol === selectedToken)?.price || 0)).toFixed(6)}</span>
          </div>
        </div>

        <Button onClick={onTrade} className="w-full">
          {tradeType === 'buy' ? 'Buy' : 'Sell'} {selectedToken} on Jupiter
        </Button>

        <div className="text-center text-sm text-gray-600">
          <p>Trades are executed through Jupiter DEX</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TradePanel;
