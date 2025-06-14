
import { apiFetch } from "./_client";
import type { SolAccountResp, TokenAccountResp } from "@/types";

/* ------------------------ Solscan endpoints (deprecated) ------------------------ */

// Note: This file is kept for backward compatibility but is no longer actively used
// The application now uses Shyft API through the sync-shyft-wallets edge function

export const fetchSol = (account: string) => {
  console.warn("Solscan API is deprecated, using Shyft API instead");
  return Promise.resolve({ lamports: 0 });
};

export const fetchSplTokens = (account: string) => {
  console.warn("Solscan API is deprecated, using Shyft API instead");
  return Promise.resolve([]);
};
