import { Suspense } from 'react'
import { AdvancedAnalyticsDashboard } from '@/components/analytics/AdvancedAnalyticsDashboard'
import { Loader2 } from 'lucide-react'

function AnalyticsLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-4 w-96 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
      <div className="h-96 bg-gray-200 rounded-lg animate-pulse" />
    </div>
  )
}

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto py-10">
      <Suspense fallback={<AnalyticsLoadingSkeleton />}>
        <AdvancedAnalyticsDashboard />
      </Suspense>
    </div>
  )
}

export const metadata = {
  title: 'Advanced Analytics | Aura Foundation',
  description: 'Comprehensive insights into the Aura Foundation ecosystem performance and metrics.',
} 