import { Suspense } from 'react'
import { VolcanoHouseCalculator } from '@/components/property/VolcanoHouseCalculator'
import { Card, CardContent } from '@/components/ui/card'

function VolcanoHouseLoadingSkeleton() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="h-12 bg-gray-200 rounded w-64 mx-auto animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
      </div>
      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function VolcanoHousePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={<VolcanoHouseLoadingSkeleton />}>
          <VolcanoHouseCalculator />
        </Suspense>
      </div>
    </div>
  )
} 