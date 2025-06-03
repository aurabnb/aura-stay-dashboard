'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Users, MessageCircle, Heart, Share2, TrendingUp, RefreshCw, ExternalLink, Calendar, Wifi, WifiOff, Twitter, Linkedin } from 'lucide-react';
import { useSocialMetrics } from '@/hooks/useOptimizedApi';
import { MobileCard, MobileGrid, MobileSkeleton } from '@/components/ui/mobile-optimized';

interface CommunityMetric {
  platform: string;
  current: number;
  growth: number;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  url?: string;
}

interface GrowthData {
  date: string;
  twitter: number;
  telegram: number;
  linkedin: number;
}

interface ApiResponse {
  twitter: { followers: number; growth: number };
  telegram: { members: number; growth: number };
  linkedin: { followers: number; growth: number };
  lastUpdated: string;
}

const fallbackMetrics: CommunityMetric[] = [
  {
    platform: 'X (Twitter)',
    current: 15420,
    growth: 12.3,
    icon: Twitter,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    platform: 'Telegram',
    current: 8745,
    growth: 18.7,
    icon: MessageCircle,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50'
  },
  {
    platform: 'LinkedIn',
    current: 3250,
    growth: 9.4,
    icon: Linkedin,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50'
  }
];

// Mobile-optimized metric card
function MetricCard({ metric, isLoading }: { metric: CommunityMetric; isLoading: boolean }) {
  const Icon = metric.icon;

  if (isLoading) {
    return (
      <MobileCard className="p-4 sm:p-6">
        <div className="flex items-center space-x-3">
          <MobileSkeleton variant="circular" className="w-10 h-10 sm:w-12 sm:h-12" />
          <div className="flex-1 space-y-2">
            <MobileSkeleton variant="text" className="w-20 h-4" />
            <MobileSkeleton variant="text" className="w-16 h-6" />
            <MobileSkeleton variant="text" className="w-12 h-3" />
          </div>
        </div>
      </MobileCard>
    );
  }

  return (
    <MobileCard className="p-4 sm:p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-3 sm:space-x-4">
        <div className={`p-2 sm:p-3 rounded-lg ${metric.bgColor}`}>
          <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${metric.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
            {metric.platform}
          </p>
          <p className="text-lg sm:text-2xl font-bold text-gray-900">
            {metric.current.toLocaleString()}
          </p>
          <div className="flex items-center mt-1">
            <Badge 
              variant={metric.growth >= 0 ? 'default' : 'destructive'}
              className="text-xs px-2 py-0.5"
            >
              {metric.growth >= 0 ? '+' : ''}{metric.growth.toFixed(1)}%
            </Badge>
          </div>
        </div>
      </div>
    </MobileCard>
  );
}

export function CommunityGrowthMetrics() {
  const [metrics, setMetrics] = useState<CommunityMetric[]>(fallbackMetrics);
  const [mounted, setMounted] = useState(false);

  // Use optimized API hook
  const {
    data,
    loading: isLoading,
    error,
    refetch,
    isStale,
    lastFetch
  } = useSocialMetrics<ApiResponse>('/api/community-metrics', {
    enabled: mounted, // Only fetch after mount
    onSuccess: (data) => {
      // Update metrics with real data
      const updatedMetrics = [
        {
          ...fallbackMetrics[0],
          current: data.twitter.followers,
          growth: data.twitter.growth
        },
        {
          ...fallbackMetrics[1],
          current: data.telegram.members,
          growth: data.telegram.growth
        },
        {
          ...fallbackMetrics[2],
          current: data.linkedin.followers,
          growth: data.linkedin.growth
        }
      ];
      setMetrics(updatedMetrics);
    },
    onError: (error) => {
      console.error('Failed to fetch community metrics:', error);
      // Keep using fallback data on error
      setMetrics(fallbackMetrics);
    }
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalFollowers = metrics.reduce((sum, metric) => sum + metric.current, 0);
  const averageGrowth = metrics.length > 0 
    ? metrics.reduce((sum, metric) => sum + metric.growth, 0) / metrics.length 
    : 0;

  const handleRefresh = async () => {
    await refetch();
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Loading skeleton for initial load
  if (!mounted || isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Header skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <MobileSkeleton variant="text" className="w-48 sm:w-64 h-6 sm:h-8 mb-2" />
            <MobileSkeleton variant="text" className="w-72 sm:w-96 h-4" />
          </div>
          <MobileSkeleton variant="rectangular" className="w-20 h-8 sm:h-10" />
        </div>

        {/* Summary skeleton */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          <MobileCard className="p-4 sm:p-6">
            <MobileSkeleton variant="text" className="w-20 h-4 mb-2" />
            <MobileSkeleton variant="text" className="w-24 h-6 sm:h-8" />
          </MobileCard>
          <MobileCard className="p-4 sm:p-6">
            <MobileSkeleton variant="text" className="w-20 h-4 mb-2" />
            <MobileSkeleton variant="text" className="w-24 h-6 sm:h-8" />
          </MobileCard>
        </div>

        {/* Metrics skeleton */}
        <MobileGrid cols={{ default: 1, sm: 2, lg: 3 }} gap={4}>
          {[...Array(3)].map((_, i) => (
            <MetricCard key={i} metric={fallbackMetrics[i]} isLoading={true} />
          ))}
        </MobileGrid>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
            Community Growth
            {error ? (
              <WifiOff className="h-5 w-5 text-red-500" title="Offline - showing cached data" />
            ) : (
              <Wifi className="h-5 w-5 text-green-500" title="Live data" />
            )}
          </h2>
          <p className="text-sm sm:text-base text-gray-600 max-w-3xl">
            Real-time community metrics across all social platforms
          </p>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-3">
          {isStale && (
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              Stale
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <MobileCard className="p-4 sm:p-6">
          <div className="text-center sm:text-left">
            <p className="text-sm font-medium text-gray-600">Total Followers</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
              {totalFollowers.toLocaleString()}
            </p>
          </div>
        </MobileCard>
        
        <MobileCard className="p-4 sm:p-6">
          <div className="text-center sm:text-left">
            <p className="text-sm font-medium text-gray-600">Average Growth</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
              +{averageGrowth.toFixed(1)}%
            </p>
          </div>
        </MobileCard>
      </div>

      {/* Individual Platform Metrics */}
      <MobileGrid cols={{ default: 1, sm: 2, lg: 3 }} gap={4}>
        {metrics.map((metric, index) => (
          <MetricCard key={index} metric={metric} isLoading={false} />
        ))}
      </MobileGrid>

      {/* Status and Last Updated */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm text-gray-500 space-y-2 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${error ? 'bg-red-500' : 'bg-green-500'}`} />
            <span>{error ? 'Offline Mode' : 'Live Data'}</span>
          </div>
          {error && (
            <span className="text-orange-600">Using cached data</span>
          )}
        </div>
        
        {lastFetch && (
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>Updated {formatDate(lastFetch)}</span>
          </div>
        )}
      </div>
    </div>
  );
} 