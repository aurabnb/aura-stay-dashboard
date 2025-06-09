import { Suspense } from 'react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { PropertyShowcase } from '@/components/property/PropertyShowcase'
import { InvestmentHubDashboard } from '@/components/dashboards/InvestmentHubDashboard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building, TrendingUp, Users, Calendar } from 'lucide-react'

function PropertiesLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-96 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-gray-200 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-lg overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/3 h-64 bg-gray-200 animate-pulse" />
              <div className="md:w-2/3 p-6 space-y-4">
                <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                <div className="h-16 w-full bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function DashboardPropertiesPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8 pt-28">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Properties Dashboard
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Manage your property investments and explore new opportunities
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+2</span> new this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your Investments</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$45,230</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+18.2%</span> ROI
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Investments</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">6</div>
              <p className="text-xs text-muted-foreground">
                Across 4 properties
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Payout</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7 days</div>
              <p className="text-xs text-muted-foreground">
                Estimated $1,240
              </p>
            </CardContent>
          </Card>
        </div>
        
        <Suspense fallback={<PropertiesLoadingSkeleton />}>
          <Tabs defaultValue="browse" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="browse">Browse Properties</TabsTrigger>
              <TabsTrigger value="investments">Your Investments</TabsTrigger>
              <TabsTrigger value="opportunities">New Opportunities</TabsTrigger>
            </TabsList>
            
            <TabsContent value="browse" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">All Properties</h2>
                <PropertyShowcase />
              </div>
            </TabsContent>
            
            <TabsContent value="investments" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">Your Property Investments</h2>
                <div className="grid gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Volcano House - Costa Rica</CardTitle>
                      <CardDescription>Your investment: $12,500 • Expected ROI: 22.5%</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Construction Progress</span>
                          <span>87%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{width: '87%'}}></div>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          Expected completion: July 2025 • Next dividend: Q3 2025
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Bali Wellness Retreat</CardTitle>
                      <CardDescription>Your investment: $8,750 • Expected ROI: 19.8%</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Construction Progress</span>
                          <span>45%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-yellow-600 h-2 rounded-full" style={{width: '45%'}}></div>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          Expected completion: December 2025 • Next dividend: Q1 2026
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="opportunities" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">New Investment Opportunities</h2>
                <InvestmentHubDashboard />
              </div>
            </TabsContent>
          </Tabs>
        </Suspense>
      </div>

      <Footer />
    </div>
  )
}

export const metadata = {
  title: 'Properties Dashboard | Aura Stay',
  description: 'Manage your property investments and explore new opportunities.',
} 