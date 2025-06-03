'use client'

import { Suspense } from 'react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { WalletDashboard } from '@/components/wallet/WalletDashboard'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { Loader2 } from 'lucide-react'

function WalletLoadingSkeleton() {
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

export default function WalletPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8 pt-28">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Wallet Dashboard
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Manage your portfolio, view balances and transaction history
          </p>
        </div>
        
        <Suspense fallback={<WalletLoadingSkeleton />}>
          <div className="text-center">
            <div className="mb-6">
              <p className="text-gray-600 mb-4">Connect your wallet to view your portfolio</p>
              <WalletMultiButton className="!bg-black hover:!bg-gray-800" />
            </div>
          </div>
        </Suspense>
      </div>

      <Footer />
    </div>
  )
} 