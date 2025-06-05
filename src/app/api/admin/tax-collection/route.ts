import { NextRequest, NextResponse } from 'next/server'
import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js'

interface SwapTaxRequest {
  userWallet: string
  fromToken: string
  toToken: string
  swapAmount: number
  tradingPair: string
  transactionType: 'buy' | 'sell' | 'swap'
  jupiterTransactionId?: string
}

interface TaxCalculationResult {
  taxAmount: number
  taxRate: number
  afterTaxAmount: number
  isExempt: boolean
  exemptReason?: string
}

interface TaxTransaction {
  id: string
  timestamp: string
  userWallet: string
  tradingPair: string
  swapAmount: number
  taxAmount: number
  taxRate: number
  transactionType: string
  status: 'pending' | 'completed' | 'failed'
  jupiterTransactionId?: string
  taxTransactionId?: string
  blockNumber?: number
}

// In-memory storage for demo (use database in production)
let taxTransactions: TaxTransaction[] = []
let taxCollectionStats = {
  totalCollected: 0,
  totalTransactions: 0,
  successRate: 0
}

// Get current tax settings (would be from database in production)
async function getTaxSettings() {
  try {
    // Simulate fetching from database
    const savedSettings = {
      swapTaxRate: 2.0,
      buyTaxRate: 1.5,
      sellTaxRate: 2.5,
      minimumTaxAmount: 0.001,
      maximumTaxAmount: 10.0,
      taxWalletAddress: 'fa1ra81T7g5DzSn7XT6z36zNqupHpG1Eh7omB2F6GTh',
      autoDistribution: true,
      enabledForPairs: ['SOL/AURA', 'USDC/AURA', 'RAY/AURA'],
      exemptWallets: [],
      isEnabled: true
    }
    return savedSettings
  } catch (error) {
    console.error('Failed to get tax settings:', error)
    return null
  }
}

function calculateTax(swapAmount: number, transactionType: string, settings: any): TaxCalculationResult {
  let taxRate = 0
  
  switch (transactionType) {
    case 'buy':
      taxRate = settings.buyTaxRate
      break
    case 'sell':
      taxRate = settings.sellTaxRate
      break
    case 'swap':
    default:
      taxRate = settings.swapTaxRate
      break
  }

  const taxAmount = (swapAmount * taxRate) / 100
  
  // Apply min/max limits
  const finalTaxAmount = Math.max(
    settings.minimumTaxAmount,
    Math.min(taxAmount, settings.maximumTaxAmount)
  )
  
  const afterTaxAmount = swapAmount - finalTaxAmount

  return {
    taxAmount: finalTaxAmount,
    taxRate,
    afterTaxAmount,
    isExempt: false
  }
}

function checkTaxExemption(userWallet: string, settings: any): { isExempt: boolean; reason?: string } {
  if (!settings.isEnabled) {
    return { isExempt: true, reason: 'Tax collection disabled' }
  }

  if (settings.exemptWallets.includes(userWallet)) {
    return { isExempt: true, reason: 'Wallet is tax-exempt' }
  }

  return { isExempt: false }
}

export async function POST(request: NextRequest) {
  try {
    console.log('💰 Tax Collection API: Processing swap tax')
    
    const body: SwapTaxRequest = await request.json()
    console.log('📝 Swap details:', body)

    // Validate required fields
    const requiredFields: (keyof SwapTaxRequest)[] = ['userWallet', 'fromToken', 'toToken', 'swapAmount', 'tradingPair', 'transactionType']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { 
            success: false, 
            error: `Missing required field: ${field}` 
          }, 
          { status: 400 }
        )
      }
    }

    // Get current tax settings
    const taxSettings = await getTaxSettings()
    if (!taxSettings) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to load tax settings' 
        }, 
        { status: 500 }
      )
    }

    // Check if wallet is exempt
    const exemptionCheck = checkTaxExemption(body.userWallet, taxSettings)
    if (exemptionCheck.isExempt) {
      console.log(`⚡ Wallet ${body.userWallet} is exempt: ${exemptionCheck.reason}`)
      
      return NextResponse.json({
        success: true,
        taxAmount: 0,
        taxRate: 0,
        afterTaxAmount: body.swapAmount,
        isExempt: true,
        exemptReason: exemptionCheck.reason,
        message: 'Transaction exempt from tax'
      })
    }

    // Check if trading pair is enabled for tax
    if (!taxSettings.enabledForPairs.includes(body.tradingPair)) {
      console.log(`⚡ Trading pair ${body.tradingPair} not enabled for tax`)
      
      return NextResponse.json({
        success: true,
        taxAmount: 0,
        taxRate: 0,
        afterTaxAmount: body.swapAmount,
        isExempt: true,
        exemptReason: 'Trading pair not subject to tax',
        message: 'Trading pair exempt from tax'
      })
    }

    // Calculate tax
    const taxCalculation = calculateTax(body.swapAmount, body.transactionType, taxSettings)
    
    console.log(`📊 Tax calculation:`)
    console.log(`   Swap amount: ${body.swapAmount} SOL`)
    console.log(`   Tax rate: ${taxCalculation.taxRate}%`)
    console.log(`   Tax amount: ${taxCalculation.taxAmount} SOL`)
    console.log(`   After tax: ${taxCalculation.afterTaxAmount} SOL`)

    // Create tax transaction record
    const taxTransaction: TaxTransaction = {
      id: `tax_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      userWallet: body.userWallet,
      tradingPair: body.tradingPair,
      swapAmount: body.swapAmount,
      taxAmount: taxCalculation.taxAmount,
      taxRate: taxCalculation.taxRate,
      transactionType: body.transactionType,
      status: 'pending',
      jupiterTransactionId: body.jupiterTransactionId
    }

    // In production, this would initiate the actual Solana transaction
    // For demo purposes, we'll simulate the tax collection
    try {
      // Simulate tax collection transaction
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mark as completed
      taxTransaction.status = 'completed'
      taxTransaction.taxTransactionId = `${taxTransaction.id}_completed`
      taxTransaction.blockNumber = Math.floor(Math.random() * 1000000) + 245789000
      
      // Store transaction
      taxTransactions.push(taxTransaction)
      
      // Update stats
      taxCollectionStats.totalCollected += taxCalculation.taxAmount
      taxCollectionStats.totalTransactions += 1
      taxCollectionStats.successRate = (taxTransactions.filter(tx => tx.status === 'completed').length / taxTransactions.length) * 100

      console.log('✅ Tax collected successfully')
      console.log(`💰 Total tax collected: ${taxCollectionStats.totalCollected} SOL`)

    } catch (error) {
      console.error('❌ Tax collection failed:', error)
      taxTransaction.status = 'failed'
      taxTransactions.push(taxTransaction)
    }

    const response = {
      success: true,
      taxAmount: taxCalculation.taxAmount,
      taxRate: taxCalculation.taxRate,
      afterTaxAmount: taxCalculation.afterTaxAmount,
      isExempt: false,
      transactionId: taxTransaction.id,
      status: taxTransaction.status,
      taxWallet: taxSettings.taxWalletAddress,
      message: taxTransaction.status === 'completed' ? 'Tax collected successfully' : 'Tax collection failed',
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ Tax Collection API Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process tax collection',
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Tax Collection API: Fetching collection stats')
    
    const url = new URL(request.url)
    const period = url.searchParams.get('period') || '24h'
    const walletAddress = url.searchParams.get('wallet')

    let filteredTransactions = taxTransactions

    // Filter by wallet if specified
    if (walletAddress) {
      filteredTransactions = filteredTransactions.filter(tx => tx.userWallet === walletAddress)
    }

    // Filter by time period
    const now = new Date()
    const periodStart = new Date()
    
    switch (period) {
      case '24h':
        periodStart.setHours(now.getHours() - 24)
        break
      case '7d':
        periodStart.setDate(now.getDate() - 7)
        break
      case '30d':
        periodStart.setDate(now.getDate() - 30)
        break
    }

    filteredTransactions = filteredTransactions.filter(tx => 
      new Date(tx.timestamp) >= periodStart
    )

    const completedTransactions = filteredTransactions.filter(tx => tx.status === 'completed')
    const totalTaxForPeriod = completedTransactions.reduce((sum, tx) => sum + tx.taxAmount, 0)

    const response = {
      success: true,
      data: {
        period,
        totalTransactions: filteredTransactions.length,
        completedTransactions: completedTransactions.length,
        totalTaxCollected: totalTaxForPeriod,
        successRate: filteredTransactions.length > 0 ? (completedTransactions.length / filteredTransactions.length) * 100 : 0,
        averageTaxAmount: completedTransactions.length > 0 ? totalTaxForPeriod / completedTransactions.length : 0,
        transactions: filteredTransactions.slice(0, 50), // Limit to last 50 transactions
        globalStats: taxCollectionStats
      },
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ Tax Stats API Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch tax collection stats',
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    )
  }
} 