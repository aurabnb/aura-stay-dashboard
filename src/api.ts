import {
  JUPITER_API,
  METEORA_API,
  SOLSCAN_API,
  SOLSCAN_API_KEY
} from "./config";

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

/* -----------------------  LOW-LEVEL FETCH HELPERS  ---------------------- */

export async function fetchSol(account: string): Promise<SolAccountResp> {
  const url = `${SOLSCAN_API}/account/${account}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${SOLSCAN_API_KEY}` } });
  if (!res.ok) throw new Error(`Solscan SOL error ${res.status}`);
  return res.json() as Promise<SolAccountResp>;
}

export async function fetchSplTokens(account: string): Promise<TokenAccountResp[]> {
  const url = `${SOLSCAN_API}/account/tokens?address=${account}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${SOLSCAN_API_KEY}` } });
  if (!res.ok) throw new Error(`Solscan tokens error ${res.status}`);
  const { data } = await res.json();
  return (data ?? []) as TokenAccountResp[];
}

export async function fetchJupiterPrices(mints: string[]): Promise<JupiterPriceResp> {
  if (mints.length === 0) return {};
  const res = await fetch(`${JUPITER_API}?ids=${mints.join(",")}`);
  if (!res.ok) throw new Error(`Jupiter error ${res.status}`);
  const { data } = await res.json();
  return data ?? {};
}

// Leaving a typed stub – call when you integrate Meteora pools
export const fetchMeteoraPool = async (pool: string) => {
  const res = await fetch(`${METEORA_API}/${pool}`);
  if (!res.ok) throw new Error(`Meteora error ${res.status}`);
  return res.json();
};
