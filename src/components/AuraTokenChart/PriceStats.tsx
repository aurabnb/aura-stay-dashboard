
import React from 'react';
import { TrendingUp, TrendingDown, BarChart3, DollarSign } from 'lucide-react';

interface PriceStatsProps {
  currentPrice: number;
  priceChange: number;
  priceChangePercent: number;
  volume24h: number;
  marketCap: string;
}

const PriceStats: React.FC<PriceStatsProps> = ({
  currentPrice,
  priceChange,
  priceChangePercent,
  volume24h,
  marketCap
}) => {
  const isPositive = priceChange > 0;

  return (
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

      <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="h-5 w-5 text-green-600" />
          <span className="text-sm font-medium text-green-700 font-urbanist">Market Cap</span>
        </div>
        <p className="text-3xl font-bold text-green-700 font-urbanist">{marketCap}</p>
        <p className="text-sm text-green-600 font-urbanist">From treasury data</p>
      </div>
    </div>
  );
};

export default PriceStats;
