import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Calculator, Home, Mountain, TreePine, Zap, Droplets, Wifi } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ConstructionItem {
  name: string;
  basePrice: number;
  unit: string;
  icon: React.ReactNode;
  category: string;
}

const VolcanoHouseCalculator: React.FC = () => {
  const [squareFootage, setSquareFootage] = useState(1200);
  const [bedrooms, setBedrooms] = useState(2);
  const [bathrooms, setBathrooms] = useState(2);
  const [luxuryLevel, setLuxuryLevel] = useState('mid'); // basic, mid, luxury
  const [ecoFeatures, setEcoFeatures] = useState({
    solarPanels: true,
    rainwaterHarvesting: true,
    greyWaterRecycling: false,
    greenRoof: false,
    naturalCooling: true
  });

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
  ];

  const calculateBaseCost = () => {
    let total = 0;
    
    // Base construction cost
    total += squareFootage * 45; // Foundation & structure
    total += squareFootage * 12; // Roofing
    
    // Room-based costs
    total += bedrooms * 8000; // Bedroom finishing
    total += bathrooms * 5500; // Bathroom finishing
    
    // Luxury multiplier
    const luxuryMultipliers = {
      basic: 1.0,
      mid: 1.3,
      luxury: 1.8
    };
    
    total *= luxuryMultipliers[luxuryLevel as keyof typeof luxuryMultipliers];
    
    return total;
  };

  const calculateEcoFeatures = () => {
    let cost = 0;
    
    if (ecoFeatures.solarPanels) cost += 15000;
    if (ecoFeatures.rainwaterHarvesting) cost += 8000;
    if (ecoFeatures.greyWaterRecycling) cost += 12000;
    if (ecoFeatures.greenRoof) cost += squareFootage * 8;
    if (ecoFeatures.naturalCooling) cost += 6000;
    
    return cost;
  };

  const calculatePermitsAndFees = () => {
    return Math.round(calculateBaseCost() * 0.15); // 15% for permits, fees, etc.
  };

  const calculateContingency = () => {
    const subtotal = calculateBaseCost() + calculateEcoFeatures() + calculatePermitsAndFees();
    return Math.round(subtotal * 0.1); // 10% contingency
  };

  const getTotalCost = () => {
    return calculateBaseCost() + calculateEcoFeatures() + calculatePermitsAndFees() + calculateContingency();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Mountain className="h-8 w-8 text-orange-600" />
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 font-urbanist">
            Volcano House
          </h1>
        </div>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Costa Rica's premier eco-luxury stay at the edge of Miravalles Volcano. 
          Calculate construction costs for your dream sustainable retreat.
        </p>
        <Link 
          to="/"
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

            <Separator />

            {/* Luxury Level */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Finish Level</h4>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'basic', label: 'Basic', multiplier: '1.0x' },
                  { key: 'mid', label: 'Mid-Range', multiplier: '1.3x' },
                  { key: 'luxury', label: 'Luxury', multiplier: '1.8x' }
                ].map((level) => (
                  <Button
                    key={level.key}
                    variant={luxuryLevel === level.key ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setLuxuryLevel(level.key)}
                    className="flex flex-col h-auto py-3"
                  >
                    <span className="font-medium">{level.label}</span>
                    <span className="text-xs opacity-70">{level.multiplier}</span>
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Eco Features */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Eco Features</h4>
              <div className="space-y-3">
                {Object.entries(ecoFeatures).map(([key, value]) => (
                  <label key={key} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setEcoFeatures({
                        ...ecoFeatures,
                        [key]: e.target.checked
                      })}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </span>
                  </label>
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
              Estimated construction costs in USD
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Base Construction</span>
                <span className="font-mono">{formatCurrency(calculateBaseCost())}</span>
              </div>
              <div className="flex justify-between">
                <span>Eco Features</span>
                <span className="font-mono">{formatCurrency(calculateEcoFeatures())}</span>
              </div>
              <div className="flex justify-between">
                <span>Permits & Fees (15%)</span>
                <span className="font-mono">{formatCurrency(calculatePermitsAndFees())}</span>
              </div>
              <div className="flex justify-between">
                <span>Contingency (10%)</span>
                <span className="font-mono">{formatCurrency(calculateContingency())}</span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between text-lg font-bold">
                <span>Total Estimated Cost</span>
                <span className="font-mono text-green-600">
                  {formatCurrency(getTotalCost())}
                </span>
              </div>
            </div>

            <div className="pt-4 space-y-3">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-semibold text-gray-900 mb-2">Cost per Square Foot</h5>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(getTotalCost() / squareFootage)} / sq ft
                </p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h5 className="font-semibold text-blue-900 mb-2">Timeline Estimate</h5>
                <p className="text-sm text-blue-800">
                  6-9 months construction time<br/>
                  Including permits and eco-system installation
                </p>
              </div>
            </div>

            <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
              Request Detailed Quote
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Project Info */}
      <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
        <CardContent className="p-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold text-orange-900 mb-4">
                About the Volcano House Project
              </h3>
              <ul className="space-y-2 text-orange-800">
                <li>• Located at the edge of Costa Rica's Miravalles Volcano</li>
                <li>• 100% sustainable construction materials</li>
                <li>• Community-funded through AURA token holders</li>
                <li>• Revenue sharing with token stakers</li>
                <li>• Carbon-negative design with reforestation program</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold text-orange-900 mb-4">
                Funding Progress
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-orange-800">Target Goal</span>
                  <span className="font-bold text-orange-900">$100,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-orange-800">Current Funds</span>
                  <span className="font-bold text-orange-900">$67,432</span>
                </div>
                <div className="w-full bg-orange-200 rounded-full h-3">
                  <div className="bg-orange-600 h-3 rounded-full" style={{ width: '67%' }}></div>
                </div>
                <p className="text-sm text-orange-700">67% funded through community treasury</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VolcanoHouseCalculator; 