
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react';

const AuraTokenChart = () => {
  const [timeframe, setTimeframe] = useState<'1h' | '4h' | '1d'>('1h');
  const [chartLoaded, setChartLoaded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const AURA_TOKEN_ADDRESS = '3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe';
  
  // Current mock data - this would ideally come from DEXScreener API
  const currentPrice = 0.000121;
  const priceChange = 0.000006;
  const priceChangePercent = 5.2;
  const isPositive = priceChange > 0;
  const volume24h = 125000;

  useEffect(() => {
    setChartLoaded(false);
    
    const timer = setTimeout(() => {
      if (iframeRef.current) {
        const iframe = iframeRef.current;
        iframe.onload = () => {
          setChartLoaded(true);
          // Try to customize chart colors via postMessage
          try {
            iframe.contentWindow?.postMessage({
              type: 'chart-config',
              config: {
                upColor: '#10B981',
                downColor: '#EF4444',
                backgroundColor: '#ffffff',
                timeframe: timeframe
              }
            }, '*');
          } catch (e) {
            console.log('Chart customization not available');
          }
        };
        
        // Force reload the iframe with new timeframe
        iframe.src = `https://dexscreener.com/solana/${AURA_TOKEN_ADDRESS}?embed=1&theme=light&trades=0&info=0&timeframe=${timeframe}`;
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [timeframe]);

  const handleTimeframeChange = (newTimeframe: '1h' | '4h' | '1d') => {
    setTimeframe(newTimeframe);
  };

  return (
    <div className="w-full max-w-none">
      <Card className="border border-gray-200">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl font-urbanist">
                <DollarSign className="h-6 w-6 text-green-600" />
                $AURA Token
              </CardTitle>
              <CardDescription className="text-gray-600 font-urbanist">
                Real-time price and volume tracking via DEXScreener
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 font-urbanist">
              Live
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Price Stats - Made wider and more prominent */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-600 font-urbanist">Current Price</span>
                <div className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  <span className="text-sm font-urbanist">{priceChangePercent}%</span>
                </div>
              </div>
              <p className="text-3xl font-bold text-black font-urbanist">${currentPrice.toFixed(6)}</p>
              <p className={`text-sm font-urbanist ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? '+' : ''}${priceChange.toFixed(6)}
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-700 font-urbanist">Volume (24h)</span>
              </div>
              <p className="text-3xl font-bold text-green-700 font-urbanist">
                {volume24h.toLocaleString()}
              </p>
              <p className="text-sm text-green-600 font-urbanist">$AURA traded</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-700 font-urbanist">Market Cap</span>
              </div>
              <p className="text-3xl font-bold text-blue-700 font-urbanist">$115.7K</p>
              <p className="text-sm text-blue-600 font-urbanist">From treasury data</p>
            </div>
          </div>

          {/* Chart Section - Made much wider */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h4 className="text-2xl font-semibold text-black font-urbanist">Price Chart</h4>
              <div className="flex gap-2">
                {(['1h', '4h', '1d'] as const).map((period) => (
                  <Button
                    key={period}
                    variant={timeframe === period ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleTimeframeChange(period)}
                    className={`text-sm font-urbanist font-medium transition-all ${
                      timeframe === period 
                        ? 'bg-green-600 hover:bg-green-700 text-white border-green-600' 
                        : 'bg-white text-gray-700 border-gray-300 hover:border-green-400 hover:text-green-600'
                    }`}
                  >
                    {period.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>

            {/* DEXScreener Chart Container - Made much wider */}
            <div 
              className="relative w-full bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm"
              style={{ 
                height: '500px',
                maxWidth: 'none'
              }}
            >
              {!chartLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-lg text-gray-600 font-urbanist">Loading real-time chart...</p>
                  </div>
                </div>
              )}
              
              <iframe
                ref={iframeRef}
                src={`https://dexscreener.com/solana/${AURA_TOKEN_ADDRESS}?embed=1&theme=light&trades=0&info=0&timeframe=${timeframe}`}
                width="100%"
                height="500"
                style={{ 
                  border: 'none',
                  borderRadius: '12px',
                  backgroundColor: '#ffffff'
                }}
                title="AURA Token Chart"
              />
            </div>

            {/* Chart Info */}
            <div className="text-center space-y-3">
              <p className="text-sm text-gray-600 font-urbanist">Real-time price data powered by DEXScreener</p>
              <p className="text-xs text-gray-500 font-mono break-all">Token Address: {AURA_TOKEN_ADDRESS}</p>
              <div className="flex justify-center gap-6 text-sm">
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-600 rounded"></div>
                  <span className="font-urbanist text-gray-700">Bullish Candles</span>
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="font-urbanist text-gray-700">Bearish Candles</span>
                </span>
              </div>
            </div>
          </div>

          {/* Trading Links */}
          <div className="flex justify-center gap-4 pt-6 border-t border-gray-200">
            <Button 
              variant="outline" 
              onClick={() => window.open(`https://jup.ag/swap/SOL-${AURA_TOKEN_ADDRESS}`, '_blank')}
              className="flex items-center gap-2 bg-white border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400 font-urbanist"
            >
              Trade on Jupiter
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.open(`https://dexscreener.com/solana/${AURA_TOKEN_ADDRESS}`, '_blank')}
              className="flex items-center gap-2 bg-white border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400 font-urbanist"
            >
              View on DEXScreener
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuraTokenChart;
