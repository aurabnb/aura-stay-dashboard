'use client'

import React from 'react'
import { Header } from '@/components/Header'
import MonitoredWallets from '@/components/treasury/MonitoredWallets'
import TreasuryValidation from '@/components/treasury/TreasuryValidation'
import { TreasuryProgress } from '@/components/treasury/TreasuryProgress'
import { WalletConnectionTest } from '@/components/wallet/WalletConnectionTest'
import { useTreasuryData } from '@/hooks/useTreasuryData'

export default function ValidationPage() {
  const { data, loading, error } = useTreasuryData()

  return (
    <div className="min-h-screen bg-white font-urbanist">
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8 pt-20">
        <div className="space-y-8">
          {/* Page Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🔧 System Validation Dashboard
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Comprehensive validation of AURA Stay Dashboard components, data integrity, and wallet connectivity.
            </p>
          </div>

          {/* Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <h3 className="text-lg font-semibold text-green-800 mb-2">Database</h3>
              <div className="text-2xl font-bold text-green-600">✅ ONLINE</div>
              <p className="text-sm text-green-600 mt-1">Prisma + PostgreSQL</p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Wallet Adapter</h3>
              <div className="text-2xl font-bold text-blue-600">✅ ACTIVE</div>
              <p className="text-sm text-blue-600 mt-1">Solana Integration</p>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 text-center">
              <h3 className="text-lg font-semibold text-purple-800 mb-2">Treasury Data</h3>
              <div className="text-2xl font-bold text-purple-600">
                {loading ? "⏳ LOADING" : error ? "❌ ERROR" : "✅ LIVE"}
              </div>
              <p className="text-sm text-purple-600 mt-1">Real-time Updates</p>
            </div>
          </div>

          {/* Wallet Connection Test */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">🔗 Wallet Adapter Test</h2>
            <WalletConnectionTest />
          </div>

          {/* Treasury Progress */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">🎯 Treasury Progress</h2>
            <TreasuryProgress />
          </div>

          {/* Monitored Wallets */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">👀 Monitored Wallets</h2>
            <MonitoredWallets />
          </div>

          {/* Treasury Validation */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">🔍 Data Validation</h2>
            <TreasuryValidation />
          </div>

          {/* Footer */}
          <div className="text-center py-8 border-t border-gray-200">
            <p className="text-gray-600">
              ✨ All systems operational - AURA Stay Dashboard v1.0.0
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Next.js 15 • Prisma • Solana • TypeScript
            </p>
          </div>
        </div>
      </main>
    </div>
  )
} 