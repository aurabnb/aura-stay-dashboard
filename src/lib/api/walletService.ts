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
    // Fetch SOL price from CoinGecko
    const solResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
    const solData = await solResponse.json();
    const solPrice = solData.solana?.usd || 180;

    // Fetch AURA price and logo from DexScreener
    const auraResponse = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${AURA_TOKEN_MINT}`);
    const auraData = await auraResponse.json();
    let auraPrice = 0.0002700; // Fallback price
    let auraLogo = '/aura-logo.png'; // Fallback logo
    
    if (auraData.pairs && auraData.pairs.length > 0) {
      const pair = auraData.pairs[0];
      const price = parseFloat(pair.priceUsd);
      if (price && price > 0) {
        auraPrice = price;
      }
      
      // Extract AURA logo from DexScreener
      if (pair.baseToken && pair.baseToken.address === AURA_TOKEN_MINT) {
        auraLogo = pair.baseToken.logoURI || auraLogo;
        console.log('AURA logo found in baseToken:', auraLogo);
      } else if (pair.quoteToken && pair.quoteToken.address === AURA_TOKEN_MINT) {
        auraLogo = pair.quoteToken.logoURI || auraLogo;
        console.log('AURA logo found in quoteToken:', auraLogo);
      }
      
      console.log('DexScreener AURA data:', { price: auraPrice, logo: auraLogo });
    }

    // Update TOKEN_METADATA with fetched logo
    TOKEN_METADATA[AURA_TOKEN_MINT].logo = auraLogo;

    return {
      sol: solPrice,
      aura: auraPrice,
      usdc: 1.0, // USDC is stable
      auraLogo
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
): { type: string; amount: number; token: string; fee: number } {
  const walletPubkey = walletAddress;
  let type = 'unknown';
  let amount = 0;
  let token = 'SOL';
  const fee = (transaction.meta?.fee || 0) / LAMPORTS_PER_SOL;

  try {
    // Check for SOL transfers
    if (transaction.meta?.preBalances && transaction.meta?.postBalances) {
      // Find the account index for our wallet
      let accountIndex = -1;
      
      // Handle both parsed and regular account keys
      if (transaction.transaction.message.accountKeys) {
        accountIndex = transaction.transaction.message.accountKeys.findIndex(
          (key) => {
            // Handle both string and PublicKey object formats
            const keyString = typeof key === 'string' ? key : 
                             key.pubkey ? key.pubkey.toString() : 
                             key.toString();
            return keyString === walletPubkey;
          }
        );
      }
      
      if (accountIndex !== -1) {
        const preBalance = transaction.meta.preBalances[accountIndex] || 0;
        const postBalance = transaction.meta.postBalances[accountIndex] || 0;
        const balanceChange = (postBalance - preBalance) / LAMPORTS_PER_SOL;
        
        // Only consider significant balance changes (excluding fees)
        if (Math.abs(balanceChange) > 0.001) {
          amount = Math.abs(balanceChange);
          type = balanceChange > 0 ? 'receive' : 'send';
          token = 'SOL';
          return { type, amount, token, fee };
        }
      }
    }

    // Check for SPL token transfers
    if (transaction.meta?.preTokenBalances && transaction.meta?.postTokenBalances) {
      for (let i = 0; i < transaction.meta.preTokenBalances.length; i++) {
        const preTokenBalance = transaction.meta.preTokenBalances[i];
        const postTokenBalance = transaction.meta.postTokenBalances.find(
          (post) => post.accountIndex === preTokenBalance.accountIndex
        );
        
        if (preTokenBalance && postTokenBalance) {
          const preAmount = parseFloat(preTokenBalance.uiTokenAmount.uiAmountString || '0');
          const postAmount = parseFloat(postTokenBalance.uiTokenAmount.uiAmountString || '0');
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
            type: 'unknown',
            amount: 0,
            token: 'SOL',
            fee: (sigInfo.fee || 5000) / LAMPORTS_PER_SOL,
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