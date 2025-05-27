
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, Clock, Target, Building, Shield, Coins, Map, Palette, TrendingUp, Rocket, Zap, Users, MapPin, TreePine, Globe } from 'lucide-react';

type RoadmapStatus = 'completed' | 'in-progress' | 'upcoming';

const AuraRoadmapTracker = () => {
  const roadmapItems = [
    {
      id: 1,
      title: 'Aurabnb Pilot',
      description: 'Complete first decentralized Volcano stay in Guayabo, Costa Rica.',
      status: 'in-progress' as RoadmapStatus,
      progress: 20,
      icon: Building
    },
    {
      id: 2,
      title: 'Decentralized Trust',
      description: 'Open Guernsey Decentralized trust structure to hold all assets.',
      status: 'upcoming' as RoadmapStatus,
      progress: 0,
      icon: Shield
    },
    {
      id: 3,
      title: 'Money Market',
      description: 'Integrate with Cosmos for Money Market with additional utility and features.',
      status: 'upcoming' as RoadmapStatus,
      progress: 0,
      icon: Coins
    },
    {
      id: 4,
      title: 'Additional Locations',
      description: 'Complete two additional Airbnbs to ensure continuity in funding and progress.',
      status: 'upcoming' as RoadmapStatus,
      progress: 0,
      icon: Map
    },
    {
      id: 5,
      title: 'Rebrand',
      description: 'Complete rebrand of Aurabnb using the same name, new website and visuals.',
      status: 'upcoming' as RoadmapStatus,
      progress: 0,
      icon: Palette
    },
    {
      id: 6,
      title: 'Build Treasury',
      description: 'Build treasury of Liquidity Provision and promising projects on balance sheet.',
      status: 'in-progress' as RoadmapStatus,
      progress: 15,
      icon: TrendingUp
    },
    {
      id: 7,
      title: 'Aurabnb MVP',
      description: 'Complete MVP platform to automate booking, governance, and payments.',
      status: 'upcoming' as RoadmapStatus,
      progress: 0,
      icon: Rocket
    },
    {
      id: 8,
      title: 'Seed Raise for Samsara',
      description: 'Begin Seed Raise for Samsara in Dominical, a 45 unit eco community.',
      status: 'upcoming' as RoadmapStatus,
      progress: 0,
      icon: TreePine
    },
    {
      id: 9,
      title: 'Airdrop to Aura Holders',
      description: 'Airdrop token holders a percentage of Samsara tokens, release seed token.',
      status: 'upcoming' as RoadmapStatus,
      progress: 0,
      icon: Zap
    },
    {
      id: 10,
      title: 'Complete Samsara',
      description: 'Complete Samsara and host events, hackathons, and retreats to showcase.',
      status: 'upcoming' as RoadmapStatus,
      progress: 0,
      icon: Users
    },
    {
      id: 11,
      title: 'Prasaga Integration',
      description: 'Integrate Prasaga for transparency metrics for supply chain and financials.',
      status: 'upcoming' as RoadmapStatus,
      progress: 0,
      icon: Shield
    },
    {
      id: 12,
      title: 'Airscape MVP',
      description: 'Complete Airscape MVP while integrating Aurabnb and Samsara economy.',
      status: 'upcoming' as RoadmapStatus,
      progress: 0,
      icon: Globe
    },
    {
      id: 13,
      title: 'Raise for Airscape',
      description: 'Begin raise for Airscape acquisition trust to purchase land and fund properties.',
      status: 'upcoming' as RoadmapStatus,
      progress: 0,
      icon: Target
    },
    {
      id: 14,
      title: 'More Aurabnb locations',
      description: 'Expand the network of boutique decentralized stays.',
      status: 'upcoming' as RoadmapStatus,
      progress: 0,
      icon: MapPin
    },
    {
      id: 15,
      title: 'More larger builds',
      description: 'Use community governance to select new locations for more larger builds.',
      status: 'upcoming' as RoadmapStatus,
      progress: 0,
      icon: Building
    },
    {
      id: 16,
      title: 'Fully integrated Eco',
      description: 'All ecosystems integrated into Airscape, fund large and small locations.',
      status: 'upcoming' as RoadmapStatus,
      progress: 0,
      icon: Globe
    }
  ];

  const getStatusIcon = (status: RoadmapStatus, progress: number) => {
    if (status === 'completed') return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (status === 'in-progress') return <Clock className="h-4 w-4 text-blue-600" />;
    return <Circle className="h-4 w-4 text-gray-400" />;
  };

  const getStatusColor = (status: RoadmapStatus) => {
    if (status === 'completed') return 'bg-green-100 text-green-800 border-green-200';
    if (status === 'in-progress') return 'bg-blue-100 text-blue-800 border-blue-200';
    return 'bg-gray-100 text-gray-600 border-gray-200';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AURA Complete Roadmap</CardTitle>
        <CardDescription>
          From pilot to fully integrated travel ecosystem - 16 key milestones
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roadmapItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={item.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 pt-1">
                  {getStatusIcon(item.status, item.progress)}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-gray-800">{item.id}.</span>
                      <Icon className="h-4 w-4 text-gray-600" />
                      <h3 className="font-semibold text-sm">{item.title}</h3>
                    </div>
                    {item.status === 'in-progress' && (
                      <Badge variant="outline" className={getStatusColor(item.status)}>
                        {item.progress}%
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-gray-700 text-xs leading-relaxed">{item.description}</p>
                  
                  {item.status === 'in-progress' && (
                    <Progress value={item.progress} className="h-1" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="border-t pt-4 mt-6">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-800">Current Focus</span>
            </div>
            <p className="text-green-700 text-sm">
              Building the world's first fully decentralized eco-stay with complete community ownership and transparent funding through LP rewards.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuraRoadmapTracker;
