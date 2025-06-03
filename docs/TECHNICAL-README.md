# Airscape (AURA) - Technical README

## Overview

**Airscape** is a decentralized platform for boutique unique stays built on the Solana blockchain. It's creating a revolutionary ecosystem where travelers become stakeholders, communities benefit directly, and every stay contributes to a sustainable future. The platform combines hospitality with blockchain technology to enable community-owned properties, transparent governance, and innovative tokenomics.

## What This Application Does

Airscape is building the world's first decentralized unique stay network, starting with boutique eco-stays and scaling to resort communities. The platform features:

- **Community-Owned Properties**: Properties are funded and owned by the community through token mechanisms
- **Transparent Treasury Management**: Real-time tracking of all financial operations and treasury movements
- **Token-Based Governance**: AURA token holders vote on property decisions and platform governance
- **Innovative Tokenomics**: 2% burn and redistribution system for sustainable growth
- **Multi-Platform Integration**: Works with existing booking platforms (Airbnb, Booking.com) while offering exclusive benefits

## Frontend Framework & Architecture

### Core Technologies
- **React 18** with **TypeScript** for type safety
- **Vite** as the build tool and development server
- **Tailwind CSS** for styling and responsive design
- **shadcn/ui** component library for modern UI components
- **React Router DOM** for client-side routing
- **TanStack Query** for server state management and data fetching

### Key Frontend Features

#### 1. **Dashboard System**
Real-time treasury tracking with live wallet balance monitoring across multiple blockchain networks.

#### 2. **Real-Time Data Integration**
Auto-refreshing data every 5 minutes from multiple APIs:
- Solana RPC for wallet balances
- CoinGecko for market prices
- Meteora for LP token values

#### 3. **Multi-Page Application Structure**
Comprehensive routing system with dedicated pages for:
- Treasury dashboard (`/value-indicator`)
- Community board (`/community-board`) 
- Trading interface (`/trading`)
- Property showcases (`/properties`)
- Analytics dashboard (`/analytics`)
- Burn redistribution (`/burn-redistribution`)
- Multisig operations (`/multisig`)

#### 4. **Advanced Analytics & Metrics**
Real-time analytics featuring:
- Token burn tracking
- Staking metrics and rewards
- Portfolio management
- Predictive models and market sentiment

## Backend Logic & Architecture

### Database Layer (Supabase)
PostgreSQL database with real-time capabilities managing:

#### Core Tables:
- **wallets**: Multi-blockchain wallet tracking (Solana/Ethereum)
- **wallet_balances**: Real-time token balance storage with USD values

### Serverless Backend (Supabase Edge Functions)

#### 1. **Treasury Data Aggregation** (`fetch-wallet-balances`)
Aggregates data from multiple sources:
- Solana RPC for wallet balances
- CoinGecko API for market prices
- Meteora API for LP token values
- Custom treasury calculations

#### 2. **Multi-Blockchain Support**
Tracks wallets across:
- **Solana** (primary): 4 operational wallets
- **Ethereum** (secondary): 1 project funding wallet
- Support for LP tokens and DeFi protocols

### Blockchain Backend (Solana Smart Contracts)

#### 1. **Multisig Treasury Management** (`aura-multisig`)
Secure multisig wallet for treasury operations:
- `initialize_multisig()`: Set up multi-signature wallet with owners and threshold
- `create_transaction()`: Propose treasury transactions with categorization
- `approve_transaction()`: Multi-signature approval process
- `execute_transaction()`: Execute approved transactions

**Transaction Categories:**
- Operations
- Business Costs  
- Marketing
- Project Funding

#### 2. **Burn & Redistribution System** (`aura-burn-redistribution`)
Automated 2% burn mechanism:
- `process_transaction()`: Burns 2% of all transactions automatically
- `stake_tokens()`: Stake AURA tokens to earn redistribution rewards
- `distribute_rewards()`: Redistribute burned tokens to stakers every 6 hours
- `claim_rewards()`: Claim accumulated staking rewards

## Data Flow Architecture

### 1. **Real-Time Treasury Tracking**
```
Solana Wallets → Supabase Edge Function ← Ethereum Wallets
                        ↓
              [CoinGecko + Meteora APIs]
                        ↓
                PostgreSQL Database
                        ↓
                 React Frontend
                        ↓
              Live Dashboard Updates
```

### 2. **Token Economics Flow**
```
AURA Transactions → 2% Auto-Burn → Burn Pool
                                       ↓
User Staking → Staking Pool → Redistribution Engine
                                       ↓
                             Reward Distribution
                                       ↓
                              Staker Rewards
```

### 3. **Governance & Decision Making**
```
Community Proposals → AURA Token Voting → Multisig Approval
                                               ↓
                                    Smart Contract Execution
                                               ↓
                                      Treasury Operations
                                               ↓
                                    Property Development
```

## Key System Components

### 1. **Treasury Management System**
- **Real-time Balance Tracking**: Monitors 5 different wallet addresses
- **Automated Categorization**: Operations, Business Costs, Marketing, Project Funding
- **LP Token Integration**: Meteora liquidity pool positions and values
- **Market Cap Integration**: Live AURA market cap from CoinGecko

**Monitored Wallets:**
- Operations: `fa1ra81T7g5DzSn7XT6z36zNqupHpG1Eh7omB2F6GTh`
- Business Costs: `Hxa31irnLJq2fEDm64gE7ZDAcPNQ6HyWqn2sE3vVKvfg`
- Marketing: `7QpFeyM5VPGMuycCCdaYUeez9c8EzaDkJYBDKKFr4DN2`
- Project Funding (Solana): `Aftv2wFpusiKHfHWdkiFNPsmrFEgrBheHX6ejS4LkM8i`
- Project Funding (Ethereum): `0xf05fc9a3c6011c76eb6fe4cbb956eeac8750306d`

### 2. **Community Features**
- **Community Board**: Message system for suggestions and discussions
- **Voting System**: Token-weighted governance for property decisions
- **Transparency Dashboard**: Public treasury movements and expenses

### 3. **Property Investment System**
- **Community Funding**: LP rewards automatically fund acquisitions
- **Democratic Decisions**: AURA holders vote on property design/amenities
- **Revenue Sharing**: Property income flows back to token holders

### 4. **Integration Strategy**
- **Symbiotic Platform Approach**: Works with existing booking platforms
- **Cross-Platform Revenue**: Tracks Airbnb, Booking.com, direct bookings
- **Exclusive Benefits**: AURA holders get special perks and rates

## API Integrations

### External APIs
- **CoinGecko**: Real-time token prices and market cap data
- **Meteora**: Solana DEX LP token balances and pool information
- **Solana RPC**: Direct blockchain data for wallet balances

### Token Support
- **AURA**: `3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe`
- **SOL**: `So11111111111111111111111111111111111111112`
- **USDC**: `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`
- **WBTC**: `3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh`
- **ETH**: `7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs`

## Development & Deployment

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (for backend services)

### Local Development
```bash
# Clone the repository
git clone <repository-url>
cd aura-stay-dashboard

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:8081`

### Environment Variables
```bash
# Supabase Configuration
SUPABASE_URL=https://ahviquwdicsyqgsfnmfi.supabase.co
SUPABASE_ANON_KEY=<your-supabase-anon-key>

# Optional: Infura for Ethereum data
INFURA_API_KEY=<your-infura-key>
```

### Build & Deployment
```bash
# Production build
npm run build

# Preview production build
npm run preview

# Development build
npm run build:dev
```

### Smart Contract Development
```bash
# Navigate to smart contract directory
cd programs/aura-multisig
# or
cd programs/aura-burn-redistribution

# Build contracts
anchor build

# Deploy to devnet
anchor deploy --provider.cluster devnet

# Deploy to mainnet
anchor deploy --provider.cluster mainnet
```

## Current Live Features

### ✅ Already Implemented
- **Live Domain**: [aurabnb.io](https://aurabnb.io)
- **Treasury Monitoring**: Real-time multi-wallet tracking
- **Market Data Integration**: Live AURA market cap and prices
- **Community Board**: Messaging system for community engagement
- **Blog System**: Static blog posts with navigation
- **Token Launch**: AURA token launched and graduated to Meteora
- **LP Token Tracking**: Meteora liquidity pool monitoring
- **Expense Categories**: Automated treasury movement categorization

### 🛠 In Development
- Property showcase for Aura stays
- Enhanced trading interface with Jupiter integration
- Advanced analytics dashboard
- Governance voting system

## Roadmap Phases

### Phase 2: Aura Expansion & DEX
- Property showcase for Aura stays
- Airbnb integration for bookings
- Internal DEX with AURA/USDC trading
- Samsara seed token launch ($1.2M raise)

### Phase 3: Samsara Pilot Launch
- 45 eco-conscious units in Dominical, Costa Rica
- Prasaga transparency integration
- Local sourcing enforcement
- POS system with real-time inventory tracking

### Phase 4: Airscape MVP
- Custom booking engine with Airbnb calendar sync
- Wallet integration with simplified fiat payments
- Referral rewards system for token holders
- Local vendor ecosystem with rating system

### Phase 5: Full Launch & Partnerships
- Investment hub for property purchases (50% user funding)
- Event booking for larger resorts
- Enhanced DEX features and derivatives
- Staking rewards transferable to property investments

### Phase 6: Global Expansion
- 40+ boutique properties worldwide
- Global Property DAO system
- AIRSCAPE index token with revenue redistribution
- Charitable voting and transport booking integration

## Architecture Decisions

### Why Solana?
- Low transaction fees for frequent burns/redistributions
- High throughput for real-time operations
- Growing DeFi ecosystem with Meteora integration
- Energy efficient compared to Ethereum

### Why Supabase?
- Real-time database subscriptions for live updates
- Edge Functions for serverless API aggregation
- PostgreSQL for complex relational data
- Built-in auth and security features

### Why React + TypeScript?
- Strong ecosystem for DeFi applications
- Type safety for financial calculations
- Component reusability across features
- Excellent tooling and development experience

## Security Considerations

### Smart Contract Security
- Multi-signature requirements for treasury operations
- Time-locked transactions for major decisions
- Emergency pause functionality for burn system
- Comprehensive testing suite

### Frontend Security
- Environment variable protection
- Input validation for all forms
- Rate limiting on API calls
- Secure wallet connection handling

### Backend Security
- Row Level Security (RLS) in Supabase
- API key rotation and management
- CORS configuration for production
- Data validation in Edge Functions

## Performance Optimizations

### Frontend
- Lazy loading for route components
- Image optimization and compression
- TanStack Query for efficient data caching
- Skeleton loading states for better UX

### Backend
- Database indexing on frequently queried fields
- Connection pooling for external APIs
- Caching strategies for market data
- Batch processing for wallet updates

## Contributing

### Development Guidelines
- Follow TypeScript strict mode
- Use Tailwind CSS for styling consistency
- Implement proper error boundaries
- Write comprehensive tests for smart contracts
- Document all API endpoints and data structures

### Code Style
- ESLint configuration for consistent formatting
- Prettier for code formatting
- Conventional commits for clear history
- Component-based architecture with clear separation of concerns

---

**Airscape: Redefining the Art of Unique Short Term Stays**

*This application represents a pioneering approach to decentralized hospitality, combining blockchain technology with real-world property investment and community governance.* 