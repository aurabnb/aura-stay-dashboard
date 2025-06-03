'use client'

import { Suspense } from 'react'
import { WalletDashboard } from '@/components/wallet/WalletDashboard'
import { useWallet } from '@solana/wallet-adapter-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Wallet, Loader2 } from 'lucide-react'

function WalletLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-4 w-96 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
      <div className="h-96 bg-gray-200 rounded-lg animate-pulse" />
    </div>
  )
}

function WalletPageContent() {
  const { connected, publicKey, disconnect } = useWallet()

  if (!connected || !publicKey) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Wallet Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your portfolio, view balances and transaction history
          </p>
        </div>
        
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Wallet className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Connect Your Wallet
            </h3>
            <p className="text-gray-600 text-center max-w-md">
              Connect your Solana wallet to view your portfolio, balances, and transaction history.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <WalletDashboard 
      walletAddress={publicKey.toString()} 
      onDisconnect={disconnect}
    />
  )
}

export default function WalletPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<WalletLoadingSkeleton />}>
        <WalletPageContent />
      </Suspense>
    </div>
  )
} 