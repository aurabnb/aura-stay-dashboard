import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { walletService } from '@/lib/services/walletService'
import { getRealTreasuryData, getRealTreasuryOverview } from '@/lib/services/realTreasuryService'

// Required for static export compatibility - only in non-static mode
// export const dynamic = 'force-dynamic'
export const revalidate = 300 // Revalidate every 5 minutes

interface TreasuryData {
  treasury: {
    totalMarketCap: number
    volatileAssets: number
    hardAssets: number
    lastUpdated: string
  }
  wallets: Array<{
    id: string
    address: string
    name: string
    blockchain: string
    balances: Array<{
      token_symbol: string
      token_name: string
      balance: number
      usd_value: number
      token_address?: string
      is_lp_token: boolean
      platform: string
      lp_details?: any
    }>
    totalUsdValue: number
  }>
  solPrice: number
}

// Fetch AURA market cap
async function fetchAuraMarketCap(): Promise<number> {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=aurora-ventures&vs_currencies=usd&include_market_cap=true'
    )
    const data = await response.json()
    return data['aurora-ventures']?.usd_market_cap || 1234567.89
  } catch (error) {
    console.error('Error fetching AURA market cap:', error)
    return 1234567.89 // Fallback value
  }
}

// Fetch current SOL price from our API route
async function fetchCoinGeckoPrice(): Promise<number> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_VERCEL_URL || 'http://localhost:3000'}/api/sol-price`)
    const data = await response.json()
    return data.price || 245.67
  } catch (error) {
    console.error('Error fetching SOL price:', error)
    return 245.67 // Fallback SOL price
  }
}

// Fetch AURA price from DexScreener
async function fetchAuraPrice(): Promise<number> {
  try {
    const response = await fetch(
      'https://api.dexscreener.com/latest/dex/tokens/3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe'
    )
    const data = await response.json()
    if (data.pairs && data.pairs.length > 0) {
      const price = parseFloat(data.pairs[0].priceUsd)
      return price > 0 ? price : 0.0002700 // Fallback price
    }
    return 0.0002700 // Fallback price
  } catch (error) {
    console.error('Error fetching AURA price:', error)
    return 0.0002700 // Fallback price
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'balances', 'transactions', 'overview', 'real'
    
    switch (type) {
      case 'real':
        // Return real blockchain data from all treasury wallets
        const realData = await getRealTreasuryData()
        return NextResponse.json(realData)
      case 'real-overview':
        // Return real treasury overview data
        const realOverview = await getRealTreasuryOverview()
        return NextResponse.json(realOverview)
      case 'balances':
        return await getTreasuryBalances()
      case 'transactions':
        return await getTreasuryTransactions(request)
      case 'overview':
        return await getTreasuryOverview()
      default:
        return await getTreasuryOverview()
    }
  } catch (error) {
    console.error('Error fetching treasury data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch treasury data' },
      { status: 500 }
    )
  }
}

async function getTreasuryBalances() {
  try {
    // Fetch real AURA price
    const auraPrice = await fetchAuraPrice()
    
    // In a real implementation, this would fetch from blockchain APIs
    // For now, returning mock data
    const balances = [
      {
        token: 'SOL',
        amount: 15420.75,
        usdValue: 15420.75 * 120, // SOL price
        change24h: 5.2,
        walletAddress: 'HwqKXvt8B4vK8tGCn2cPgE9pVEuE6eFdQiZK8RqX1jJQ',
        logo: '/logos/sol.png'
      },
      {
        token: 'USDC',
        amount: 485250.00,
        usdValue: 485250.00,
        change24h: 0.1,
        walletAddress: 'HwqKXvt8B4vK8tGCn2cPgE9pVEuE6eFdQiZK8RqX1jJQ',
        logo: '/logos/usdc.png'
      },
      {
        token: 'AURA',
        amount: 500000000, // 500M AURA tokens - realistic amount for low price
        usdValue: 500000000 * auraPrice, // Use real AURA price
        change24h: 12.8,
        walletAddress: 'fa1ra81T7g5DzSn7XT6z36zNqupHpG1Eh7omB2F6GTh',
        logo: '/logos/aura.png'
      }
    ]

    const totalValue = balances.reduce((sum, balance) => sum + balance.usdValue, 0)
    
    return NextResponse.json({
      balances,
      totalValue,
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    throw error
  }
}

async function getTreasuryTransactions(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const category = searchParams.get('category')

    // In a real implementation, this would fetch from blockchain and database
    const mockTransactions = [
      {
        id: '1',
        hash: 'abc123def456ghi789',
        type: 'incoming',
        amount: 50000,
        token: 'USDC',
        from: '9Wd2xPc6KmF6qmqbsQSbhemAmRpVfgVBFUPeLpYw7',
        to: 'HwqKXvt8B4vK8tGCn2cPgE9pVEuE6eFdQiZK8RqX1jJQ',
        category: 'Operations',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        status: 'confirmed',
        description: 'Monthly operations budget allocation'
      },
      {
        id: '2',
        hash: 'def456ghi789jkl012',
        type: 'outgoing',
        amount: 15000,
        token: 'USDC',
        from: 'HwqKXvt8B4vK8tGCn2cPgE9pVEuE6eFdQiZK8RqX1jJQ',
        to: 'Hxa31irnLJq2fEDm64gE7ZDAcPNQ6HyWqn2sE3vVKvfg',
        category: 'ProjectFunding',
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        status: 'confirmed',
        description: 'Volcano Stay construction funding'
      },
      {
        id: '3',
        hash: 'ghi789jkl012mno345',
        type: 'outgoing',
        amount: 5000,
        token: 'USDC',
        from: 'HwqKXvt8B4vK8tGCn2cPgE9pVEuE6eFdQiZK8RqX1jJQ',
        to: '7QpFeyM5VPGMuycCCdaYUeez9c8EzaDkJYBDKKFr4DN2',
        category: 'Marketing',
        timestamp: new Date(Date.now() - 259200000).toISOString(),
        status: 'confirmed',
        description: 'Q1 marketing campaign'
      }
    ]

    const filteredTransactions = category && category !== 'all' 
      ? mockTransactions.filter(tx => tx.category === category)
      : mockTransactions

    return NextResponse.json({
      transactions: filteredTransactions.slice(0, limit),
      total: filteredTransactions.length,
      hasMore: filteredTransactions.length > limit
    })
  } catch (error) {
    throw error
  }
}

async function getTreasuryOverview() {
  try {
    const balances = await getTreasuryBalances()
    const balancesData = await balances.json()
    
    const overview = {
      totalValue: balancesData.totalValue,
      monthlyChange: 8.5, // Mock percentage
      totalTransactions: 156,
      activeWallets: 3,
      performance: {
        thisMonth: 12.3,
        lastMonth: 8.7,
        yearToDate: 45.2
      },
      allocation: [
        { category: 'Operations', amount: 2500000, percentage: 35 },
        { category: 'ProjectFunding', amount: 2000000, percentage: 28 },
        { category: 'Marketing', amount: 1500000, percentage: 21 },
        { category: 'Reserve', amount: 1142489, percentage: 16 }
      ]
    }

    return NextResponse.json(overview)
  } catch (error) {
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, data } = body

    if (type === 'simulate-transaction') {
      // Simulate a transaction for testing
      const { amount, token, destination, category, description } = data
      
      if (!amount || !token || !destination || !category) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        )
      }

      // Mock transaction simulation
      const simulatedTransaction = {
        id: `sim_${Date.now()}`,
        hash: `simulated_${Math.random().toString(36).substring(7)}`,
        type: 'outgoing',
        amount: parseFloat(amount),
        token,
        from: 'HwqKXvt8B4vK8tGCn2cPgE9pVEuE6eFdQiZK8RqX1jJQ',
        to: destination,
        category,
        timestamp: new Date().toISOString(),
        status: 'simulated',
        description: description || 'Simulated transaction',
        estimatedFee: 0.00025, // SOL fee
        estimatedTime: '2-3 seconds'
      }

      return NextResponse.json({
        transaction: simulatedTransaction,
        success: true
      })
    }

    return NextResponse.json(
      { error: 'Invalid request type' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error processing treasury request:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
} 