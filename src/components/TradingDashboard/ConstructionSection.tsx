
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Hammer, Calendar, DollarSign, Truck, Users, Wrench } from 'lucide-react';

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
      startDate: '2024-11-01',
      endDate: '2024-12-15',
      progress: 100,
      cost: 15000,
      status: 'completed'
    },
    {
      phase: 'Foundation & Structure',
      description: 'Concrete foundation, bamboo frame construction',
      startDate: '2024-12-16',
      endDate: '2025-03-30',
      progress: 75,
      cost: 35000,
      status: 'in-progress'
    },
    {
      phase: 'Roofing & Weatherproofing',
      description: 'Sustainable roofing, windows, exterior finish',
      startDate: '2025-04-01',
      endDate: '2025-05-15',
      progress: 20,
      cost: 25000,
      status: 'in-progress'
    },
    {
      phase: 'Solar & Electrical',
      description: 'Solar panel installation, electrical systems',
      startDate: '2025-05-16',
      endDate: '2025-06-30',
      progress: 0,
      cost: 20000,
      status: 'pending'
    },
    {
      phase: 'Interior & Plumbing',
      description: 'Interior finishing, bathroom, kitchen setup',
      startDate: '2025-07-01',
      endDate: '2025-08-15',
      progress: 0,
      cost: 18000,
      status: 'pending'
    },
    {
      phase: 'Landscaping & Final',
      description: 'Gardens, pathways, final inspections',
      startDate: '2025-08-16',
      endDate: '2025-09-30',
      progress: 0,
      cost: 12000,
      status: 'pending'
    }
  ];

  const costBreakdown: CostBreakdown[] = [
    {
      category: 'Materials',
      budgeted: 65000,
      spent: 28000,
      remaining: 37000,
      icon: Hammer
    },
    {
      category: 'Labor',
      budgeted: 40000,
      spent: 15000,
      remaining: 25000,
      icon: Users
    },
    {
      category: 'Equipment',
      budgeted: 15000,
      spent: 8000,
      remaining: 7000,
      icon: Truck
    },
    {
      category: 'Permits & Legal',
      budgeted: 5000,
      spent: 4000,
      remaining: 1000,
      icon: Wrench
    }
  ];

  const totalBudget = costBreakdown.reduce((sum, item) => sum + item.budgeted, 0);
  const totalSpent = costBreakdown.reduce((sum, item) => sum + item.spent, 0);
  const totalRemaining = costBreakdown.reduce((sum, item) => sum + item.remaining, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'delayed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress === 100) return 'bg-green-500';
    if (progress > 50) return 'bg-blue-500';
    if (progress > 0) return 'bg-yellow-500';
    return 'bg-gray-300';
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
            Volcano Stay project timeline and progress tracking
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
            Budget breakdown and spending tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Overall Budget Summary */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">${totalBudget.toLocaleString()}</div>
                <div className="text-sm text-blue-700">Total Budget</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">${totalSpent.toLocaleString()}</div>
                <div className="text-sm text-green-700">Total Spent</div>
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
                <span className="font-semibold">{((totalSpent / totalBudget) * 100).toFixed(1)}%</span>
              </div>
              <Progress value={(totalSpent / totalBudget) * 100} className="h-3" />
            </div>

            {/* Cost Breakdown by Category */}
            <div className="space-y-4">
              <h4 className="font-semibold">Cost Breakdown by Category</h4>
              {costBreakdown.map((item, index) => {
                const Icon = item.icon;
                const utilizationPercent = (item.spent / item.budgeted) * 100;
                
                return (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-blue-600" />
                        <span className="font-medium">{item.category}</span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {utilizationPercent.toFixed(1)}% utilized
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm mb-2">
                      <div>
                        <p className="text-gray-600">Budgeted</p>
                        <p className="font-semibold">${item.budgeted.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Spent</p>
                        <p className="font-semibold text-green-600">${item.spent.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Remaining</p>
                        <p className="font-semibold">${item.remaining.toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <Progress value={utilizationPercent} className="h-2" />
                  </div>
                );
              })}
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-2">Budget Status</h4>
              <p className="text-yellow-700 text-sm">
                Construction is currently on budget with {((totalSpent / totalBudget) * 100).toFixed(1)}% of funds utilized. 
                Foundation work is progressing ahead of schedule, which may allow for early completion.
              </p>
              <p className="text-xs text-yellow-600 mt-2">Last updated: March 20, 2025</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConstructionSection;
