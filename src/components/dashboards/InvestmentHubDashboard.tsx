'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { 
  Building, 
  TrendingUp, 
  Gift, 
  Hammer, 
  MapPin, 
  DollarSign,
  Users,
  Calendar,
  Star,
  Loader2,
  ExternalLink
} from 'lucide-react'
import { useWallet } from '@solana/wallet-adapter-react'
import { toast } from 'sonner'

interface Property {
  id: string
  name: string
  location: string
  totalRaise: number
  userInvestmentPool: number
  currentInvestment: number
  minInvestment: number
  maxInvestment: number
  expectedROI: number
  constructionProgress: number
  status: 'fundraising' | 'construction' | 'operating'
  description: string
  amenities: string[]
  images: string[]
}

interface Airdrop {
  id: string
  property: string
  allocation: number
  eligibleHolders: number
  distributionDate: string
  userEstimate: number
  status: 'upcoming' | 'distributed'
}

interface UserRewards {
  AURA: number
  SAMSARA: number
  AIRSCAPE: number
}

export function InvestmentHubDashboard() {
  const { connected, publicKey } = useWallet()
  const [selectedProperty, setSelectedProperty] = useState<string>('')
  const [investmentAmount, setInvestmentAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [userStakedRewards] = useState<UserRewards>({
    AURA: 125.5,
    SAMSARA: 45.2,
    AIRSCAPE: 78.9
  })

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
      images: ['/lovable-uploads/ea2ec5fb-7766-4c6c-8b6a-659540d919d3.png']
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
      images: ['/lovable-uploads/2e8ea2f9-9d0f-4c9a-9664-88980e977f96.png']
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
      images: ['/lovable-uploads/f0fefd83-c00f-4677-bdd0-327b97ff0cb1.png']
    }
  ]

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
  ]

  const handleInvest = async (propertyId: string) => {
    if (!connected || !publicKey) {
      toast.error('Please connect your wallet to invest')
      return
    }

    if (!investmentAmount || parseFloat(investmentAmount) <= 0) {
      toast.error('Please enter a valid investment amount')
      return
    }

    try {
      setLoading(true)
      
      // Mock investment transaction
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success(`Successfully invested $${investmentAmount} in ${properties.find(p => p.id === propertyId)?.name}!`)
      setInvestmentAmount('')
      
    } catch (error) {
      console.error('Investment error:', error)
      toast.error('Failed to process investment')
    } finally {
      setLoading(false)
    }
  }

  const handleUseRewards = async (token: string, amount: number) => {
    if (!connected || !publicKey) {
      toast.error('Please connect your wallet to use rewards')
      return
    }

    try {
      setLoading(true)
      
      // Mock reward usage transaction
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast.success(`Successfully used ${amount} ${token} rewards for investment!`)
      
    } catch (error) {
      console.error('Reward usage error:', error)
      toast.error('Failed to use rewards')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fundraising': return 'bg-blue-100 text-blue-800'
      case 'construction': return 'bg-yellow-100 text-yellow-800'
      case 'operating': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (!connected) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Investment Hub</h1>
          <p className="text-muted-foreground">
            Invest in unique properties and earn returns through community ownership
          </p>
        </div>
        
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Building className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Connect Your Wallet
            </h3>
            <p className="text-gray-600 text-center max-w-md">
              Connect your Solana wallet to start investing in unique properties and earning returns.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Investment Hub</h1>
        <p className="text-muted-foreground">
          Invest in unique properties and earn returns through community ownership
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Investment</p>
                <p className="text-2xl font-bold">$25,420</p>
                <p className="text-xs text-gray-500">Across 2 properties</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Expected Returns</p>
                <p className="text-2xl font-bold">19.2%</p>
                <p className="text-xs text-gray-500">Average APY</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Gift className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Available Rewards</p>
                <p className="text-2xl font-bold">${(userStakedRewards.AURA * 2.1 + userStakedRewards.SAMSARA * 1.8 + userStakedRewards.AIRSCAPE * 1.5).toFixed(0)}</p>
                <p className="text-xs text-gray-500">From staking</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="properties" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="properties">Available Properties</TabsTrigger>
          <TabsTrigger value="airdrops">Token Airdrops</TabsTrigger>
          <TabsTrigger value="portfolio">My Portfolio</TabsTrigger>
        </TabsList>
        
        <TabsContent value="properties" className="space-y-6">
          <div className="grid gap-6">
            {properties.map((property) => (
              <Card key={property.id} className="overflow-hidden">
                <div className="md:flex">
                  <div className="md:w-1/3 bg-gradient-to-br from-blue-100 to-purple-100 h-64 md:h-auto relative overflow-hidden">
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
                    <div className="absolute inset-0 flex items-center justify-center text-center" style={{ display: property.images && property.images.length > 0 ? 'none' : 'flex' }}>
                      <div>
                        <Building className="h-16 w-16 mx-auto text-blue-600 mb-2" />
                        <span className="text-gray-600">Property Image</span>
                      </div>
                    </div>
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
                        <div className="space-y-3">
                          <div className="flex gap-3">
                            <Input
                              type="number"
                              placeholder="Investment amount ($)"
                              value={investmentAmount}
                              onChange={(e) => setInvestmentAmount(e.target.value)}
                              className="flex-1"
                              min={property.minInvestment}
                              max={property.maxInvestment}
                            />
                            <Button 
                              onClick={() => handleInvest(property.id)}
                              disabled={loading}
                            >
                              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Invest'}
                            </Button>
                          </div>
                          
                          <div className="flex gap-2">
                            {[25, 50, 75, 100].map((percent) => (
                              <Button
                                key={percent}
                                variant="outline"
                                size="sm"
                                onClick={() => setInvestmentAmount((property.minInvestment * percent / 25).toString())}
                              >
                                ${(property.minInvestment * percent / 25).toLocaleString()}
                              </Button>
                            ))}
                          </div>
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
                Upcoming Token Airdrops
              </CardTitle>
              <CardDescription>
                AURA holders receive 0.5% allocation of new property tokens
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {airdrops.map((airdrop) => (
                  <div key={airdrop.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{airdrop.property}</h4>
                        <p className="text-sm text-gray-600">{airdrop.allocation}% token allocation</p>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">
                        {airdrop.status === 'upcoming' ? 'Upcoming' : 'Distributed'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Distribution Date</p>
                        <p className="font-semibold">{formatDate(airdrop.distributionDate)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Eligible Holders</p>
                        <p className="font-semibold">{airdrop.eligibleHolders.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Your Estimate</p>
                        <p className="font-semibold text-green-600">{airdrop.userEstimate} tokens</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Status</p>
                        <p className="font-semibold">{airdrop.status === 'upcoming' ? 'Pending' : 'Completed'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <Separator className="my-6" />
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">How Airdrops Work</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Hold AURA tokens to be eligible for property token airdrops</li>
                  <li>• Each new property allocates 0.5% of tokens to AURA holders</li>
                  <li>• Distribution is proportional to your AURA holdings</li>
                  <li>• Property tokens generate revenue from booking income</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Staking Rewards Available
                </CardTitle>
                <CardDescription>
                  Use your staking rewards to invest in properties
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(userStakedRewards).map(([token, amount]) => (
                    <div key={token} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-semibold">{token}</p>
                        <p className="text-sm text-gray-600">{amount.toFixed(2)} tokens</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${(amount * (token === 'AURA' ? 2.1 : token === 'SAMSARA' ? 1.8 : 1.5)).toFixed(2)}</p>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleUseRewards(token, amount)}
                          disabled={loading}
                        >
                          Use for Investment
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Separator className="my-4" />
                
                <div className="text-center">
                  <p className="text-lg font-semibold">
                    Total Available: ${Object.entries(userStakedRewards).reduce((sum, [token, amount]) => 
                      sum + (amount * (token === 'AURA' ? 2.1 : token === 'SAMSARA' ? 1.8 : 1.5)), 0
                    ).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">From staking rewards</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  My Investments
                </CardTitle>
                <CardDescription>
                  Your property investment portfolio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <Building className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No Investments Yet
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Start investing in properties to build your portfolio
                    </p>
                    <Button asChild>
                      <a href="#properties">Browse Properties</a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 