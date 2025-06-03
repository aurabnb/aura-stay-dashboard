# 🏝️ AURA Stay Dashboard

A modern, decentralized dashboard for the AURA ecosystem - building the world's first community-owned hospitality network.

## 🚀 Overview

AURA Stay Dashboard is a Next.js application that provides real-time treasury monitoring, governance tools, and community features for the AURA token ecosystem. Built with modern web technologies and integrated with Solana blockchain.

## ✨ Features

- **📊 Treasury Monitoring** - Real-time wallet tracking and asset management
- **🗳️ Governance System** - Token-weighted voting and proposals
- **💰 Fiat Integration** - Buy crypto with MoonPay integration
- **🔗 Wallet Connection** - Phantom, Solflare, and other Solana wallets
- **📈 Analytics Dashboard** - Trading insights and portfolio tracking
- **🏨 Property Showcase** - Investment opportunities and property details
- **🔥 Token Economics** - 2% burn and redistribution system
- **📱 Mobile Responsive** - Optimized for all devices

## 🛠️ Tech Stack

- **Framework**: Next.js 15.3.3 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Radix UI
- **Database**: PostgreSQL with Prisma ORM
- **Blockchain**: Solana Web3.js + Anchor
- **Authentication**: Wallet-based + NextAuth.js
- **Deployment**: Vercel/Railway ready

## 🏃‍♂️ Quick Start

### Prerequisites

- Node.js 18.18.0+ (recommended: 20+)
- PostgreSQL database (or use cloud providers)
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/aurabnb/aura-stay-dashboard.git
cd aura-stay-dashboard

# Install dependencies
npm install

# Set up environment variables
cp env.example .env
# Edit .env with your database URL and API keys

# Set up the database
npm run db:generate
npm run db:push

# Start the development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 📝 Environment Configuration

Create a `.env` file with the following variables:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/aura_stay_dashboard"

# Solana
NEXT_PUBLIC_SOLANA_RPC_URL="https://api.devnet.solana.com"
NEXT_PUBLIC_SOLANA_NETWORK="devnet"

# Optional: API Keys
COINGECKO_API_KEY="your_api_key"
NEXT_PUBLIC_MOONPAY_API_KEY="your_moonpay_key"
```

## 🗄️ Database Setup

### Cloud Database (Recommended)

**Option 1: Neon (Free)**
1. Visit [neon.tech](https://neon.tech)
2. Create a project and copy the DATABASE_URL
3. Update your `.env` file

**Option 2: Supabase**
1. Visit [supabase.com](https://supabase.com)
2. Create a project and get the connection string
3. Update your `.env` file

### Local PostgreSQL

```bash
# macOS with Homebrew
brew install postgresql
brew services start postgresql
createdb aura_stay_dashboard
```

## 📜 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:migrate   # Run database migrations
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed database with initial data

# Testing
npm run test         # Run unit tests
npm run test:e2e     # Run end-to-end tests
npm run test:watch   # Run tests in watch mode

# Blockchain
npm run anchor:build # Build Solana programs
npm run anchor:test  # Test Solana programs
```

## 📁 Project Structure

```
aura-stay-dashboard/
├── src/
│   ├── app/                 # Next.js App Router pages
│   ├── components/          # React components
│   │   ├── ui/             # Reusable UI components
│   │   ├── treasury/       # Treasury-specific components
│   │   ├── governance/     # Governance components
│   │   └── ...
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions and services
│   ├── types/              # TypeScript type definitions
│   └── services/           # API and blockchain services
├── prisma/                 # Database schema and migrations
├── programs/               # Solana/Anchor programs
├── public/                 # Static assets
├── tests/                  # Test files
├── docs/                   # Documentation files
└── scripts/                # Build and deployment scripts
```

## 🔗 Key Components

- **Treasury Dashboard** - Real-time wallet monitoring and analytics
- **Governance Portal** - Proposal creation and voting system
- **Fiat Purchase Flow** - MoonPay integration for crypto purchases
- **Property Showcase** - Investment opportunities in eco-stays
- **Community Board** - Social features and messaging
- **Analytics Suite** - Trading and portfolio insights

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Deploy
railway login
railway link
railway up
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📚 Documentation

- [Technical Documentation](./docs/TECHNICAL-README.md)
- [Migration Reports](./docs/)
- [Database Setup Guide](./docs/DATABASE_SETUP.md)
- [Deployment Guide](./docs/PRODUCTION-DEPLOYMENT.md)
- [API Documentation](./docs/API.md)

## 🔒 Security

- All database queries use Prisma for SQL injection protection
- Wallet connections are handled securely with proper validation
- API routes include proper authentication and rate limiting
- Environment variables are properly configured for sensitive data

## 📈 Performance

- Next.js 15 optimizations and App Router
- Static generation where possible
- Image optimization with Next.js Image component
- Efficient database queries with Prisma
- Real-time updates with optimized polling

## 🌐 Community

- [Telegram](https://t.me/aurabnb)
- [Twitter](https://twitter.com/aurabnb)
- [Discord](https://discord.gg/aurabnb)
- [Website](https://aurabnb.com)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💎 AURA Ecosystem

AURA is building the world's first decentralized hospitality network. Learn more:

- **Volcano Stay**: Our first eco-lodge in Costa Rica
- **Community Governance**: Token holders vote on all decisions
- **Revenue Sharing**: Property income flows back to token holders
- **Sustainable Tourism**: Carbon-negative properties with local impact

---

**Built with ❤️ by the AURA community** 