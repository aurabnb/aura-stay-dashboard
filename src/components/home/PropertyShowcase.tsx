'use client'

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Star, Wifi, Car, Coffee, Leaf, Mountain, Waves, Users, Calendar, ExternalLink } from 'lucide-react';

interface Property {
  id: string;
  name: string;
  location: string;
  type: 'aura' | 'samsara' | 'airscape';
  status: 'live' | 'coming-soon' | 'construction';
  description: string;
  shortDescription: string;
  priceFrom: number;
  rating: number;
  reviewCount: number;
  amenities: string[];
  features: string[];
  sustainability: string[];
  images: string[];
}

const MOCK_PROPERTIES: Property[] = [
  {
    id: 'aura-bali-1',
    name: 'Aura Eco-Villa Ubud',
    location: 'Ubud, Bali',
    type: 'aura',
    status: 'live',
    description: 'A sustainable luxury villa nestled in the heart of Ubud\'s lush jungle. Experience traditional Balinese architecture with modern eco-friendly amenities.',
    shortDescription: 'Eco-luxury villa in Ubud\'s jungle',
    priceFrom: 250,
    rating: 4.9,
    reviewCount: 128,
    amenities: ['Infinity Pool', 'Yoga Deck', 'Organic Garden', 'Spa'],
    features: ['Solar Powered', 'Rainwater Harvesting', 'Local Materials'],
    sustainability: ['Zero Waste', 'Farm to Table', 'Community Support'],
    images: ['/properties/aura-bali-1.jpg', '/properties/aura-bali-2.jpg']
  },
  {
    id: 'samsara-costa-rica',
    name: 'Samsara Treehouse Lodge',
    location: 'Monteverde, Costa Rica',
    type: 'samsara',
    status: 'coming-soon',
    description: 'Elevated luxury treehouses offering panoramic views of the Costa Rican rainforest. Connect with nature without compromising on comfort.',
    shortDescription: 'Luxury treehouses in the rainforest',
    priceFrom: 300,
    rating: 4.8,
    reviewCount: 96,
    amenities: ['Private Deck', 'Outdoor Shower', 'Telescope', 'Mini Kitchen'],
    features: ['Sustainable Wood', 'Green Energy', 'Minimal Impact'],
    sustainability: ['Wildlife Protection', 'Local Employment', 'Eco Tours'],
    images: ['/properties/samsara-cr-1.jpg', '/properties/samsara-cr-2.jpg']
  },
  {
    id: 'airscape-greece',
    name: 'Airscape Cycladic Villa',
    location: 'Santorini, Greece',
    type: 'airscape',
    status: 'construction',
    description: 'A modern interpretation of traditional Cycladic architecture, offering stunning caldera views and sustainable luxury living.',
    shortDescription: 'Sustainable luxury with caldera views',
    priceFrom: 400,
    rating: 4.7,
    reviewCount: 64,
    amenities: ['Private Pool', 'Wine Cellar', 'Sunset Terrace', 'Chef\'s Kitchen'],
    features: ['Smart Home', 'Energy Efficient', 'Local Design'],
    sustainability: ['Solar Power', 'Water Conservation', 'Waste Reduction'],
    images: ['/properties/airscape-gr-1.jpg', '/properties/airscape-gr-2.jpg']
  }
];

const PropertyCard: React.FC<{ property: Property }> = ({ property }) => {
  const statusColors = {
    'live': 'bg-green-100 text-green-800',
    'coming-soon': 'bg-blue-100 text-blue-800',
    'construction': 'bg-orange-100 text-orange-800'
  };

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="relative h-64 overflow-hidden">
        <img
          src={property.images[0]}
          alt={property.name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
        <div className="absolute top-4 right-4">
          <Badge variant="outline" className={`${statusColors[property.status]} border-0`}>
            {property.status === 'coming-soon' ? 'Coming Soon' : 
             property.status === 'construction' ? 'Under Construction' : 'Live'}
          </Badge>
        </div>
      </div>
      
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-semibold">{property.name}</CardTitle>
            <CardDescription className="flex items-center mt-1">
              <MapPin className="h-4 w-4 mr-1" />
              {property.location}
            </CardDescription>
          </div>
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-400 mr-1" />
            <span className="font-medium">{property.rating}</span>
            <span className="text-gray-500 text-sm ml-1">({property.reviewCount})</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-gray-600 mb-4">{property.shortDescription}</p>
        
        <Tabs defaultValue="amenities" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="amenities" className="flex-1">Amenities</TabsTrigger>
            <TabsTrigger value="features" className="flex-1">Features</TabsTrigger>
            <TabsTrigger value="sustainability" className="flex-1">Eco</TabsTrigger>
          </TabsList>
          <TabsContent value="amenities" className="mt-4">
            <div className="grid grid-cols-2 gap-2">
              {property.amenities.map((amenity, index) => (
                <div key={index} className="flex items-center text-sm">
                  <Coffee className="h-4 w-4 mr-2 text-gray-500" />
                  {amenity}
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="features" className="mt-4">
            <div className="grid grid-cols-2 gap-2">
              {property.features.map((feature, index) => (
                <div key={index} className="flex items-center text-sm">
                  <Mountain className="h-4 w-4 mr-2 text-gray-500" />
                  {feature}
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="sustainability" className="mt-4">
            <div className="grid grid-cols-2 gap-2">
              {property.sustainability.map((item, index) => (
                <div key={index} className="flex items-center text-sm">
                  <Leaf className="h-4 w-4 mr-2 text-green-500" />
                  {item}
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold">${property.priceFrom}</span>
            <span className="text-gray-500">/night</span>
          </div>
          <Button variant="default" className="flex items-center">
            View Details
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export function PropertyShowcase() {
  const [filter, setFilter] = useState<'all' | 'aura' | 'samsara' | 'airscape'>('all');
  
  const filteredProperties = MOCK_PROPERTIES.filter(
    property => filter === 'all' || property.type === filter
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-center gap-4">
        {(['all', 'aura', 'samsara', 'airscape'] as const).map((type) => (
          <Button
            key={type}
            variant={filter === type ? 'default' : 'outline'}
            onClick={() => setFilter(type)}
            className="capitalize"
          >
            {type === 'all' ? 'All Properties' : `${type} Properties`}
          </Button>
        ))}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProperties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </div>
  );
} 