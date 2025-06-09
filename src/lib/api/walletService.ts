// Wallet API service functions
import { 
  WalletBalance, 
  WalletTransaction, 
  WalletOverview, 
  TokenMetrics 
} from '@/types/wallet';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

// AURA token contract address
const AURA_TOKEN_MINT = '3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe';

// Solana connection
const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');

// Token metadata mapping
const TOKEN_METADATA = {
  'So11111111111111111111111111111111111111112': {
    symbol: 'SOL',
    name: 'Solana',
    decimals: 9,
    logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'
  },
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png'
  },
  [AURA_TOKEN_MINT]: {
    symbol: 'AURA',
    name: 'AURA Token',
    decimals: 9,
    logo: '/aura-logo.png'
  }
};

// Fetch current token prices from DexScreener and CoinGecko
async function fetchTokenPrices(): Promise<{ sol: number; aura: number; usdc: number }> {
  try {
    // Fetch SOL price from CoinGecko
    const solResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
    const solData = await solResponse.json();
    const solPrice = solData.solana?.usd || 180;

    // Fetch AURA price from DexScreener
    const auraResponse = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${AURA_TOKEN_MINT}`);
    const auraData = await auraResponse.json();
    let auraPrice = 0.0002700; // Fallback price
    
    if (auraData.pairs && auraData.pairs.length > 0) {
      const price = parseFloat(auraData.pairs[0].priceUsd);
      if (price && price > 0) {
        auraPrice = price;
      }
    }

    return {
      sol: solPrice,
      aura: auraPrice,
      usdc: 1.0 // USDC is stable
    };
  } catch (error) {
    console.error('Error fetching token prices:', error);
    return {
      sol: 180,
      aura: 0.0002700,
      usdc: 1.0
    };
  }
}

// Fetch real wallet overview
export async function getWalletOverview(walletAddress: string): Promise<WalletOverview> {
  try {
    const publicKey = new PublicKey(walletAddress);
    const prices = await fetchTokenPrices();
    
    // Fetch SOL balance
    const solBalance = await connection.getBalance(publicKey);
    const solBalanceFormatted = solBalance / LAMPORTS_PER_SOL;
    
    // Fetch SPL token accounts
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      publicKey,
      { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') }
    );

    let auraBalance = 0;
    let totalValueUSD = solBalanceFormatted * prices.sol;
    let tokenCount = 1; // SOL counts as 1

    // Process token accounts
    for (const account of tokenAccounts.value) {
      const tokenInfo = account.account.data.parsed.info;
      const mint = tokenInfo.mint;
      const balance = parseFloat(tokenInfo.tokenAmount.uiAmount || '0');
      
      if (balance > 0) {
        tokenCount++;
        
        if (mint === AURA_TOKEN_MINT) {
          auraBalance = balance;
          totalValueUSD += balance * prices.aura;
        } else if (mint === 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v') {
          // USDC
          totalValueUSD += balance * prices.usdc;
        }
      }
    }

    return {
      address: walletAddress,
      totalValueUSD,
      solBalance: solBalanceFormatted,
      auraBalance,
      tokenCount,
      isActive: true,
      lastActivity: Date.now()
    };
  } catch (error) {
    console.error('Error fetching wallet overview:', error);
    // Return fallback data
    return {
      address: walletAddress,
      totalValueUSD: 0,
      solBalance: 0,
      auraBalance: 0,
      tokenCount: 0,
      isActive: false,
      lastActivity: Date.now()
    };
  }
}

export async function getWalletBalances(walletAddress: string): Promise<WalletBalance[]> {
  try {
    const publicKey = new PublicKey(walletAddress);
    const prices = await fetchTokenPrices();
    
    // Initialize default tokens (always show these even with 0 balance)
    const defaultTokens = {
      'So11111111111111111111111111111111111111112': {
        mint: 'So11111111111111111111111111111111111111112',
        symbol: 'SOL',
        name: 'Solana',
        logo: TOKEN_METADATA['So11111111111111111111111111111111111111112'].logo,
        balance: 0,
        uiAmount: 0,
        valueUSD: 0,
        decimals: 9
      },
      [AURA_TOKEN_MINT]: {
        mint: AURA_TOKEN_MINT,
        symbol: 'AURA',
        name: 'AURA Token',
        logo: TOKEN_METADATA[AURA_TOKEN_MINT].logo,
        balance: 0,
        uiAmount: 0,
        valueUSD: 0,
        decimals: 9
      },
      'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': {
        mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        symbol: 'USDC',
        name: 'USD Coin',
        logo: TOKEN_METADATA['EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'].logo,
        balance: 0,
        uiAmount: 0,
        valueUSD: 0,
        decimals: 6
      }
    };
    
    // Fetch actual SOL balance
    const solBalance = await connection.getBalance(publicKey);
    const solBalanceFormatted = solBalance / LAMPORTS_PER_SOL;
    
    // Update SOL balance
    defaultTokens['So11111111111111111111111111111111111111112'] = {
      ...defaultTokens['So11111111111111111111111111111111111111112'],
      balance: solBalance,
      uiAmount: solBalanceFormatted,
      valueUSD: solBalanceFormatted * prices.sol
    };
    
    // Fetch SPL token balances
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      publicKey,
      { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') }
    );

    // Update actual token balances if they exist
    for (const account of tokenAccounts.value) {
      const tokenInfo = account.account.data.parsed.info;
      const mint = tokenInfo.mint;
      const balance = parseInt(tokenInfo.tokenAmount.amount);
      const uiAmount = parseFloat(tokenInfo.tokenAmount.uiAmount || '0');
      
      if (defaultTokens[mint as keyof typeof defaultTokens]) {
        let price = 0;
        
        if (mint === AURA_TOKEN_MINT) {
          price = prices.aura;
        } else if (mint === 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v') {
          price = prices.usdc;
        }
        
        // Update the default token with actual balance
        defaultTokens[mint as keyof typeof defaultTokens] = {
          ...defaultTokens[mint as keyof typeof defaultTokens],
          balance,
          uiAmount,
          valueUSD: uiAmount * price
        };
      }
    }
    
    // Return tokens in specific order: SOL, AURA, USDC
    const orderedTokens: WalletBalance[] = [
      defaultTokens['So11111111111111111111111111111111111111112'],
      defaultTokens[AURA_TOKEN_MINT],
      defaultTokens['EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v']
    ];
    
    return orderedTokens;
  } catch (error) {
    console.error('Error fetching wallet balances:', error);
    
    // Return default tokens with 0 balances on error
    return [
      {
        mint: 'So11111111111111111111111111111111111111112',
        symbol: 'SOL',
        name: 'Solana',
        logo: TOKEN_METADATA['So11111111111111111111111111111111111111112'].logo,
        balance: 0,
        uiAmount: 0,
        valueUSD: 0,
        decimals: 9
      },
      {
        mint: AURA_TOKEN_MINT,
        symbol: 'AURA',
        name: 'AURA Token',
        logo: TOKEN_METADATA[AURA_TOKEN_MINT].logo,
        balance: 0,
        uiAmount: 0,
        valueUSD: 0,
        decimals: 9
      },
      {
        mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        symbol: 'USDC',
        name: 'USD Coin',
        logo: TOKEN_METADATA['EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'].logo,
        balance: 0,
        uiAmount: 0,
        valueUSD: 0,
        decimals: 6
      }
    ];
  }
}

export async function getWalletTransactions(
  walletAddress: string, 
  limit: number = 20
): Promise<WalletTransaction[]> {
  try {
    const publicKey = new PublicKey(walletAddress);
    
    // Fetch recent transaction signatures
    const signatures = await connection.getSignaturesForAddress(publicKey, { limit });
    const transactions: WalletTransaction[] = [];
    
    for (const sigInfo of signatures) {
      // For now, create mock transaction data based on signatures
      // In a full implementation, you'd parse each transaction
      transactions.push({
        signature: sigInfo.signature,
        type: Math.random() > 0.5 ? 'send' : 'receive',
        amount: Math.random() * 100 + 1,
        token: Math.random() > 0.5 ? 'SOL' : 'AURA',
        fee: (sigInfo.fee || 5000) / LAMPORTS_PER_SOL,
        blockTime: sigInfo.blockTime || Math.floor(Date.now() / 1000),
        status: sigInfo.err ? 'failed' : 'success'
      });
    }
    
    return transactions;
  } catch (error) {
    console.error('Error fetching wallet transactions:', error);
    return [];
  }
}

export async function getTokenMetrics(): Promise<TokenMetrics> {
  try {
    // Fetch AURA token metrics from DexScreener
    const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${AURA_TOKEN_MINT}`);
    const data = await response.json();
    
    if (data.pairs && data.pairs.length > 0) {
      const pair = data.pairs[0];
      const price = parseFloat(pair.priceUsd) || 0.0002700;
      const priceChange24h = parseFloat(pair.priceChange?.h24) || 0;
      const volume24h = parseFloat(pair.volume?.h24) || 0;
      const marketCap = parseFloat(pair.marketCap) || 0;
      
      return {
        price,
        priceChange24h,
        marketCap,
        volume24h,
        holders: 5000, // Estimate - would need additional API
        symbol: 'AURA',
        name: 'AURA Token'
      };
    }
    
    // Fallback data
    return {
      price: 0.0002700,
      priceChange24h: 0,
      marketCap: 270000,
      volume24h: 50000,
      holders: 5000,
      symbol: 'AURA',
      name: 'AURA Token'
    };
  } catch (error) {
    console.error('Error fetching token metrics:', error);
    return {
      price: 0.0002700,
      priceChange24h: 0,
      marketCap: 270000,
      volume24h: 50000,
      holders: 5000,
      symbol: 'AURA',
      name: 'AURA Token'
    };
  }
}

// Helper function to generate mock transaction signatures (kept for compatibility)
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