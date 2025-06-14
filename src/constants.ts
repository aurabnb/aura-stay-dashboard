
import { WalletConfig } from "./types";

/** Funding goal for Volcano Stay (USD) */
export const VOLCANO_FUNDING_GOAL = 100_000;

/** Treasury wallet explicitly used for SOL inflows */
export const FUNDING_WALLET_ADDRESS =
  "BRRGD28WnhKvdaHYMZRDc9dGn5LWa7YM5xzww2NRyN5L";

/** Monitored wallets for the project */
export const MONITORED_WALLETS: WalletConfig[] = [
  { name: "Operations", address: "AXYFBhYPhHt4SzGqdpSfBSMWEQmKdCyQScA1xjRvHzph" },
  { name: "Business Costs", address: "Hxa3IlrmJq2fEDmc4gETZDdAPhQ6HyWqn2Es3vVKkFg" },
  { name: "Marketing", address: "7QapFoyM5VPGMuycCCdaYUoe29c8EzadJkJYBDKKFf4DN2" },
  { name: "Project Funding – SOL", address: "Aftv2wfPusikfHFwdklFNpsmrFEgrBheHXo6jS4LkM8i" }
];

/**  The wrapped-SOL mint – used for price look-ups */
export const SOL_MINT = "So11111111111111111111111111111111111111112";

/** Current SOL price in USD, used as a fallback */
export const SOL_FALLBACK_PRICE_USD = 174.33;
