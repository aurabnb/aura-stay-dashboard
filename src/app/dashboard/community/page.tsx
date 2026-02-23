'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

// Only dynamically import CommunityBoard if it actually has SSR issues
const CommunityBoard = dynamic(
  () => import('@/components/community/CommunityBoard').then(mod => ({ default: mod.CommunityBoard })),
  { 
    ssr: false,
    loading: () => (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="h-96 bg-gray-200 rounded-lg animate-pulse" />
        </div>
        <div className="lg:col-span-2">
          <div className="h-96 bg-gray-200 rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  )
}
)

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8 pt-28">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Community Hub
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Engage with the Aura Foundation community, share ideas, and participate in discussions
          </p>
        </div>
        
        <Suspense fallback={
          <div className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <div className="h-96 bg-gray-200 rounded-lg animate-pulse" />
              </div>
              <div className="lg:col-span-2">
                <div className="h-96 bg-gray-200 rounded-lg animate-pulse" />
              </div>
            </div>
          </div>
        }>
          <CommunityBoard />
        </Suspense>
      </div>

      <Footer />
    </div>
  )
} 