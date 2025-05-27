
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, ExternalLink, Activity } from 'lucide-react';

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
  showAll?: boolean;
}

const TokenList: React.FC<TokenListProps> = ({ tokens, selectedToken, onTokenSelect, showAll = false }) => {
  return (
    <Card className="bg-gradient-to-br from-white to-gray-50 border-0 shadow-lg">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900 font-urbanist flex items-center gap-2">
              <Activity className="h-6 w-6 text-green-600" />
              {showAll ? 'All Tokens' : 'AURA Token Trading'}
            </CardTitle>
            <CardDescription className="text-gray-600 font-urbanist mt-2">
              {showAll ? 'Complete token listing with trading data' : 'Live price data and Jupiter DEX integration'}
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 font-urbanist">
            Live Data
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tokens.map((token) => (
            <div 
              key={token.symbol}
              className={`p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg ${
                selectedToken === token.symbol 
                  ? 'border-green-500 bg-green-50 shadow-md transform scale-[1.02]' 
                  : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300'
              }`}
              onClick={() => onTokenSelect(token.symbol)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-2xl shadow-lg">
                    {token.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xl font-bold text-gray-900 font-urbanist">{token.symbol}</p>
                      {selectedToken === token.symbol && (
                        <Badge variant="default" className="bg-green-600 text-white">
                          Selected
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 font-urbanist">{token.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900 font-urbanist">${token.price.toFixed(8)}</p>
                  <div className="flex items-center gap-2 justify-end">
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                      token.change24h > 0 ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {token.change24h > 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                      <span className={`text-sm font-semibold ${token.change24h > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {token.change24h > 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6 mb-4">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700 font-medium font-urbanist mb-1">Volume 24h</p>
                  <p className="text-lg font-bold text-blue-900 font-urbanist">${token.volume24h.toLocaleString()}</p>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                  <p className="text-sm text-purple-700 font-medium font-urbanist mb-1">Market Cap</p>
                  <p className="text-lg font-bold text-purple-900 font-urbanist">${token.marketCap.toLocaleString()}</p>
                </div>
              </div>
              
              {token.jupiterUrl && (
                <div className="pt-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(token.jupiterUrl, '_blank');
                    }}
                    className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white border-0 hover:from-green-700 hover:to-green-800 shadow-md hover:shadow-lg transition-all duration-300 font-urbanist"
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
