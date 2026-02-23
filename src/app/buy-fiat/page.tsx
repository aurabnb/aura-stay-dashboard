'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

// Dynamic import with SSR disabled to prevent wallet context issues
const FiatPurchase = dynamic(
  () => import('@/components/financial/FiatPurchase').then(mod => ({ default: mod.FiatPurchase })),
  { 
    ssr: false,
    loading: () => (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 w-48 bg-gray-200 rounded"></div>
            <div className="h-4 w-64 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
              <div className="space-y-4">
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
)

export default function BuyFiatPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8 pt-28">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Buy AURA with Fiat
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Purchase AURA tokens directly with your credit card or bank account through our secure partners
          </p>
        </div>
        
        <FiatPurchase />
      </main>

      <Footer />
    </div>
  )
} 