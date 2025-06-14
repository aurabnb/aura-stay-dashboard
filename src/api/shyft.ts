
import { apiFetch } from "./_client";

const SHYFT_API = "https://api.shyft.to/sol/v1";

interface ShyftTokenBalance {
  address: string;
  balance: number;
  associated_account: string;
  info: {
    symbol: string;
    name: string;
    decimals: number;
    image?: string;
  };
}

interface ShyftWalletResponse {
  success: boolean;
  message: string;
  result: {
    address: string;
    balance: number;
    tokens: ShyftTokenBalance[];
  };
}

// We'll get the API key from Supabase edge function instead of frontend
export const fetchSolBalanceShyft = async (account: string) => {
  // Since API keys should be server-side, we'll use a fallback for now
  console.warn("Shyft API should be called from server-side for security");
  return { lamports: 0 };
};

export const fetchSplTokensShyft = async (account: string) => {
  // Since API keys should be server-side, we'll use a fallback for now
  console.warn("Shyft API should be called from server-side for security");
  return [];
};
