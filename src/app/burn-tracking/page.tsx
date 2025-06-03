import { Suspense } from 'react'
import { BurnRedistributionDashboard } from '@/components/financial/BurnRedistributionDashboard'
import { Card, CardContent } from '@/components/ui/card'

function BurnTrackingLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function BurnTrackingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={<BurnTrackingLoadingSkeleton />}>
          <BurnRedistributionDashboard />
        </Suspense>
      </div>
    </div>
  )
} 