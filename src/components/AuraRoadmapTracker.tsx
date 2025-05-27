
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, Clock, Target, Building, Shield, Coins } from 'lucide-react';

type RoadmapStatus = 'completed' | 'in-progress' | 'upcoming';

const AuraRoadmapTracker = () => {
  const roadmapItems = [
    {
      id: 1,
      title: 'Aurabnb Pilot',
      description: 'Complete first decentralized Volcano stay in Guayabo, Costa Rica',
      status: 'in-progress' as RoadmapStatus,
      progress: 20,
      icon: Building,
      details: 'Currently 1/5th funded through LP rewards'
    },
    {
      id: 2,
      title: 'Decentralized Trust',
      description: 'Open Guernsey Decentralized trust structure to hold all assets',
      status: 'upcoming' as RoadmapStatus,
      progress: 0,
      icon: Shield,
      details: 'Legal framework for transparent asset management'
    },
    {
      id: 3,
      title: 'Money Market',
      description: 'Integrate with Cosmos for Money Market with additional utility and features',
      status: 'upcoming' as RoadmapStatus,
      progress: 0,
      icon: Coins,
      details: 'Enhanced DeFi functionality for AURA holders'
    },
    {
      id: 4,
      title: 'Additional Locations',
      description: 'Complete two additional Airbnbs to ensure continuity in funding and progress',
      status: 'upcoming' as RoadmapStatus,
      progress: 0,
      icon: Target,
      details: 'Expand the AURA eco-stay network'
    }
  ];

  const getStatusIcon = (status: RoadmapStatus, progress: number) => {
    if (status === 'completed') return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (status === 'in-progress') return <Clock className="h-5 w-5 text-blue-600" />;
    return <Circle className="h-5 w-5 text-gray-400" />;
  };

  const getStatusColor = (status: RoadmapStatus) => {
    if (status === 'completed') return 'bg-green-100 text-green-800 border-green-200';
    if (status === 'in-progress') return 'bg-blue-100 text-blue-800 border-blue-200';
    return 'bg-gray-100 text-gray-600 border-gray-200';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AURA Pilot Roadmap</CardTitle>
        <CardDescription>
          Track our progress through the initial phases of the decentralized travel network
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {roadmapItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={item.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 pt-1">
                {getStatusIcon(item.status, item.progress)}
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-gray-600" />
                    <h3 className="font-semibold">{item.title}</h3>
                  </div>
                  <Badge variant="outline" className={getStatusColor(item.status)}>
                    {item.status === 'completed' && 'Completed'}
                    {item.status === 'in-progress' && 'In Progress'}
                    {item.status === 'upcoming' && 'Upcoming'}
                  </Badge>
                </div>
                
                <p className="text-gray-700 text-sm">{item.description}</p>
                
                {item.status === 'in-progress' && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-gray-600">Progress</span>
                      <span className="text-xs text-gray-500">{item.progress}%</span>
                    </div>
                    <Progress value={item.progress} className="h-2" />
                  </div>
                )}
                
                <p className="text-xs text-gray-600 bg-white p-2 rounded border">
                  {item.details}
                </p>
              </div>
            </div>
          );
        })}
        
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
