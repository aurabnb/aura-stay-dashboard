'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import the dashboard component to prevent SSR issues
const InvestmentHubDashboard = dynamic(
  () => import('@/components/dashboards/InvestmentHubDashboard').then(mod => ({ default: mod.InvestmentHubDashboard })),
  { 
    ssr: false,
    loading: () => <InvestmentHubLoading />
  }
)

function InvestmentHubLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-96 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-lg p-6">
            <div className="h-16 w-16 bg-gray-200 rounded animate-pulse mb-4" />
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
          </div>
        ))}
      </div>
      <div className="grid gap-6">
        {[1, 2].map((i) => (
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

export default function InvestmentHubPage() {
  return (
    <div className="container mx-auto py-8">
      <Suspense fallback={<InvestmentHubLoading />}>
        <InvestmentHubDashboard />
      </Suspense>
    </div>
  )
} 