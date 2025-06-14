
import { NextResponse } from 'next/server'

// Mock treasury data
const treasuryData = {
  totalValue: 2500000,
  wallets: [
    {
      name: 'Main Treasury',
      address: 'AuRa1234567890abcdef',
      balance: 1500000,
      percentage: 60
    },
    {
      name: 'Development Fund',
      address: 'AuRaDev567890abcdef12',
      balance: 750000,
      percentage: 30
    },
    {
      name: 'Marketing Fund',
      address: 'AuRaMkt890abcdef12345',
      balance: 250000,
      percentage: 10
    }
  ]
}

export async function GET() {
  try {
    return NextResponse.json(treasuryData)
  } catch (error) {
    console.error('Treasury API error:', error)
    return NextResponse.json({ error: 'Failed to fetch treasury data' }, { status: 500 })
  }
}
