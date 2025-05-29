/* ------------------------------------------------------------------
   Types that describe raw payloads coming *from external services*
   (Solscan, Jupiter, Meteora …)
-------------------------------------------------------------------*/

/** Native SOL account response */
export interface SolAccountResp {
  lamports: number;
}

export interface TokenAmount {
  uiAmount: number;
}

export interface TokenAccountResp {
  tokenAddress: string;
  tokenSymbol?: string;
  tokenName?: string;
  tokenAmount: TokenAmount;
  /** USD value we enrich locally */
  usd?: number;
}

/** { mint: { price } } map returned by Jupiter price API */
export type JupiterPriceResp = Record<string, { price: number }>;
