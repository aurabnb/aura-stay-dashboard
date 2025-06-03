'use client'

import React, { useState } from 'react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calculator, Home, MapPin, DollarSign, Users, Leaf, Calendar, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function VolcanoHousePage() {
  const [bedrooms, setBedrooms] = useState('2')
  const [bathrooms, setBathrooms] = useState('2')
  const [size, setSize] = useState('1200')
  const [features, setFeatures] = useState<string[]>([])
  const [estimatedCost, setEstimatedCost] = useState(0)

  const baseConstructionCost = 85 // $85 per sq ft in Costa Rica
  const premiumFeatureCosts = {
    'Solar Power System': 15000,
    'Rainwater Harvesting': 8000,
    'Geothermal Heating': 12000,
    'Smart Home Integration': 5000,
    'Infinity Pool': 25000,
    'Outdoor Kitchen': 8000,
    'Sustainable Materials Upgrade': 10000,
    'Panoramic Glass Walls': 15000
  }

  const calculateCost = () => {
    const baseCost = parseInt(size) * baseConstructionCost
    const featureCosts = features.reduce((sum, feature) => sum + (premiumFeatureCosts[feature as keyof typeof premiumFeatureCosts] || 0), 0)
    setEstimatedCost(baseCost + featureCosts)
  }

  React.useEffect(() => {
    calculateCost()
  }, [size, features])

  const toggleFeature = (feature: string) => {
    setFeatures(prev => 
      prev.includes(feature) 
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8 pt-28">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Home className="h-8 w-8 text-gray-700" />
            <h1 className="text-4xl font-bold text-gray-900">
              Volcano House
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our flagship eco-lodge in Guayabo, Costa Rica. Experience sustainable luxury 
            in the shadow of the Turrialba Volcano.
          </p>
          <div className="mt-6">
            <Link href="/">
              <Button variant="outline" className="mr-4">
                <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
                Back to Homepage
              </Button>
            </Link>
          </div>
        </div>

        {/* Project Overview */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Project Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Location</span>
                <span className="font-semibold">Guayabo, Costa Rica</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Property Size</span>
                <span className="font-semibold">2.5 acres</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Elevation</span>
                <span className="font-semibold">3,200 ft</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Expected Completion</span>
                <span className="font-semibold">July 2025</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Funding Goal</span>
                <span className="font-semibold">$100,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Current Progress</span>
                <span className="font-semibold text-green-600">87% Funded</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-5 w-5" />
                Sustainable Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">100% renewable energy powered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Rainwater collection system</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Locally sourced building materials</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Organic waste composting</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Native flora restoration</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Carbon-negative operations</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Construction Cost Calculator */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Construction Cost Calculator
            </CardTitle>
            <p className="text-gray-600">
              Estimate construction costs for similar eco-lodges in Costa Rica
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
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
                    <SelectItem value="4">4 Bathrooms</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="size">Size (sq ft)</Label>
                <Input
                  id="size"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  placeholder="1200"
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label>Premium Features</Label>
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(premiumFeatureCosts).map(([feature, cost]) => (
                  <div key={feature} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={feature}
                      checked={features.includes(feature)}
                      onChange={() => toggleFeature(feature)}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor={feature} className="text-sm flex-1">
                      {feature}
                    </label>
                    <span className="text-sm text-gray-600">
                      +${cost.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Estimated Total Cost</h3>
                  <p className="text-sm text-gray-600">
                    Base cost: ${baseConstructionCost}/sq ft • Premium features included
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-600">
                    ${estimatedCost.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">
                    ${(estimatedCost / parseInt(size)).toFixed(0)}/sq ft
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Cost Breakdown Includes:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Foundation and structural engineering</li>
                <li>• Sustainable building materials</li>
                <li>• Solar power system installation</li>
                <li>• Plumbing and electrical work</li>
                <li>• Interior finishes and furnishing</li>
                <li>• Permits and legal fees</li>
                <li>• Labor costs (local rates)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Projections */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Revenue Projections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">$250/night</div>
                <div className="text-sm text-gray-600">Average Nightly Rate</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">75%</div>
                <div className="text-sm text-gray-600">Expected Occupancy</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">$68k/year</div>
                <div className="text-sm text-gray-600">Projected Annual Revenue</div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">Revenue Distribution to AURA Holders:</h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Gross Revenue:</span>
                  <span className="float-right font-semibold">$68,000</span>
                </div>
                <div>
                  <span className="text-gray-600">Operating Expenses (30%):</span>
                  <span className="float-right font-semibold">-$20,400</span>
                </div>
                <div>
                  <span className="text-gray-600">Property Management (15%):</span>
                  <span className="float-right font-semibold">-$10,200</span>
                </div>
                <div className="border-t pt-2">
                  <span className="text-gray-900 font-semibold">Net Revenue to Holders:</span>
                  <span className="float-right font-bold text-green-600">$37,400</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Construction Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <div className="font-semibold">Land Acquisition ✓</div>
                  <div className="text-sm text-gray-600">Completed December 2024</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <div className="font-semibold">Permits & Approvals ✓</div>
                  <div className="text-sm text-gray-600">Completed January 2025</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                <div className="flex-1">
                  <div className="font-semibold">Foundation & Structure</div>
                  <div className="text-sm text-gray-600">In Progress - March 2025</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                <div className="flex-1">
                  <div className="font-semibold">Interior & Systems</div>
                  <div className="text-sm text-gray-600">Planned - May 2025</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                <div className="flex-1">
                  <div className="font-semibold">Grand Opening</div>
                  <div className="text-sm text-gray-600">Target - July 2025</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  )
} 