
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Leaf, Users, Building, Zap, Droplets, Mountain, Waves, Calendar, Hammer, Eye } from 'lucide-react';

const SamsaraDetails = () => {
  const [constructionProgress] = useState(35);
  const [tokenSaleProgress] = useState(68);

  const projectStats = {
    totalUnits: 45,
    oceanViewUnits: 30,
    farmArea: '5 acres',
    solarCapacity: '200kW',
    expectedCompletion: 'Q3 2025',
    sustainabilityRating: '95%'
  };

  const amenities = [
    { name: 'Ocean View Units', description: '30 of 45 units with panoramic ocean views', icon: Waves },
    { name: 'Off-Grid Farm', description: '5-acre permaculture farm for community food', icon: Leaf },
    { name: 'Natural Pool', description: 'Chemical-free swimming with natural filtration', icon: Droplets },
    { name: 'Gym & Wellness', description: 'Fitness center and wellness facilities', icon: Users },
    { name: 'Conference Center', description: 'Modern meeting spaces for events', icon: Building },
    { name: 'Solar Energy', description: '200kW solar array for 100% renewable power', icon: Zap }
  ];

  const sustainabilityFeatures = [
    'Bamboo and local stone construction',
    'Rainwater harvesting systems',
    'Composting toilets and greywater systems',
    'Permaculture food forest',
    'Electric vehicle charging stations',
    'Zero waste management system',
    'Native species reforestation',
    'Community-supported agriculture'
  ];

  const constructionMilestones = [
    { phase: 'Site Preparation', completion: 100, date: 'Completed' },
    { phase: 'Foundation Work', completion: 85, date: 'Mar 2025' },
    { phase: 'Structure Building', completion: 40, date: 'May 2025' },
    { phase: 'Solar Installation', completion: 15, date: 'Jun 2025' },
    { phase: 'Interior Finishing', completion: 0, date: 'Jul 2025' },
    { phase: 'Landscaping', completion: 0, date: 'Aug 2025' }
  ];

  return (
    <div className="space-y-8">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="construction">Construction</TabsTrigger>
          <TabsTrigger value="sustainability">Sustainability</TabsTrigger>
          <TabsTrigger value="investment">Investment</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mountain className="h-5 w-5" />
                  Project Overview
                </CardTitle>
                <CardDescription>
                  A revolutionary eco-community showcasing sustainable living
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Total Units</p>
                    <p className="text-2xl font-bold text-blue-600">{projectStats.totalUnits}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Ocean View</p>
                    <p className="text-2xl font-bold text-blue-600">{projectStats.oceanViewUnits}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Farm Area</p>
                    <p className="text-2xl font-bold text-green-600">{projectStats.farmArea}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Solar Power</p>
                    <p className="text-2xl font-bold text-yellow-600">{projectStats.solarCapacity}</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Sustainability Rating</span>
                    <span className="text-sm font-bold text-green-600">{projectStats.sustainabilityRating}</span>
                  </div>
                  <Progress value={95} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Location & Access</CardTitle>
                <CardDescription>
                  <MapPin className="h-4 w-4 inline mr-1" />
                  Dominical, Costa Rica
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 h-32 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">Interactive Map Coming Soon</span>
                </div>
                <div className="space-y-2 text-sm">
                  <p><strong>Distance to Beach:</strong> 300 meters</p>
                  <p><strong>Nearest Airport:</strong> San José (3 hours)</p>
                  <p><strong>Local Town:</strong> Dominical (5 minutes walk)</p>
                  <p><strong>Surfing:</strong> World-class waves at Dominical Beach</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Community Amenities</CardTitle>
              <CardDescription>
                Designed for sustainable living and community connection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {amenities.map((amenity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                    <amenity.icon className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold mb-1">{amenity.name}</h4>
                      <p className="text-sm text-gray-600">{amenity.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="construction" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hammer className="h-5 w-5" />
                Construction Progress
              </CardTitle>
              <CardDescription>
                Live updates from the construction site
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">{constructionProgress}%</div>
                <p className="text-gray-600 mb-4">Overall Completion</p>
                <Progress value={constructionProgress} className="h-3" />
                <p className="text-sm text-gray-500 mt-2">Expected completion: {projectStats.expectedCompletion}</p>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Construction Milestones</h4>
                {constructionMilestones.map((milestone, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{milestone.phase}</p>
                      <p className="text-sm text-gray-600">{milestone.date}</p>
                    </div>
                    <div className="w-32">
                      <Progress value={milestone.completion} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">{milestone.completion}%</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">Latest Update</h4>
                <p className="text-yellow-700 text-sm">
                  Foundation work is ahead of schedule. Solar panel installation begins next month with local Costa Rican contractors.
                </p>
                <p className="text-xs text-yellow-600 mt-2">Updated: March 15, 2025</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sustainability" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5" />
                Sustainability Features
              </CardTitle>
              <CardDescription>
                Leading the way in eco-conscious community development
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-4">Environmental Impact</h4>
                  <div className="space-y-3">
                    {sustainabilityFeatures.slice(0, 4).map((feature, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-4">Community Benefits</h4>
                  <div className="space-y-3">
                    {sustainabilityFeatures.slice(4).map((feature, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">100%</div>
                  <div className="text-sm text-green-700">Renewable Energy</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">0</div>
                  <div className="text-sm text-blue-700">Waste to Landfill</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">75%</div>
                  <div className="text-sm text-purple-700">Local Materials</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="investment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Samsara Token Sale</CardTitle>
              <CardDescription>
                Invest in the future of sustainable community living
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-4">Token Sale Progress</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>Funds Raised</span>
                        <span className="font-semibold">$816,000 / $1,200,000</span>
                      </div>
                      <Progress value={tokenSaleProgress} className="h-3" />
                      <p className="text-sm text-gray-600 mt-2">{tokenSaleProgress}% complete</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Token Price</p>
                        <p className="font-semibold">$0.135</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Min Investment</p>
                        <p className="font-semibold">$100</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-4">Investment Benefits</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-sm">10% of bookings distributed to holders</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-sm">Governance voting rights</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-sm">Priority booking access</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-sm">Exclusive community events</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button size="lg" className="flex-1">
                  <Calendar className="h-4 w-4 mr-2" />
                  Invest in Samsara
                </Button>
                <Button variant="outline" size="lg">
                  <Eye className="h-4 w-4 mr-2" />
                  View Whitepaper
                </Button>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-semibold text-orange-800 mb-2">Aura Holder Airdrop</h4>
                <p className="text-orange-700 text-sm">
                  Aura token holders will receive a proportional airdrop of Samsara tokens at project completion. 
                  Snapshot will be taken at construction milestone completion.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SamsaraDetails;
