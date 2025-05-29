/* ------------------------------------------------------------------
   Project-level (frontend) models derived from API data
-------------------------------------------------------------------*/

export interface WalletConfig {
  name: string;
  address: string;
}

/* ---------- LP-aware wallet breakdown ---------- */

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

/* ---------- misc dashboard / hook helpers ---------- */

export interface ApiStatus {
  solPrice: "loading" | "success" | "error";
  wallets: "loading" | "success" | "error";
  auraMarketCap: "loading" | "success" | "error";
}

export interface ConsolidatedData {
  treasury: {
    totalMarketCap: number;
    volatileAssets: number;
    hardAssets: number;
    lastUpdated: string;
  };
  wallets: WalletData[];
  solPrice: number;
}
