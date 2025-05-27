
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface ChartSectionProps {
  tokenAddress: string;
}

const ChartSection: React.FC<ChartSectionProps> = ({ tokenAddress }) => {
  const [timeframe, setTimeframe] = useState<'1h' | '4h' | '1d'>('1h');
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
        
        // Use light theme with custom colors that match your site
        iframe.src = `https://dexscreener.com/solana/${tokenAddress}?embed=1&theme=light&trades=0&info=0&timeframe=${timeframe}&chartType=candles&chartLeftToolbar=show&chartTheme=dark`;
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [timeframe, tokenAddress]);

  const handleTimeframeChange = (newTimeframe: '1h' | '4h' | '1d') => {
    setTimeframe(newTimeframe);
  };

  return (
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

      {/* Chart Container */}
      <div 
        className="relative w-full bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm"
        style={{ 
          height: '500px',
          maxWidth: 'none'
        }}
      >
        {!chartLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-lg text-gray-600 font-urbanist">Loading real-time chart...</p>
            </div>
          </div>
        )}
        
        <iframe
          ref={iframeRef}
          src={`https://dexscreener.com/solana/${tokenAddress}?embed=1&theme=light&trades=0&info=0&timeframe=${timeframe}&chartType=candles&chartLeftToolbar=show&chartTheme=dark`}
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
        <p className="text-xs text-gray-500 font-mono break-all">Token Address: {tokenAddress}</p>
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
  );
};

export default ChartSection;
