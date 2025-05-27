
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Hammer, Calendar, DollarSign, Truck, Users, Wrench, Camera, Video } from 'lucide-react';

interface ConstructionMilestone {
  phase: string;
  description: string;
  startDate: string;
  endDate: string;
  progress: number;
  cost: number;
  status: 'completed' | 'in-progress' | 'pending' | 'delayed';
}

interface CostBreakdown {
  category: string;
  budgeted: number;
  spent: number;
  remaining: number;
  icon: React.ElementType;
}

const ConstructionSection: React.FC = () => {
  const milestones: ConstructionMilestone[] = [
    {
      phase: 'Site Preparation',
      description: 'Land clearing, access roads, utilities',
      startDate: '2025-06-01',
      endDate: '2025-07-15',
      progress: 0,
      cost: 15000,
      status: 'pending'
    },
    {
      phase: 'Foundation & Structure',
      description: 'Concrete foundation, bamboo frame construction',
      startDate: '2025-07-16',
      endDate: '2025-10-30',
      progress: 0,
      cost: 35000,
      status: 'pending'
    },
    {
      phase: 'Roofing & Weatherproofing',
      description: 'Sustainable roofing, windows, exterior finish',
      startDate: '2025-11-01',
      endDate: '2025-12-15',
      progress: 0,
      cost: 25000,
      status: 'pending'
    },
    {
      phase: 'Solar & Electrical',
      description: 'Solar panel installation, electrical systems',
      startDate: '2025-12-16',
      endDate: '2026-01-30',
      progress: 0,
      cost: 20000,
      status: 'pending'
    },
    {
      phase: 'Interior & Plumbing',
      description: 'Interior finishing, bathroom, kitchen setup',
      startDate: '2026-02-01',
      endDate: '2026-03-15',
      progress: 0,
      cost: 18000,
      status: 'pending'
    },
    {
      phase: 'Landscaping & Final',
      description: 'Gardens, pathways, final inspections',
      startDate: '2026-03-16',
      endDate: '2026-04-30',
      progress: 0,
      cost: 12000,
      status: 'pending'
    }
  ];

  const costBreakdown: CostBreakdown[] = [
    {
      category: 'Materials',
      budgeted: 65000,
      spent: 0,
      remaining: 65000,
      icon: Hammer
    },
    {
      category: 'Labor',
      budgeted: 40000,
      spent: 0,
      remaining: 40000,
      icon: Users
    },
    {
      category: 'Equipment',
      budgeted: 15000,
      spent: 0,
      remaining: 15000,
      icon: Truck
    },
    {
      category: 'Permits & Legal',
      budgeted: 5000,
      spent: 0,
      remaining: 5000,
      icon: Wrench
    }
  ];

  const totalBudget = costBreakdown.reduce((sum, item) => sum + item.budgeted, 0);
  const totalSpent = costBreakdown.reduce((sum, item) => sum + item.spent, 0);
  const totalRemaining = costBreakdown.reduce((sum, item) => sum + item.remaining, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'in-progress': return 'bg-gray-200 text-gray-800';
      case 'delayed': return 'bg-gray-300 text-gray-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Construction Schedule
          </CardTitle>
          <CardDescription>
            Volcano Stay project timeline and progress tracking - Construction starts June 2025
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {milestones.map((milestone, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{milestone.phase}</h4>
                    <p className="text-sm text-gray-600 mb-2">{milestone.description}</p>
                    <div className="flex gap-4 text-sm text-gray-500">
                      <span>Start: {new Date(milestone.startDate).toLocaleDateString()}</span>
                      <span>End: {new Date(milestone.endDate).toLocaleDateString()}</span>
                      <span>Cost: ${milestone.cost.toLocaleString()}</span>
                    </div>
                  </div>
                  <Badge className={getStatusColor(milestone.status)}>
                    {milestone.status.replace('-', ' ').toUpperCase()}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span className="font-semibold">{milestone.progress}%</span>
                  </div>
                  <Progress 
                    value={milestone.progress} 
                    className="h-2"
                    style={{
                      backgroundColor: '#f3f4f6'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Construction Costs
          </CardTitle>
          <CardDescription>
            Budget breakdown and spending tracking - Construction not yet started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Overall Budget Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">${totalBudget.toLocaleString()}</div>
                <div className="text-sm text-gray-700">Total Budget</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">${totalSpent.toLocaleString()}</div>
                <div className="text-sm text-gray-700">Total Spent</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">${totalRemaining.toLocaleString()}</div>
                <div className="text-sm text-gray-700">Remaining</div>
              </div>
            </div>

            {/* Overall Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Budget Utilization</span>
                <span className="font-semibold">0%</span>
              </div>
              <Progress value={0} className="h-3" />
            </div>

            {/* Cost Breakdown by Category */}
            <div className="space-y-4">
              <h4 className="font-semibold">Cost Breakdown by Category</h4>
              {costBreakdown.map((item, index) => {
                const Icon = item.icon;
                
                return (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-gray-600" />
                        <span className="font-medium">{item.category}</span>
                      </div>
                      <span className="text-sm text-gray-600">
                        0% utilized
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm mb-2">
                      <div>
                        <p className="text-gray-600">Budgeted</p>
                        <p className="font-semibold">${item.budgeted.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Spent</p>
                        <p className="font-semibold text-gray-600">${item.spent.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Remaining</p>
                        <p className="font-semibold">${item.remaining.toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <Progress value={0} className="h-2" />
                  </div>
                );
              })}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">Project Status</h4>
              <p className="text-gray-700 text-sm">
                Construction is scheduled to begin in June 2025. All permits and planning are currently in progress. 
                Progress photos and videos will be posted here once construction begins.
              </p>
              <p className="text-xs text-gray-600 mt-2">Last updated: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Progress Documentation
          </CardTitle>
          <CardDescription>
            Construction photos and videos will be posted here as work progresses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <div className="flex justify-center items-center gap-4 mb-4">
              <Camera className="h-12 w-12 text-gray-400" />
              <Video className="h-12 w-12 text-gray-400" />
            </div>
            <h4 className="text-xl font-semibold text-gray-600 mb-2">Coming Soon</h4>
            <p className="text-gray-500">
              Progress photos and videos will be uploaded here once construction begins in June 2025
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConstructionSection;
