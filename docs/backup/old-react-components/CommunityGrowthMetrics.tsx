import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, MessageCircle, Briefcase, TrendingUp } from 'lucide-react';
import { fetchSocialMetrics, SocialMetrics } from '@/api/socialMedia';

interface CommunityMetrics extends SocialMetrics {
  totalMembers: number;
}

const CommunityGrowthMetrics: React.FC = () => {
  const [metrics, setMetrics] = useState<CommunityMetrics>({
    xFollowers: 0,
    telegramMembers: 0,
    linkedinFollowers: 0,
    totalMembers: 0,
    lastUpdated: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch community metrics from APIs
  const fetchCommunityMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const socialData = await fetchSocialMetrics();
      
      const currentMetrics = {
        ...socialData,
        totalMembers: socialData.xFollowers + socialData.telegramMembers + socialData.linkedinFollowers
      };
      
      setMetrics(currentMetrics);
    } catch (err) {
      setError('Failed to fetch community metrics');
      console.error('Error fetching community metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunityMetrics();
    
    // Update metrics every 5 minutes
    const interval = setInterval(fetchCommunityMetrics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-red-600 text-center">
            <p className="font-medium">Error loading community metrics</p>
            <p className="text-sm mt-1">{error}</p>
            <button
              onClick={fetchCommunityMetrics}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const communityPlatforms = [
    {
      name: 'X (Twitter)',
      count: metrics.xFollowers,
      icon: <MessageCircle className="h-5 w-5" />,
      color: 'bg-blue-500',
      link: 'https://x.com/aurabnb'
    },
    {
      name: 'Telegram',
      count: metrics.telegramMembers,
      icon: <Users className="h-5 w-5" />,
      color: 'bg-blue-400',
      link: 'https://t.me/aurabnb'
    },
    {
      name: 'LinkedIn',
      count: metrics.linkedinFollowers,
      icon: <Briefcase className="h-5 w-5" />,
      color: 'bg-blue-600',
      link: 'https://linkedin.com/company/aurabnb'
    },
    {
      name: 'Total Community',
      count: metrics.totalMembers,
      icon: <TrendingUp className="h-5 w-5" />,
      color: 'bg-black',
      link: null
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Community Growth</h3>
        <p className="text-gray-600">Real-time community metrics across all platforms</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {communityPlatforms.map((platform, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`${platform.color} text-white p-2 rounded-lg`}>
                  {platform.icon}
                </div>
                <Badge variant="outline" className="text-xs">
                  Live
                </Badge>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">{platform.name}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {platform.count.toLocaleString()}
                </p>
                
                {platform.link && (
                  <a
                    href={platform.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Visit →
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="text-center text-sm text-gray-500">
        <p>Metrics update automatically every 5 minutes</p>
        <p className="mt-1">
          Last updated: {metrics.lastUpdated ? new Date(metrics.lastUpdated).toLocaleString() : 'Never'}
        </p>
      </div>
    </div>
  );
};

export default CommunityGrowthMetrics; 