
import { apiFetch } from "./_client";
import { SOLSCAN_API, SOLSCAN_API_KEY, hasSolscanApiKey } from "@/config";
import type { SolAccountResp, TokenAccountResp } from "@/types";

/* ------------------------ Solscan endpoints ------------------------ */

const BASE_HEADERS = hasSolscanApiKey() 
  ? { Authorization: `Bearer ${SOLSCAN_API_KEY}` }
  : {};

export const fetchSol = (account: string) => {
  if (!hasSolscanApiKey()) {
    console.warn("Solscan API key not configured, using fallback data");
    return Promise.resolve({ lamports: 0 });
  }
  
  return apiFetch<SolAccountResp>(`${SOLSCAN_API}/account/${account}`, {
    headers: BASE_HEADERS,
  });
};

export const fetchSplTokens = (account: string) => {
  if (!hasSolscanApiKey()) {
    console.warn("Solscan API key not configured, returning empty token list");
    return Promise.resolve([]);
  }
  
  return apiFetch<{ data: TokenAccountResp[] }>(
    `${SOLSCAN_API}/account/tokens?address=${account}`,
    { headers: BASE_HEADERS },
  ).then(r => r.data ?? []);
};
