# Environment Variables Setup Guide

This guide helps you configure environment variables for both local development and Vercel deployment.

## 🚨 Important: Vercel Compatibility

**Fixed JSON Array Issue**: The original `NEXT_PUBLIC_TREASURY_WALLETS` JSON array has been replaced with individual environment variables for better Vercel compatibility.

## 📝 Provided API Keys

The following API keys have been provided:

```bash
# CoinGecko API Key
COINGECKO_API_KEY=CG-cDSsL8jeSUuYzeCm2rCk1pNu

# Solana RPC API Key  
SOLANA_RPC_API_KEY=c140ab8b-a388-41c6-a1d4-5975d26e6afc

# Twitter Bearer Token
TWITTER_BEARER_TOKEN=AAAAAAAAAAAAAAAAAAAAAOHp2AEAAAAArrQYWGzQQGcaITaMHBkxqfWkWqk%3DZrpnOoLnu2pKfCHX0kgxnSgFhbtnxLmOtxX7p4TxaPG7mT5rti
```

## 🏠 Local Development Setup

1. **Copy environment template:**
   ```bash
   cp env.example .env.local
   ```

2. **Update `.env.local` with the provided keys:**
   ```bash
   # API Keys for External Services
   COINGECKO_API_KEY="CG-cDSsL8jeSUuYzeCm2rCk1pNu"
   SOLANA_RPC_API_KEY="c140ab8b-a388-41c6-a1d4-5975d26e6afc"
   TWITTER_BEARER_TOKEN="AAAAAAAAAAAAAAAAAAAAAOHp2AEAAAAArrQYWGzQQGcaITaMHBkxqfWkWqk%3DZrpnOoLnu2pKfCHX0kgxnSgFhbtnxLmOtxX7p4TxaPG7mT5rti"
   
   # Treasury Wallet Configuration (Vercel-compatible)
   TREASURY_WALLET_1_NAME="Operations"
   TREASURY_WALLET_1_ADDRESS="fa1ra81T7g5DzSn7XT6z36zNqupHpG1Eh7omB2F6GTh"
   TREASURY_WALLET_1_BLOCKCHAIN="Solana"
   # ... (continue with other wallets)
   ```

## ☁️ Vercel Deployment Setup

### Option 1: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Set environment variables
vercel env add COINGECKO_API_KEY
vercel env add SOLANA_RPC_API_KEY
vercel env add TWITTER_BEARER_TOKEN
# ... continue with all variables
```

### Option 2: Vercel Dashboard
1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable from `vercel.env.template`

### Option 3: Bulk Import
1. Copy all variables from `vercel.env.template`
2. Use Vercel's bulk import feature in the dashboard

## 🔧 Treasury Wallets Configuration

### ❌ Old Approach (Vercel Issues)
```bash
# This caused issues on Vercel due to JSON parsing
NEXT_PUBLIC_TREASURY_WALLETS='[{"name":"Operations","address":"..."}]'
```

### ✅ New Approach (Vercel Compatible)
```bash
# Individual variables - works perfectly on Vercel
TREASURY_WALLET_1_NAME="Operations"
TREASURY_WALLET_1_ADDRESS="fa1ra81T7g5DzSn7XT6z36zNqupHpG1Eh7omB2F6GTh"
TREASURY_WALLET_1_BLOCKCHAIN="Solana"

TREASURY_WALLET_2_NAME="Business Costs"
TREASURY_WALLET_2_ADDRESS="Hxa31irnLJq2fEDm64gE7ZDAcPNQ6HyWqn2sE3vVKvfg"
TREASURY_WALLET_2_BLOCKCHAIN="Solana"
# ... continue for all 5 wallets
```

## 🛠️ How It Works

The new system uses `src/lib/config/treasuryWallets.ts` to:

1. **Read individual environment variables** (Vercel-friendly)
2. **Build wallet array dynamically** at runtime
3. **Provide fallback values** for development
4. **Export unified interface** for the rest of the app

```typescript
// Automatically builds from env vars
export const TREASURY_WALLETS = getTreasuryWallets();
```

## 📋 Required Environment Variables

### Core Application
- `NEXT_PUBLIC_SOLANA_RPC_URL`
- `NEXT_PUBLIC_AURA_TOKEN_MINT`
- `COINGECKO_API_KEY`
- `SOLANA_RPC_API_KEY`

### Treasury Wallets (Required: 1-5)
- `TREASURY_WALLET_X_NAME`
- `TREASURY_WALLET_X_ADDRESS` 
- `TREASURY_WALLET_X_BLOCKCHAIN`

### Social Media (Optional)
- `TWITTER_BEARER_TOKEN`
- `TELEGRAM_BOT_TOKEN`
- `LINKEDIN_ACCESS_TOKEN`

## 🚀 Deployment Commands

```bash
# Deploy to Vercel
vercel --prod

# Check environment variables
vercel env ls

# Pull environment variables locally
vercel env pull .env.local
```

## 🔍 Troubleshooting

### Vercel Build Issues
- Ensure no JSON arrays in environment variables
- Check that all required variables are set
- Use individual `TREASURY_WALLET_X_*` variables

### Local Development Issues
- Copy `env.example` to `.env.local`
- Ensure all API keys are properly quoted
- Check for trailing spaces in variable values

### Community Metrics Not Loading
- Verify `TWITTER_BEARER_TOKEN` is set
- Check API rate limits
- Fallback data will be used if APIs fail

## 📚 Files Updated

- `env.example` - Updated with new structure
- `env.production.example` - Production configuration
- `vercel.env.template` - Quick Vercel setup
- `src/lib/config/treasuryWallets.ts` - New wallet utility
- `src/lib/constants.ts` - Updated to use new utility

## ✅ Verification

Test your setup:
```bash
npm run dev
```

Check that:
- ✅ Treasury wallets load correctly
- ✅ Community metrics display
- ✅ AURA token data fetches
- ✅ No console errors about missing env vars 