import { Suspense } from 'react'
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
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<CommunityLoadingSkeleton />}>
        <CommunityBoard />
      </Suspense>
    </div>
  )
}

export const metadata = {
  title: 'Community Board | Aura Stay Dashboard',
  description: 'Engage with the Aura Foundation community, share ideas, and participate in discussions.',
} 