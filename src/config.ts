
/**
  * API endpoints for Solana data and price lookups
 */
export const SOLSCAN_API = "https://pro-api.solscan.io/v2.0";
export const JUPITER_API = "https://lite-api.jup.ag/price/v2";
export const METEORA_API = "https://dlmm-api.meteora.ag/pool";

// Use a fallback or throw an error if the API key is not provided
export const SOLSCAN_API_KEY = import.meta.env.REACT_APP_SOLSCAN_API_KEY || "";

// Helper to check if Solscan API is available
export const hasSolscanApiKey = () => SOLSCAN_API_KEY && SOLSCAN_API_KEY !== "";
