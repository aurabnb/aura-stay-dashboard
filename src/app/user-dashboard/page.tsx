'use client'

import dynamic from 'next/dynamic'

// Dynamic import with SSR disabled to prevent wallet context issues during build
const UserDashboardPageContent = dynamic(
  () => import('@/components/UserDashboardPageContent'),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-lg p-6">
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />
                <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
)

export default function UserDashboardPage() {
  return <UserDashboardPageContent />
} 