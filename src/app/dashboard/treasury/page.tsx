import { Suspense } from 'react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { TreasuryDashboard } from '@/components/TreasuryDashboard'
import { MultisigDashboard } from '@/components/multisig/MultisigDashboard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2 } from 'lucide-react'

function TreasuryLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-4 w-96 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
      <div className="h-96 bg-gray-200 rounded-lg animate-pulse" />
    </div>
  )
}

export const metadata = {
  title: 'Treasury Management | Aura Stay Dashboard',
  description: 'Comprehensive treasury and multisig wallet management for the Aura Foundation.',
}

export default function TreasuryPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8 pt-28">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Treasury Management
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive treasury and multisig wallet management for the Aura Foundation
          </p>
        </div>
        
        <Suspense fallback={<TreasuryLoadingSkeleton />}>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Treasury Overview</TabsTrigger>
              <TabsTrigger value="multisig">Multisig Wallet</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <TreasuryDashboard />
            </TabsContent>
            
            <TabsContent value="multisig">
              <MultisigDashboard />
            </TabsContent>
          </Tabs>
        </Suspense>
      </div>

      <Footer />
    </div>
  )
} 