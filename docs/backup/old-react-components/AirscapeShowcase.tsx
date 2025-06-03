
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Users, Building, Hammer, DollarSign, TrendingUp, ExternalLink, Calendar } from 'lucide-react';

interface Resort {
  id: string;
  name: string;
  location: string;
  status: 'fundraising' | 'construction' | 'operating';
  description: string;
  totalRaise: number;
  userInvestmentPool: number;
  currentInvestment: number;
  minInvestment: number;
  maxInvestment: number;
  expectedROI: number;
  constructionProgress: number;
  totalUnits: number;
  amenities: string[];
  sustainabilityFeatures: string[];
  airbnbLink?: string;
  bookingLink?: string;
  images: string[];
}

const AirscapeShowcase = () => {
  const [selectedResort, setSelectedResort] = useState<string>('');

  const resorts: Resort[] = [
    {
      id: 'thailand-eco-resort',
      name: 'Thailand Eco-Resort',
      location: 'Koh Samui, Thailand',
      status: 'construction',
      description: 'A stunning eco-conscious resort featuring 30 overwater villas with sustainable bamboo construction and solar energy. This boutique unique stay offers unparalleled luxury in harmony with nature.',
      totalRaise: 5000000,
      userInvestmentPool: 2500000,
      currentInvestment: 1875000,
      minInvestment: 1000,
      maxInvestment: 50000,
      expectedROI: 18.5,
      constructionProgress: 65,
      totalUnits: 30,
      amenities: ['Overwater Villas', 'Solar Energy', 'Bamboo Construction', 'Spa & Wellness', 'Organic Farm'],
      sustainabilityFeatures: ['100% Solar Power', 'Bamboo Construction', 'Marine Conservation', 'Local Employment'],
      images: ['/placeholder-thailand.jpg']
    },
    {
      id: 'bali-wellness-retreat',
      name: 'Bali Wellness Retreat',
      location: 'Ubud, Bali',
      status: 'fundraising',
      description: 'An intimate wellness retreat with 20 tree-house suites, yoga pavilions, and traditional Balinese healing gardens. Experience authentic Balinese culture in this boutique unique stay.',
      totalRaise: 3500000,
      userInvestmentPool: 1750000,
      currentInvestment: 875000,
      minInvestment: 500,
      maxInvestment: 25000,
      expectedROI: 22.3,
      constructionProgress: 30,
      totalUnits: 20,
      amenities: ['Tree-house Suites', 'Yoga Pavilions', 'Healing Gardens', 'Traditional Spa', 'Meditation Center'],
      sustainabilityFeatures: ['Traditional Building Methods', 'Organic Farming', 'Cultural Preservation', 'Local Artisans'],
      images: ['/placeholder-bali.jpg']
    },
    {
      id: 'morocco-desert-camp',
      name: 'Morocco Desert Camp',
      location: 'Sahara Desert, Morocco',
      status: 'fundraising',
      description: 'Luxury desert glamping with 15 traditional Berber tents equipped with modern amenities and stargazing decks. An unforgettable boutique unique stay experience.',
      totalRaise: 2200000,
      userInvestmentPool: 1100000,
      currentInvestment: 550000,
      minInvestment: 750,
      maxInvestment: 15000,
      expectedROI: 16.8,
      constructionProgress: 0,
      totalUnits: 15,
      amenities: ['Luxury Tents', 'Stargazing Decks', 'Camel Trekking', 'Traditional Cuisine', 'Desert Activities'],
      sustainabilityFeatures: ['Solar Power', 'Water Conservation', 'Local Materials', 'Cultural Immersion'],
      images: ['/placeholder-morocco.jpg']
    }
  ];

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
          <TabsTrigger value="properties">Resort Properties</TabsTrigger>
          <TabsTrigger value="investment">Investment Opportunities</TabsTrigger>
          <TabsTrigger value="features">Platform Features</TabsTrigger>
        </TabsList>
        
        <TabsContent value="properties" className="space-y-6">
          <div className="grid gap-6">
            {resorts.map((resort) => (
              <Card key={resort.id} className="overflow-hidden">
                <div className="md:flex">
                  <div className="md:w-1/3 bg-gradient-to-br from-blue-100 to-blue-200 h-64 md:h-auto flex items-center justify-center">
                    <div className="text-center p-6">
                      <Building className="h-12 w-12 mx-auto mb-2 text-blue-600" />
                      <span className="text-blue-700 font-medium">{resort.name}</span>
                    </div>
                  </div>
                  <div className="md:w-2/3">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getStatusColor(resort.status)}>
                              {resort.status.charAt(0).toUpperCase() + resort.status.slice(1)}
                            </Badge>
                            <Badge variant="outline">
                              {resort.totalUnits} units
                            </Badge>
                          </div>
                          <CardTitle className="text-xl mb-2">{resort.name}</CardTitle>
                          <CardDescription className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {resort.location}
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Expected ROI</p>
                          <p className="text-2xl font-bold text-green-600">{resort.expectedROI}%</p>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <p className="text-gray-600">{resort.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Total Raise</p>
                          <p className="font-semibold">${resort.totalRaise.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">User Pool</p>
                          <p className="font-semibold">${resort.userInvestmentPool.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Min Investment</p>
                          <p className="font-semibold">${resort.minInvestment.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Max Investment</p>
                          <p className="font-semibold">${resort.maxInvestment.toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Investment Progress</span>
                          <span>{((resort.currentInvestment / resort.userInvestmentPool) * 100).toFixed(1)}%</span>
                        </div>
                        <Progress value={(resort.currentInvestment / resort.userInvestmentPool) * 100} />
                        <p className="text-sm text-gray-600">
                          ${resort.currentInvestment.toLocaleString()} raised of ${resort.userInvestmentPool.toLocaleString()}
                        </p>
                      </div>

                      {resort.status === 'construction' && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="flex items-center gap-1">
                              <Hammer className="h-4 w-4" />
                              Construction Progress
                            </span>
                            <span>{resort.constructionProgress}%</span>
                          </div>
                          <Progress value={resort.constructionProgress} className="bg-yellow-100" />
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {resort.amenities.map((amenity, index) => (
                          <Badge key={index} variant="outline">{amenity}</Badge>
                        ))}
                      </div>

                      <div className="flex gap-3 pt-4 border-t">
                        {resort.status === 'fundraising' && (
                          <Button className="flex-1">
                            <DollarSign className="h-4 w-4 mr-2" />
                            Invest Now
                          </Button>
                        )}
                        {resort.status === 'operating' && (
                          <>
                            <Button className="flex-1">
                              <Calendar className="h-4 w-4 mr-2" />
                              Book with Airscape
                            </Button>
                            {resort.airbnbLink && (
                              <Button variant="outline" asChild>
                                <a href={resort.airbnbLink} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  Book on Airbnb
                                </a>
                              </Button>
                            )}
                          </>
                        )}
                        {resort.status === 'construction' && (
                          <Button variant="outline" className="flex-1">
                            <TrendingUp className="h-4 w-4 mr-2" />
                            Track Progress
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="investment" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Investment Model</CardTitle>
                <CardDescription>
                  How Airscape resort investments work
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-800">50% User Investment</h4>
                    <p className="text-sm text-blue-700">Community investors can purchase up to 50% of each resort</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-800">Ownership Tokens</h4>
                    <p className="text-sm text-purple-700">Receive proportional ownership tokens for revenue sharing</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-800">Revenue Distribution</h4>
                    <p className="text-sm text-green-700">Quarterly distributions from booking revenue and appreciation</p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <h4 className="font-semibold text-orange-800">Aura Holder Benefits</h4>
                    <p className="text-sm text-orange-700">0.5% airdrop of new resort tokens to AURA holders</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Investment Dashboard</CardTitle>
                <CardDescription>
                  Track your resort investments
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">$0</div>
                  <div className="text-sm text-gray-600">Total Invested</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">$0</div>
                  <div className="text-sm text-gray-600">Estimated Returns</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">0</div>
                  <div className="text-sm text-gray-600">Active Investments</div>
                </div>
                <Button className="w-full">Connect Wallet to View Portfolio</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="features" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Innovative Booking Features</CardTitle>
                <CardDescription>
                  Next-generation booking experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold">Crypto & Fiat Payments</h4>
                      <p className="text-sm text-gray-600">Pay with crypto, credit cards, or use staking rewards</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold">Symbiotic Integration</h4>
                      <p className="text-sm text-gray-600">Book through Airscape or external platforms like Airbnb</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold">Local Vendor Services</h4>
                      <p className="text-sm text-gray-600">Book transport, tours, and services from verified local vendors</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold">Event Booking</h4>
                      <p className="text-sm text-gray-600">Host weddings, retreats, and exclusive events at resorts</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Transparency & Sustainability</CardTitle>
                <CardDescription>
                  Blockchain-powered transparency
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold">Supply Chain Tracking</h4>
                      <p className="text-sm text-gray-600">All consumables and materials tracked on-chain</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold">Local Sourcing</h4>
                      <p className="text-sm text-gray-600">Enforced local sourcing for community economic impact</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold">Financial Transparency</h4>
                      <p className="text-sm text-gray-600">All expenses and revenue tracked transparently</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold">AI Insights</h4>
                      <p className="text-sm text-gray-600">Predictive analytics for investment decisions</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AirscapeShowcase;
