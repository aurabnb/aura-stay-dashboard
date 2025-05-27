
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign } from 'lucide-react';
import PriceStats from './AuraTokenChart/PriceStats';
import ChartSection from './AuraTokenChart/ChartSection';
import TradingLinks from './AuraTokenChart/TradingLinks';

const AuraTokenChart = () => {
  const AURA_TOKEN_ADDRESS = '3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe';
  
  // Current mock data - this would ideally come from DEXScreener API
  const currentPrice = 0.000121;
  const priceChange = 0.000006;
  const priceChangePercent = 5.2;
  const volume24h = 125000;
  const marketCap = '$115.7K';

  return (
    <div className="w-full max-w-none">
      <Card className="border border-gray-200 bg-white">
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
          {/* Price Stats */}
          <PriceStats
            currentPrice={currentPrice}
            priceChange={priceChange}
            priceChangePercent={priceChangePercent}
            volume24h={volume24h}
            marketCap={marketCap}
          />

          {/* Chart Section */}
          <ChartSection tokenAddress={AURA_TOKEN_ADDRESS} />

          {/* Trading Links */}
          <TradingLinks tokenAddress={AURA_TOKEN_ADDRESS} />
        </CardContent>
      </Card>
    </div>
  );
};

export default AuraTokenChart;
