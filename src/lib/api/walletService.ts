// Wallet API service functions
import { 
  WalletBalance, 
  WalletTransaction, 
  WalletOverview, 
  TokenMetrics 
} from '@/types/wallet';

// Mock data for development - replace with real API calls
export async function getWalletOverview(walletAddress: string): Promise<WalletOverview> {
  // TODO: Replace with real API call
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
  
  return {
    address: walletAddress,
    totalValueUSD: Math.random() * 10000 + 1000,
    solBalance: Math.random() * 10 + 1,
    auraBalance: Math.random() * 100000 + 10000,
    tokenCount: Math.floor(Math.random() * 20) + 5,
    isActive: Math.random() > 0.3,
    lastActivity: Date.now() - Math.random() * 86400000 // Random time in last 24h
  };
}

export async function getWalletBalances(walletAddress: string): Promise<WalletBalance[]> {
  // TODO: Replace with real API call
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const mockTokens = [
    {
      mint: 'So11111111111111111111111111111111111111112',
      symbol: 'SOL',
      name: 'Solana',
      logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
      balance: Math.random() * 1000000000, // Raw balance
      uiAmount: Math.random() * 10 + 1,
      valueUSD: Math.random() * 1000 + 100,
      decimals: 9
    },
    {
      mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      symbol: 'USDC',
      name: 'USD Coin',
      logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
      balance: Math.random() * 1000000000,
      uiAmount: Math.random() * 1000 + 50,
      valueUSD: Math.random() * 1000 + 50,
      decimals: 6
    },
    {
      mint: 'AURA_TOKEN_MINT', // Placeholder for AURA token mint
      symbol: 'AURA',
      name: 'Airscape (AURA)',
      logo: '/aura-logo.png', // Assuming logo is in public folder
      balance: Math.random() * 100000000000,
      uiAmount: Math.random() * 100000 + 10000,
      valueUSD: Math.random() * 5000 + 500,
      decimals: 9
    }
  ];
  
  return mockTokens;
}

export async function getWalletTransactions(
  walletAddress: string, 
  limit: number = 20
): Promise<WalletTransaction[]> {
  // TODO: Replace with real API call
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const mockTransactions: WalletTransaction[] = [];
  const types: WalletTransaction['type'][] = ['send', 'receive', 'stake', 'unstake', 'swap'];
  const tokens = ['SOL', 'USDC', 'AURA'];
  
  for (let i = 0; i < limit; i++) {
    mockTransactions.push({
      signature: generateMockSignature(),
      type: types[Math.floor(Math.random() * types.length)],
      amount: Math.random() * 1000 + 1,
      token: tokens[Math.floor(Math.random() * tokens.length)],
      fee: Math.random() * 0.01 + 0.000005,
      blockTime: Math.floor((Date.now() - Math.random() * 86400000 * 7) / 1000), // Last 7 days
      status: Math.random() > 0.1 ? 'success' : 'failed'
    });
  }
  
  return mockTransactions.sort((a, b) => b.blockTime - a.blockTime);
}

export async function getTokenMetrics(): Promise<TokenMetrics> {
  // TODO: Replace with real API call to get AURA token metrics
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    price: Math.random() * 0.01 + 0.001,
    priceChange24h: (Math.random() - 0.5) * 20, // -10% to +10%
    marketCap: Math.random() * 10000000 + 1000000,
    volume24h: Math.random() * 500000 + 100000,
    holders: Math.floor(Math.random() * 10000) + 5000,
    symbol: 'AURA',
    name: 'Airscape (AURA)'
  };
}

// Helper function to generate mock transaction signatures
function generateMockSignature(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz123456789';
  let result = '';
  for (let i = 0; i < 88; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Function to send tokens (placeholder for future implementation)
export async function sendToken(
  fromAddress: string,
  toAddress: string,
  amount: number,
  tokenMint: string
): Promise<{ signature: string; success: boolean }> {
  // TODO: Implement actual token sending logic with Solana web3.js
  throw new Error('Send token functionality not yet implemented');
}

// Function to stake AURA tokens (placeholder for future implementation)
export async function stakeAura(
  walletAddress: string,
  amount: number
): Promise<{ signature: string; success: boolean }> {
  // TODO: Implement actual staking logic with smart contracts
  throw new Error('Staking functionality not yet implemented');
} 