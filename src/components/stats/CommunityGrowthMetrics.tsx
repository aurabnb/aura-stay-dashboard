'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Users, MessageCircle, Heart, Share2, TrendingUp, RefreshCw, ExternalLink, Calendar } from 'lucide-react';

interface CommunityMetric {
  platform: string;
  current: number;
  growth: number;
  icon: React.ReactNode;
  color: string;
  url: string;
}

interface GrowthData {
  date: string;
  twitter: number;
  telegram: number;
  linkedin: number;
}

export function CommunityGrowthMetrics() {
  const [isClient, setIsClient] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const metrics: CommunityMetric[] = [
    {
      platform: 'Twitter',
      current: 2847,
      growth: 12.3,
      icon: <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs">T</div>,
      color: 'text-blue-600',
      url: 'https://twitter.com/aura_bnb'
    },
    {
      platform: 'Telegram',
      current: 1284,
      growth: 18.7,
      icon: <div className="w-6 h-6 bg-cyan-600 rounded-full flex items-center justify-center text-white text-xs">T</div>,
      color: 'text-cyan-600',
      url: 'https://t.me/aura_bnb'
    },
    {
      platform: 'LinkedIn',
      current: 892,
      growth: 9.4,
      icon: <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs">L</div>,
      color: 'text-indigo-600',
      url: 'https://linkedin.com/company/aura-bnb'
    }
  ];

  const growthData: GrowthData[] = [
    { date: 'Jan', twitter: 1200, telegram: 450, linkedin: 300 },
    { date: 'Feb', twitter: 1450, telegram: 580, linkedin: 380 },
    { date: 'Mar', twitter: 1750, telegram: 720, linkedin: 450 },
    { date: 'Apr', twitter: 2100, telegram: 890, linkedin: 580 },
    { date: 'May', twitter: 2450, telegram: 1050, linkedin: 720 },
    { date: 'Jun', twitter: 2847, telegram: 1284, linkedin: 892 }
  ];

  const totalFollowers = metrics.reduce((sum, metric) => sum + metric.current, 0);
  const averageGrowth = metrics.reduce((sum, metric) => sum + metric.growth, 0) / metrics.length;

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLastUpdated(new Date());
    setIsRefreshing(false);
  };

  const formatDate = (date: Date) => {
    return date.toISOString().replace('T', ' ').substr(0, 19);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Community Growth</h2>
          <p className="text-muted-foreground">Track our community expansion across platforms</p>
        </div>
        <Button onClick={handleRefresh} variant="outline" disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Total Community</p>
                <p className="text-2xl font-bold">{totalFollowers.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Across all platforms</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Average Growth</p>
                <p className="text-2xl font-bold">+{averageGrowth.toFixed(1)}%</p>
                <p className="text-xs text-gray-500">Past 30 days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Heart className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-sm text-gray-600">Engagement Rate</p>
                <p className="text-2xl font-bold">4.7%</p>
                <p className="text-xs text-gray-500">Above average</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metrics.map((metric, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`${metric.color}`}>
                    {metric.icon}
                  </div>
                  <CardTitle className="text-lg">{metric.platform}</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(metric.url, '_blank')}
                  className="h-8 w-8 p-0"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-3xl font-bold">{metric.current.toLocaleString()}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-green-600 font-medium">+{metric.growth}%</span>
                    <span className="text-gray-500 text-sm">this month</span>
                  </div>
                </div>
                
                <div className="pt-2">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Growth Target</span>
                    <span>{((metric.growth / 20) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full bg-gradient-to-r ${
                        metric.platform === 'Twitter' ? 'from-blue-500 to-blue-600' :
                        metric.platform === 'Telegram' ? 'from-cyan-500 to-cyan-600' :
                        'from-indigo-500 to-indigo-600'
                      }`}
                      style={{ width: `${Math.min((metric.growth / 20) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Growth Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Community Growth Over Time</CardTitle>
          <CardDescription>
            Follower growth across all platforms over the past 6 months
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [value, typeof name === 'string' ? name.charAt(0).toUpperCase() + name.slice(1) : name]}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="twitter"
                  stackId="1"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.7}
                />
                <Area
                  type="monotone"
                  dataKey="telegram"
                  stackId="1"
                  stroke="#06B6D4"
                  fill="#06B6D4"
                  fillOpacity={0.7}
                />
                <Area
                  type="monotone"
                  dataKey="linkedin"
                  stackId="1"
                  stroke="#6366F1"
                  fill="#6366F1"
                  fillOpacity={0.7}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Community Highlights */}
      <Card className="bg-gradient-to-r from-gray-50 to-gray-100">
        <CardHeader>
          <CardTitle>Community Highlights</CardTitle>
          <CardDescription>
            Recent achievements and milestones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Recent Milestones</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span>Reached 1,000 Telegram members</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span>2,500 Twitter followers milestone</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  <span>Featured in 5 crypto publications</span>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Engagement Stats</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-bold text-gray-900">127</p>
                  <p className="text-sm text-gray-600">Daily active members</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">89%</p>
                  <p className="text-sm text-gray-600">Member retention</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Last Updated */}
      <div className="text-center text-sm text-gray-500">
        <div className="flex items-center justify-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>
            Last updated: {isClient ? formatDate(lastUpdated) : 'Loading...'}
          </span>
        </div>
      </div>
    </div>
  );
} 