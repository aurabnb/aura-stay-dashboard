'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useWallet } from '@solana/wallet-adapter-react'
import { useToast } from '@/hooks/use-toast'
import { 
  CreditCard, 
  ExternalLink, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle,
  Info
} from 'lucide-react'

interface FiatPurchaseProps {
  onPurchaseComplete?: () => void
}

export function FiatPurchase({ onPurchaseComplete }: FiatPurchaseProps) {
  const [purchaseStep, setPurchaseStep] = useState<'initial' | 'moonpay' | 'swap'>('initial')
  const [mounted, setMounted] = useState(false)
  const { connected, publicKey } = useWallet()
  const { toast } = useToast()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleMoonPayPurchase = () => {
    if (!connected || !publicKey) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet first",
        variant: "destructive"
      })
      return
    }

    setPurchaseStep('moonpay')
    
    // Only create MoonPay URL on client side
    if (mounted) {
      const moonPayUrl = `https://buy-sandbox.moonpay.com/?` +
        `apiKey=pk_test_123&` +
        `currencyCode=SOL&` +
        `walletAddress=${publicKey.toString()}&` +
        `redirectURL=${encodeURIComponent(window.location.origin)}`
      
      window.open(moonPayUrl, '_blank', 'width=400,height=600')
    }

    // Simulate progress
    setTimeout(() => {
      setPurchaseStep('swap')
      toast({
        title: "SOL Purchase Complete!",
        description: "Now swapping SOL for AURA tokens...",
      })
      
      setTimeout(() => {
        setPurchaseStep('initial')
        toast({
          title: "AURA Purchase Complete!",
          description: "AURA tokens have been added to your wallet",
        })
        onPurchaseComplete?.()
      }, 3000)
    }, 5000)
  }

  const resetPurchase = () => {
    setPurchaseStep('initial')
  }

  if (purchaseStep === 'moonpay') {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <CreditCard className="h-6 w-6" />
            Step 1: Purchase SOL
          </CardTitle>
          <CardDescription>
            Complete your SOL purchase through MoonPay
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
          <p className="text-center text-muted-foreground">
            Complete your purchase in the MoonPay window that opened...
          </p>
          <div className="flex justify-center">
            <Button variant="outline" onClick={resetPurchase}>
              Cancel Purchase
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (purchaseStep === 'swap') {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <ArrowRight className="h-6 w-6" />
            Step 2: Swap SOL for AURA
          </CardTitle>
          <CardDescription>
            Converting your SOL to AURA tokens via Meteora
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center py-8">
            <div className="animate-pulse">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
          </div>
          <p className="text-center text-muted-foreground">
            Swapping SOL for AURA tokens...
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-700">
              <strong>Processing:</strong> Your SOL is being automatically swapped for AURA tokens 
              on Meteora DEX at the best available rate.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Purchase Options */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Buy AURA with Fiat</CardTitle>
          <CardDescription>
            Purchase AURA tokens directly with your credit card or bank account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Recommended: MoonPay
                </CardTitle>
                <CardDescription>
                  Buy SOL with fiat, then auto-swap to AURA
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Processing Fee</span>
                    <span>4.5%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Swap Fee</span>
                    <span>0.3%</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Total Fee</span>
                    <span>~4.8%</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Badge className="bg-green-100 text-green-800">
                    ✓ Credit Card & Bank Transfer
                  </Badge>
                  <Badge className="bg-green-100 text-green-800">
                    ✓ Auto SOL→AURA Swap
                  </Badge>
                  <Badge className="bg-green-100 text-green-800">
                    ✓ KYC Verified & Secure
                  </Badge>
                </div>

                <Button 
                  className="w-full" 
                  onClick={handleMoonPayPurchase}
                  disabled={!connected}
                >
                  {!connected ? 'Connect Wallet First' : 'Buy with MoonPay'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ExternalLink className="h-5 w-5" />
                  Alternative: Manual Process
                </CardTitle>
                <CardDescription>
                  Buy SOL elsewhere, then swap manually
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="bg-gray-100 text-gray-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold">
                      1
                    </span>
                    <span>Buy SOL on Coinbase, Binance, or Kraken</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="bg-gray-100 text-gray-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold">
                      2
                    </span>
                    <span>Transfer SOL to your Solana wallet</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="bg-gray-100 text-gray-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold">
                      3
                    </span>
                    <span>Swap SOL for AURA on Jupiter or Meteora</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Badge variant="outline">
                    Lower Fees (~1-2%)
                  </Badge>
                  <Badge variant="outline">
                    More Control
                  </Badge>
                  <Badge variant="outline">
                    Requires Experience
                  </Badge>
                </div>

                <Button variant="outline" className="w-full" asChild>
                  <a href="/dashboard/trading" target="_blank">
                    Go to Trading Dashboard
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            How the MoonPay Process Works
          </CardTitle>
          <CardDescription>
            Step-by-step breakdown of the fiat to AURA purchase
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center space-y-3">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                <CreditCard className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold">1. Purchase SOL</h3>
              <p className="text-sm text-muted-foreground">
                MoonPay securely processes your credit card or bank payment to purchase SOL tokens
              </p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                <ArrowRight className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold">2. Auto-Swap to AURA</h3>
              <p className="text-sm text-muted-foreground">
                SOL is automatically swapped for AURA tokens on Meteora DEX at the best available rate
              </p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold">3. Receive AURA</h3>
              <p className="text-sm text-muted-foreground">
                AURA tokens are delivered directly to your connected Solana wallet
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Important Information */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800">
            <AlertCircle className="h-5 w-5" />
            Important Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-amber-700">
          <p>
            <strong>Minimum Purchase:</strong> $50 USD equivalent
          </p>
          <p>
            <strong>Processing Time:</strong> 5-15 minutes for the complete process
          </p>
          <p>
            <strong>Supported Regions:</strong> US, EU, UK, and 100+ other countries
          </p>
          <p>
            <strong>KYC Required:</strong> Identity verification may be required for purchases over $150
          </p>
          <p>
            <strong>Support:</strong> For issues with MoonPay, contact support@moonpay.com
          </p>
        </CardContent>
      </Card>
    </div>
  )
} 