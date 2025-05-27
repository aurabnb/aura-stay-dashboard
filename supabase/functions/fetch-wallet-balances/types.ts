
export interface TokenInfo {
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
}

export interface MeteoraPoolData {
  poolAddress: string;
  name: string;
  tokenA: {
    mint: string;
    symbol: string;
    amount: number;
    usdValue: number;
  };
  tokenB: {
    mint: string;
    symbol: string;
    amount: number;
    usdValue: number;
  };
  totalLiquidity: number;
  volume24h: number;
  fees24h: number;
  apy: number;
  userShare: number;
  userUsdValue: number;
}

export interface LPDetails {
  poolAddress: string;
  token1: { symbol: string; amount: number; usdValue: number };
  token2: { symbol: string; amount: number; usdValue: number };
  priceRange: { min: number; max: number };
  totalUsdValue: number;
  meteoraData?: MeteoraPoolData;
}

export interface WalletBalance {
  symbol: string;
  name: string;
  balance: number;
  usdValue: number;
  tokenAddress?: string;
  isLpToken: boolean;
  platform: string;
  lpDetails?: LPDetails;
}

export interface WalletConfig {
  wallet_id: string;
  name: string;
  address: string;
  blockchain: string;
}
