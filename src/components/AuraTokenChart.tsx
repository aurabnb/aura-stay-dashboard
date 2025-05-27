
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react';

const AuraTokenChart = () => {
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M'>('1D');

  // Sample data - in production this would come from your API
  const priceData = {
    '1D': [
      { time: '00:00', price: 0.000115, volume: 12500 },
      { time: '04:00', price: 0.000118, volume: 8900 },
      { time: '08:00', price: 0.000120, volume: 15600 },
      { time: '12:00', price: 0.000117, volume: 22100 },
      { time: '16:00', price: 0.000122, volume: 18300 },
      { time: '20:00', price: 0.000119, volume: 14700 },
      { time: '24:00', price: 0.000121, volume: 11200 }
    ],
    '1W': [
      { time: 'Mon', price: 0.000115, volume: 125000 },
      { time: 'Tue', price: 0.000118, volume: 89000 },
      { time: 'Wed', price: 0.000120, volume: 156000 },
      { time: 'Thu', price: 0.000117, volume: 221000 },
      { time: 'Fri', price: 0.000122, volume: 183000 },
      { time: 'Sat', price: 0.000119, volume: 147000 },
      { time: 'Sun', price: 0.000121, volume: 112000 }
    ],
    '1M': [
      { time: 'Week 1', price: 0.000108, volume: 890000 },
      { time: 'Week 2', price: 0.000112, volume: 1200000 },
      { time: 'Week 3', price: 0.000115, volume: 1450000 },
      { time: 'Week 4', price: 0.000121, volume: 1680000 }
    ]
  };

  const currentPrice = 0.000121;
  const priceChange = 0.000006;
  const priceChangePercent = 5.2;
  const isPositive = priceChange > 0;

  const totalVolume = priceData[timeframe].reduce((sum, item) => sum + item.volume, 0);

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
              <CardDescription>Real-time price and volume tracking</CardDescription>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Live
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
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
                <span className="text-sm font-medium text-blue-600">Volume ({timeframe})</span>
              </div>
              <p className="text-2xl font-bold text-blue-700">
                {totalVolume.toLocaleString()}
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

          <div className="space-y-4">
            <div className="flex gap-2">
              {(['1D', '1W', '1M'] as const).map((period) => (
                <Button
                  key={period}
                  variant={timeframe === period ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeframe(period)}
                  className="text-xs"
                >
                  {period}
                </Button>
              ))}
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={priceData[timeframe]}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="time" fontSize={12} />
                  <YAxis fontSize={12} tickFormatter={(value) => `$${value.toFixed(6)}`} />
                  <Tooltip 
                    formatter={(value: number) => [`$${value.toFixed(6)}`, 'Price']}
                    labelStyle={{ color: '#374151' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="h-48">
              <h4 className="text-sm font-medium mb-3">Volume Distribution</h4>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priceData[timeframe]}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="time" fontSize={12} />
                  <YAxis fontSize={12} tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
                  <Tooltip 
                    formatter={(value: number) => [value.toLocaleString(), 'Volume']}
                    labelStyle={{ color: '#374151' }}
                  />
                  <Bar dataKey="volume" fill="#3B82F6" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuraTokenChart;
