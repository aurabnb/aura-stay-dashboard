
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, Circle, Clock, Target, Building, Shield, Coins, Map, Palette, TrendingUp, Rocket, Zap, Users, MapPin, TreePine, Globe, Filter, Calendar, Bell, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type RoadmapStatus = 'completed' | 'in-progress' | 'upcoming' | 'delayed';
type Priority = 'high' | 'medium' | 'low';

interface RoadmapItem {
  id: number;
  title: string;
  description: string;
  status: RoadmapStatus;
  progress: number;
  icon: any;
  priority: Priority;
  estimatedCompletion?: string;
  dependencies?: number[];
  category: 'development' | 'business' | 'community' | 'infrastructure';
  details?: string;
  resources?: string[];
  challenges?: string[];
  updates?: Array<{date: string, message: string}>;
}

const EnhancedRoadmapTracker = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [showCompletedItems, setShowCompletedItems] = useState(true);
  const [sortBy, setSortBy] = useState<'priority' | 'progress' | 'date'>('priority');
  const { toast } = useToast();

  const roadmapItems: RoadmapItem[] = [
    {
      id: 1,
      title: 'Aurabnb Pilot',
      description: 'Complete first decentralized Volcano stay in Guayabo, Costa Rica.',
      status: 'in-progress' as RoadmapStatus,
      progress: 5,
      icon: Building,
      priority: 'high',
      estimatedCompletion: '2024-Q2',
      category: 'business',
      details: 'Establishing the first property in our decentralized hospitality network. This pilot will serve as proof of concept for the entire AURA ecosystem.',
      resources: ['Property acquisition', 'Legal framework', 'Local partnerships'],
      challenges: ['Regulatory compliance', 'Infrastructure setup', 'Community acceptance'],
      updates: [
        {date: '2024-01-15', message: 'Property identified and initial negotiations started'},
        {date: '2024-01-20', message: 'Legal framework review in progress'}
      ]
    },
    {
      id: 2,
      title: 'Decentralized Trust',
      description: 'Open Guernsey Decentralized trust structure to hold all assets.',
      status: 'upcoming' as RoadmapStatus,
      progress: 0,
      icon: Shield,
      priority: 'high',
      estimatedCompletion: '2024-Q3',
      dependencies: [1],
      category: 'infrastructure',
      details: 'Establishing a legal trust structure in Guernsey to hold all AURA assets in a decentralized manner.',
      resources: ['Legal counsel', 'Trust formation', 'Regulatory compliance'],
      challenges: ['Complex legal requirements', 'Multi-jurisdiction compliance']
    },
    {
      id: 3,
      title: 'Money Market',
      description: 'Integrate with Cosmos for Money Market with additional utility and features.',
      status: 'upcoming' as RoadmapStatus,
      progress: 0,
      icon: Coins,
      priority: 'medium',
      estimatedCompletion: '2024-Q4',
      category: 'development',
      details: 'Building financial services infrastructure to provide lending, borrowing, and yield farming opportunities.',
      resources: ['Cosmos integration', 'Smart contracts', 'Security audits'],
      challenges: ['Cross-chain compatibility', 'Liquidity bootstrapping']
    },
    {
      id: 4,
      title: 'Additional Locations',
      description: 'Complete two additional Airbnbs to ensure continuity in funding and progress.',
      status: 'upcoming' as RoadmapStatus,
      progress: 0,
      icon: Map,
      priority: 'high',
      estimatedCompletion: '2025-Q1',
      dependencies: [1, 2],
      category: 'business',
      details: 'Expanding the property portfolio to include diverse locations and property types.',
      resources: ['Property sourcing', 'Due diligence', 'Community funding'],
      challenges: ['Market conditions', 'Funding requirements', 'Location selection']
    },
    {
      id: 5,
      title: 'Rebrand',
      description: 'Complete rebrand of Aurabnb using the same name, new website and visuals.',
      status: 'upcoming' as RoadmapStatus,
      progress: 0,
      icon: Palette,
      priority: 'medium',
      estimatedCompletion: '2024-Q3',
      category: 'community',
      details: 'Comprehensive brand refresh to better communicate our vision and values.',
      resources: ['Design team', 'Brand strategy', 'Website development'],
      challenges: ['Brand consistency', 'Community acceptance', 'Marketing alignment']
    },
    {
      id: 6,
      title: 'Build Treasury',
      description: 'Build treasury of Liquidity Provision and promising projects on balance sheet.',
      status: 'in-progress' as RoadmapStatus,
      progress: 15,
      icon: TrendingUp,
      priority: 'high',
      estimatedCompletion: 'Ongoing',
      category: 'business',
      details: 'Continuously building treasury through strategic investments and liquidity provision.',
      resources: ['Investment strategy', 'Due diligence', 'Risk management'],
      challenges: ['Market volatility', 'Investment selection', 'Risk assessment'],
      updates: [
        {date: '2024-01-10', message: 'Initial LP positions established'},
        {date: '2024-01-25', message: 'Treasury diversification strategy implemented'}
      ]
    }
  ];

  // Filter and sort items
  const filteredItems = roadmapItems
    .filter(item => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
      if (selectedStatus !== 'all' && item.status !== selectedStatus) return false;
      if (!showCompletedItems && item.status === 'completed') return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'progress':
          return b.progress - a.progress;
        case 'date':
          return a.id - b.id;
        default:
          return 0;
      }
    });

  const toggleExpanded = (id: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const getStatusIcon = (status: RoadmapStatus, progress: number) => {
    if (status === 'completed') return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (status === 'in-progress') return <Clock className="h-4 w-4 text-blue-600" />;
    if (status === 'delayed') return <Circle className="h-4 w-4 text-red-600" />;
    return <Circle className="h-4 w-4 text-gray-400" />;
  };

  const getStatusColor = (status: RoadmapStatus) => {
    if (status === 'completed') return 'bg-green-100 text-green-800 border-green-200';
    if (status === 'in-progress') return 'bg-blue-100 text-blue-800 border-blue-200';
    if (status === 'delayed') return 'bg-red-100 text-red-800 border-red-200';
    return 'bg-gray-100 text-gray-600 border-gray-200';
  };

  const getPriorityColor = (priority: Priority) => {
    if (priority === 'high') return 'bg-red-100 text-red-800 border-red-200';
    if (priority === 'medium') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'development': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'business': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'community': return 'bg-green-100 text-green-800 border-green-200';
      case 'infrastructure': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  // Calculate overall progress
  const overallProgress = roadmapItems.reduce((sum, item) => sum + item.progress, 0) / roadmapItems.length;
  const completedItems = roadmapItems.filter(item => item.status === 'completed').length;
  const inProgressItems = roadmapItems.filter(item => item.status === 'in-progress').length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-6 w-6 text-blue-600" />
              Enhanced AURA Roadmap
            </CardTitle>
            <CardDescription>
              Interactive roadmap with detailed progress tracking and analytics
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {overallProgress.toFixed(0)}% Complete
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                toast({
                  title: "Roadmap Updated",
                  description: "Latest progress information loaded",
                });
              }}
            >
              <Bell className="h-4 w-4 mr-1" />
              Subscribe
            </Button>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{completedItems}</div>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{inProgressItems}</div>
              <p className="text-sm text-gray-600">In Progress</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{roadmapItems.length - completedItems - inProgressItems}</div>
              <p className="text-sm text-gray-600">Upcoming</p>
            </div>
          </div>
          <Progress value={overallProgress} className="h-3" />
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="roadmap" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="roadmap" className="space-y-6 mt-6">
            {/* Filters */}
            <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium">Filters:</span>
              </div>
              
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Categories</option>
                <option value="development">Development</option>
                <option value="business">Business</option>
                <option value="community">Community</option>
                <option value="infrastructure">Infrastructure</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="in-progress">In Progress</option>
                <option value="upcoming">Upcoming</option>
                <option value="delayed">Delayed</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="priority">Sort by Priority</option>
                <option value="progress">Sort by Progress</option>
                <option value="date">Sort by Date</option>
              </select>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={showCompletedItems}
                  onChange={(e) => setShowCompletedItems(e.target.checked)}
                  className="rounded"
                />
                Show Completed
              </label>
            </div>

            {/* Roadmap Items */}
            <div className="space-y-4">
              {filteredItems.map((item) => {
                const Icon = item.icon;
                const isExpanded = expandedItems.has(item.id);
                
                return (
                  <div 
                    key={item.id} 
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 pt-1">
                        {getStatusIcon(item.status, item.progress)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-sm text-gray-800">{item.id}.</span>
                            <Icon className="h-4 w-4 text-gray-600" />
                            <h3 className="font-semibold text-sm">{item.title}</h3>
                            <div className="flex gap-2">
                              <Badge variant="outline" className={getStatusColor(item.status)}>
                                {item.status.replace('-', ' ')}
                              </Badge>
                              <Badge variant="outline" className={getPriorityColor(item.priority)}>
                                {item.priority}
                              </Badge>
                              <Badge variant="outline" className={getCategoryColor(item.category)}>
                                {item.category}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {item.status === 'in-progress' && (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                {item.progress}%
                              </Badge>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleExpanded(item.id)}
                              className="p-1"
                            >
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                        
                        <p className="text-gray-700 text-xs leading-relaxed mb-3">{item.description}</p>
                        
                        {item.status === 'in-progress' && (
                          <Progress value={item.progress} className="h-2 mb-3" />
                        )}

                        {/* Expanded Details */}
                        {isExpanded && (
                          <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-lg">
                            {item.details && (
                              <div>
                                <h4 className="font-medium text-sm mb-2">Details</h4>
                                <p className="text-xs text-gray-600">{item.details}</p>
                              </div>
                            )}

                            {item.estimatedCompletion && (
                              <div>
                                <h4 className="font-medium text-sm mb-1">Estimated Completion</h4>
                                <p className="text-xs text-gray-600">{item.estimatedCompletion}</p>
                              </div>
                            )}

                            {item.resources && (
                              <div>
                                <h4 className="font-medium text-sm mb-2">Required Resources</h4>
                                <ul className="text-xs text-gray-600 space-y-1">
                                  {item.resources.map((resource, idx) => (
                                    <li key={idx} className="flex items-center gap-2">
                                      <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                      {resource}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {item.challenges && (
                              <div>
                                <h4 className="font-medium text-sm mb-2">Key Challenges</h4>
                                <ul className="text-xs text-gray-600 space-y-1">
                                  {item.challenges.map((challenge, idx) => (
                                    <li key={idx} className="flex items-center gap-2">
                                      <div className="w-1 h-1 bg-red-400 rounded-full"></div>
                                      {challenge}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {item.updates && item.updates.length > 0 && (
                              <div>
                                <h4 className="font-medium text-sm mb-2">Recent Updates</h4>
                                <div className="space-y-2">
                                  {item.updates.map((update, idx) => (
                                    <div key={idx} className="flex gap-2">
                                      <Calendar className="h-3 w-3 text-gray-400 mt-0.5" />
                                      <div>
                                        <p className="text-xs font-medium text-gray-700">{update.date}</p>
                                        <p className="text-xs text-gray-600">{update.message}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {item.dependencies && item.dependencies.length > 0 && (
                              <div>
                                <h4 className="font-medium text-sm mb-2">Dependencies</h4>
                                <div className="flex gap-2">
                                  {item.dependencies.map(depId => {
                                    const depItem = roadmapItems.find(r => r.id === depId);
                                    return depItem ? (
                                      <Badge key={depId} variant="outline" className="text-xs">
                                        #{depId} {depItem.title}
                                      </Badge>
                                    ) : null;
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No items match your current filters</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="timeline" className="mt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Project Timeline</h3>
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="space-y-4">
                  {['2024-Q1', '2024-Q2', '2024-Q3', '2024-Q4', '2025-Q1'].map(quarter => (
                    <div key={quarter} className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-medium">{quarter}</h4>
                      <div className="mt-2 space-y-1">
                        {roadmapItems
                          .filter(item => item.estimatedCompletion === quarter)
                          .map(item => (
                            <p key={item.id} className="text-sm text-gray-600">
                              • {item.title}
                            </p>
                          ))
                        }
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Progress by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['development', 'business', 'community', 'infrastructure'].map(category => {
                      const categoryItems = roadmapItems.filter(item => item.category === category);
                      const avgProgress = categoryItems.reduce((sum, item) => sum + item.progress, 0) / categoryItems.length;
                      
                      return (
                        <div key={category}>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm capitalize">{category}</span>
                            <span className="text-sm">{avgProgress.toFixed(0)}%</span>
                          </div>
                          <Progress value={avgProgress} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['completed', 'in-progress', 'upcoming', 'delayed'].map(status => {
                      const count = roadmapItems.filter(item => item.status === status).length;
                      const percentage = (count / roadmapItems.length) * 100;
                      
                      return (
                        <div key={status} className="flex justify-between items-center">
                          <span className="text-sm capitalize">{status.replace('-', ' ')}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{count}</span>
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full" 
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

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

export default EnhancedRoadmapTracker;
