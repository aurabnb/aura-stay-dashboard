
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

export const KNOWN_TOKENS: Record<string, { symbol: string; name: string; decimals: number }> = {
  'So11111111111111111111111111111111111111112': { symbol: 'SOL', name: 'Solana', decimals: 9 },
  '3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe': { symbol: 'AURA', name: 'AURA Token', decimals: 6 },
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': { symbol: 'USDC', name: 'USD Coin', decimals: 6 },
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': { symbol: 'USDT', name: 'Tether USD', decimals: 6 },
  '3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh': { symbol: 'WBTC', name: 'Wrapped Bitcoin', decimals: 8 },
  '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs': { symbol: 'ETH', name: 'Ethereum', decimals: 8 },
  '0xf0f9d895aca5c8678f706fb8216fa22957685a13': { symbol: 'CULT', name: 'Cult DAO', decimals: 18 },
  '0x2d77b594b9bbaed03221f7c63af8c4307432daf1': { symbol: 'DCULT', name: 'Cult DAO', decimals: 18 }
};
