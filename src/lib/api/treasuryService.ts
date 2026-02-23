import type { ConsolidatedData, WalletData } from '@/types/treasury';
import { FUNDING_WALLET_ADDRESS, SOL_FALLBACK_PRICE_USD, MONITORED_WALLETS } from '@/lib/constants';

// Mock treasury data matching the original React app structure
const mockTreasuryWallets: WalletData[] = [
  {
    wallet_id: '1',
    name: 'Operations',
    address: MONITORED_WALLETS[0].address, // fa1ro8lT7gSdZSn7XTz6a3zNquphpGlEh7omB2f6GTh
    blockchain: 'Solana',
    balances: [
      {
        token_symbol: 'SOL',
        token_name: 'Solana',
        balance: 245.5,
        usd_value: 42796.15, // 245.5 * 174.33
        token_address: 'So11111111111111111111111111111111111111112',
        is_lp_token: false,
        platform: 'Solana',
      },
      {
        token_symbol: 'USDC',
        token_name: 'USD Coin',
        balance: 8500,
        usd_value: 8500,
        token_address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        is_lp_token: false,
        platform: 'Solana',
      },
    ],
    totalUsdValue: 51296.15,
  },
  {
    wallet_id: '2',
    name: 'Business Costs',
    address: MONITORED_WALLETS[1].address, // Hxa3IlrmJq2fEDmc4gETZDdAPhQ6HyWqn2Es3vVKkFg
    blockchain: 'Solana',
    balances: [
      {
        token_symbol: 'SOL',
        token_name: 'Solana',
        balance: 189.3,
        usd_value: 32988.07, // 189.3 * 174.33
        token_address: 'So11111111111111111111111111111111111111112',
        is_lp_token: false,
        platform: 'Solana',
      },
      {
        token_symbol: 'AURA',
        token_name: 'Aura Token',
        balance: 125000,
        usd_value: 3125, // Assuming $0.025/AURA
        token_address: '3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe',
        is_lp_token: false,
        platform: 'Solana',
      },
    ],
    totalUsdValue: 36113.07,
  },
  {
    wallet_id: '3',
    name: 'Marketing',
    address: MONITORED_WALLETS[2].address, // 7QapFoyM5VPGMuycCCdaYUoe29c8EzadJkJYBDKKFf4DN2
    blockchain: 'Solana',
    balances: [
      {
        token_symbol: 'SOL',
        token_name: 'Solana',
        balance: 78.9,
        usd_value: 13756.64, // 78.9 * 174.33
        token_address: 'So11111111111111111111111111111111111111112',
        is_lp_token: false,
        platform: 'Solana',
      },
      {
        token_symbol: 'SOL-USDC LP',
        token_name: 'Meteora SOL-USDC LP',
        balance: 15.5,
        usd_value: 2700,
        token_address: 'DDhpWFZSfGFcZNdJ3bDWMjq2XSdFjsRQWcKMmhbULWrT',
        is_lp_token: true,
        platform: 'Meteora',
        lp_details: {
          poolAddress: 'DDhpWFZSfGFcZNdJ3bDWMjq2XSdFjsRQWcKMmhbULWrT',
          token1: { symbol: 'SOL', amount: 8.2, usdValue: 1429.11 },
          token2: { symbol: 'USDC', amount: 1270.89, usdValue: 1270.89 },
          priceRange: { min: 150.0, max: 200.0 },
          totalUsdValue: 2700,
        },
      },
    ],
    totalUsdValue: 16456.64,
  },
  {
    wallet_id: '4',
    name: 'Project Funding – SOL',
    address: MONITORED_WALLETS[3].address, // Aftv2wfPusikfHFwdklFNpsmrFEgrBheHXo6jS4LkM8i (main funding wallet)
    blockchain: 'Solana',
    balances: [
      {
        token_symbol: 'SOL',
        token_name: 'Solana',
        balance: 573.2, // This drives the $100k goal progress
        usd_value: 99952.86, // 573.2 * 174.33 ≈ $100k
        token_address: 'So11111111111111111111111111111111111111112',
        is_lp_token: false,
        platform: 'Solana',
      },
    ],
    totalUsdValue: 99952.86,
  },
];

export const getTreasuryData = async (): Promise<ConsolidatedData> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  const currentTime = new Date().toISOString();
  
  // Calculate total market cap from all balances
  const totalMarketCap = mockTreasuryWallets
    .flatMap(wallet => wallet.balances)
    .reduce((sum, balance) => sum + (balance.usd_value || 0), 0);

  // Calculate volatile assets (crypto tokens, excluding stablecoins)
  const volatileAssets = mockTreasuryWallets
    .flatMap(wallet => wallet.balances)
    .filter(balance => !['USDC', 'USDT'].includes(balance.token_symbol))
    .reduce((sum, balance) => sum + (balance.usd_value || 0), 0);

  // Calculate hard assets (stablecoins)
  const hardAssets = mockTreasuryWallets
    .flatMap(wallet => wallet.balances)
    .filter(balance => ['USDC', 'USDT'].includes(balance.token_symbol))
    .reduce((sum, balance) => sum + (balance.usd_value || 0), 0);

  return {
    treasury: {
      totalMarketCap,
      volatileAssets,
      hardAssets,
      lastUpdated: currentTime,
    },
    wallets: mockTreasuryWallets,
    solPrice: SOL_FALLBACK_PRICE_USD,
  };
};

export const getTreasuryOverview = async () => {
  const data = await getTreasuryData();
  
  return {
    totalValue: data.treasury.totalMarketCap,
    liquidAssets: data.treasury.hardAssets + 
      data.wallets
        .flatMap(w => w.balances)
        .filter(b => b.is_lp_token || ['SOL', 'ETH', 'AURA'].includes(b.token_symbol))
        .reduce((sum, b) => sum + (b.usd_value || 0), 0),
    fundingGoalProgress: 0, // Will be calculated in component
    lastUpdated: data.treasury.lastUpdated,
  };
}; 