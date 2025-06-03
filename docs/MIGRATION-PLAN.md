# Airscape Migration Plan: React/Vite → Next.js 14 + Prisma

## Overview
Migrating from React/Vite + Supabase to Next.js 14 + Prisma + PostgreSQL while maintaining all functionality and improving performance.

## Phase 1: Frontend Migration (Week 1-2)

### 1.1 Project Structure Mapping

```
Current (React/Vite)              →  Target (Next.js 14)
├── src/
│   ├── pages/                    →  ├── app/
│   │   ├── Index.tsx            →  │   ├── page.tsx (home)
│   │   ├── ValueIndicator.tsx   →  │   ├── value-indicator/page.tsx
│   │   ├── CommunityBoard.tsx   →  │   ├── community-board/page.tsx
│   │   ├── Trading.tsx          →  │   ├── trading/page.tsx
│   │   └── Analytics.tsx        →  │   ├── analytics/page.tsx
│   ├── components/               →  │   └── components/
│   ├── hooks/                    →  │   └── hooks/
│   ├── services/                 →  │   └── lib/
│   └── integrations/             →  │   └── lib/
└── supabase/functions/           →  └── app/api/
```

### 1.2 Core Migrations Required

#### A. Layout System
```typescript
// app/layout.tsx
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
```

#### B. Page Routing Conversion
```typescript
// Current: Multiple routes in App.tsx
<Route path="/" element={<Index />} />
<Route path="/value-indicator" element={<ValueIndicatorPage />} />

// Target: App Router file structure
app/
├── page.tsx                    // Index
├── value-indicator/
│   └── page.tsx               // ValueIndicatorPage
├── community-board/
│   └── page.tsx               // CommunityBoardPage
└── analytics/
    └── page.tsx               // AnalyticsPage
```

#### C. Data Fetching Strategy
```typescript
// Current: Client-side with TanStack Query
const { data, loading, error } = useTreasuryData()

// Target: Server Components + Client Components
// Server Component for initial data
async function TreasuryPage() {
  const initialData = await getTreasuryData()
  return <TreasuryDashboard initialData={initialData} />
}

// Client Component for real-time updates
'use client'
function TreasuryDashboard({ initialData }) {
  const { data } = useTreasuryData(initialData)
  // ...
}
```

### 1.3 Component Migration Priority

#### High Priority (Core functionality)
1. **Header/Navigation** - Critical for app navigation
2. **Treasury Components** - Main dashboard functionality
3. **Value Indicator** - Key financial metrics
4. **Community Board** - User engagement

#### Medium Priority
1. **Trading Dashboard** - Jupiter integration
2. **Analytics Dashboard** - Advanced metrics
3. **Property Showcase** - Business logic

#### Low Priority (Nice-to-have)
1. **Onboarding Flow** - User experience
2. **Advanced Charts** - Visual enhancements

---

## Phase 2: Backend Migration (Week 2-3)

### 2.1 Database Schema Migration

#### Current Supabase Schema → Prisma Schema
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Wallet {
  id          String   @id @default(cuid())
  address     String   @unique
  name        String
  description String?
  blockchain  String
  walletType  String   @map("wallet_type")
  explorerUrl String   @map("explorer_url")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  
  balances    WalletBalance[]
  
  @@map("wallets")
}

model WalletBalance {
  id           String    @id @default(cuid())
  walletId     String    @map("wallet_id")
  tokenSymbol  String    @map("token_symbol")
  tokenName    String?   @map("token_name")
  tokenAddress String?   @map("token_address")
  balance      Float     @default(0)
  usdValue     Float?    @map("usd_value")
  isLpToken    Boolean?  @map("is_lp_token")
  platform     String?
  lpDetails    String?   @map("lp_details")
  lastUpdated  DateTime  @default(now()) @map("last_updated")
  
  wallet       Wallet    @relation(fields: [walletId], references: [id])
  
  @@map("wallet_balances")
}

// New tables for enhanced functionality
model Transaction {
  id          String   @id @default(cuid())
  hash        String   @unique
  amount      Float
  tokenSymbol String   @map("token_symbol")
  fromWallet  String   @map("from_wallet")
  toWallet    String   @map("to_wallet")
  category    String
  timestamp   DateTime
  blockchain  String
  
  @@map("transactions")
}

model CommunityMessage {
  id        String   @id @default(cuid())
  content   String
  author    String
  timestamp DateTime @default(now())
  category  String
  upvotes   Int      @default(0)
  
  @@map("community_messages")
}
```

### 2.2 API Routes Migration

#### Current: Supabase Edge Functions → Next.js API Routes

```typescript
// app/api/treasury/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getWalletBalances } from '@/lib/blockchain'
import { getCoinGeckoPrice } from '@/lib/external-apis'

export async function GET(request: NextRequest) {
  try {
    // Fetch wallet data from database
    const wallets = await prisma.wallet.findMany({
      include: { balances: true }
    })

    // Get live blockchain data
    const liveBalances = await Promise.all(
      wallets.map(wallet => getWalletBalances(wallet.address, wallet.blockchain))
    )

    // Update database with fresh data
    // ... update logic

    // Calculate treasury metrics
    const treasuryData = calculateTreasuryMetrics(liveBalances)

    return NextResponse.json(treasuryData)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch treasury data' }, { status: 500 })
  }
}
```

### 2.3 Service Layer Migration

#### External API Integration
```typescript
// lib/external-apis.ts
export async function getCoinGeckoPrice(tokenId: string) {
  const response = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${tokenId}&vs_currencies=usd`,
    { next: { revalidate: 300 } } // Cache for 5 minutes
  )
  return response.json()
}

export async function getMeteoraPoolData(poolAddress: string) {
  // Meteora API integration
}

export async function getSolanaWalletBalance(address: string) {
  // Solana RPC integration
}
```

---

## Phase 3: Database Migration (Week 3-4)

### 3.1 Data Migration Strategy

#### Step 1: Export from Supabase
```bash
# Export current data
pg_dump $SUPABASE_DB_URL > supabase_backup.sql

# Or use Supabase CLI
supabase db dump > backup.sql
```

#### Step 2: Prisma Migration Setup
```bash
# Initialize Prisma
npx prisma init

# Create migration from schema
npx prisma migrate dev --name init

# Seed with existing data
npx prisma db seed
```

#### Step 3: Data Transformation
```typescript
// scripts/migrate-data.ts
import { PrismaClient } from '@prisma/client'
import { supabaseData } from './supabase-export'

const prisma = new PrismaClient()

async function migrateWallets() {
  for (const wallet of supabaseData.wallets) {
    await prisma.wallet.create({
      data: {
        address: wallet.address,
        name: wallet.name,
        blockchain: wallet.blockchain,
        walletType: wallet.wallet_type,
        explorerUrl: wallet.explorer_url,
        balances: {
          create: wallet.balances.map(balance => ({
            tokenSymbol: balance.token_symbol,
            tokenName: balance.token_name,
            balance: balance.balance,
            usdValue: balance.usd_value,
            isLpToken: balance.is_lp_token,
            platform: balance.platform,
            lpDetails: balance.lp_details
          }))
        }
      }
    })
  }
}
```

### 3.2 Real-time Functionality Replacement

#### Current: Supabase Real-time → Server-Sent Events
```typescript
// app/api/treasury/stream/route.ts
export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      const interval = setInterval(async () => {
        const data = await getTreasuryData()
        controller.enqueue(`data: ${JSON.stringify(data)}\n\n`)
      }, 30000) // 30 seconds

      return () => clearInterval(interval)
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    }
  })
}
```

---

## Phase 4: Enhanced Features (Week 4-5)

### 4.1 Performance Optimizations

#### Server Components Strategy
```typescript
// app/analytics/page.tsx (Server Component)
import { AnalyticsClient } from './AnalyticsClient'
import { getAnalyticsData } from '@/lib/analytics'

export default async function AnalyticsPage() {
  const initialData = await getAnalyticsData()
  
  return (
    <div>
      <h1>Analytics Dashboard</h1>
      <AnalyticsClient initialData={initialData} />
    </div>
  )
}

// app/analytics/AnalyticsClient.tsx (Client Component)
'use client'
import { useEffect, useState } from 'react'

export function AnalyticsClient({ initialData }) {
  const [data, setData] = useState(initialData)
  
  useEffect(() => {
    // Real-time updates
    const eventSource = new EventSource('/api/analytics/stream')
    eventSource.onmessage = (event) => {
      setData(JSON.parse(event.data))
    }
    return () => eventSource.close()
  }, [])

  return <AdvancedAnalytics data={data} />
}
```

### 4.2 Caching Strategy
```typescript
// lib/cache.ts
import { unstable_cache } from 'next/cache'

export const getCachedTreasuryData = unstable_cache(
  async () => {
    return await fetchTreasuryData()
  },
  ['treasury-data'],
  { revalidate: 300 } // 5 minutes
)
```

---

## Migration Phases Timeline

### Week 1: Project Setup & Core Pages
- [x] Next.js 14 project initialization
- [x] Port layout and navigation
- [x] Migrate Index, ValueIndicator, CommunityBoard pages
- [x] Set up Tailwind CSS and shadcn/ui

### Week 2: API Routes & Data Fetching
- [ ] Create API routes for treasury data
- [ ] Implement blockchain integration
- [ ] Set up external API connections
- [ ] Migrate remaining pages

### Week 3: Database Migration
- [ ] Set up PostgreSQL database
- [ ] Create Prisma schema
- [ ] Migrate data from Supabase
- [ ] Test data integrity

### Week 4: Real-time Features
- [ ] Implement Server-Sent Events
- [ ] Add caching strategies
- [ ] Performance optimization
- [ ] Error handling

### Week 5: Testing & Deployment
- [ ] Comprehensive testing
- [ ] Performance benchmarking
- [ ] Production deployment
- [ ] Monitoring setup

---

## What to Port, Rewrite, or Replace

### ✅ Port Directly (90% compatible)
- **UI Components**: All shadcn/ui components
- **Styling**: Tailwind CSS classes
- **Types**: TypeScript interfaces and types
- **Business Logic**: Treasury calculations, token economics
- **Smart Contract Integration**: Solana wallet connections

### 🔄 Rewrite with Adaptations
- **Data Fetching**: TanStack Query → Server Components + SWR
- **Routing**: React Router → Next.js App Router
- **API Layer**: Supabase Edge Functions → Next.js API Routes
- **Real-time**: Supabase subscriptions → Server-Sent Events

### 🔀 Replace Completely
- **Database ORM**: Supabase client → Prisma Client
- **Authentication**: Supabase Auth → NextAuth.js (if needed)
- **File Storage**: Supabase Storage → Next.js static files or cloud storage

---

## Risk Mitigation

### High-Risk Areas
1. **Real-time Updates**: Test SSE performance vs Supabase subscriptions
2. **Blockchain Integration**: Ensure Solana web3.js works in server environment
3. **Data Migration**: Validate data integrity during transfer

### Mitigation Strategies
1. **Gradual Migration**: Run both systems in parallel initially
2. **Feature Flags**: Enable/disable features during migration
3. **Comprehensive Testing**: Unit, integration, and end-to-end tests
4. **Rollback Plan**: Keep Supabase environment as backup

This migration will result in better performance, improved SEO, and more maintainable code while preserving all existing functionality. 