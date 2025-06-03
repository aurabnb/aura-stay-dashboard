# Airscape (AURA) - Next.js + Prisma

A decentralized platform for boutique unique stays built on Solana blockchain, now powered by Next.js 14 and Prisma ORM.

## Overview

**Airscape** is a community-owned platform facilitating funding for unique hospitality experiences, starting with the Volcano Stay project in Costa Rica. The platform features advanced treasury management, community governance, and a sustainable token economy with burn-redistribution mechanisms.

### Key Features

- 🏦 **Treasury Management** - Real-time tracking of multi-blockchain wallet balances
- 🗳️ **Community Governance** - Proposal creation and weighted voting system
- 💬 **Community Board** - User discussions and community engagement
- 📊 **Analytics Dashboard** - Advanced metrics and performance tracking
- ⚡ **Real-time Updates** - Live price feeds and balance synchronization
- 🔗 **Blockchain Integration** - Solana and Ethereum wallet support

## Technology Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern React component library
- **TanStack Query** - Data fetching and caching
- **Lucide React** - Icon library

### Backend
- **Next.js API Routes** - Server-side API endpoints
- **Prisma ORM** - Type-safe database client
- **PostgreSQL** - Primary database
- **Solana web3.js** - Blockchain integration

### External Services
- **CoinGecko API** - Live cryptocurrency prices
- **Solana RPC** - Blockchain data fetching
- **Meteora API** - LP token information

## Project Structure

```
airscape-nextjs/
├── prisma/
│   └── schema.prisma              # Database schema definition
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── api/                   # API routes
│   │   │   ├── treasury/route.ts  # Treasury management API
│   │   │   ├── community/route.ts # Community features API
│   │   │   └── governance/route.ts # Governance API
│   │   ├── layout.tsx             # Root layout
│   │   ├── page.tsx               # Home page
│   │   └── providers.tsx          # Client-side providers
│   ├── components/                # React components
│   │   ├── ui/                    # Base UI components
│   │   ├── Header.tsx             # Navigation component
│   │   └── TreasuryDashboard.tsx  # Treasury display
│   └── lib/                       # Utilities and services
│       ├── prisma.ts              # Database client setup
│       ├── utils.ts               # Helper functions
│       └── services/              # Business logic
│           └── walletService.ts   # Wallet management service
├── package.json                   # Dependencies and scripts
├── migration.md                   # Migration progress tracking
└── env.example                    # Environment variables template
```

## Database Schema

The application uses a comprehensive Prisma schema with the following models:

### Core Models
- **Wallet** - Treasury wallet management
- **WalletBalance** - Token balance tracking
- **User** - User profiles and authentication
- **TransactionRecord** - Transaction history

### Community Features
- **CommunityMessage** - Community board posts
- **Proposal** - Governance proposals
- **Vote** - Voting records
- **StakingRecord** - Token staking data

### Analytics
- **PriceHistory** - Historical price data
- **AnalyticsEvent** - User behavior tracking

## API Endpoints

### Treasury API (`/api/treasury`)
- `GET` - Fetch treasury data with live prices
- `POST` - Admin actions (refresh wallets, seed data)

### Community API (`/api/community`)
- `GET` - Fetch community messages with filtering
- `POST` - Create new messages
- `PATCH` - Vote on messages

### Governance API (`/api/governance`)
- `GET` - Fetch proposals and voting data
- `POST` - Create proposals and cast votes
- `PATCH` - Update proposal status

## Prerequisites

### System Requirements
- **Node.js** ≥18.18.0 or ≥20.0.0
- **PostgreSQL** ≥12.0
- **npm** or **yarn**

### Environment Setup

1. **Copy environment template**
   ```bash
   cp env.example .env.local
   ```

2. **Configure environment variables**
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/airscape_db"
   NEXT_PUBLIC_SOLANA_RPC_URL="https://api.mainnet-beta.solana.com"
   COINGECKO_API_KEY="your_api_key_here"
   ```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd airscape-nextjs
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup database**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Push schema to database
   npx prisma db push
   
   # (Optional) View database in Prisma Studio
   npx prisma studio
   ```

4. **Seed initial data**
   ```bash
   # Start the development server first
   npm run dev
   
   # In another terminal, seed wallets
   curl -X POST http://localhost:3000/api/treasury \
     -H "Content-Type: application/json" \
     -d '{"action":"seed_wallets"}'
   ```

## Development

### Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Database Management
```bash
# View database schema
npx prisma studio

# Reset database
npx prisma db push --force-reset

# Generate client after schema changes
npx prisma generate
```

### Useful Scripts
```bash
# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Type checking
npm run type-check
```

## Treasury Management

The platform tracks multiple wallets across different blockchains:

### Monitored Wallets
- **Operations** - `fa1ra81T7g5DzSn7XT6z36zNqupHpG1Eh7omB2F6GTh`
- **Business Costs** - `Hxa31irnLJq2fEDm64gE7ZDAcPNQ6HyWqn2sE3vVKvfg`
- **Marketing** - `7QpFeyM5VPGMuycCCdaYUeez9c8EzaDkJYBDKKFr4DN2`
- **Project Funding (SOL)** - `Aftv2wFpusiKHfHWdkiFNPsmrFEgrBheHX6ejS4LkM8i`
- **Project Funding (ETH)** - `0xf05fc9a3c6011c76eb6fe4cbb956eeac8750306d`

### Supported Tokens
- **SOL** - Native Solana token
- **AURA** - Platform governance token
- **USDC/USDT** - Stablecoins
- **WBTC/ETH** - Major cryptocurrencies

## Community Features

### Community Board
- Create and share messages by category
- Upvote/downvote system
- Wallet-based user identification

### Governance System
- Create proposals for treasury, partnerships, and governance
- Weighted voting based on token staking
- Automatic proposal status tracking

## Performance Features

### Optimizations
- Server-side rendering for improved SEO
- TanStack Query for intelligent caching
- Optimized database queries with Prisma
- Real-time price updates with minimal API calls

### Caching Strategy
- API response caching for non-critical data
- Client-side query caching with React Query
- Database query optimization with proper indexing

## Migration from Previous Version

This Next.js version is migrated from a React + Vite + Supabase architecture:

### Key Improvements
- **Performance** - Server-side rendering and optimized bundling
- **Scalability** - Proper database relations and API structure
- **Developer Experience** - Type-safe queries and better error handling
- **Feature Expansion** - Enhanced community and governance features

See [`migration.md`](./migration.md) for detailed migration progress and technical changes.

## Deployment

### Production Environment
1. **Database Setup**
   - Create PostgreSQL database
   - Run migrations: `npx prisma db push`
   - Seed initial data

2. **Environment Configuration**
   - Set production environment variables
   - Configure external API keys
   - Set up proper security headers

3. **Deploy to Platform**
   - Vercel (recommended for Next.js)
   - Railway or Render (with PostgreSQL)
   - Docker container deployment

### Environment Variables (Production)
```env
DATABASE_URL="postgresql://prod_url"
NEXT_PUBLIC_SOLANA_RPC_URL="https://api.mainnet-beta.solana.com"
COINGECKO_API_KEY="production_key"
NEXTAUTH_SECRET="secure_random_string"
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Development Guidelines
- Follow TypeScript best practices
- Use Prisma for all database operations
- Implement proper error handling
- Add tests for new features
- Document API changes

## Security Considerations

- All user inputs are validated server-side
- Database queries use parameterized statements (Prisma ORM)
- API routes implement proper error handling
- Wallet addresses are validated before processing
- Rate limiting should be implemented for production

## Support

For questions or issues:
- Create an issue in the GitHub repository
- Join the community Discord
- Contact the development team

## License

[Add your license information here]

---

**Note**: This application requires Node.js ≥18.18.0. If you're running Node.js 18.16.0, please update to a compatible version to use Prisma and Next.js 15.
