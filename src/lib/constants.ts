import { WalletConfig } from "@/types/treasury";

/** Funding goal for Volcano Stay (USD) */
export const VOLCANO_FUNDING_GOAL = 100_000;

/** Treasury wallet explicitly used for SOL inflows */
export const FUNDING_WALLET_ADDRESS =
  "BRRGD28WnhKvdaHYMZRDc9dGn5LWa7YM5xzww2NRyN5L";

/** Monitored wallets for the project */
export const MONITORED_WALLETS: WalletConfig[] = [
  { name: "Operations", address: "fa1ra81T7g5DzSn7XT6z36zNqupHpG1Eh7omB2F6GTh" },
  { name: "Business Costs", address: "Hxa31irnLJq2fEDm64gE7ZDAcPNQ6HyWqn2sE3vVKvfg" },
  { name: "Marketing", address: "7QpFeyM5VPGMuycCCdaYUeez9c8EzaDkJYBDKKFr4DN2" },
  { name: "Project Funding – SOL", address: "Aftv2wFpusiKHfHWdkiFNPsmrFEgrBheHX6ejS4LkM8i" }
];

/** The wrapped-SOL mint – used for price look-ups */
export const SOL_MINT = "So11111111111111111111111111111111111111112";

/** Current SOL price in USD, used as a fallback */
export const SOL_FALLBACK_PRICE_USD = 174.33;

// API refresh intervals
export const TREASURY_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes 