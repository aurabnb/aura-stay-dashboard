export interface WalletConfig {
  name: string;
  address: string;
}

export interface LPDetails {
  poolAddress: string;
  token1: { symbol: string; amount: number; usdValue: number };
  token2: { symbol: string; amount: number; usdValue: number };
  priceRange: { min: number; max: number };
  totalUsdValue: number;
}

export interface WalletBalance {
  token_symbol: string;
  token_name: string;
  balance: number;
  usd_value: number;
  token_address?: string;
  is_lp_token: boolean;
  platform: string;
  lp_details?: LPDetails;
}

export interface WalletData {
  wallet_id: string;
  name: string;
  address: string;
  blockchain: string;
  balances: WalletBalance[];
  totalUsdValue: number;
}

export interface TreasuryMetrics {
  totalMarketCap: number;
  volatileAssets: number;
  hardAssets: number;
  lastUpdated: string;
}

export interface ConsolidatedData {
  treasury: TreasuryMetrics;
  wallets: WalletData[];
  solPrice: number;
}

export interface ApiStatus {
  solPrice: 'loading' | 'success' | 'error';
  wallets: 'loading' | 'success' | 'error';
  auraMarketCap: 'loading' | 'success' | 'error';
}

export interface UseTreasuryDataReturn {
  data: ConsolidatedData | null;
  loading: boolean;
  error: string | null;
  lastRefresh: Date | null;
  apiStatus: ApiStatus;
  fetchData: () => Promise<void>;
}

/* -----------------------------  API  TYPES  ----------------------------- */
export interface SolAccountResp { lamports: number }

export interface TokenAmount { uiAmount: number }

export interface TokenAccountResp {
  tokenAddress: string;
  tokenSymbol?: string;
  tokenName?: string;
  tokenAmount: TokenAmount;
  usd?: number;
}

export type JupiterPriceResp = Record<string, { price: number }>; 