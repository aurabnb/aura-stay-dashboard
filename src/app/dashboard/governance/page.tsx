import { Suspense } from 'react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { GovernanceDashboard } from '@/components/governance/GovernanceDashboard'
import { Card, CardContent } from '@/components/ui/card'
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
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-gray-200 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="h-96 bg-gray-200 rounded-lg animate-pulse" />
    </div>
  )
}

export const metadata = {
  title: 'Governance | Aura Stay Dashboard',
  description: 'Participate in DAO governance and community decisions.',
}

export default function GovernancePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8 pt-28">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Governance Hub
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Participate in DAO governance and community decisions
          </p>
        </div>
        
        <Suspense fallback={<GovernanceLoadingSkeleton />}>
          <GovernanceDashboard />
        </Suspense>
      </div>

      <Footer />
    </div>
  )
} 