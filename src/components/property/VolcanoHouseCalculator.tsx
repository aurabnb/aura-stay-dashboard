'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Calculator, Home, Mountain, TreePine, Zap, Droplets, Wifi } from 'lucide-react'
import Link from 'next/link'

interface ConstructionItem {
  name: string
  basePrice: number
  unit: string
  icon: React.ReactNode
  category: string
}

const VolcanoHouseCalculator: React.FC = () => {
  const [squareFootage, setSquareFootage] = useState(1200)
  const [bedrooms, setBedrooms] = useState(2)
  const [bathrooms, setBathrooms] = useState(2)
  const [luxuryLevel, setLuxuryLevel] = useState('mid') // basic, mid, luxury
  const [ecoFeatures, setEcoFeatures] = useState({
    solarPanels: true,
    rainwaterHarvesting: true,
    greyWaterRecycling: false,
    greenRoof: false,
    naturalCooling: true
  })

  const constructionItems: ConstructionItem[] = [
    {
      name: 'Foundation & Structure',
      basePrice: 45,
      unit: 'per sq ft',
      icon: <Home className="h-5 w-5" />,
      category: 'Structure'
    },
    {
      name: 'Roofing (Eco-friendly)',
      basePrice: 12,
      unit: 'per sq ft',
      icon: <TreePine className="h-5 w-5" />,
      category: 'Structure'
    },
    {
      name: 'Solar Panel System',
      basePrice: 8000,
      unit: 'per bedroom',
      icon: <Zap className="h-5 w-5" />,
      category: 'Utilities'
    },
    {
      name: 'Water Systems',
      basePrice: 3500,
      unit: 'per bathroom',
      icon: <Droplets className="h-5 w-5" />,
      category: 'Utilities'
    },
    {
      name: 'High-Speed Internet',
      basePrice: 2500,
      unit: 'flat rate',
      icon: <Wifi className="h-5 w-5" />,
      category: 'Utilities'
    }
  ]

  const calculateBaseCost = () => {
    let total = 0
    
    // Base construction cost
    total += squareFootage * 45 // Foundation & structure
    total += squareFootage * 12 // Roofing
    
    // Room-based costs
    total += bedrooms * 8000 // Bedroom finishing
    total += bathrooms * 5500 // Bathroom finishing
    
    // Luxury multiplier
    const luxuryMultipliers = {
      basic: 1.0,
      mid: 1.3,
      luxury: 1.8
    }
    
    total *= luxuryMultipliers[luxuryLevel as keyof typeof luxuryMultipliers]
    
    return total
  }

  const calculateEcoFeatures = () => {
    let cost = 0
    
    if (ecoFeatures.solarPanels) cost += 15000
    if (ecoFeatures.rainwaterHarvesting) cost += 8000
    if (ecoFeatures.greyWaterRecycling) cost += 12000
    if (ecoFeatures.greenRoof) cost += squareFootage * 8
    if (ecoFeatures.naturalCooling) cost += 6000
    
    return cost
  }

  const calculatePermitsAndFees = () => {
    return Math.round(calculateBaseCost() * 0.15) // 15% for permits, fees, etc.
  }

  const calculateContingency = () => {
    const subtotal = calculateBaseCost() + calculateEcoFeatures() + calculatePermitsAndFees()
    return Math.round(subtotal * 0.1) // 10% contingency
  }

  const getTotalCost = () => {
    return calculateBaseCost() + calculateEcoFeatures() + calculatePermitsAndFees() + calculateContingency()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Mountain className="h-8 w-8 text-orange-600" />
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Volcano House
          </h1>
        </div>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Costa Rica&apos;s premier eco-luxury stay at the edge of Miravalles Volcano. 
          Calculate construction costs for your dream sustainable retreat.
        </p>
        <Link 
          href="/"
          className="inline-block bg-gray-700 hover:bg-gray-800 text-white px-6 py-2 rounded-full text-sm font-medium transition-colors"
        >
          ← Back to Home
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Calculator Inputs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Construction Calculator
            </CardTitle>
            <CardDescription>
              Customize your Volcano House specifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Specifications */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Basic Specifications</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sqft">Square Footage</Label>
                  <Input
                    id="sqft"
                    type="number"
                    value={squareFootage}
                    onChange={(e) => setSquareFootage(parseInt(e.target.value) || 0)}
                    min="500"
                    max="5000"
                  />
                </div>
                <div>
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    value={bedrooms}
                    onChange={(e) => setBedrooms(parseInt(e.target.value) || 0)}
                    min="1"
                    max="6"
                  />
                </div>
                <div>
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    value={bathrooms}
                    onChange={(e) => setBathrooms(parseInt(e.target.value) || 0)}
                    min="1"
                    max="6"
                  />
                </div>
              </div>
            </div>

            {/* Luxury Level */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Luxury Level</h4>
              <div className="grid grid-cols-3 gap-3">
                {['basic', 'mid', 'luxury'].map((level) => (
                  <Button
                    key={level}
                    variant={luxuryLevel === level ? 'default' : 'outline'}
                    onClick={() => setLuxuryLevel(level)}
                    className="capitalize"
                  >
                    {level}
                  </Button>
                ))}
              </div>
            </div>

            {/* Eco Features */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Eco Features</h4>
              <div className="space-y-2">
                {Object.entries(ecoFeatures).map(([feature, enabled]) => (
                  <div key={feature} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={feature}
                      checked={enabled}
                      onChange={(e) => setEcoFeatures({
                        ...ecoFeatures,
                        [feature]: e.target.checked
                      })}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor={feature} className="text-sm capitalize">
                      {feature.replace(/([A-Z])/g, ' $1').trim()}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cost Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Cost Breakdown</CardTitle>
            <CardDescription>
              Estimated construction costs for your Volcano House
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Specifications Summary */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <h5 className="font-semibold text-gray-900">Your Specifications:</h5>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span>Size: {squareFootage.toLocaleString()} sq ft</span>
                <span>Bedrooms: {bedrooms}</span>
                <span>Bathrooms: {bathrooms}</span>
                <span>Level: {luxuryLevel}</span>
              </div>
            </div>

            {/* Cost Items */}
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Base Construction</span>
                <span className="font-medium">{formatCurrency(calculateBaseCost())}</span>
              </div>
              <div className="flex justify-between">
                <span>Eco Features</span>
                <span className="font-medium">{formatCurrency(calculateEcoFeatures())}</span>
              </div>
              <div className="flex justify-between">
                <span>Permits & Fees</span>
                <span className="font-medium">{formatCurrency(calculatePermitsAndFees())}</span>
              </div>
              <div className="flex justify-between">
                <span>Contingency (10%)</span>
                <span className="font-medium">{formatCurrency(calculateContingency())}</span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between text-lg font-bold">
                <span>Total Cost</span>
                <span className="text-green-600">{formatCurrency(getTotalCost())}</span>
              </div>
              
              <div className="text-sm text-gray-600">
                Cost per sq ft: {formatCurrency(getTotalCost() / squareFootage)}
              </div>
            </div>

            {/* Construction Items Detail */}
            <div className="space-y-3">
              <h5 className="font-semibold text-gray-900">Included Features:</h5>
              <div className="space-y-2">
                {constructionItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 text-sm">
                    <div className="text-gray-600">{item.icon}</div>
                    <span className="flex-1">{item.name}</span>
                    <span className="text-gray-600">{formatCurrency(item.basePrice)} {item.unit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact CTA */}
            <div className="bg-orange-50 p-4 rounded-lg">
              <h5 className="font-semibold text-orange-900 mb-2">Ready to Build?</h5>
              <p className="text-sm text-orange-800 mb-3">
                Contact our team to get a detailed quote and start planning your Volcano House.
              </p>
              <Button className="w-full bg-orange-600 hover:bg-orange-700">
                Get Detailed Quote
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default VolcanoHouseCalculator
export { VolcanoHouseCalculator } 