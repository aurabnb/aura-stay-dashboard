'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MapPin, Star, Wifi, Car, Coffee, Leaf, Mountain, Waves, Users, Calendar, ExternalLink } from 'lucide-react'

interface Property {
  id: string
  name: string
  location: string
  type: 'aura' | 'samsara' | 'airscape'
  status: 'live' | 'coming-soon' | 'construction'
  description: string
  shortDescription: string
  priceFrom: number
  rating: number
  reviewCount: number
  amenities: string[]
  features: string[]
  images: string[]
  airbnbLink?: string
  tabletHotelsLink?: string
  maxGuests: number
  bedrooms: number
  bathrooms: number
  sustainability: string[]
}

export function PropertyShowcase() {
  const [selectedProperty, setSelectedProperty] = useState<string>('')
  const [activeTab, setActiveTab] = useState('all')

  const properties: Property[] = [
    {
      id: 'volcan-stay',
      name: 'Volcan Stay',
      location: 'Arenal, Costa Rica',
      type: 'aura',
      status: 'live',
      description: 'A secluded eco-retreat with stunning volcano views, featuring sustainable bamboo construction and immersive rainforest experiences. This boutique unique stay offers an intimate connection with nature while maintaining luxury amenities.',
      shortDescription: 'Eco-retreat with volcano views',
      priceFrom: 180,
      rating: 4.9,
      reviewCount: 24,
      maxGuests: 4,
      bedrooms: 2,
      bathrooms: 2,
      amenities: ['Volcano Views', 'Eco-Friendly', 'Bamboo Construction', 'Rainforest Access', 'Hot Tub'],
      features: ['Solar Energy', 'Rainwater Collection', 'Organic Garden', 'Wildlife Observation'],
      sustainability: ['100% Solar Power', 'Local Materials', 'Rainwater Harvesting', 'Zero Waste'],
      images: ['/lovable-uploads/376d858b-71fc-454d-9450-826650b45f5c.png'],
      airbnbLink: 'https://airbnb.com/volcan-stay'
    },
    {
      id: 'playa-hermosa',
      name: 'Playa Hermosa Retreat',
      location: 'Guanacaste, Costa Rica',
      type: 'aura',
      status: 'live',
      description: 'A beachfront boutique unique stay featuring locally-sourced materials and panoramic ocean views. Experience Costa Rican culture through authentic design and community connections.',
      shortDescription: 'Beachfront retreat with ocean views',
      priceFrom: 220,
      rating: 4.8,
      reviewCount: 18,
      maxGuests: 6,
      bedrooms: 3,
      bathrooms: 2,
      amenities: ['Ocean Views', 'Beach Access', 'Local Art', 'Outdoor Kitchen', 'Infinity Pool'],
      features: ['Local Stone Construction', 'Traditional Design', 'Community Connections', 'Surf Lessons'],
      sustainability: ['Local Sourcing', 'Community Employment', 'Ocean Conservation', 'Renewable Energy'],
      images: ['/placeholder-playa.jpg'],
      airbnbLink: 'https://airbnb.com/playa-hermosa'
    },
    {
      id: 'samsara-dominical',
      name: 'Samsara Eco-Community',
      location: 'Dominical, Costa Rica',
      type: 'samsara',
      status: 'construction',
      description: 'A boutique eco-conscious community featuring 45 sustainable units with ocean views, off-grid farm, and natural pool. Coming soon with innovative booking transparency via blockchain integration.',
      shortDescription: 'Eco-conscious community with 45 units',
      priceFrom: 160,
      rating: 0,
      reviewCount: 0,
      maxGuests: 4,
      bedrooms: 2,
      bathrooms: 1,
      amenities: ['Ocean Views', 'Off-Grid Farm', 'Natural Pool', 'Gym', 'Conference Center'],
      features: ['Solar Energy', 'Permaculture', 'Community Living', 'Wellness Center'],
      sustainability: ['100% Renewable Energy', 'Permaculture Design', 'Water Conservation', 'Local Food Production'],
      images: ['/placeholder-samsara.jpg']
    },
    {
      id: 'thailand-eco-resort',
      name: 'Thailand Eco-Resort',
      location: 'Koh Samui, Thailand',
      type: 'airscape',
      status: 'construction',
      description: 'A stunning eco-conscious resort featuring 30 overwater villas with sustainable bamboo construction and solar energy. This boutique unique stay will offer unparalleled luxury in harmony with nature.',
      shortDescription: '30 overwater villas with sustainable design',
      priceFrom: 280,
      rating: 0,
      reviewCount: 0,
      maxGuests: 2,
      bedrooms: 1,
      bathrooms: 1,
      amenities: ['Overwater Villas', 'Solar Energy', 'Bamboo Construction', 'Spa & Wellness', 'Organic Farm'],
      features: ['Traditional Thai Design', 'Marine Conservation', 'Local Employment', 'Cultural Experiences'],
      sustainability: ['Solar Power', 'Bamboo Construction', 'Marine Protection', 'Local Community Support'],
      images: ['/placeholder-thailand.jpg']
    },
    {
      id: 'bali-wellness',
      name: 'Bali Wellness Retreat',
      location: 'Ubud, Bali',
      type: 'airscape',
      status: 'coming-soon',
      description: 'An intimate wellness retreat with 20 tree-house suites, yoga pavilions, and traditional Balinese healing gardens. Experience authentic Balinese culture in this boutique unique stay.',
      shortDescription: '20 tree-house suites with wellness focus',
      priceFrom: 200,
      rating: 0,
      reviewCount: 0,
      maxGuests: 2,
      bedrooms: 1,
      bathrooms: 1,
      amenities: ['Tree-house Suites', 'Yoga Pavilions', 'Healing Gardens', 'Traditional Spa', 'Meditation Center'],
      features: ['Balinese Architecture', 'Healing Traditions', 'Organic Gardens', 'Cultural Immersion'],
      sustainability: ['Traditional Building Methods', 'Organic Farming', 'Cultural Preservation', 'Local Artisans'],
      images: ['/placeholder-bali.jpg']
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-green-100 text-green-800'
      case 'coming-soon': return 'bg-blue-100 text-blue-800'
      case 'construction': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'aura': return 'bg-purple-100 text-purple-800'
      case 'samsara': return 'bg-orange-100 text-orange-800'
      case 'airscape': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredProperties = activeTab === 'all' ? properties : properties.filter(p => p.type === activeTab)

  return (
    <div className="space-y-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Properties</TabsTrigger>
          <TabsTrigger value="aura">Aura Stays</TabsTrigger>
          <TabsTrigger value="samsara">Samsara</TabsTrigger>
          <TabsTrigger value="airscape">Airscape</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="space-y-6 mt-8">
          <div className="grid gap-6">
            {filteredProperties.map((property) => (
              <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="md:flex">
                  <div className="md:w-1/3 bg-gradient-to-br from-gray-100 to-gray-200 h-64 md:h-auto relative overflow-hidden">
                    {property.images && property.images.length > 0 ? (
                      <img 
                        src={property.images[0]} 
                        alt={property.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="absolute inset-0 flex items-center justify-center text-center p-6" style={{ display: property.images && property.images.length > 0 ? 'none' : 'flex' }}>
                      <div>
                        <Mountain className="h-12 w-12 mx-auto mb-2 text-gray-500" />
                        <span className="text-gray-500">Property Image</span>
                      </div>
                    </div>
                  </div>
                  <div className="md:w-2/3">
                    <CardHeader>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getTypeColor(property.type)}>
                              {property.type.toUpperCase()}
                            </Badge>
                            <Badge className={getStatusColor(property.status)}>
                              {property.status === 'coming-soon' ? 'Coming Soon' : 
                               property.status === 'live' ? 'Available Now' : 'Under Construction'}
                            </Badge>
                          </div>
                          <CardTitle className="text-2xl mb-2">{property.name}</CardTitle>
                          <CardDescription className="flex items-center gap-1 text-base">
                            <MapPin className="h-4 w-4" />
                            {property.location}
                          </CardDescription>
                          {property.status === 'live' && (
                            <div className="flex items-center gap-2 mt-2">
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-semibold">{property.rating}</span>
                              </div>
                              <span className="text-gray-600">({property.reviewCount} reviews)</span>
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">
                            ${property.priceFrom}
                          </p>
                          <p className="text-sm text-gray-600">per night</p>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-6">
                      <p className="text-gray-700 leading-relaxed">{property.description}</p>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span>{property.maxGuests} guests</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{property.bedrooms}</span>
                          <span className="text-gray-600">bedrooms</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{property.bathrooms}</span>
                          <span className="text-gray-600">bathrooms</span>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Coffee className="h-4 w-4" />
                          Amenities
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {property.amenities.map((amenity, index) => (
                            <Badge key={index} variant="outline">{amenity}</Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Leaf className="h-4 w-4" />
                          Sustainability
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {property.sustainability.map((item, index) => (
                            <Badge key={index} variant="outline" className="bg-green-50 text-green-700">
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {property.status === 'live' && (
                        <div className="flex gap-3 pt-4 border-t">
                          <Button className="flex-1" size="lg">
                            <Calendar className="h-4 w-4 mr-2" />
                            Book with Airscape
                          </Button>
                          {property.airbnbLink && (
                            <Button variant="outline" size="lg" asChild>
                              <a href={property.airbnbLink} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Book on Airbnb
                              </a>
                            </Button>
                          )}
                        </div>
                      )}

                      {property.status === 'construction' && (
                        <div className="bg-yellow-50 p-4 rounded-lg">
                          <p className="text-yellow-800 font-medium">Construction in Progress</p>
                          <p className="text-yellow-700 text-sm mt-1">
                            This boutique unique stay is currently being built with sustainable practices and local materials.
                          </p>
                        </div>
                      )}

                      {property.status === 'coming-soon' && (
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <p className="text-blue-800 font-medium">Coming Soon</p>
                          <p className="text-blue-700 text-sm mt-1">
                            Pre-booking and investment opportunities will be available soon.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 