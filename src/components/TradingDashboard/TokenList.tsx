
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
    <Card className="bg-white border border-gray-200 shadow-lg">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-black font-urbanist flex items-center gap-2">
              <Activity className="h-6 w-6 text-black" />
              AURA Token Trading
            </CardTitle>
            <CardDescription className="text-gray-600 font-urbanist mt-2">
              Live price data and Jupiter DEX integration
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300 font-urbanist">
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
                  ? 'border-black bg-gray-50 shadow-md transform scale-[1.02]' 
                  : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-400'
              }`}
              onClick={() => onTokenSelect(token.symbol)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg border border-gray-200">
                    {token.symbol === 'AURA' ? (
                      <img 
                        src="/lovable-uploads/a85f448b-cd5c-46a7-a2b5-7bdabd161e26.png" 
                        alt="AURA Token"
                        className="w-8 h-8 object-contain"
                      />
                    ) : (
                      <span className="text-2xl">{token.icon}</span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xl font-bold text-black font-urbanist">{token.symbol}</p>
                      {selectedToken === token.symbol && (
                        <Badge variant="default" className="bg-black text-white">
                          Selected
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 font-urbanist">{token.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-black font-urbanist">${token.price.toFixed(8)}</p>
                  <div className="flex items-center gap-2 justify-end">
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                      token.change24h > 0 ? 'bg-gray-100' : 'bg-gray-200'
                    }`}>
                      {token.change24h > 0 ? (
                        <TrendingUp className="h-4 w-4 text-gray-700" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-gray-700" />
                      )}
                      <span className="text-sm font-semibold text-gray-700">
                        {token.change24h > 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6 mb-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-700 font-medium font-urbanist mb-1">Volume 24h</p>
                  <p className="text-lg font-bold text-black font-urbanist">${token.volume24h.toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-700 font-medium font-urbanist mb-1">Market Cap</p>
                  <p className="text-lg font-bold text-black font-urbanist">${token.marketCap.toLocaleString()}</p>
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
                    className="flex items-center gap-2 bg-black text-white border-black hover:bg-gray-800 hover:border-gray-800 shadow-md hover:shadow-lg transition-all duration-300 font-urbanist"
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
