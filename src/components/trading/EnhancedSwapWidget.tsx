'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Zap, 
  ArrowRightLeft, 
  DollarSign, 
  Info, 
  ExternalLink,
  Calculator,
  AlertTriangle,
  CheckCircle,
  TrendingUp
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Token {
  symbol: string
  name: string
  mint: string
  decimals: number
  logoURI?: string
}

interface TaxCalculation {
  taxAmount: number
  taxRate: number
  afterTaxAmount: number
  isExempt: boolean
  exemptReason?: string
}

const SUPPORTED_TOKENS: Token[] = [
  { symbol: 'SOL', name: 'Solana', mint: 'So11111111111111111111111111111111111111112', decimals: 9 },
  { symbol: 'AURA', name: 'Aura Network', mint: '3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe', decimals: 9 },
  { symbol: 'USDC', name: 'USD Coin', mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', decimals: 6 },
  { symbol: 'RAY', name: 'Raydium', mint: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R', decimals: 6 }
]

export const EnhancedSwapWidget: React.FC = () => {
  const { toast } = useToast()
  const [fromToken, setFromToken] = useState<Token>(SUPPORTED_TOKENS[0])
  const [toToken, setToToken] = useState<Token>(SUPPORTED_TOKENS[1])
  const [amount, setAmount] = useState<string>('')
  const [userWallet, setUserWallet] = useState<string>('')
  const [taxCalculation, setTaxCalculation] = useState<TaxCalculation | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [isSwapping, setIsSwapping] = useState(false)

  const getTradingPair = () => {
    return `${fromToken.symbol}/${toToken.symbol}`
  }

  const getTransactionType = () => {
    if (toToken.symbol === 'AURA') return 'buy'
    if (fromToken.symbol === 'AURA') return 'sell'
    return 'swap'
  }

  const calculateTax = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setTaxCalculation(null)
      return
    }

    setIsCalculating(true)
    try {
      const response = await fetch('/api/admin/tax-collection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userWallet: userWallet || 'demo_wallet_123',
          fromToken: fromToken.symbol,
          toToken: toToken.symbol,
          swapAmount: parseFloat(amount),
          tradingPair: getTradingPair(),
          transactionType: getTransactionType()
        })
      })

      const data = await response.json()

      if (data.success) {
        setTaxCalculation({
          taxAmount: data.taxAmount,
          taxRate: data.taxRate,
          afterTaxAmount: data.afterTaxAmount,
          isExempt: data.isExempt,
          exemptReason: data.exemptReason
        })
      } else {
        console.error('Tax calculation failed:', data.error)
        setTaxCalculation(null)
      }
    } catch (error) {
      console.error('Tax calculation error:', error)
      setTaxCalculation(null)
    } finally {
      setIsCalculating(false)
    }
  }

  const handleSwap = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid swap amount",
        variant: "destructive"
      })
      return
    }

    setIsSwapping(true)
    try {
      // First, ensure we have the latest tax calculation
      await calculateTax()

      // In production, this would integrate with Jupiter API
      // For demo, we'll simulate the swap process
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Open Jupiter with pre-filled parameters
      const jupiterUrl = `https://jup.ag/swap/${fromToken.symbol}-${toToken.symbol}`
      window.open(jupiterUrl, '_blank')

      toast({
        title: "Swap Initiated",
        description: `Redirected to Jupiter for ${amount} ${fromToken.symbol} → ${toToken.symbol} swap`,
      })

      // Log the tax transaction
      if (taxCalculation && !taxCalculation.isExempt) {
        console.log(`💰 Tax will be collected: ${taxCalculation.taxAmount} SOL (${taxCalculation.taxRate}%)`)
      }

    } catch (error) {
      console.error('Swap error:', error)
      toast({
        title: "Swap Error",
        description: "Failed to initiate swap. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSwapping(false)
    }
  }

  const swapTokens = () => {
    const temp = fromToken
    setFromToken(toToken)
    setToToken(temp)
    setTaxCalculation(null)
  }

  useEffect(() => {
    if (amount && parseFloat(amount) > 0) {
      const timer = setTimeout(calculateTax, 500)
      return () => clearTimeout(timer)
    } else {
      setTaxCalculation(null)
    }
  }, [amount, fromToken, toToken, userWallet])

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-blue-600" />
          Enhanced Swap with Tax
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Wallet Connection */}
        <div className="space-y-2">
          <Label htmlFor="wallet">Wallet Address (Optional)</Label>
          <Input
            id="wallet"
            placeholder="Enter your wallet address..."
            value={userWallet}
            onChange={(e) => setUserWallet(e.target.value)}
          />
          <p className="text-xs text-gray-500">
            Leave empty for demo calculations
          </p>
        </div>

        {/* From Token */}
        <div className="space-y-2">
          <Label>From</Label>
          <div className="flex gap-2">
            <Select value={fromToken.symbol} onValueChange={(value) => 
              setFromToken(SUPPORTED_TOKENS.find(t => t.symbol === value) || SUPPORTED_TOKENS[0])
            }>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_TOKENS.map(token => (
                  <SelectItem key={token.symbol} value={token.symbol}>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{token.symbol}</span>
                      <span className="text-gray-500">{token.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              type="number"
              step="0.001"
              min="0"
              className="flex-1"
            />
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={swapTokens}
            className="rounded-full p-2"
          >
            <ArrowRightLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* To Token */}
        <div className="space-y-2">
          <Label>To</Label>
          <Select value={toToken.symbol} onValueChange={(value) => 
            setToToken(SUPPORTED_TOKENS.find(t => t.symbol === value) || SUPPORTED_TOKENS[1])
          }>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_TOKENS.map(token => (
                <SelectItem key={token.symbol} value={token.symbol}>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{token.symbol}</span>
                    <span className="text-gray-500">{token.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tax Calculation Display */}
        {isCalculating && (
          <Alert>
            <Calculator className="h-4 w-4 animate-spin" />
            <AlertDescription>
              Calculating tax amount...
            </AlertDescription>
          </Alert>
        )}

        {taxCalculation && (
          <div className="space-y-3">
            {taxCalculation.isExempt ? (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Tax Exempt:</strong> {taxCalculation.exemptReason}
                </AlertDescription>
              </Alert>
            ) : (
              <Alert>
                <DollarSign className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Swap Amount:</span>
                      <span className="font-semibold">{amount} {fromToken.symbol}</span>
                    </div>
                    <div className="flex justify-between text-orange-600">
                      <span>Tax Rate:</span>
                      <Badge variant="secondary">{taxCalculation.taxRate}%</Badge>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>Tax Amount:</span>
                      <span className="font-semibold">-{taxCalculation.taxAmount.toFixed(6)} SOL</span>
                    </div>
                    <div className="flex justify-between text-green-600 border-t pt-1">
                      <span>You'll Receive:</span>
                      <span className="font-bold">{taxCalculation.afterTaxAmount.toFixed(6)} {fromToken.symbol}</span>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Trading Pair Info */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">Trading Pair</span>
          </div>
          <Badge variant="outline">{getTradingPair()}</Badge>
        </div>

        {/* Swap Button */}
        <Button 
          onClick={handleSwap}
          disabled={!amount || parseFloat(amount) <= 0 || isSwapping || isCalculating}
          className="w-full"
          size="lg"
        >
          {isSwapping ? (
            <>
              <Calculator className="h-4 w-4 mr-2 animate-spin" />
              Processing Swap...
            </>
          ) : (
            <>
              <ExternalLink className="h-4 w-4 mr-2" />
              Swap on Jupiter
            </>
          )}
        </Button>

        {/* Tax Info */}
        <div className="text-xs text-gray-500 text-center space-y-1">
          <p>🔍 Tax rates are automatically calculated</p>
          <p>💰 All taxes go to the AURA treasury</p>
          <p>⚡ Exempt wallets and pairs are supported</p>
        </div>
      </CardContent>
    </Card>
  )
} 