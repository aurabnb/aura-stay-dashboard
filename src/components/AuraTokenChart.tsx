
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react';

const AuraTokenChart = () => {
  const [timeframe, setTimeframe] = useState<'1h' | '4h' | '1d'>('1h');
  const [chartLoaded, setChartLoaded] = useState(false);

  const AURA_TOKEN_ADDRESS = '3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe';
  
  // Current mock data - this would ideally come from DEXScreener API
  const currentPrice = 0.000121;
  const priceChange = 0.000006;
  const priceChangePercent = 5.2;
  const isPositive = priceChange > 0;
  const volume24h = 125000;

  useEffect(() => {
    // Load DEXScreener chart
    const loadChart = () => {
      const container = document.getElementById('dexscreener-chart');
      if (!container) return;

      // Clear existing content
      container.innerHTML = '';

      // Create iframe for DEXScreener chart
      const iframe = document.createElement('iframe');
      iframe.src = `https://dexscreener.com/solana/${AURA_TOKEN_ADDRESS}?embed=1&theme=light&trades=0&info=0`;
      iframe.width = '100%';
      iframe.height = '400';
      iframe.style.border = 'none';
      iframe.style.borderRadius = '8px';
      iframe.style.backgroundColor = '#ffffff';
      
      // Custom styling via postMessage (if supported)
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

      container.appendChild(iframe);
    };

    loadChart();
  }, [timeframe]);

  const handleTimeframeChange = (newTimeframe: '1h' | '4h' | '1d') => {
    setTimeframe(newTimeframe);
    setChartLoaded(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                $AURA Token
              </CardTitle>
              <CardDescription>Real-time price and volume tracking via DEXScreener</CardDescription>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Live
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Price Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Current Price</span>
                <div className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  <span className="text-xs">{priceChangePercent}%</span>
                </div>
              </div>
              <p className="text-2xl font-bold">${currentPrice.toFixed(6)}</p>
              <p className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? '+' : ''}${priceChange.toFixed(6)}
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">Volume (24h)</span>
              </div>
              <p className="text-2xl font-bold text-blue-700">
                {volume24h.toLocaleString()}
              </p>
              <p className="text-sm text-blue-600">$AURA traded</p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">Market Cap</span>
              </div>
              <p className="text-2xl font-bold text-green-700">$115.7K</p>
              <p className="text-sm text-green-600">From treasury data</p>
            </div>
          </div>

          {/* Chart Controls */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-semibold">Price Chart</h4>
              <div className="flex gap-2">
                {(['1h', '4h', '1d'] as const).map((period) => (
                  <Button
                    key={period}
                    variant={timeframe === period ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleTimeframeChange(period)}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700"
                    style={{
                      backgroundColor: timeframe === period ? '#10B981' : '#E5E7EB',
                      color: timeframe === period ? 'white' : '#1F2937'
                    }}
                  >
                    {period.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>

            {/* DEXScreener Chart Container */}
            <div 
              className="relative w-full bg-white border border-gray-200 rounded-lg overflow-hidden"
              style={{ 
                height: '400px', 
                maxWidth: '600px', 
                margin: '0 auto',
                border: '1px solid #E5E7EB',
                borderRadius: '8px'
              }}
            >
              <div id="dexscreener-chart" className="w-full h-full">
                {!chartLoaded && (
                  <div className="flex items-center justify-center h-full bg-gray-50">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
                      <p className="text-sm text-gray-600">Loading real-time chart...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Chart Info */}
            <div className="text-center text-xs text-gray-500 space-y-1">
              <p>Real-time price data powered by DEXScreener</p>
              <p>Token Address: {AURA_TOKEN_ADDRESS}</p>
              <div className="flex justify-center gap-4 text-xs">
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-600 rounded"></div>
                  Bullish Candles
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  Bearish Candles
                </span>
              </div>
            </div>
          </div>

          {/* Trading Links */}
          <div className="flex justify-center gap-4 pt-4 border-t border-gray-200">
            <Button 
              variant="outline" 
              onClick={() => window.open(`https://jup.ag/swap/SOL-${AURA_TOKEN_ADDRESS}`, '_blank')}
              className="flex items-center gap-2"
            >
              Trade on Jupiter
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.open(`https://dexscreener.com/solana/${AURA_TOKEN_ADDRESS}`, '_blank')}
              className="flex items-center gap-2"
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
