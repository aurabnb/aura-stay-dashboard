
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building, TrendingUp, Gift, Hammer, MapPin } from 'lucide-react';
import { log } from '@/lib/logger';

interface Property {
  id: string;
  name: string;
  location: string;
  totalRaise: number;
  userInvestmentPool: number;
  currentInvestment: number;
  minInvestment: number;
  maxInvestment: number;
  expectedROI: number;
  constructionProgress: number;
  status: 'fundraising' | 'construction' | 'operating';
  description: string;
  amenities: string[];
  images: string[];
}

interface Airdrop {
  id: string;
  property: string;
  allocation: number;
  eligibleHolders: number;
  distributionDate: string;
  userEstimate: number;
  status: 'upcoming' | 'distributed';
}

const InvestmentHubDashboard = () => {
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [userStakedRewards] = useState({
    AURA: 125.5,
    SAMSARA: 45.2,
    AIRSCAPE: 78.9
  });

  const properties: Property[] = [
    {
      id: '1',
      name: 'Thailand Eco-Resort',
      location: 'Koh Samui, Thailand',
      totalRaise: 5000000,
      userInvestmentPool: 2500000,
      currentInvestment: 1875000,
      minInvestment: 1000,
      maxInvestment: 50000,
      expectedROI: 18.5,
      constructionProgress: 65,
      status: 'construction',
      description: 'A stunning eco-conscious resort featuring 30 overwater villas with sustainable bamboo construction and solar energy.',
      amenities: ['Overwater Villas', 'Solar Energy', 'Bamboo Construction', 'Spa & Wellness', 'Organic Farm'],
      images: ['/placeholder-resort1.jpg']
    },
    {
      id: '2',
      name: 'Bali Wellness Retreat',
      location: 'Ubud, Bali',
      totalRaise: 3500000,
      userInvestmentPool: 1750000,
      currentInvestment: 875000,
      minInvestment: 500,
      maxInvestment: 25000,
      expectedROI: 22.3,
      constructionProgress: 30,
      status: 'fundraising',
      description: 'An intimate wellness retreat with 20 tree-house suites, yoga pavilions, and traditional Balinese healing gardens.',
      amenities: ['Tree-house Suites', 'Yoga Pavilions', 'Healing Gardens', 'Traditional Spa', 'Meditation Center'],
      images: ['/placeholder-resort2.jpg']
    },
    {
      id: '3',
      name: 'Morocco Desert Camp',
      location: 'Sahara Desert, Morocco',
      totalRaise: 2200000,
      userInvestmentPool: 1100000,
      currentInvestment: 550000,
      minInvestment: 750,
      maxInvestment: 15000,
      expectedROI: 16.8,
      constructionProgress: 0,
      status: 'fundraising',
      description: 'Luxury desert glamping with 15 traditional Berber tents equipped with modern amenities and stargazing decks.',
      amenities: ['Luxury Tents', 'Stargazing Decks', 'Camel Trekking', 'Traditional Cuisine', 'Desert Activities'],
      images: ['/placeholder-resort3.jpg']
    }
  ];

  const airdrops: Airdrop[] = [
    {
      id: '1',
      property: 'Thailand Eco-Resort',
      allocation: 0.5,
      eligibleHolders: 5420,
      distributionDate: '2025-07-15',
      userEstimate: 12.3,
      status: 'upcoming'
    },
    {
      id: '2',
      property: 'Bali Wellness Retreat',
      allocation: 0.5,
      eligibleHolders: 5420,
      distributionDate: '2025-09-01',
      userEstimate: 8.7,
      status: 'upcoming'
    }
  ];

  const handleInvest = (propertyId: string) => {
    log.dev(`Investing $${investmentAmount} in property ${propertyId}`, { propertyId, investmentAmount }, 'InvestmentHub');
  };

  const handleUseRewards = (token: string, amount: number) => {
    log.dev(`Using ${amount} ${token} rewards for investment`, { token, amount }, 'InvestmentHub');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fundraising': return 'bg-blue-100 text-blue-800';
      case 'construction': return 'bg-yellow-100 text-yellow-800';
      case 'operating': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      <Tabs defaultValue="properties" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="properties">New Properties</TabsTrigger>
          <TabsTrigger value="airdrops">Airdrops</TabsTrigger>
          <TabsTrigger value="portfolio">My Portfolio</TabsTrigger>
        </TabsList>
        
        <TabsContent value="properties" className="space-y-6">
          <div className="grid gap-6">
            {properties.map((property) => (
              <Card key={property.id} className="overflow-hidden">
                <div className="md:flex">
                  <div className="md:w-1/3 bg-gray-200 h-64 md:h-auto flex items-center justify-center">
                    <span className="text-gray-500">Property Image</span>
                  </div>
                  <div className="md:w-2/3">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl flex items-center gap-2">
                            <Building className="h-5 w-5" />
                            {property.name}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-1 mt-1">
                            <MapPin className="h-4 w-4" />
                            {property.location}
                          </CardDescription>
                        </div>
                        <Badge className={getStatusColor(property.status)}>
                          {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-gray-600">{property.description}</p>
                      
                      <div className="flex flex-wrap gap-2">
                        {property.amenities.map((amenity, index) => (
                          <Badge key={index} variant="outline">{amenity}</Badge>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Total Raise</p>
                          <p className="font-semibold">${property.totalRaise.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">User Pool</p>
                          <p className="font-semibold">${property.userInvestmentPool.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Expected ROI</p>
                          <p className="font-semibold text-green-600">{property.expectedROI}%</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Min Investment</p>
                          <p className="font-semibold">${property.minInvestment.toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Investment Progress</span>
                          <span>{((property.currentInvestment / property.userInvestmentPool) * 100).toFixed(1)}%</span>
                        </div>
                        <Progress value={(property.currentInvestment / property.userInvestmentPool) * 100} />
                        <p className="text-sm text-gray-600">
                          ${property.currentInvestment.toLocaleString()} raised of ${property.userInvestmentPool.toLocaleString()}
                        </p>
                      </div>

                      {property.status === 'construction' && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="flex items-center gap-1">
                              <Hammer className="h-4 w-4" />
                              Construction Progress
                            </span>
                            <span>{property.constructionProgress}%</span>
                          </div>
                          <Progress value={property.constructionProgress} className="bg-yellow-100" />
                        </div>
                      )}

                      {property.status === 'fundraising' && (
                        <div className="flex gap-3">
                          <Input
                            type="number"
                            placeholder="Investment amount"
                            value={investmentAmount}
                            onChange={(e) => setInvestmentAmount(e.target.value)}
                            className="flex-1"
                          />
                          <Button onClick={() => handleInvest(property.id)}>
                            Invest
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="airdrops" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Airdrops for Aura Holders
              </CardTitle>
              <CardDescription>
                Receive 0.5% of each new resort's token issuance based on your AURA holdings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {airdrops.map((airdrop) => (
                  <div key={airdrop.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold">{airdrop.property}</h4>
                        <p className="text-sm text-gray-600">{airdrop.allocation}% token allocation</p>
                      </div>
                      <Badge variant={airdrop.status === 'upcoming' ? 'default' : 'secondary'}>
                        {airdrop.status === 'upcoming' ? 'Upcoming' : 'Distributed'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Eligible Holders</p>
                        <p className="font-semibold">{airdrop.eligibleHolders.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Distribution Date</p>
                        <p className="font-semibold">{new Date(airdrop.distributionDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Your Estimate</p>
                        <p className="font-semibold text-green-600">{airdrop.userEstimate} tokens</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Status</p>
                        <p className="font-semibold">{airdrop.status === 'upcoming' ? 'Snapshot Pending' : 'Completed'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="portfolio" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Staked Rewards Available</CardTitle>
                <CardDescription>
                  Use your staking rewards to invest in new properties
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(userStakedRewards).map(([token, amount]) => (
                  <div key={token} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-semibold">{amount.toFixed(2)} {token}</p>
                      <p className="text-sm text-gray-600">Available for Investment</p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleUseRewards(token, amount)}
                    >
                      Use for Investment
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Investment Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">Total Invested</p>
                    <p className="text-2xl font-bold text-blue-600">$15,000</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">Estimated Returns</p>
                    <p className="text-2xl font-bold text-green-600">$2,775</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-600">Active Investments</p>
                    <p className="text-2xl font-bold text-purple-600">3</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>My Investments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-semibold">Thailand Eco-Resort</p>
                    <p className="text-sm text-gray-600">Invested: $10,000 • 0.2% ownership</p>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">Construction</Badge>
                </div>
                <div className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-semibold">Bali Wellness Retreat</p>
                    <p className="text-sm text-gray-600">Invested: $5,000 • 0.15% ownership</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">Fundraising</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InvestmentHubDashboard;
