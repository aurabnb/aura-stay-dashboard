
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, ExternalLink } from 'lucide-react';

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

interface TokenListProps {
  tokens: Token[];
  selectedToken: string;
  onTokenSelect: (symbol: string) => void;
}

const TokenList: React.FC<TokenListProps> = ({ tokens, selectedToken, onTokenSelect }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AURA Token Trading</CardTitle>
        <CardDescription>Live price data and Jupiter DEX integration</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tokens.map((token) => (
            <div 
              key={token.symbol}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedToken === token.symbol ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => onTokenSelect(token.symbol)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{token.icon}</span>
                  <div>
                    <p className="font-semibold">{token.symbol}</p>
                    <p className="text-sm text-gray-600">{token.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold">${token.price.toFixed(8)}</p>
                  <div className="flex items-center gap-1">
                    {token.change24h > 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <span className={`text-sm ${token.change24h > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {token.change24h > 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <p>Volume 24h</p>
                  <p className="font-semibold">${token.volume24h.toLocaleString()}</p>
                </div>
                <div>
                  <p>Market Cap</p>
                  <p className="font-semibold">${token.marketCap.toLocaleString()}</p>
                </div>
              </div>
              {token.jupiterUrl && (
                <div className="mt-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(token.jupiterUrl, '_blank');
                    }}
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Trade on Jupiter
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TokenList;
