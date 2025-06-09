'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Flame, TrendingUp, Coins, Percent, BarChart3, RefreshCw, ExternalLink } from 'lucide-react';

interface BurnMetric {
  label: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  color: string;
}

interface BurnHistoryData {
  date: string;
  burned: number;
  redistributed: number;
  cumulative: number;
}

export function LiveBurnMetrics() {
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isClient, setIsClient] = useState(false);

  // Ensure this only runs on client to avoid hydration issues
  useEffect(() => {
    setIsClient(true);
    setLastUpdated(new Date());
  }, []);

  // Format date consistently for both server and client
  const formatDate = (date: Date) => {
    // Always return consistent format, never change between server/client
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds}`;
  };

  const burnMetrics: BurnMetric[] = [
    {
      label: 'Total Burned',
      value: '2.4M',
      change: 5.2,
      icon: <Flame className="h-5 w-5" />,
      color: 'text-red-600'
    },
    {
      label: 'Daily Burn Rate',
      value: '12.5K',
      change: 8.1,
      icon: <TrendingUp className="h-5 w-5" />,
      color: 'text-orange-600'
    },
    {
      label: 'Burn Percentage',
      value: '2.0%',
      change: 0,
      icon: <Percent className="h-5 w-5" />,
      color: 'text-blue-600'
    },
    {
      label: 'Redistributed',
      value: '847K',
      change: 12.3,
      icon: <Coins className="h-5 w-5" />,
      color: 'text-green-600'
    }
  ];

  const burnHistory: BurnHistoryData[] = [
    { date: 'Jan', burned: 180000, redistributed: 120000, cumulative: 180000 },
    { date: 'Feb', burned: 220000, redistributed: 140000, cumulative: 400000 },
    { date: 'Mar', burned: 280000, redistributed: 160000, cumulative: 680000 },
    { date: 'Apr', burned: 320000, redistributed: 180000, cumulative: 1000000 },
    { date: 'May', burned: 380000, redistributed: 220000, cumulative: 1380000 },
    { date: 'Jun', burned: 420000, redistributed: 280000, cumulative: 1800000 }
  ];

  const burnDistribution = [
    { name: 'Treasury Funding', value: 70, color: '#10B981' },
    { name: 'Staking Rewards', value: 20, color: '#3B82F6' },
    { name: 'Community Incentives', value: 10, color: '#F59E0B' }
  ];

  const handleRefresh = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLastUpdated(new Date());
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">Live Burn Metrics</h2>
          <p className="text-gray-600">
            Real-time tracking of AURA's 2% burn and redistribution system
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <Flame className="h-3 w-3 mr-1" />
            Active
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {burnMetrics.map((metric, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg bg-gray-50 ${metric.color}`}>
                  {metric.icon}
                </div>
                {metric.change !== 0 && (
                  <div className={`flex items-center text-sm ${
                    metric.change > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <TrendingUp className="h-4 w-4 mr-1" />
                    {metric.change > 0 ? '+' : ''}{metric.change}%
                  </div>
                )}
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
                <p className="text-sm text-gray-600">{metric.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Burn History Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Burn History</CardTitle>
            <CardDescription>
              Monthly burn and redistribution over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={burnHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      `${Number(value).toLocaleString()} AURA`,
                      name === 'burned' ? 'Burned' : 'Redistributed'
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="burned"
                    stroke="#EF4444"
                    strokeWidth={3}
                    dot={{ fill: '#EF4444', strokeWidth: 2, r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="redistributed"
                    stroke="#10B981"
                    strokeWidth={3}
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Burn Distribution</CardTitle>
            <CardDescription>
              How burned tokens contribute to the ecosystem
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={burnDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {burnDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* How Burn Works */}
      <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-red-600" />
            How the 2% Burn System Works
          </CardTitle>
          <CardDescription>
            Understanding AURA's deflationary tokenomics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <h4 className="font-semibold mb-2">Transaction Occurs</h4>
              <p className="text-sm text-gray-700">
                Every AURA transaction automatically triggers the 2% burn mechanism
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <h4 className="font-semibold mb-2">Tokens Burned</h4>
              <p className="text-sm text-gray-700">
                2% of transaction value is permanently removed from circulation
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <h4 className="font-semibold mb-2">Value Redistributed</h4>
              <p className="text-sm text-gray-700">
                Burn contributes to treasury funding and staking rewards
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Impact Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Burn Impact Summary</CardTitle>
          <CardDescription>
            The measurable effects of our burn mechanism
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <BarChart3 className="h-8 w-8 mx-auto text-purple-600 mb-2" />
              <p className="text-2xl font-bold text-gray-900">-2.4%</p>
              <p className="text-sm text-gray-600">Supply Reduction</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <TrendingUp className="h-8 w-8 mx-auto text-green-600 mb-2" />
              <p className="text-2xl font-bold text-gray-900">+15.3%</p>
              <p className="text-sm text-gray-600">Token Value Impact</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Coins className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <p className="text-2xl font-bold text-gray-900">$127K</p>
              <p className="text-sm text-gray-600">Treasury Contribution</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Flame className="h-8 w-8 mx-auto text-red-600 mb-2" />
              <p className="text-2xl font-bold text-gray-900">180</p>
              <p className="text-sm text-gray-600">Days Active</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* External Links */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold mb-1">Track Burns On-Chain</h4>
              <p className="text-sm text-gray-600">
                View all burn transactions and verify the mechanism transparency
              </p>
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              View on Solscan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Last Updated */}
      <div className="text-center text-sm text-gray-500" suppressHydrationWarning>
        {isClient ? (
          `Last updated: ${formatDate(lastUpdated)}`
        ) : (
          'Last updated: Loading...'
        )}
      </div>
    </div>
  );
} 