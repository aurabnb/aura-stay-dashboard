import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd', {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'AuraStay-Dashboard/1.0'
      },
      next: { revalidate: 60 } // Cache for 60 seconds
    })

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`)
    }

    const data = await response.json()
    const solPrice = data.solana?.usd || 150 // Fallback to 150 if data missing

    return NextResponse.json({ 
      price: solPrice,
      timestamp: Date.now(),
      source: 'coingecko'
    })
  } catch (error) {
    console.error('Error fetching SOL price:', error)
    
    // Return fallback price on error
    return NextResponse.json({ 
      price: 150,
      timestamp: Date.now(),
      source: 'fallback',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
} 