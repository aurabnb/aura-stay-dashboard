import { NextRequest, NextResponse } from 'next/server'

interface StakingTaxRequest {
  userWallet: string
  amount: number
  operation: 'stake' | 'unstake' | 'claim_rewards'
  currentStakedAmount?: number
  currentRewardAmount?: number
}

interface StakingTaxResult {
  grossAmount: number
  taxAmount: number
  netAmount: number
  taxRate: number
  operation: string
  isExempt: boolean
  exemptReason?: string
}

interface StakingTransaction {
  id: string
  timestamp: string
  userWallet: string
  operation: 'stake' | 'unstake' | 'claim_rewards'
  grossAmount: number
  taxAmount: number
  netAmount: number
  taxRate: number
  status: 'pending' | 'completed' | 'failed'
  transactionHash?: string
  blockNumber?: number
}

// In-memory storage for demo (use database in production)
let stakingTransactions: StakingTransaction[] = []
let stakingTaxStats = {
  totalStakeTaxCollected: 0,
  totalUnstakeTaxCollected: 0,
  totalRewardTaxCollected: 0,
  totalStakingTransactions: 0,
  successRate: 0
}

// Get current staking tax settings
async function getStakingTaxSettings() {
  try {
    // In production, this would fetch from your smart contract or database
    const savedSettings = {
      stakeTaxRate: 1.0,
      unstakeTaxRate: 2.0,
      rewardTaxRate: 1.5,
      minimumTaxAmount: 0.001,
      maximumTaxAmount: 10.0,
      taxWalletAddress: 'fa1ra81T7g5DzSn7XT6z36zNqupHpG1Eh7omB2F6GTh',
      exemptWallets: [],
      isEnabled: true
    }
    return savedSettings
  } catch (error) {
    console.error('Failed to get staking tax settings:', error)
    return null
  }
}

function calculateStakingTax(amount: number, operation: string, settings: any): StakingTaxResult {
  let taxRate = 0
  
  switch (operation) {
    case 'stake':
      taxRate = settings.stakeTaxRate
      break
    case 'unstake':
      taxRate = settings.unstakeTaxRate
      break
    case 'claim_rewards':
      taxRate = settings.rewardTaxRate
      break
    default:
      taxRate = 0
      break
  }

  const taxAmount = (amount * taxRate) / 100
  
  // Apply min/max limits
  const finalTaxAmount = Math.max(
    settings.minimumTaxAmount,
    Math.min(taxAmount, settings.maximumTaxAmount)
  )
  
  const netAmount = amount - finalTaxAmount

  return {
    grossAmount: amount,
    taxAmount: finalTaxAmount,
    netAmount,
    taxRate,
    operation,
    isExempt: false
  }
}

function checkStakingTaxExemption(userWallet: string, settings: any): { isExempt: boolean; reason?: string } {
  if (!settings.isEnabled) {
    return { isExempt: true, reason: 'Staking tax collection disabled' }
  }

  if (settings.exemptWallets.includes(userWallet)) {
    return { isExempt: true, reason: 'Wallet is tax-exempt for staking' }
  }

  return { isExempt: false }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🥩 Staking Tax API: Processing staking tax calculation')
    
    const body: StakingTaxRequest = await request.json()
    console.log('📝 Staking operation details:', body)

    // Validate required fields
    const requiredFields: (keyof StakingTaxRequest)[] = ['userWallet', 'amount', 'operation']
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

    // Validate operation type
    if (!['stake', 'unstake', 'claim_rewards'].includes(body.operation)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid operation. Must be: stake, unstake, or claim_rewards' 
        }, 
        { status: 400 }
      )
    }

    // Get current staking tax settings
    const taxSettings = await getStakingTaxSettings()
    if (!taxSettings) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to load staking tax settings' 
        }, 
        { status: 500 }
      )
    }

    // Check if wallet is exempt from staking taxes
    const exemptionCheck = checkStakingTaxExemption(body.userWallet, taxSettings)
    if (exemptionCheck.isExempt) {
      console.log(`⚡ Wallet ${body.userWallet} is exempt from staking tax: ${exemptionCheck.reason}`)
      
      return NextResponse.json({
        success: true,
        grossAmount: body.amount,
        taxAmount: 0,
        netAmount: body.amount,
        taxRate: 0,
        operation: body.operation,
        isExempt: true,
        exemptReason: exemptionCheck.reason,
        message: 'Staking operation exempt from redistribution tax'
      })
    }

    // Calculate staking tax
    const taxCalculation = calculateStakingTax(body.amount, body.operation, taxSettings)
    
    console.log(`📊 Staking tax calculation:`)
    console.log(`   Operation: ${body.operation}`)
    console.log(`   Gross amount: ${body.amount} AURA`)
    console.log(`   Tax rate: ${taxCalculation.taxRate}%`)
    console.log(`   Tax amount: ${taxCalculation.taxAmount} AURA`)
    console.log(`   Net amount: ${taxCalculation.netAmount} AURA`)

    // Create staking tax transaction record
    const stakingTransaction: StakingTransaction = {
      id: `stake_tax_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      userWallet: body.userWallet,
      operation: body.operation,
      grossAmount: body.amount,
      taxAmount: taxCalculation.taxAmount,
      netAmount: taxCalculation.netAmount,
      taxRate: taxCalculation.taxRate,
      status: 'pending'
    }

    // In production, this would interact with the Anchor smart contract
    // For demo purposes, we'll simulate the staking tax collection
    try {
      // Simulate smart contract interaction
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mark as completed
      stakingTransaction.status = 'completed'
      stakingTransaction.transactionHash = `${stakingTransaction.id}_tx_hash`
      stakingTransaction.blockNumber = Math.floor(Math.random() * 1000000) + 245789000
      
      // Store transaction
      stakingTransactions.push(stakingTransaction)
      
      // Update stats based on operation
      switch (body.operation) {
        case 'stake':
          stakingTaxStats.totalStakeTaxCollected += taxCalculation.taxAmount
          break
        case 'unstake':
          stakingTaxStats.totalUnstakeTaxCollected += taxCalculation.taxAmount
          break
        case 'claim_rewards':
          stakingTaxStats.totalRewardTaxCollected += taxCalculation.taxAmount
          break
      }
      
      stakingTaxStats.totalStakingTransactions += 1
      stakingTaxStats.successRate = (stakingTransactions.filter(tx => tx.status === 'completed').length / stakingTransactions.length) * 100

      console.log('✅ Staking tax collected successfully')
      console.log(`💰 Total staking tax collected: ${stakingTaxStats.totalStakeTaxCollected + stakingTaxStats.totalUnstakeTaxCollected + stakingTaxStats.totalRewardTaxCollected} AURA`)

    } catch (error) {
      console.error('❌ Staking tax collection failed:', error)
      stakingTransaction.status = 'failed'
      stakingTransactions.push(stakingTransaction)
    }

    const response = {
      success: true,
      grossAmount: taxCalculation.grossAmount,
      taxAmount: taxCalculation.taxAmount,
      netAmount: taxCalculation.netAmount,
      taxRate: taxCalculation.taxRate,
      operation: body.operation,
      isExempt: false,
      transactionId: stakingTransaction.id,
      status: stakingTransaction.status,
      taxWallet: 'staking_pool_redistribution',
      message: stakingTransaction.status === 'completed' ? 'Staking tax added to reward pool for redistribution' : 'Staking tax collection failed',
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ Staking Tax API Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process staking tax calculation',
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Staking Tax API: Fetching staking tax stats')
    
    const url = new URL(request.url)
    const period = url.searchParams.get('period') || '24h'
    const operation = url.searchParams.get('operation') // 'stake', 'unstake', 'claim_rewards'
    const walletAddress = url.searchParams.get('wallet')

    let filteredTransactions = stakingTransactions

    // Filter by wallet if specified
    if (walletAddress) {
      filteredTransactions = filteredTransactions.filter(tx => tx.userWallet === walletAddress)
    }

    // Filter by operation if specified
    if (operation && ['stake', 'unstake', 'claim_rewards'].includes(operation)) {
      filteredTransactions = filteredTransactions.filter(tx => tx.operation === operation)
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

    // Calculate operation-specific stats
    const stakeTransactions = completedTransactions.filter(tx => tx.operation === 'stake')
    const unstakeTransactions = completedTransactions.filter(tx => tx.operation === 'unstake')
    const rewardTransactions = completedTransactions.filter(tx => tx.operation === 'claim_rewards')

    const response = {
      success: true,
      data: {
        period,
        operation: operation || 'all',
        totalTransactions: filteredTransactions.length,
        completedTransactions: completedTransactions.length,
        totalTaxCollected: totalTaxForPeriod,
        successRate: filteredTransactions.length > 0 ? (completedTransactions.length / filteredTransactions.length) * 100 : 0,
        averageTaxAmount: completedTransactions.length > 0 ? totalTaxForPeriod / completedTransactions.length : 0,
        operationBreakdown: {
          stake: {
            count: stakeTransactions.length,
            totalTax: stakeTransactions.reduce((sum, tx) => sum + tx.taxAmount, 0),
            averageTax: stakeTransactions.length > 0 ? stakeTransactions.reduce((sum, tx) => sum + tx.taxAmount, 0) / stakeTransactions.length : 0
          },
          unstake: {
            count: unstakeTransactions.length,
            totalTax: unstakeTransactions.reduce((sum, tx) => sum + tx.taxAmount, 0),
            averageTax: unstakeTransactions.length > 0 ? unstakeTransactions.reduce((sum, tx) => sum + tx.taxAmount, 0) / unstakeTransactions.length : 0
          },
          claim_rewards: {
            count: rewardTransactions.length,
            totalTax: rewardTransactions.reduce((sum, tx) => sum + tx.taxAmount, 0),
            averageTax: rewardTransactions.length > 0 ? rewardTransactions.reduce((sum, tx) => sum + tx.taxAmount, 0) / rewardTransactions.length : 0
          }
        },
        transactions: filteredTransactions.slice(0, 50), // Limit to last 50 transactions
        globalStats: stakingTaxStats
      },
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ Staking Tax Stats API Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch staking tax stats',
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    )
  }
} 