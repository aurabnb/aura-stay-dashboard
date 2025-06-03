// Wallet-related type definitions

export interface WalletBalance {
  mint: string;
  symbol: string;
  name: string;
  logo?: string;
  balance: number;
  uiAmount: number;
  valueUSD: number;
  decimals: number;
  isLpToken?: boolean;
  platform?: string;
}

export interface WalletTransaction {
  signature: string;
  type: 'send' | 'receive' | 'stake' | 'unstake' | 'swap' | 'other';
  amount: number;
  token: string;
  fee: number;
  blockTime: number;
  status: 'success' | 'failed';
  from?: string;
  to?: string;
  programId?: string;
}

export interface WalletOverview {
  address: string;
  totalValueUSD: number;
  solBalance: number;
  auraBalance: number;
  tokenCount: number;
  isActive: boolean;
  lastActivity?: number;
}

export interface TokenMetrics {
  price: number;
  priceChange24h: number;
  marketCap: number;
  volume24h: number;
  holders: number;
  symbol: string;
  name: string;
}

export interface StakingData {
  stakedAmount: number;
  rewardAmount: number;
  apy: number;
  lockPeriod?: number;
  unstakeDate?: number;
}

export interface TreasuryWallet {
  name: string;
  address: string;
  blockchain: string;
  balance?: number;
  valueUSD?: number;
} 