import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Flame, TrendingUp, Users, Timer, Zap } from 'lucide-react';
import { getStakingMetrics, getBurnHistory } from '@/api/believe';
import { Link } from 'react-router-dom';

const LiveBurnMetrics: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [recentBurns, setRecentBurns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stakingData, burnHistory] = await Promise.all([
          getStakingMetrics(),
          getBurnHistory(5)
        ]);
        setMetrics(stakingData);
        setRecentBurns(burnHistory);
      } catch (error) {
        console.error('Failed to fetch burn metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </CardContent>
      </Card>
    );
  }

  const nextDistribution = metrics?.nextDistribution 
    ? new Date(metrics.nextDistribution) 
    : new Date(Date.now() + 6 * 60 * 60 * 1000);

  const timeUntil = Math.max(0, nextDistribution.getTime() - Date.now());
  const hoursUntil = Math.floor(timeUntil / (1000 * 60 * 60));
  const minutesUntil = Math.floor((timeUntil % (1000 * 60 * 60)) / (1000 * 60));

  return (
    <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-200 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-red-900">
              <Flame className="h-6 w-6" />
              2% Burn & Redistribution
            </CardTitle>
            <CardDescription className="text-red-700">
              Live token burning and staking rewards system
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
            <Zap className="h-3 w-3 mr-1" />
            LIVE
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-red-700">Total Rewards</p>
            <p className="text-lg font-bold text-red-900">
              {metrics?.totalRewardsDistributed.toFixed(2) || '0.00'} AURA
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-red-700">Active Stakers</p>
            <p className="text-lg font-bold text-red-900">
              {metrics?.totalStakers.toLocaleString() || '0'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-red-700">Next Distribution</p>
            <p className="text-lg font-bold text-red-900">
              {hoursUntil}h {minutesUntil}m
            </p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/60 p-4 rounded-lg border border-red-200">
          <h4 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Recent Burns
          </h4>
          <div className="space-y-2">
            {recentBurns.slice(0, 3).map((burn, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="outline" 
                    size="sm"
                    className={burn.type === 'buy' ? 'border-green-300 text-green-700' : 'border-red-300 text-red-700'}
                  >
                    {burn.type}
                  </Badge>
                  <span className="text-gray-600">
                    {new Date(burn.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <span className="font-semibold text-red-900">
                  {burn.amount.toFixed(4)} AURA
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white/60 p-4 rounded-lg border border-red-200">
          <h4 className="font-semibold text-red-900 mb-2">How It Works</h4>
          <ul className="text-sm text-red-800 space-y-1">
            <li>• 2% of every transaction is automatically burned</li>
            <li>• Burned tokens are redistributed to stakers</li>
            <li>• Rewards distributed 4 times daily</li>
            <li>• Proportional to your staking amount</li>
          </ul>
        </div>

        {/* CTA Buttons */}
        <div className="flex gap-3">
          <Link 
            to="/trading" 
            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-center font-medium transition-colors"
          >
            Start Staking
          </Link>
          <Link 
            to="/burn-redistribution" 
            className="flex-1 border border-red-300 text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg text-center font-medium transition-colors"
          >
            View Dashboard
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveBurnMetrics; 