
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, MapPin, Target, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSocialMetrics } from '@/hooks/useSocialMetrics';

const AuraStats = () => {
  const { metrics, refreshMetrics, isLoading } = useSocialMetrics();

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const stats = [
    {
      title: 'X (Twitter) Followers',
      value: metrics.twitter.error ? 'Check Live' : formatNumber(metrics.twitter.followers),
      description: '@Aura_bnb',
      icon: Users,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      link: 'https://x.com/Aura_bnb',
      isLoading: metrics.twitter.isLoading,
      hasError: !!metrics.twitter.error
    },
    {
      title: 'Telegram Members',
      value: metrics.telegram.error ? 'Check Live' : formatNumber(metrics.telegram.members),
      description: 'Community group',
      icon: Users,
      color: 'text-gray-700',
      bgColor: 'bg-gray-50',
      link: 'https://t.me/+_3_OC0_hoY5mYWE5',
      isLoading: metrics.telegram.isLoading,
      hasError: !!metrics.telegram.error
    },
    {
      title: 'LinkedIn Followers',
      value: metrics.linkedin.error ? 'Check Live' : formatNumber(metrics.linkedin.followers),
      description: 'Company page',
      icon: Users,
      color: 'text-gray-800',
      bgColor: 'bg-gray-50',
      link: 'https://www.linkedin.com/company/aura-bnb/',
      isLoading: metrics.linkedin.isLoading,
      hasError: !!metrics.linkedin.error
    },
    {
      title: 'Properties in Pipeline',
      value: '1',
      description: 'Eco-stay planned',
      icon: MapPin,
      color: 'text-black',
      bgColor: 'bg-gray-100',
      isLoading: false,
      hasError: false
    }
  ];

  const growthTarget = {
    title: 'Growth Target',
    value: '15',
    description: 'Properties by Year 1',
    icon: Target,
    color: 'text-black',
    bgColor: 'bg-black',
    iconColor: 'text-white'
  };

  return (
    <div className="space-y-6">
      {/* Community Metrics */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Community Growth</h3>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshMetrics}
              disabled={isLoading}
              className="text-gray-600 hover:text-black"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            {metrics.lastUpdated && (
              <span className="text-xs text-gray-500">
                Last updated: {metrics.lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.slice(0, 3).map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">{stat.title}</p>
                      <div className="flex items-center gap-2 mb-1">
                        <p className={`text-2xl font-bold ${stat.hasError ? 'text-red-500' : 'text-gray-900'}`}>
                          {stat.isLoading ? (
                            <span className="animate-pulse">Loading...</span>
                          ) : (
                            stat.value
                          )}
                        </p>
                        {stat.isLoading && (
                          <RefreshCw className="h-4 w-4 animate-spin text-gray-400" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500">{stat.description}</p>
                      {stat.link && (
                        <a 
                          href={stat.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-gray-700 hover:text-black transition-colors mt-1 inline-block font-medium"
                        >
                          Visit →
                        </a>
                      )}
                    </div>
                    <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Project Metrics */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Project Progress</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Properties in Pipeline */}
          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">{stats[3].title}</p>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{stats[3].value}</p>
                  <p className="text-xs text-gray-500">{stats[3].description}</p>
                </div>
                <div className={`w-12 h-12 ${stats[3].bgColor} rounded-lg flex items-center justify-center`}>
                  <MapPin className={`w-6 h-6 ${stats[3].color}`} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Growth Target */}
          <Card className="border-none shadow-lg bg-black text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-300 mb-2">{growthTarget.title}</p>
                  <p className="text-3xl font-bold text-white mb-1">{growthTarget.value}</p>
                  <p className="text-xs text-gray-400">{growthTarget.description}</p>
                </div>
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-black" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AuraStats;
