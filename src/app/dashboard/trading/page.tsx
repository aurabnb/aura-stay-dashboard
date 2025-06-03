import { Suspense } from 'react'
import { TradingDashboard } from '@/components/dashboards/TradingDashboard'
import { EnhancedTradingDashboard } from '@/components/trading/EnhancedTradingDashboard'
import { StakingSection } from '@/components/trading/StakingSection'
import { Loader2 } from 'lucide-react'

function TradingLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-4 w-96 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="h-96 bg-gray-200 rounded-lg animate-pulse" />
        </div>
        <div className="space-y-4">
          <div className="h-48 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-48 bg-gray-200 rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  )
}

export default function TradingPage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <Suspense fallback={<TradingLoadingSkeleton />}>
        <EnhancedTradingDashboard />
      </Suspense>
      
      <Suspense fallback={
        <div className="h-96 bg-gray-200 rounded-lg animate-pulse" />
      }>
        <StakingSection />
      </Suspense>
    </div>
  )
}

export const metadata = {
  title: 'Trading Hub | Aura Stay Dashboard',
  description: 'Advanced trading tools with real-time analytics and portfolio management.',
} 