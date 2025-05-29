import { apiFetch } from "./_client";
import { SOLSCAN_API, SOLSCAN_API_KEY } from "@/config";
import type { SolAccountResp, TokenAccountResp } from "@/types";

/* ------------------------ Solscan endpoints ------------------------ */

const BASE_HEADERS = { Authorization: `Bearer ${SOLSCAN_API_KEY}` };

export const fetchSol = (account: string) =>
  apiFetch<SolAccountResp>(`${SOLSCAN_API}/account/${account}`, {
    headers: BASE_HEADERS,
  });

export const fetchSplTokens = (account: string) =>
  apiFetch<{ data: TokenAccountResp[] }>(
    `${SOLSCAN_API}/account/tokens?address=${account}`,
    { headers: BASE_HEADERS },
  ).then(r => r.data ?? []);
