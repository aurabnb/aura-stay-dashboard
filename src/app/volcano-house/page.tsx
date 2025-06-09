'use client'

import React, { useState, useEffect } from 'react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Calculator, 
  Home, 
  MapPin, 
  DollarSign, 
  Users, 
  Leaf, 
  Calendar, 
  ArrowRight, 
  Mountain,
  TreePine,
  Droplets,
  Sun,
  Building,
  Star,
  Camera,
  TrendingUp,
  PieChart,
  Clock,
  Thermometer,
  Wind,
  CheckCircle,
  PlayCircle,
  ImageIcon,
  Globe,
  Wifi,
  Car,
  Coffee,
  Utensils,
  Bed,
  Bath,
  Maximize,
  Zap
} from 'lucide-react'
import Link from 'next/link'

export default function VolcanoHousePage() {
  const [bedrooms, setBedrooms] = useState('2')
  const [bathrooms, setBathrooms] = useState('2')
  const [size, setSize] = useState('1200')
  const [features, setFeatures] = useState<string[]>([])
  const [estimatedCost, setEstimatedCost] = useState(0)
  const [activeTab, setActiveTab] = useState('overview')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isCalculatorExpanded, setIsCalculatorExpanded] = useState(false)

  const baseConstructionCost = 85 // $85 per sq ft in Costa Rica
  const premiumFeatureCosts = {
    'Solar Power System': 15000,
    'Rainwater Harvesting': 8000,
    'Geothermal Heating': 12000,
    'Smart Home Integration': 5000,
    'Infinity Pool': 25000,
    'Outdoor Kitchen': 8000,
    'Sustainable Materials Upgrade': 10000,
    'Panoramic Glass Walls': 15000,
    'Electric Vehicle Charging': 3000,
    'Meditation Deck': 6000,
    'Observatory Dome': 18000,
    'Greenhouse': 12000
  }

  const propertyImages = [
    '/properties/volcano-house-1.jpg',
    '/properties/volcano-house-2.jpg',
    '/properties/volcano-house-3.jpg',
    '/properties/volcano-house-4.jpg',
    '/properties/volcano-house-5.jpg'
  ]

  const sustainabilityMetrics = [
    { label: 'Carbon Footprint Reduction', value: '95%', icon: Leaf },
    { label: 'Renewable Energy Usage', value: '100%', icon: Sun },
    { label: 'Water Conservation', value: '80%', icon: Droplets },
    { label: 'Local Material Usage', value: '85%', icon: Building }
  ]

  const amenities = [
    { name: 'High-Speed WiFi', icon: Wifi, included: true },
    { name: 'Electric Vehicle Charging', icon: Car, included: true },
    { name: 'Organic Coffee Bar', icon: Coffee, included: true },
    { name: 'Farm-to-Table Kitchen', icon: Utensils, included: true },
    { name: 'King Size Eco-Beds', icon: Bed, included: true },
    { name: 'Spa-Quality Bathrooms', icon: Bath, included: true },
    { name: 'Panoramic Views', icon: Maximize, included: true },
    { name: 'Solar Power System', icon: Zap, included: true }
  ]

  const weatherData = [
    { time: 'Morning', temp: '72°F', condition: 'Misty', icon: '🌫️' },
    { time: 'Afternoon', temp: '78°F', condition: 'Sunny', icon: '☀️' },
    { time: 'Evening', temp: '68°F', condition: 'Clear', icon: '🌙' },
    { time: 'Night', temp: '65°F', condition: 'Starry', icon: '✨' }
  ]

  const investmentHighlights = [
    {
      title: 'Strong ROI Potential',
      value: '12.5%',
      description: 'Expected annual return on investment',
      trend: '+2.3%',
      icon: TrendingUp
    },
    {
      title: 'High Occupancy Rate',
      value: '75%',
      description: 'Based on regional eco-lodge data',
      trend: '+5%',
      icon: Users
    },
    {
      title: 'Premium Pricing',
      value: '$250',
      description: 'Average nightly rate',
      trend: '+8%',
      icon: DollarSign
    },
    {
      title: 'Sustainability Score',
      value: '9.2/10',
      description: 'Environmental impact rating',
      trend: 'A+',
      icon: Leaf
    }
  ]

  const calculateCost = () => {
    const baseCost = parseInt(size) * baseConstructionCost
    const featureCosts = features.reduce((sum, feature) => sum + (premiumFeatureCosts[feature as keyof typeof premiumFeatureCosts] || 0), 0)
    setEstimatedCost(baseCost + featureCosts)
  }

  useEffect(() => {
    calculateCost()
  }, [size, features])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % propertyImages.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const toggleFeature = (feature: string) => {
    setFeatures(prev => 
      prev.includes(feature) 
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    )
  }

  const fundingProgress = 87

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8 pt-28">
        {/* Hero Section with Background Image */}
        <div className="relative overflow-hidden rounded-3xl mb-12 h-96 bg-gradient-to-r from-green-600 to-blue-600">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(https://aura-stay-dashboard.vercel.app/lovable-uploads/376d858b-71fc-454d-9450-826650b45f5c.png)'
            }}
          ></div>
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          <div className="relative z-10 h-full flex items-center justify-center text-center text-white p-8">
            <div>
              <div className="flex items-center justify-center gap-3 mb-6">
                <Mountain className="h-12 w-12" />
                <h1 className="text-5xl font-bold">
                  Volcano House
                </h1>
                <Badge variant="secondary" className="ml-4 bg-green-500 text-white">
                  🌿 Eco-Certified
                </Badge>
              </div>
              <p className="text-xl mb-6 max-w-3xl mx-auto opacity-90">
                Costa Rica's premier sustainable eco-lodge. Experience luxury accommodations 
                powered by 100% renewable energy in the shadow of Turrialba Volcano.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button className="bg-white text-green-600 hover:bg-gray-100">
                  <PlayCircle className="h-5 w-5 mr-2" />
                  Virtual Tour
                </Button>
                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-green-600">
                  <Camera className="h-5 w-5 mr-2" />
                  Photo Gallery
                </Button>
                <Link href="/">
                  <Button variant="outline" className="border-white text-white hover:bg-white hover:text-green-600">
                    <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
                    Back to Homepage
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {investmentHighlights.map((metric, index) => {
            const IconComponent = metric.icon
            return (
              <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <IconComponent className="h-8 w-8 text-green-600" />
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      {metric.trend}
                    </Badge>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {metric.value}
                  </div>
                  <div className="text-sm font-medium text-gray-700 mb-1">
                    {metric.title}
                  </div>
                  <div className="text-xs text-gray-500">
                    {metric.description}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Enhanced Funding Progress */}
        <Card className="mb-12 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  🎯 Funding Progress
                  <Badge className="ml-3 bg-green-600 text-white">Only $13k left!</Badge>
                </h3>
                <p className="text-gray-600">We're almost there! Help us complete this sustainable paradise.</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-green-600">{fundingProgress}%</div>
                <div className="text-sm text-gray-600">$87,000 / $100,000</div>
                <div className="text-xs text-green-600 font-medium">🔥 $2,500 raised this week</div>
              </div>
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Funding Progress</span>
                <span className="text-sm text-gray-600">{fundingProgress}% Complete</span>
              </div>
              <Progress value={fundingProgress} className="h-6 mb-2" />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Dec 2024</span>
                <span className="font-medium text-green-600">Current: $87K</span>
                <span>Jul 2025</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-lg font-bold text-blue-600">156</div>
                <div className="text-xs text-gray-600">Investors</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-lg font-bold text-green-600">$559</div>
                <div className="text-xs text-gray-600">Avg. Investment</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-lg font-bold text-purple-600">23</div>
                <div className="text-xs text-gray-600">Days Left</div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Button className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-none">
                <DollarSign className="h-4 w-4 mr-2" />
                Invest Now
              </Button>
              <Button variant="outline" className="flex-1 sm:flex-none">
                💎 View Investment Tiers
              </Button>
              <Button variant="outline" className="flex-1 sm:flex-none">
                📊 Investment FAQ
              </Button>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-800">
                <strong>💡 Early Bird Bonus:</strong> Invest before February 15th and get 
                <span className="font-semibold"> 5% bonus tokens</span> + 
                <span className="font-semibold"> free helicopter transfer</span> on opening day!
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-12">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sustainability">Sustainability</TabsTrigger>
            <TabsTrigger value="amenities">Amenities</TabsTrigger>
            <TabsTrigger value="calculator">Calculator</TabsTrigger>
            <TabsTrigger value="investment">Investment</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Project Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Project Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">2.5</div>
                      <div className="text-sm text-gray-600">Acres</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">3,200</div>
                      <div className="text-sm text-gray-600">Elevation (ft)</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">📍 Location</span>
                      <span className="font-semibold">Guayabo, Costa Rica</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">🏗️ Completion</span>
                      <span className="font-semibold">July 2025</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">🌡️ Climate</span>
                      <span className="font-semibold">Tropical Highland</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">🏔️ Volcano Distance</span>
                      <span className="font-semibold">2.5 miles</span>
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">🌋 About Turrialba Volcano</h4>
                    <p className="text-sm text-green-700">
                      One of Costa Rica's most active volcanoes, offering spectacular views and unique geothermal features. 
                      Our property provides safe, stunning vantage points of this natural wonder.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Weather & Location */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Thermometer className="h-5 w-5" />
                    Climate & Weather
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {weatherData.map((weather, index) => (
                      <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-2xl mb-1">{weather.icon}</div>
                        <div className="font-semibold">{weather.temp}</div>
                        <div className="text-xs text-gray-600">{weather.time}</div>
                        <div className="text-xs text-gray-500">{weather.condition}</div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Perfect Year-Round Climate</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Average temperature: 65-78°F</li>
                      <li>• Low humidity (40-60%)</li>
                      <li>• Minimal seasonal variation</li>
                      <li>• 300+ days of sunshine</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Construction Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Construction Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-5 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="h-8 w-8 text-white" />
                    </div>
                    <div className="font-semibold text-green-600">Land Acquisition</div>
                    <div className="text-sm text-gray-600">Dec 2024 ✓</div>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="h-8 w-8 text-white" />
                    </div>
                    <div className="font-semibold text-green-600">Permits & Approvals</div>
                    <div className="text-sm text-gray-600">Jan 2025 ✓</div>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Clock className="h-8 w-8 text-white" />
                    </div>
                    <div className="font-semibold text-yellow-600">Foundation</div>
                    <div className="text-sm text-gray-600">Mar 2025 (In Progress)</div>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Building className="h-8 w-8 text-white" />
                    </div>
                    <div className="font-semibold text-gray-600">Interior & Systems</div>
                    <div className="text-sm text-gray-600">May 2025</div>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Star className="h-8 w-8 text-white" />
                    </div>
                    <div className="font-semibold text-gray-600">Grand Opening</div>
                    <div className="text-sm text-gray-600">Jul 2025</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sustainability" className="space-y-8">
            {/* Sustainability Metrics */}
            <div className="grid md:grid-cols-4 gap-6">
              {sustainabilityMetrics.map((metric, index) => {
                const IconComponent = metric.icon
                return (
                  <Card key={index} className="text-center">
                    <CardContent className="p-6">
                      <IconComponent className="h-12 w-12 text-green-600 mx-auto mb-4" />
                      <div className="text-3xl font-bold text-green-600 mb-2">{metric.value}</div>
                      <div className="text-sm font-medium text-gray-700">{metric.label}</div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Detailed Sustainability Features */}
            <div className="grid lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Leaf className="h-5 w-5" />
                    Environmental Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { icon: '🌞', title: '100% Solar Powered', desc: 'Complete energy independence with battery storage' },
                    { icon: '💧', title: 'Rainwater Harvesting', desc: '10,000L collection system with filtration' },
                    { icon: '🌱', title: 'Organic Waste Composting', desc: 'Zero waste to landfill policy' },
                    { icon: '🌳', title: 'Native Flora Restoration', desc: '500+ indigenous plants on property' },
                    { icon: '🔄', title: 'Greywater Recycling', desc: 'Advanced water treatment and reuse' },
                    { icon: '🌍', title: 'Carbon Negative Operations', desc: 'Sequestering more CO₂ than we emit' }
                  ].map((feature, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl">{feature.icon}</div>
                      <div>
                        <div className="font-semibold text-green-800">{feature.title}</div>
                        <div className="text-sm text-green-600">{feature.desc}</div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TreePine className="h-5 w-5" />
                    Community Impact
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { icon: '👥', title: 'Local Employment', desc: '15 full-time jobs for community members' },
                    { icon: '🎓', title: 'Educational Programs', desc: 'Sustainability workshops for local schools' },
                    { icon: '🛒', title: 'Local Sourcing', desc: '85% of materials and supplies from region' },
                    { icon: '🌾', title: 'Organic Farm Partnership', desc: 'Supporting 3 local organic farms' },
                    { icon: '🏥', title: 'Healthcare Contributions', desc: '$10k annual donation to local clinic' },
                    { icon: '📚', title: 'Conservation Research', desc: 'Hosting university research programs' }
                  ].map((impact, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl">{impact.icon}</div>
                      <div>
                        <div className="font-semibold text-blue-800">{impact.title}</div>
                        <div className="text-sm text-blue-600">{impact.desc}</div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="amenities" className="space-y-8">
            <div className="grid lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Premium Amenities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {amenities.map((amenity, index) => {
                      const IconComponent = amenity.icon
                      return (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <IconComponent className="h-5 w-5 text-green-600" />
                          <div>
                            <div className="font-medium text-sm">{amenity.name}</div>
                            {amenity.included && (
                              <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                                Included
                              </Badge>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    Activities & Experiences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    '🥾 Volcano hiking trails',
                    '🦋 Wildlife observation tours',
                    '☕ Coffee plantation visits',
                    '🧘 Sunrise meditation sessions',
                    '🌌 Stargazing from observatory',
                    '🎣 Sustainable fishing experiences',
                    '🌿 Herbal garden workshops',
                    '📸 Photography masterclasses'
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">{activity}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="calculator" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Enhanced Construction Calculator
                </CardTitle>
                <p className="text-gray-600">
                  Calculate costs for similar eco-lodges with our advanced estimation tool
                </p>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Basic Parameters */}
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="bedrooms">Bedrooms</Label>
                    <Select value={bedrooms} onValueChange={setBedrooms}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Bedroom</SelectItem>
                        <SelectItem value="2">2 Bedrooms</SelectItem>
                        <SelectItem value="3">3 Bedrooms</SelectItem>
                        <SelectItem value="4">4 Bedrooms</SelectItem>
                        <SelectItem value="5">5+ Bedrooms</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bathrooms">Bathrooms</Label>
                    <Select value={bathrooms} onValueChange={setBathrooms}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Bathroom</SelectItem>
                        <SelectItem value="2">2 Bathrooms</SelectItem>
                        <SelectItem value="3">3 Bathrooms</SelectItem>
                        <SelectItem value="4">4+ Bathrooms</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="size">Total Size (sq ft)</Label>
                    <Input
                      id="size"
                      value={size}
                      onChange={(e) => setSize(e.target.value)}
                      placeholder="1200"
                      className="text-lg"
                    />
                  </div>
                </div>

                {/* Premium Features */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-semibold">Premium Features</Label>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setIsCalculatorExpanded(!isCalculatorExpanded)}
                    >
                      {isCalculatorExpanded ? 'Show Less' : 'Show All Features'}
                    </Button>
                  </div>
                  
                  <div className={`grid md:grid-cols-2 gap-4 ${isCalculatorExpanded ? '' : 'max-h-48 overflow-hidden'}`}>
                    {Object.entries(premiumFeatureCosts).map(([feature, cost]) => (
                      <div key={feature} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                        <input
                          type="checkbox"
                          id={feature}
                          checked={features.includes(feature)}
                          onChange={() => toggleFeature(feature)}
                          className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-600"
                        />
                        <label htmlFor={feature} className="flex-1 text-sm font-medium cursor-pointer">
                          {feature}
                        </label>
                        <span className="text-sm font-semibold text-green-600">
                          +${cost.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cost Breakdown */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Cost Estimate</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Base Construction:</span>
                          <span className="font-semibold">${(parseInt(size) * baseConstructionCost).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Premium Features:</span>
                          <span className="font-semibold">+${features.reduce((sum, feature) => sum + (premiumFeatureCosts[feature as keyof typeof premiumFeatureCosts] || 0), 0).toLocaleString()}</span>
                        </div>
                        <div className="border-t pt-3">
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-bold text-gray-900">Total Estimate:</span>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-green-600">
                                ${estimatedCost.toLocaleString()}
                              </div>
                              <div className="text-sm text-gray-600">
                                ${Math.round(estimatedCost / parseInt(size))}/sq ft
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">What's Included:</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {[
                          '✓ Foundation & Structure',
                          '✓ Sustainable Materials',
                          '✓ Solar Installation',
                          '✓ Plumbing & Electrical',
                          '✓ Interior Finishes',
                          '✓ Permits & Legal',
                          '✓ Local Labor',
                          '✓ Project Management'
                        ].map((item, index) => (
                          <div key={index} className="text-gray-600">{item}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="investment" className="space-y-8">
            {/* Revenue Projections */}
            <div className="grid lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Revenue Projections
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">$250</div>
                      <div className="text-sm text-gray-600">Avg. Nightly Rate</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">75%</div>
                      <div className="text-sm text-gray-600">Occupancy Rate</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">$68k</div>
                      <div className="text-sm text-gray-600">Annual Revenue</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900">5-Year Revenue Forecast:</h4>
                    {[
                      { year: 'Year 1', revenue: '$68,000', growth: '-' },
                      { year: 'Year 2', revenue: '$74,800', growth: '+10%' },
                      { year: 'Year 3', revenue: '$82,280', growth: '+10%' },
                      { year: 'Year 4', revenue: '$90,508', growth: '+10%' },
                      { year: 'Year 5', revenue: '$99,559', growth: '+10%' }
                    ].map((forecast, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">{forecast.year}:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{forecast.revenue}</span>
                          {forecast.growth !== '-' && (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              {forecast.growth}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Return Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-3">Annual Distribution Breakdown:</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Gross Revenue:</span>
                          <span className="font-semibold">$68,000</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Operating Expenses (30%):</span>
                          <span className="font-semibold text-red-600">-$20,400</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Property Management (15%):</span>
                          <span className="font-semibold text-red-600">-$10,200</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Maintenance Reserve (10%):</span>
                          <span className="font-semibold text-red-600">-$6,800</span>
                        </div>
                        <div className="border-t pt-2 flex justify-between">
                          <span className="font-bold text-gray-900">Net to AURA Holders:</span>
                          <span className="font-bold text-green-600">$30,600</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Per $1,000 investment:</span>
                          <span className="font-semibold">~$306/year</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">Investment Benefits:</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>✓ Quarterly dividend payments</li>
                        <li>✓ Property appreciation potential</li>
                        <li>✓ Voting rights on major decisions</li>
                        <li>✓ Discounted stays at the property</li>
                        <li>✓ Tax benefits (consult advisor)</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Investment Call to Action */}
            <Card className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-4">Ready to Invest in Sustainable Hospitality?</h3>
                <p className="text-lg mb-6 opacity-90">
                  Join our community of eco-conscious investors and earn returns while protecting the environment.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button className="bg-white text-green-600 hover:bg-gray-100">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Start Investing
                  </Button>
                  <Button variant="outline" className="border-white text-white hover:bg-white hover:text-green-600">
                    Download Prospectus
                  </Button>
                  <Button variant="outline" className="border-white text-white hover:bg-white hover:text-green-600">
                    Schedule a Call
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Interactive Map Section */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Location & Accessibility
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="aspect-video bg-gradient-to-r from-green-100 to-blue-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Interactive Map</h3>
                    <p className="text-gray-600 mb-4">Explore our location in beautiful Costa Rica</p>
                    <Button className="bg-green-600 hover:bg-green-700">
                      View on Google Maps
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Getting There:</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-blue-600">✈️</span>
                      </div>
                      <div>
                        <div className="font-medium">San José Airport (SJO)</div>
                        <div className="text-sm text-gray-600">2.5 hours drive via scenic route</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-green-600">🚗</span>
                      </div>
                      <div>
                        <div className="font-medium">Private Transfer</div>
                        <div className="text-sm text-gray-600">Available on request - $75 each way</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-purple-600">🚁</span>
                      </div>
                      <div>
                        <div className="font-medium">Helicopter Transfer</div>
                        <div className="text-sm text-gray-600">45 minutes scenic flight - $400 per person</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Nearby Attractions:</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="p-2 bg-gray-50 rounded">🌋 Turrialba Volcano (2.5 mi)</div>
                    <div className="p-2 bg-gray-50 rounded">☕ Coffee Tours (1 mi)</div>
                    <div className="p-2 bg-gray-50 rounded">🦋 Butterfly Garden (3 mi)</div>
                    <div className="p-2 bg-gray-50 rounded">🌊 White Water Rafting (5 mi)</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Testimonials */}
        <Card className="mb-12 bg-gradient-to-r from-blue-50 to-green-50">
          <CardHeader>
            <CardTitle className="text-center">What Visitors Say</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-white rounded-lg shadow-sm">
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">
                  "An absolutely magical experience! The sustainability features didn't compromise on luxury at all."
                </p>
                <div className="font-semibold">- Sarah M.</div>
                <div className="text-sm text-gray-500">Environmental Scientist</div>
              </div>
              
              <div className="text-center p-6 bg-white rounded-lg shadow-sm">
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">
                  "The volcano views at sunrise are breathtaking. Best eco-lodge we've ever stayed at!"
                </p>
                <div className="font-semibold">- Mark & Lisa T.</div>
                <div className="text-sm text-gray-500">Travel Bloggers</div>
              </div>
              
              <div className="text-center p-6 bg-white rounded-lg shadow-sm">
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">
                  "Perfect blend of comfort and environmental consciousness. The investment returns are great too!"
                </p>
                <div className="font-semibold">- David K.</div>
                <div className="text-sm text-gray-500">AURA Investor</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Facts Footer */}
        <Card className="bg-gray-50">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="group hover:scale-105 transition-transform">
                <div className="text-2xl font-bold text-green-600 group-hover:text-green-700">100%</div>
                <div className="text-sm text-gray-600">Renewable Energy</div>
              </div>
              <div className="group hover:scale-105 transition-transform">
                <div className="text-2xl font-bold text-blue-600 group-hover:text-blue-700">12.5%</div>
                <div className="text-sm text-gray-600">Expected ROI</div>
              </div>
              <div className="group hover:scale-105 transition-transform">
                <div className="text-2xl font-bold text-purple-600 group-hover:text-purple-700">2025</div>
                <div className="text-sm text-gray-600">Opening Year</div>
              </div>
              <div className="group hover:scale-105 transition-transform">
                <div className="text-2xl font-bold text-orange-600 group-hover:text-orange-700">A+</div>
                <div className="text-sm text-gray-600">Sustainability Rating</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  )
} 