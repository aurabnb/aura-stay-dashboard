
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, Clock, Rocket } from 'lucide-react';

interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'upcoming';
  category: 'pilot' | 'infrastructure' | 'expansion' | 'ecosystem';
}

const RoadmapTracker = () => {
  const roadmapItems: RoadmapItem[] = [
    {
      id: '1',
      title: 'Aurabnb Pilot',
      description: 'Complete first decentralized Volcano stay in Guayabo, Costa Rica.',
      status: 'in-progress',
      category: 'pilot'
    },
    {
      id: '2',
      title: 'Decentralized Trust',
      description: 'Open Guernsey Decentralized trust structure to hold all assets.',
      status: 'upcoming',
      category: 'infrastructure'
    },
    {
      id: '3',
      title: 'Money Market',
      description: 'Integrate with Cosmos for Money Market with additional utility and features.',
      status: 'upcoming',
      category: 'infrastructure'
    },
    {
      id: '4',
      title: 'Additional Locations',
      description: 'Complete two additional Airbnbs to ensure continuity in funding and progress.',
      status: 'upcoming',
      category: 'expansion'
    },
    {
      id: '5',
      title: 'Rebrand',
      description: 'Complete rebrand of Aurabnb using the same name, new website and visuals.',
      status: 'upcoming',
      category: 'pilot'
    },
    {
      id: '6',
      title: 'Build Treasury',
      description: 'Build treasury of Liquidity Provision and promising projects on balance sheet.',
      status: 'in-progress',
      category: 'infrastructure'
    },
    {
      id: '7',
      title: 'Aurabnb MVP',
      description: 'Complete MVP platform to automate booking, governance, and payments.',
      status: 'upcoming',
      category: 'pilot'
    },
    {
      id: '8',
      title: 'Seed Raise for Samsara',
      description: 'Begin Seed Raise for Samsara in Dominical, a 45 unit eco community.',
      status: 'upcoming',
      category: 'expansion'
    },
    {
      id: '9',
      title: 'Airdrop to Aura Holders',
      description: 'Airdrop token holders a percentage of Samsara tokens, release seed token.',
      status: 'upcoming',
      category: 'ecosystem'
    },
    {
      id: '10',
      title: 'Complete Samsara',
      description: 'Complete Samsara and host events, hackathons, and retreats to showcase.',
      status: 'upcoming',
      category: 'expansion'
    },
    {
      id: '11',
      title: 'Prasaga Integration',
      description: 'Integrate Prasaga for transparency metrics for supply chain and financials.',
      status: 'upcoming',
      category: 'infrastructure'
    },
    {
      id: '12',
      title: 'Airscape MVP',
      description: 'Complete Airscape MVP while integrating Aurabnb and Samsara economy.',
      status: 'upcoming',
      category: 'ecosystem'
    },
    {
      id: '13',
      title: 'Raise for Airscape',
      description: 'Begin raise for Airscape acquisition trust to purchase land and fund properties.',
      status: 'upcoming',
      category: 'ecosystem'
    },
    {
      id: '14',
      title: 'More Aurabnb locations',
      description: 'Expand the network of boutique decentralized stays.',
      status: 'upcoming',
      category: 'expansion'
    },
    {
      id: '15',
      title: 'More larger builds',
      description: 'Use community governance to select new locations for more larger builds.',
      status: 'upcoming',
      category: 'expansion'
    },
    {
      id: '16',
      title: 'Fully integrated Eco',
      description: 'All ecosystems integrated into Airscape, fund large and small locations.',
      status: 'upcoming',
      category: 'ecosystem'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'in-progress':
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'upcoming':
        return <Circle className="h-5 w-5 text-gray-400" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'upcoming':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'pilot':
        return 'bg-purple-100 text-purple-800';
      case 'infrastructure':
        return 'bg-yellow-100 text-yellow-800';
      case 'expansion':
        return 'bg-green-100 text-green-800';
      case 'ecosystem':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const completedCount = roadmapItems.filter(item => item.status === 'completed').length;
  const inProgressCount = roadmapItems.filter(item => item.status === 'in-progress').length;
  const totalCount = roadmapItems.length;
  const progressPercentage = ((completedCount + inProgressCount * 0.5) / totalCount) * 100;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Rocket className="h-5 w-5 text-blue-600" />
          AURA Roadmap Progress
        </CardTitle>
        <CardDescription>
          Track our journey from boutique stays to a fully integrated travel ecosystem
        </CardDescription>
        <div className="flex items-center gap-4 mt-4">
          <div className="text-sm">
            <span className="font-semibold">{completedCount}</span> completed
          </div>
          <div className="text-sm">
            <span className="font-semibold">{inProgressCount}</span> in progress
          </div>
          <div className="text-sm">
            <span className="font-semibold">{totalCount - completedCount - inProgressCount}</span> upcoming
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          {roadmapItems.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-lg border transition-all ${
                item.status === 'completed' 
                  ? 'bg-green-50 border-green-200' 
                  : item.status === 'in-progress'
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {getStatusIcon(item.status)}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{item.title}</h4>
                    <div className="flex gap-2">
                      <Badge className={getCategoryColor(item.category)} variant="outline">
                        {item.category}
                      </Badge>
                      <Badge className={getStatusColor(item.status)}>
                        {item.status === 'in-progress' ? 'In Progress' : 
                         item.status === 'completed' ? 'Completed' : 'Upcoming'}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RoadmapTracker;
