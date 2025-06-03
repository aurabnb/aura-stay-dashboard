# Aura Stay Dashboard

A full-stack decentralized platform for boutique stays built on Solana blockchain, featuring treasury management, community governance, and analytics.

## 🏗️ Architecture

### Backend Stack
- **Next.js 15** - React framework with App Router
- **Prisma ORM** - Database modeling and querying
- **PostgreSQL** - Primary database
- **TypeScript** - Type safety across the stack

### Blockchain Stack  
- **Solana** - Layer 1 blockchain
- **Anchor Framework** - Solana program development
- **Wallet Adapter** - Multi-wallet support
- **@solana/web3.js** - Solana JavaScript SDK

### Frontend Stack
- **React 19** - UI framework
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **TanStack Query** - Data fetching and caching

## 🚀 Quick Start

### Prerequisites
- Node.js ≥18.18.0 (update from current 18.16.0)
- PostgreSQL database
- Solana CLI
- Anchor CLI

### Installation

1. **Clone and setup**
```bash
git clone <repository-url>
cd aura-stay-dashboard
npm install
```

2. **Environment Configuration**
```bash
cp env.example .env.local
# Edit .env.local with your configuration
```

3. **Database Setup**
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database  
npm run db:push

# Seed initial data
npm run db:seed
```

4. **Solana Program Setup**
```bash
# Build Anchor programs
npm run anchor:build

# Deploy to devnet/localnet
npm run anchor:deploy
```

5. **Development Server**
```bash
# Start Next.js development server
npm run dev

# In another terminal, start Solana test validator (for local development)
npm run solana:start
```

Visit `http://localhost:3000` to view the application.

## 📁 Project Structure

```
aura-stay-dashboard/
├── programs/                 # Solana programs
│   ├── aura-burn-redistribution/
│   └── aura-multisig/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API routes
│   │   │   ├── treasury/   # Treasury management
│   │   │   ├── community/  # Community features  
│   │   │   └── governance/ # DAO governance
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Dashboard page
│   ├── components/         # React components
│   │   ├── providers/      # Context providers
│   │   ├── ui/            # UI components
│   │   └── dashboard/     # Dashboard components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities and services
│   │   ├── services/      # Business logic
│   │   └── prisma.ts      # Database client
│   └── types/             # TypeScript definitions
├── prisma/               # Database schema and migrations
├── scripts/              # Deployment scripts
├── Anchor.toml          # Anchor configuration
└── package.json         # Dependencies and scripts
```

## 🛠️ Available Scripts

### Development
- `npm run dev` - Start Next.js development server
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Database Management
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Create and run migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed database with initial data
- `npm run db:reset` - Reset database and reseed

### Solana Programs
- `npm run anchor:build` - Build Anchor programs
- `npm run anchor:deploy` - Deploy programs to configured cluster
- `npm run anchor:test` - Run program tests
- `npm run solana:start` - Start local Solana test validator

## 🔧 Configuration

### Environment Variables

Key environment variables (see `env.example` for complete list):

```bash
# Database
DATABASE_URL="postgresql://..."

# Solana
NEXT_PUBLIC_SOLANA_RPC_URL="https://api.devnet.solana.com"
NEXT_PUBLIC_SOLANA_NETWORK="devnet"

# Program IDs
NEXT_PUBLIC_AURA_BURN_REDISTRIBUTION_PROGRAM="3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe"

# API Keys
COINGECKO_API_KEY="your_api_key"
```

### Solana Programs

The project includes two main Solana programs:

1. **aura-burn-redistribution** - Handles 2% burn and redistribution mechanism
2. **aura-multisig** - Multi-signature wallet functionality

Program IDs are configured in `Anchor.toml` and must match environment variables.

## 📊 Features

### Treasury Management
- Real-time portfolio tracking
- Multi-blockchain wallet monitoring (Solana, Ethereum)
- Token balance aggregation
- Price feed integration (CoinGecko)

### Community Platform  
- Message board with categories
- Voting system (upvote/downvote)
- User profiles and wallet-based authentication

### DAO Governance
- Proposal creation and management
- Staking-weighted voting
- Multiple proposal categories
- Admin governance controls

### Analytics Dashboard
- Transaction monitoring
- User behavior tracking  
- Treasury performance metrics
- Custom analytics events

## 🚀 Deployment

### Database Deployment
1. Set up PostgreSQL database (Railway, Neon, or other provider)
2. Update `DATABASE_URL` in production environment
3. Run migrations: `npm run db:migrate`

### Solana Program Deployment
1. Configure cluster in `Anchor.toml` (devnet/mainnet)
2. Update program IDs in environment variables
3. Deploy: `npm run anchor:deploy`

### Frontend Deployment
1. Build application: `npm run build`
2. Deploy to Vercel, Netlify, or other platform
3. Set production environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable  
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🔗 Links

- [Solana Documentation](https://docs.solana.com/)
- [Anchor Framework](https://anchor-lang.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)

## ⚠️ Important Notes

1. **Node.js Version**: Requires Node.js ≥18.18.0. Current version (18.16.0) needs updating.
2. **Security**: Never commit private keys or sensitive environment variables.
3. **Testing**: Always test on devnet before deploying to mainnet.
4. **Monitoring**: Set up proper monitoring for production deployments.
