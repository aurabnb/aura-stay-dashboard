import { NextRequest, NextResponse } from 'next/server'

const AURA_TOKEN_MINT = '3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe'

// In-memory cache for 5 minutes to avoid hitting rate limits
let priceCache: {
  data: any
  timestamp: number
} | null = null

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Optional database caching helper
async function getCachedData(key: string) {
  try {
    // Try to import Prisma client - this will fail if DATABASE_URL is not set
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    
    const cached = await prisma.apiCache.findUnique({
      where: { key },
    })
    
    if (cached && cached.expiresAt > new Date()) {
      return cached.data
    }
    
    return null
  } catch (error) {
    // Database not available, use in-memory cache only
    console.log('Database caching not available, using in-memory cache only')
    return null
  }
}

async function setCachedData(key: string, data: any, ttl: number) {
  try {
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    
    const expiresAt = new Date(Date.now() + ttl)
    
    await prisma.apiCache.upsert({
      where: { key },
      update: {
        data,
        expiresAt,
      },
      create: {
        key,
        data,
        expiresAt,
      },
    })
  } catch (error) {
    // Database not available, skip database caching
    console.log('Database caching not available')
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tokens = searchParams.get('tokens') || 'sol,aura'
    const cacheKey = `token_prices_${tokens}`
    
    // Check in-memory cache first
    if (priceCache && Date.now() - priceCache.timestamp < CACHE_DURATION) {
      return NextResponse.json(priceCache.data)
    }

    // Check database cache
    const dbCached = await getCachedData(cacheKey)
    if (dbCached) {
      // Update in-memory cache
      priceCache = {
        data: dbCached,
        timestamp: Date.now()
      }
      return NextResponse.json(dbCached)
    }

    const promises: Promise<any>[] = []
    
    // Fetch SOL price from CoinGecko
    if (tokens.includes('sol')) {
      promises.push(
        fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd')
          .then(res => res.json())
          .then(data => ({ sol: data.solana?.usd || 180 }))
          .catch(() => ({ sol: 180 }))
      )
    }

    // Fetch AURA price from DexScreener
    if (tokens.includes('aura')) {
      promises.push(
        fetch(`https://api.dexscreener.com/latest/dex/tokens/${AURA_TOKEN_MINT}`)
          .then(res => res.json())
          .then(data => {
            let auraPrice = 0.0002700 // Fallback
            let auraLogo = '/aura-logo.png'
            let priceChange24h = 0
            let volume24h = 0
            let marketCap = 0
            
            if (data.pairs && data.pairs.length > 0) {
              const pair = data.pairs[0]
              const price = parseFloat(pair.priceUsd)
              if (price && price > 0) {
                auraPrice = price
              }
              
              priceChange24h = parseFloat(pair.priceChange?.h24) || 0
              volume24h = parseFloat(pair.volume?.h24) || 0
              marketCap = parseFloat(pair.marketCap) || 0
              
              // Extract logo
              if (pair.baseToken && pair.baseToken.address === AURA_TOKEN_MINT) {
                auraLogo = pair.baseToken.logoURI || auraLogo
              } else if (pair.quoteToken && pair.quoteToken.address === AURA_TOKEN_MINT) {
                auraLogo = pair.quoteToken.logoURI || auraLogo
              }
            }
            
            return {
              aura: auraPrice,
              auraLogo,
              auraMetrics: {
                price: auraPrice,
                priceChange24h,
                volume24h,
                marketCap,
                symbol: 'AURA',
                name: 'AURA Token'
              }
            }
          })
          .catch(() => ({
            aura: 0.0002700,
            auraLogo: '/aura-logo.png',
            auraMetrics: {
              price: 0.0002700,
              priceChange24h: 0,
              volume24h: 50000,
              marketCap: 270000,
              symbol: 'AURA',
              name: 'AURA Token'
            }
          }))
      )
    }

    const results = await Promise.all(promises)
    const combinedData = results.reduce((acc, result) => ({ ...acc, ...result }), {
      usdc: 1.0, // USDC is stable
      lastUpdated: new Date().toISOString(),
      cached: false
    })

    // Cache the result in-memory
    priceCache = {
      data: combinedData,
      timestamp: Date.now()
    }

    // Cache in database (async, don't wait)
    setCachedData(cacheKey, combinedData, CACHE_DURATION).catch(console.error)

    return NextResponse.json(combinedData)
  } catch (error) {
    console.error('Error fetching token prices:', error)
    
    // Return fallback data
    return NextResponse.json({
      sol: 180,
      aura: 0.0002700,
      usdc: 1.0,
      auraLogo: '/aura-logo.png',
      auraMetrics: {
        price: 0.0002700,
        priceChange24h: 0,
        volume24h: 50000,
        marketCap: 270000,
        symbol: 'AURA',
        name: 'AURA Token'
      },
      lastUpdated: new Date().toISOString(),
      error: 'Failed to fetch live data, using fallback',
      cached: false
    })
  }
} 