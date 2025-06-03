'use client'

import React from 'react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { FiatPurchase } from '@/components/financial/FiatPurchase'

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