# AURA Stay Dashboard 5

A comprehensive Next.js dashboard for the AURA ecosystem featuring real-time staking, treasury tracking, and community analytics.

## 🚀 Key Features

### 🏠 Real Estate Integration
- **Volcano House Calculator**: Property investment analysis
- **Stay Showcase**: Unique property experiences
- **Investment Tracking**: Real estate performance metrics

### 💰 Staking Platform
- **Time-Weighted Staking**: Earn rewards based on stake duration
- **Live Blockchain Integration**: Real Solana transactions with wallet signatures
- **30-Day Optimal Lock**: Maximum rewards for longer commitments
- **Multi-Token Rewards**: SOL and SPL token distributions

### 📊 Treasury Management
- **Live Wallet Monitoring**: Real-time balance tracking
- **Burn & Redistribution**: Token economics management
- **Performance Analytics**: Investment return analysis

### 🎯 Trading Tools
- **Jupiter Integration**: Advanced Solana token swapping
- **Portfolio Tracking**: Multi-wallet performance monitoring
- **Price Analytics**: Real-time market data

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Blockchain**: Solana, Anchor Framework, SPL Tokens
- **Wallet**: Solana Wallet Adapter
- **Charts**: Recharts, D3.js
- **UI**: Shadcn/ui, Framer Motion
- **API**: Real-time price feeds, Solana RPC

## 📋 Testing Documentation

### Comprehensive Test Suite
- **[TESTING_SUMMARY.md](./TESTING_SUMMARY.md)** - Complete testing overview and results
- **[FUNCTION_TEST_REPORT.md](./FUNCTION_TEST_REPORT.md)** - Automated validation test results
- **[MANUAL_TESTING_GUIDE.md](./MANUAL_TESTING_GUIDE.md)** - Step-by-step testing instructions

### Smart Contract Testing
- **16 Contract Functions** fully documented and tested
- **100% Success Rate** on automated validation tests
- **Real Blockchain Integration** with Solana devnet
- **Security Features** validated (replay protection, access control)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Solana wallet (Phantom, Solflare, etc.)
- AURA tokens for staking (test tokens available)

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd aura-stay-dashboard

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Setup
```bash
# Copy environment template
cp .env.example .env.local

# Configure your environment variables
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_RPC_ENDPOINT=https://api.devnet.solana.com
```

## 🧪 Testing the Platform

### User Testing (Real Blockchain)
1. Visit: http://localhost:3000/staking
2. Connect your Solana wallet
3. Look for green "Live Blockchain Integration" banner
4. Try staking - you'll get real wallet signature prompts
5. Monitor transactions on [Solana Explorer](https://explorer.solana.com/?cluster=devnet)

### Automated Testing
```bash
# Run function validation tests
npx tsx scripts/simple-function-test.ts

# Generate manual testing guide
npx tsx scripts/manual-test-guide.ts
```

## 🔗 Smart Contract Details

### Deployed Contract
- **Program ID**: `3qbuonQKjYW5XhYWohpHu1trKazvr7UwBYP5xk9hKMF6`
- **Network**: Solana Devnet
- **Token Mint**: `3SPBiVPiJTqnqmrBxxRVnRDEywsqBHeTEDQs34PmXon9`

### Contract Functions
- **Admin Functions** (9): Pool management, distribution control, emergency operations
- **User Functions** (4): Stake, unstake, claim rewards
- **Read-Only Functions** (3): Pool state, user positions, balances

## 📚 Project Structure

```
src/
├── app/                    # Next.js app router pages
├── components/             # React components
│   ├── analytics/         # Analytics dashboards
│   ├── staking/           # Staking interfaces
│   ├── trading/           # Trading tools
│   ├── treasury/          # Treasury management
│   └── ui/                # UI components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and services
│   ├── anchor/           # Solana/Anchor integration
│   └── services/         # API services
└── types/                # TypeScript definitions

scripts/                  # Testing and automation
├── simple-function-test.ts    # Automated validation
├── manual-test-guide.ts       # Test guide generator
└── comprehensive-test.ts      # Full integration tests

programs/                 # Solana smart contracts
└── time-weighted-staking/ # Staking contract source
```

## 🎯 Integration Status

### ✅ Live Blockchain Features
- **100% Real Integration**: All staking operations use actual blockchain transactions
- **Wallet Signatures**: Every transaction requires user approval
- **Real Token Transfers**: Actual AURA tokens moved to/from smart contract
- **Live State Reading**: Pool and user data read from blockchain
- **Real-Time Prices**: Live SOL prices from CoinGecko
- **Network Statistics**: Live Solana network data

### 🔧 Development Features
- **Hot Reload**: Instant updates during development
- **TypeScript**: Full type safety
- **Responsive Design**: Mobile-optimized interface
- **Error Handling**: Comprehensive error boundaries
- **Performance Optimized**: Lazy loading and code splitting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Run tests: `npm test`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation**: Check the `/docs` directory for detailed guides
- **Issues**: Report bugs or request features via GitHub issues
- **Testing**: Follow the manual testing guide for validation
- **Community**: Join our Discord for support and updates

---

**Built with ❤️ for the AURA ecosystem** 
