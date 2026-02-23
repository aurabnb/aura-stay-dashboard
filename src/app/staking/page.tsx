'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/Header'

export default function StakingPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the main dashboard with staking tab
    router.replace('/user-dashboard#staking')
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* DevNet Warning Banner */}
      <div className="bg-orange-600 text-white text-center py-3 px-4 relative z-50">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-orange-300 rounded-full animate-pulse"></div>
          <span className="font-semibold">🚧 Redirecting to User Dashboard... 🚧</span>
          <div className="w-2 h-2 bg-orange-300 rounded-full animate-pulse"></div>
        </div>
      </div>

      <Header />
      
      <div className="container mx-auto px-4 py-8 pt-28">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-8"></div>
          <h1 className="text-2xl font-semibold mb-4">Redirecting to User Dashboard</h1>
          <p className="text-muted-foreground">
            Staking features have been moved to the main user dashboard for a better experience.
          </p>
        </div>
      </div>
    </div>
  )
} 