import { NextRequest, NextResponse } from 'next/server'

interface TaxSettings {
  swapTaxRate: number
  buyTaxRate: number
  sellTaxRate: number
  stakeTaxRate: number
  unstakeTaxRate: number
  rewardTaxRate: number
  minimumTaxAmount: number
  maximumTaxAmount: number
  taxWalletAddress: string
  autoDistribution: boolean
  enabledForPairs: string[]
  exemptWallets: string[]
  isEnabled: boolean
  lastUpdated: string
  updatedBy: string
}

// Default tax settings
const DEFAULT_TAX_SETTINGS: TaxSettings = {
  swapTaxRate: 2.0,
  buyTaxRate: 1.5,
  sellTaxRate: 2.5,
  stakeTaxRate: 1.0,
  unstakeTaxRate: 2.0,
  rewardTaxRate: 1.5,
  minimumTaxAmount: 0.001,
  maximumTaxAmount: 10.0,
  taxWalletAddress: 'fa1ra81T7g5DzSn7XT6z36zNqupHpG1Eh7omB2F6GTh',
  autoDistribution: true,
  enabledForPairs: ['SOL/AURA', 'USDC/AURA', 'RAY/AURA'],
  exemptWallets: [],
  isEnabled: true,
  lastUpdated: new Date().toISOString(),
  updatedBy: 'admin'
}

// In production, this would be stored in a database
let currentTaxSettings: TaxSettings = { ...DEFAULT_TAX_SETTINGS }

export async function GET(request: NextRequest) {
  try {
    console.log('🔧 Tax Settings API: Fetching current settings')
    
    // In production, verify admin authentication here
    const authHeader = request.headers.get('authorization')
    // if (!authHeader || !verifyAdminToken(authHeader)) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    // Simulate database fetch
    await new Promise(resolve => setTimeout(resolve, 100))

    const response = {
      success: true,
      data: currentTaxSettings,
      timestamp: new Date().toISOString()
    }

    console.log('✅ Tax Settings retrieved successfully')
    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ Tax Settings API Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch tax settings',
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Tax Settings API: Updating settings')
    
    // In production, verify admin authentication here
    const authHeader = request.headers.get('authorization')
    // if (!authHeader || !verifyAdminToken(authHeader)) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const body = await request.json()
    console.log('📝 Received settings update:', body)

    // Validate required fields
    const requiredFields: (keyof TaxSettings)[] = ['swapTaxRate', 'buyTaxRate', 'sellTaxRate', 'stakeTaxRate', 'unstakeTaxRate', 'rewardTaxRate', 'taxWalletAddress']
    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null) {
        return NextResponse.json(
          { 
            success: false, 
            error: `Missing required field: ${field}`,
            timestamp: new Date().toISOString()
          }, 
          { status: 400 }
        )
      }
    }

    // Validate tax rates
    if (body.swapTaxRate < 0 || body.swapTaxRate > 10) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Swap tax rate must be between 0% and 10%',
          timestamp: new Date().toISOString()
        }, 
        { status: 400 }
      )
    }

    if (body.buyTaxRate < 0 || body.buyTaxRate > 5) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Buy tax rate must be between 0% and 5%',
          timestamp: new Date().toISOString()
        }, 
        { status: 400 }
      )
    }

    if (body.sellTaxRate < 0 || body.sellTaxRate > 5) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Sell tax rate must be between 0% and 5%',
          timestamp: new Date().toISOString()
        }, 
        { status: 400 }
      )
    }

    // Validate staking tax rates
    if (body.stakeTaxRate < 0 || body.stakeTaxRate > 10) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Stake tax rate must be between 0% and 10%',
          timestamp: new Date().toISOString()
        }, 
        { status: 400 }
      )
    }

    if (body.unstakeTaxRate < 0 || body.unstakeTaxRate > 10) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unstake tax rate must be between 0% and 10%',
          timestamp: new Date().toISOString()
        }, 
        { status: 400 }
      )
    }

    if (body.rewardTaxRate < 0 || body.rewardTaxRate > 10) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Reward tax rate must be between 0% and 10%',
          timestamp: new Date().toISOString()
        }, 
        { status: 400 }
      )
    }

    // Validate wallet address format (basic Solana address validation)
    const solanaAddressRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/
    if (!solanaAddressRegex.test(body.taxWalletAddress)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid Solana wallet address format',
          timestamp: new Date().toISOString()
        }, 
        { status: 400 }
      )
    }

    // Update settings
    const updatedSettings: TaxSettings = {
      ...currentTaxSettings,
      ...body,
      lastUpdated: new Date().toISOString(),
      updatedBy: 'admin' // In production, get from JWT token
    }

    // Simulate database save
    await new Promise(resolve => setTimeout(resolve, 200))
    currentTaxSettings = updatedSettings

    console.log('✅ Tax settings updated successfully')
    
    // Log important changes
    console.log(`📊 New swap tax rate: ${updatedSettings.swapTaxRate}%`)
    console.log(`💰 Tax wallet: ${updatedSettings.taxWalletAddress}`)
    console.log(`🔄 Auto distribution: ${updatedSettings.autoDistribution}`)

    const response = {
      success: true,
      data: updatedSettings,
      message: 'Tax settings updated successfully',
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ Tax Settings Update Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update tax settings',
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  // Reset to default settings
  try {
    console.log('🔄 Tax Settings API: Resetting to defaults')
    
    // In production, verify admin authentication here
    const authHeader = request.headers.get('authorization')
    // if (!authHeader || !verifyAdminToken(authHeader)) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    // Reset to defaults
    currentTaxSettings = {
      ...DEFAULT_TAX_SETTINGS,
      lastUpdated: new Date().toISOString(),
      updatedBy: 'admin'
    }

    console.log('✅ Tax settings reset to defaults')

    const response = {
      success: true,
      data: currentTaxSettings,
      message: 'Tax settings reset to defaults',
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ Tax Settings Reset Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to reset tax settings',
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    )
  }
} 