
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown, DollarSign, Zap } from 'lucide-react';

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
  const selectedTokenData = tokens.find(t => t.symbol === selectedToken);
  const estimatedTotal = ((parseFloat(tradeAmount) || 0) * (selectedTokenData?.price || 0));

  return (
    <Card className="bg-gradient-to-br from-white to-gray-50 border-0 shadow-lg sticky top-6">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900 font-urbanist flex items-center gap-2">
              <ArrowUpDown className="h-6 w-6 text-blue-600" />
              Trade {selectedToken}
            </CardTitle>
            <CardDescription className="text-gray-600 font-urbanist mt-2">
              Powered by Jupiter DEX
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-urbanist">
            <Zap className="h-3 w-3 mr-1" />
            Fast
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant={tradeType === 'buy' ? 'default' : 'outline'}
            onClick={() => onTradeTypeChange('buy')}
            className={`font-semibold font-urbanist transition-all duration-300 ${
              tradeType === 'buy' 
                ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-md' 
                : 'hover:bg-green-50 hover:border-green-200 hover:text-green-700'
            }`}
          >
            Buy
          </Button>
          <Button 
            variant={tradeType === 'sell' ? 'default' : 'outline'}
            onClick={() => onTradeTypeChange('sell')}
            className={`font-semibold font-urbanist transition-all duration-300 ${
              tradeType === 'sell' 
                ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-md' 
                : 'hover:bg-red-50 hover:border-red-200 hover:text-red-700'
            }`}
          >
            Sell
          </Button>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700 font-urbanist">Amount</label>
          <div className="relative">
            <Input
              type="number"
              placeholder={`Enter ${selectedToken} amount`}
              value={tradeAmount}
              onChange={(e) => onTradeAmountChange(e.target.value)}
              className="pr-16 h-12 text-lg font-semibold border-2 focus:border-blue-500 transition-colors font-urbanist"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm font-medium text-gray-500">
              {selectedToken}
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600 font-urbanist">Current Price</span>
              <span className="text-lg font-bold text-gray-900 font-urbanist">
                ${selectedTokenData?.price.toFixed(8)}
              </span>
            </div>
            <div className="border-t border-gray-300 pt-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600 font-urbanist">Estimated Total</span>
                <div className="text-right">
                  <span className="text-xl font-bold text-blue-600 font-urbanist">
                    ${estimatedTotal.toFixed(6)}
                  </span>
                  <p className="text-xs text-gray-500 font-urbanist">USD</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Button 
          onClick={onTrade} 
          className="w-full h-12 text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 font-urbanist"
          disabled={!tradeAmount || parseFloat(tradeAmount) <= 0}
        >
          <DollarSign className="h-5 w-5 mr-2" />
          {tradeType === 'buy' ? 'Buy' : 'Sell'} {selectedToken} on Jupiter
        </Button>

        <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700 font-medium font-urbanist">
            🚀 Trades executed through Jupiter DEX for best prices
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TradePanel;
