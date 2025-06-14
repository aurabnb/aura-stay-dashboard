
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

export const WALLETS_CONFIG = [
  {
    wallet_id: "69fe7f1c-bf6a-4981-9d2e-93f25b3ae6be",
    name: "Operations",
    address: "AXYFBhYPhHt4SzGqdpSfBSMWEQmKdCyQScA1xjRvHzph",
    blockchain: "Solana"
  },
  {
    wallet_id: "dfa84c3c-8cf0-4a03-a209-c2ad09f5016d",
    name: "Business Costs",
    address: "Hxa31irnLJq2fEDm64gE7ZDAcPNQ6HyWqn2sE3vVKvfg",
    blockchain: "Solana"
  },
  {
    wallet_id: "5635149e-2095-4777-afeb-316c273cf2ec",
    name: "Marketing",
    address: "7QpFeyM5VPGMuycCCdaYUeez9c8EzaDkJYBDKKFr4DN2",
    blockchain: "Solana"
  },
  {
    wallet_id: "296a8349-e4bd-4480-a4ac-e6039726d6fa",
    name: "Project Funding - Solana",
    address: "Aftv2wFpusiKHfHWdkiFNPsmrFEgrBheHX6ejS4LkM8i",
    blockchain: "Solana"
  },
  {
    wallet_id: "746a0a15-e232-4706-a156-c2e1d901dcdf",
    name: "Project Funding - Ethereum",
    address: "0xf05fc9a3c6011c76eb6fe4cbb956eeac8750306d",
    blockchain: "Ethereum"
  }
];

export const METEORA_LP_TOKENS = new Map([
  // Add LP token configurations here if needed
]);

export const FIXED_PRICES: Record<string, number> = {
  'SOL': 144.21,
  'AURA': 0.00011566,
  'WBTC': 105000,
  'ETH': 3500,
  'CULT': 0.00001,
  'WETH': 3500,
  'USDC': 1.0,
  'USDT': 1.0,
  'DCULT': 0.00001
};
