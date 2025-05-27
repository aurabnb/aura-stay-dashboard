import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, MapPin, Target } from 'lucide-react';

const AuraStats = () => {
  const stats = [
    {
      title: 'X (Twitter) Followers',
      value: 'Check Live',
      description: '@Aura_bnb',
      icon: Users,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      link: 'https://x.com/Aura_bnb'
    },
    {
      title: 'Telegram Members',
      value: 'Check Live',
      description: 'Community group',
      icon: Users,
      color: 'text-gray-700',
      bgColor: 'bg-gray-50',
      link: 'https://t.me/+_3_OC0_hoY5mYWE5'
    },
    {
      title: 'LinkedIn Followers',
      value: 'Check Live',
      description: 'Company page',
      icon: Users,
      color: 'text-gray-800',
      bgColor: 'bg-gray-50',
      link: 'https://www.linkedin.com/company/aura-bnb/'
    },
    {
      title: 'Properties in Pipeline',
      value: '1',
      description: 'Eco-stay planned',
      icon: MapPin,
      color: 'text-black',
      bgColor: 'bg-gray-100'
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
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Community Growth</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.slice(0, 3).map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
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
