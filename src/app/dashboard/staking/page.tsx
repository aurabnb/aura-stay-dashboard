import { Suspense } from 'react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { StakingSection } from '@/components/trading/StakingSection'

function StakingLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-96 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-lg p-4">
            <div className="h-16 w-16 bg-gray-200 rounded animate-pulse mb-4" />
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
          </div>
        ))}
      </div>
      <div className="h-96 bg-gray-200 rounded-lg animate-pulse" />
    </div>
  )
}

export default function StakingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="container mx-auto py-8 pt-28">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">AURA Staking</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Stake AURA tokens to earn rewards from the 0.8% burn redistribution mechanism
            </p>
          </div>
          
          <Suspense fallback={<StakingLoadingSkeleton />}>
            <StakingSection />
          </Suspense>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export const metadata = {
  title: 'Staking | Aura Stay Dashboard',
  description: 'Stake AURA tokens to earn passive rewards from the ecosystem.',
} 