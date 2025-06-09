'use client'

import React from 'react'
import { Header } from '@/components/Header'
import MonitoredWallets from '@/components/treasury/MonitoredWallets'
import TreasuryValidation from '@/components/treasury/TreasuryValidation'
import { TreasuryProgress } from '@/components/treasury/TreasuryProgress'
import { WalletConnectionTest } from '@/components/wallet/WalletConnectionTest'
import { useTreasuryData } from '@/hooks/useTreasuryData'
import dynamic from 'next/dynamic'

// Dynamically import wallet-dependent components to prevent SSR issues
const ValidationPage = dynamic(
  () => import('@/components/ValidationPage').then(mod => ({ default: mod.default })),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
          <div className="h-32 w-full bg-gray-200 rounded animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
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

export default function Page() {
  return <ValidationPage />
} 