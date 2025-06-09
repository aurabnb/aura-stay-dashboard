'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'

// Dynamic import with SSR disabled to prevent wallet context issues
const InvestmentHubDashboard = dynamic(
  () => import('@/components/dashboards/InvestmentHubDashboard').then(mod => ({ default: mod.InvestmentHubDashboard })),
  { 
    ssr: false,
    loading: () => <InvestmentLoadingSkeleton />
  }
)

function InvestmentLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-4 w-96 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
      <div className="h-96 bg-gray-200 rounded-lg animate-pulse" />
    </div>
  )
}

export default function InvestmentPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<InvestmentLoadingSkeleton />}>
        <InvestmentHubDashboard />
      </Suspense>
    </div>
  )
} 