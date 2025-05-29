/**
 * Central place for run-time constants & monitored wallets.
 * Extend as the project grows – keeps hard-coded strings out of components.
 */
export const SOLSCAN_API = "https://pro-api.solscan.io/v2.0";
export const JUPITER_API = "https://lite-api.jup.ag/price/v2";
export const METEORA_API = "https://dlmm-api.meteora.ag/pool";
export const SOLSCAN_API_KEY = import.meta.env.REACT_APP_SOLSCAN_API_KEY as string;

/** The wrapped-SOL mint – used for price look-ups */
export const SOL_MINT = "So11111111111111111111111111111111111111112";

export interface WalletConfig {
  name: string;
  address: string;
}

/** Add / Remove wallets here  */
export const MONITORED_WALLETS: WalletConfig[] = [
  { name: "Operations", address: "fa1ro8lT7gSdZSn7XTz6a3zNquphpGlEh7omB2f6GTh" },
  { name: "Business Costs", address: "Hxa3IlrmJq2fEDmc4gETZDdAPhQ6HyWqn2Es3vVKkFg" },
  { name: "Marketing", address: "7QapFoyM5VPGMuycCCdaYUoe29c8EzadJkJYBDKKFf4DN2" },
  { name: "Project Funding – SOL", address: "Aftv2wfPusikfHFwdklFNpsmrFEgrBheHXo6jS4LkM8i" }
];
