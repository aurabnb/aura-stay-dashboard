import { Suspense } from 'react'
import { GovernanceDashboard } from '@/components/governance/GovernanceDashboard'
import { Loader2 } from 'lucide-react'

function GovernanceLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-4 w-96 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
      <div className="h-96 bg-gray-200 rounded-lg animate-pulse" />
    </div>
  )
}

export default function GovernancePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<GovernanceLoadingSkeleton />}>
        <GovernanceDashboard />
      </Suspense>
    </div>
  )
}

export const metadata = {
  title: 'Governance | Aura Stay Dashboard',
  description: 'Participate in DAO governance and community decisions.',
} 