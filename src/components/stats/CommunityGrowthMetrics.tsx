'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Users, MessageCircle, Heart, Share2, TrendingUp, RefreshCw, ExternalLink } from 'lucide-react';

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
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const metrics: CommunityMetric[] = [
    {
      platform: 'Twitter',
      current: 2834,
      growth: 12.5,
      icon: <Share2 className="h-5 w-5" />,
      color: 'text-blue-600',
      url: 'https://twitter.com/Aura_bnb'
    },
    {
      platform: 'Telegram',
      current: 1247,
      growth: 8.3,
      icon: <MessageCircle className="h-5 w-5" />,
      color: 'text-cyan-600',
      url: 'https://t.me/aurabnb'
    },
    {
      platform: 'LinkedIn',
      current: 456,
      growth: 15.2,
      icon: <Users className="h-5 w-5" />,
      color: 'text-indigo-600',
      url: 'https://www.linkedin.com/company/aura-bnb/'
    }
  ];

  const growthData: GrowthData[] = [
    { date: 'Jan', twitter: 1200, telegram: 800, linkedin: 200 },
    { date: 'Feb', twitter: 1450, telegram: 920, linkedin: 250 },
    { date: 'Mar', twitter: 1700, telegram: 1050, linkedin: 300 },
    { date: 'Apr', twitter: 2100, telegram: 1150, linkedin: 350 },
    { date: 'May', twitter: 2500, telegram: 1200, linkedin: 400 },
    { date: 'Jun', twitter: 2834, telegram: 1247, linkedin: 456 }
  ];

  const handleRefresh = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLastUpdated(new Date());
    setLoading(false);
  };

  const totalFollowers = metrics.reduce((sum, metric) => sum + metric.current, 0);
  const averageGrowth = metrics.reduce((sum, metric) => sum + metric.growth, 0) / metrics.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">Community Growth</h2>
          <p className="text-gray-600">
            Track our growing community across all platforms
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <TrendingUp className="h-3 w-3 mr-1" />
            Growing
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
        Last updated: {lastUpdated.toLocaleString()}
      </div>
    </div>
  );
} 