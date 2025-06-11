// Wallet API service functions
import { 
  WalletBalance, 
  WalletTransaction, 
  WalletOverview, 
  TokenMetrics 
} from '@/types/wallet';
import { Connection, PublicKey, LAMPORTS_PER_SOL, ParsedTransactionWithMeta } from '@solana/web3.js';

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
async function fetchTokenPrices(): Promise<{ sol: number; aura: number; usdc: number; auraLogo?: string }> {
  try {
    // Use our server-side API route instead of direct external calls
    const response = await fetch('/api/token-prices?tokens=sol,aura');
    const data = await response.json();
    
    return {
      sol: data.sol || 180,
      aura: data.aura || 0.0002700,
      usdc: 1.0, // USDC is stable
      auraLogo: data.auraLogo || '/aura-logo.png'
    };
  } catch (error) {
    console.error('Error fetching token prices:', error);
    return {
      sol: 180,
      aura: 0.0002700,
      usdc: 1.0,
      auraLogo: '/aura-logo.png'
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

// Helper function to parse transaction data and determine type and amount
function parseTransaction(
  transaction: ParsedTransactionWithMeta, 
  walletAddress: string
): { type: 'send' | 'receive' | 'stake' | 'unstake' | 'swap' | 'other'; amount: number; token: string; fee: number } {
  let type: 'send' | 'receive' | 'stake' | 'unstake' | 'swap' | 'other' = 'other';
  let amount = 0;
  let token = 'SOL';
  let fee = (transaction.meta?.fee || 5000) / LAMPORTS_PER_SOL;

  try {
    // Check SOL balance changes first
    const preBalances = transaction.meta?.preBalances || [];
    const postBalances = transaction.meta?.postBalances || [];
    const accountKeys = transaction.transaction.message.accountKeys || [];
    
    // Find the user's account index
    let userAccountIndex = -1;
    for (let i = 0; i < accountKeys.length; i++) {
      if (accountKeys[i].pubkey.toString() === walletAddress) {
        userAccountIndex = i;
        break;
      }
    }
    
    if (userAccountIndex !== -1 && userAccountIndex < preBalances.length && userAccountIndex < postBalances.length) {
      const solChange = (postBalances[userAccountIndex] - preBalances[userAccountIndex]) / LAMPORTS_PER_SOL;
      
      if (Math.abs(solChange) > fee * 2) { // Ignore small changes that might just be fees
        amount = Math.abs(solChange);
        type = solChange > 0 ? 'receive' : 'send';
        token = 'SOL';
        return { type, amount, token, fee };
      }
    }
    
    // Check for token balance changes
    if (transaction.meta?.preTokenBalances && transaction.meta?.postTokenBalances) {
      for (let i = 0; i < transaction.meta.preTokenBalances.length; i++) {
        const preTokenBalance = transaction.meta.preTokenBalances[i];
        const postTokenBalance = transaction.meta.postTokenBalances.find(
          post => post.accountIndex === preTokenBalance.accountIndex
        );
        
        if (postTokenBalance && preTokenBalance.uiTokenAmount && postTokenBalance.uiTokenAmount) {
          const preAmount = preTokenBalance.uiTokenAmount.uiAmount || 0;
          const postAmount = postTokenBalance.uiTokenAmount.uiAmount || 0;
          const tokenChange = postAmount - preAmount;
          
          if (Math.abs(tokenChange) > 0) {
            amount = Math.abs(tokenChange);
            type = tokenChange > 0 ? 'receive' : 'send';
            
            // Determine token symbol
            if (preTokenBalance.mint === AURA_TOKEN_MINT) {
              token = 'AURA';
            } else if (preTokenBalance.mint === 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v') {
              token = 'USDC';
            } else {
              token = 'TOKEN';
            }
            return { type, amount, token, fee };
          }
        }
      }
    }

    // Check for common program interactions
    if (transaction.transaction.message.instructions) {
      for (const instruction of transaction.transaction.message.instructions) {
        if ('programId' in instruction) {
          const programId = instruction.programId.toString();
          
          // Check for staking programs
          if (programId === 'Stake11111111111111111111111111111111111111' || 
              programId.includes('Stake')) {
            type = 'stake';
            amount = 1; // Placeholder amount for staking operations
            token = 'SOL';
            return { type, amount, token, fee };
          }
          
          // Check for DEX/swap programs
          if (programId.includes('Swap') || 
              programId === 'SwaPpA9LAaLfeLi3a68M4DjnLqgtticKg6CnyNwgAC8' ||
              programId === '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM') {
            type = 'swap';
            amount = 0; // Would need more complex parsing for swap amounts
            token = 'TOKEN';
            return { type, amount, token, fee };
          }
        }
      }
    }

  } catch (error) {
    console.error('Error parsing transaction:', error);
  }

  // Default for unparseable transactions
  return { type, amount, token, fee };
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
    
    // Process signatures in batches to avoid overwhelming the RPC
    const batchSize = 5;
    for (let i = 0; i < Math.min(signatures.length, 10); i += batchSize) {
      const batch = signatures.slice(i, i + batchSize);
      
      // Fetch parsed transaction details for each signature
      const txPromises = batch.map(sigInfo => 
        connection.getParsedTransaction(sigInfo.signature, {
          maxSupportedTransactionVersion: 0
        }).catch(error => {
          console.error(`Error fetching transaction ${sigInfo.signature}:`, error);
          return null;
        })
      );
      
      const txResults = await Promise.all(txPromises);
      
      for (let j = 0; j < batch.length; j++) {
        const sigInfo = batch[j];
        const transaction = txResults[j];
        
        if (transaction) {
          // Parse the transaction to extract meaningful data
          const { type, amount, token, fee } = parseTransaction(transaction, walletAddress);
          
          transactions.push({
            signature: sigInfo.signature,
            type,
            amount,
            token,
            fee,
            blockTime: sigInfo.blockTime || Math.floor(Date.now() / 1000),
            status: sigInfo.err ? 'failed' : 'success'
          });
        } else {
          // Fallback for transactions that couldn't be parsed
          transactions.push({
            signature: sigInfo.signature,
            type: 'other',
            amount: 0,
            token: 'SOL',
            fee: 0.000005, // Default SOL transaction fee
            blockTime: sigInfo.blockTime || Math.floor(Date.now() / 1000),
            status: sigInfo.err ? 'failed' : 'success'
          });
        }
      }
    }
    
    return transactions;
  } catch (error) {
    console.error('Error fetching wallet transactions:', error);
    return [];
  }
}

export async function getTokenMetrics(): Promise<TokenMetrics> {
  try {
    // Use our server-side API route instead of direct external calls
    const response = await fetch('/api/token-prices?tokens=aura');
    const data = await response.json();
    
    if (data.auraMetrics) {
      return {
        price: data.auraMetrics.price,
        priceChange24h: data.auraMetrics.priceChange24h,
        marketCap: data.auraMetrics.marketCap,
        volume24h: data.auraMetrics.volume24h,
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