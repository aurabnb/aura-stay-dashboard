
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LineChart, Activity, TrendingUp, Volume2 } from 'lucide-react';

interface PriceChartProps {
  tokenAddress: string;
  tokenSymbol: string;
}

const PriceChart: React.FC<PriceChartProps> = ({ tokenAddress, tokenSymbol }) => {
  const [timeframe, setTimeframe] = useState<'1h' | '4h' | '1d' | '1w'>('1h');
  const [chartType, setChartType] = useState<'candles' | 'line'>('candles');
  const [chartLoaded, setChartLoaded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    setChartLoaded(false);
    
    const timer = setTimeout(() => {
      if (iframeRef.current) {
        const iframe = iframeRef.current;
        iframe.onload = () => {
          setChartLoaded(true);
        };
        
        iframe.src = `https://dexscreener.com/solana/${tokenAddress}?embed=1&theme=light&trades=0&info=0&timeframe=${timeframe}&chartType=${chartType}&chartLeftToolbar=show&chartTheme=light`;
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [timeframe, chartType, tokenAddress]);

  const handleTimeframeChange = (newTimeframe: '1h' | '4h' | '1d' | '1w') => {
    setTimeframe(newTimeframe);
  };

  const handleChartTypeChange = (newChartType: 'candles' | 'line') => {
    setChartType(newChartType);
  };

  return (
    <Card className="bg-white border border-gray-200 shadow-lg">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-black font-urbanist flex items-center gap-2">
              <LineChart className="h-6 w-6 text-black" />
              {tokenSymbol} Price Chart
            </CardTitle>
            <CardDescription className="text-gray-600 font-urbanist mt-2">
              Real-time price data with technical analysis
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300 font-urbanist">
            <Activity className="h-3 w-3 mr-1" />
            Live Data
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Chart Controls */}
        <div className="flex flex-wrap gap-4 items-center justify-between">
          {/* Timeframe Controls */}
          <div className="flex gap-2">
            <span className="text-sm font-medium text-gray-700 font-urbanist flex items-center">
              <Volume2 className="h-4 w-4 mr-1" />
              Timeframe:
            </span>
            {(['1h', '4h', '1d', '1w'] as const).map((period) => (
              <Button
                key={period}
                variant={timeframe === period ? "default" : "outline"}
                size="sm"
                onClick={() => handleTimeframeChange(period)}
                className={`text-sm font-urbanist font-medium transition-all ${
                  timeframe === period 
                    ? 'bg-black hover:bg-gray-800 text-white border-black' 
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:text-black'
                }`}
              >
                {period.toUpperCase()}
              </Button>
            ))}
          </div>

          {/* Chart Type Controls */}
          <div className="flex gap-2">
            <span className="text-sm font-medium text-gray-700 font-urbanist flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" />
              Chart:
            </span>
            {(['candles', 'line'] as const).map((type) => (
              <Button
                key={type}
                variant={chartType === type ? "default" : "outline"}
                size="sm"
                onClick={() => handleChartTypeChange(type)}
                className={`text-sm font-urbanist font-medium transition-all ${
                  chartType === type 
                    ? 'bg-gray-700 hover:bg-gray-800 text-white border-gray-700' 
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:text-black'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Chart Container */}
        <div 
          className="relative w-full bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm"
          style={{ 
            height: '600px',
            maxWidth: 'none'
          }}
        >
          {!chartLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
                <p className="text-lg text-gray-600 font-urbanist">Loading advanced chart...</p>
                <p className="text-sm text-gray-500 font-urbanist mt-2">Technical indicators and volume data</p>
              </div>
            </div>
          )}
          
          <iframe
            ref={iframeRef}
            src={`https://dexscreener.com/solana/${tokenAddress}?embed=1&theme=light&trades=0&info=0&timeframe=${timeframe}&chartType=${chartType}&chartLeftToolbar=show&chartTheme=light`}
            width="100%"
            height="600"
            style={{ 
              border: 'none',
              borderRadius: '12px',
              backgroundColor: '#ffffff'
            }}
            title={`${tokenSymbol} Advanced Chart`}
          />
        </div>

        {/* Chart Features Info */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-sm font-medium text-gray-900 font-urbanist">Technical Analysis</p>
              <p className="text-xs text-gray-600 font-urbanist">RSI, MACD, Moving Averages</p>
            </div>
            <div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Volume2 className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-gray-900 font-urbanist">Volume Analysis</p>
              <p className="text-xs text-gray-600 font-urbanist">Trading volume indicators</p>
            </div>
            <div>
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <LineChart className="h-4 w-4 text-purple-600" />
              </div>
              <p className="text-sm font-medium text-gray-900 font-urbanist">Multiple Timeframes</p>
              <p className="text-xs text-gray-600 font-urbanist">1H to 1W analysis</p>
            </div>
            <div>
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Activity className="h-4 w-4 text-orange-600" />
              </div>
              <p className="text-sm font-medium text-gray-900 font-urbanist">Real-time Data</p>
              <p className="text-xs text-gray-600 font-urbanist">Live price updates</p>
            </div>
          </div>
        </div>

        {/* Chart Info */}
        <div className="text-center space-y-2 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 font-urbanist">Advanced charting powered by DEXScreener</p>
          <p className="text-xs text-gray-500 font-mono break-all">Token: {tokenAddress}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PriceChart;
