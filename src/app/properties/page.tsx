import { Suspense } from 'react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { PropertyShowcase } from '@/components/property/PropertyShowcase'

function PropertiesLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-96 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="grid gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-lg overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/3 h-64 bg-gray-200 animate-pulse" />
              <div className="md:w-2/3 p-6 space-y-4">
                <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                <div className="h-16 w-full bg-gray-200 rounded animate-pulse" />
                <div className="flex gap-2">
                  <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
                  <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
                  <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function PropertiesPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="container mx-auto py-8 pt-28">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Properties</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover unique eco-conscious stays around the world
            </p>
          </div>
          
          <Suspense fallback={<PropertiesLoading />}>
            <PropertyShowcase />
          </Suspense>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export const metadata = {
  title: 'Properties | Aura Stay Dashboard',
  description: 'Discover unique eco-conscious stays around the world.',
} 