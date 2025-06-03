import { Suspense } from 'react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { CommunityBoard } from '@/components/community/CommunityBoard'
import { Loader2 } from 'lucide-react'

function CommunityLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-4 w-96 bg-gray-200 rounded animate-pulse" />
      </div>
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
        
        <Suspense fallback={<CommunityLoadingSkeleton />}>
          <CommunityBoard />
        </Suspense>
      </div>

      <Footer />
    </div>
  )
}

export const metadata = {
  title: 'Community Board | Aura Stay Dashboard',
  description: 'Engage with the Aura Foundation community, share ideas, and participate in discussions.',
} 