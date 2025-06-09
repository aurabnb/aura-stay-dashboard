'use client'

import dynamic from 'next/dynamic'

// Dynamic import with SSR disabled to prevent wallet context issues during build
const StakingPageContent = dynamic(
  () => import('@/components/StakingPageContent'),
  { 
    ssr: false,
    loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="bg-orange-600 text-white text-center py-3 px-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-orange-300 rounded-full animate-pulse"></div>
            <span className="font-semibold">🚧 DEVNET VERSION - Loading... 🚧</span>
            <div className="w-2 h-2 bg-orange-300 rounded-full animate-pulse"></div>
              </div>
            </div>
        <div className="pt-24 pb-12">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mx-auto mb-6" />
              <div className="h-12 w-96 bg-gray-200 rounded animate-pulse mx-auto mb-6" />
              <div className="h-4 w-full max-w-3xl bg-gray-200 rounded animate-pulse mx-auto" />
            </div>
          </div>
        </div>
    </div>
  )
  }
)

export default function StakingPage() {
  return <StakingPageContent />
} 