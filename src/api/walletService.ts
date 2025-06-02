import { Connection, PublicKey, ParsedAccountData } from '@solana/web3.js';

export interface WalletBalance {
  mint: string;
  symbol: string;
  name: string;
  balance: number;
  decimals: number;
  uiAmount: number;
  valueUSD: number;
  logo?: string;
}

export interface WalletTransaction {
  signature: string;
  blockTime: number;
  type: 'send' | 'receive' | 'swap' | 'stake' | 'unstake';
  amount: number;
  token: string;
  from?: string;
  to?: string;
  fee: number;
  status: 'success' | 'failed' | 'pending';
}

export interface WalletOverview {
  address: string;
  totalValueUSD: number;
  solBalance: number;
  auraBalance: number;
  tokenCount: number;
  nftCount: number;
  lastActivity: string;
  isActive: boolean;
}

// Known token addresses and metadata
const TOKEN_REGISTRY = {
  'So11111111111111111111111111111111111111112': {
    symbol: 'SOL',
    name: 'Solana',
    decimals: 9,
    logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'
  },
  '3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe': {
    symbol: 'AURA',
    name: 'AuraBNB',
    decimals: 6,
    logo: '/lovable-uploads/99705421-813e-4d11-89a5-90bffaa2147a.png'
  },
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png'
  },
  '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R': {
    symbol: 'RAY',
    name: 'Raydium',
    decimals: 6,
    logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R/logo.svg'
  }
};

class WalletService {
  private connection: Connection;
  private priceCache: Map<string, number> = new Map();

  constructor() {
    // Using public RPC endpoints - in production, use dedicated endpoints
    const endpoints = [
      'https://api.mainnet-beta.solana.com',
      'https://solana-api.projectserum.com',
      'https://rpc.ankr.com/solana'
    ];
    
    this.connection = new Connection(endpoints[0], 'confirmed');
  }

  // Get comprehensive wallet overview
  async getWalletOverview(walletAddress: string): Promise<WalletOverview> {
    try {
      const publicKey = new PublicKey(walletAddress);
      
      // Get SOL balance
      const solBalance = await this.connection.getBalance(publicKey) / 1e9;
      
      // Get token accounts
      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
        publicKey,
        { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') }
      );

      // Get AURA balance specifically
      const auraBalance = await this.getTokenBalance(walletAddress, '3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe');
      
      // Get recent transactions for activity check
      const signatures = await this.connection.getSignaturesForAddress(publicKey, { limit: 1 });
      const lastActivity = signatures.length > 0 
        ? new Date(signatures[0].blockTime! * 1000).toISOString()
        : new Date().toISOString();

      // Calculate total value (simplified)
      const totalValueUSD = solBalance * 174.33 + auraBalance * 0.00011566; // Mock prices

      return {
        address: walletAddress,
        totalValueUSD,
        solBalance,
        auraBalance,
        tokenCount: tokenAccounts.value.length,
        nftCount: 0, // Would require additional NFT fetching
        lastActivity,
        isActive: signatures.length > 0 && Date.now() - (signatures[0].blockTime! * 1000) < 7 * 24 * 60 * 60 * 1000 // Active if transaction in last 7 days
      };
    } catch (error) {
      console.error('Failed to fetch wallet overview:', error);
      return this.getSimulatedWalletOverview(walletAddress);
    }
  }

  // Get all token balances
  async getWalletBalances(walletAddress: string): Promise<WalletBalance[]> {
    try {
      const publicKey = new PublicKey(walletAddress);
      const balances: WalletBalance[] = [];

      // Add SOL balance
      const solBalance = await this.connection.getBalance(publicKey) / 1e9;
      balances.push({
        mint: 'So11111111111111111111111111111111111111112',
        symbol: 'SOL',
        name: 'Solana',
        balance: solBalance * 1e9,
        decimals: 9,
        uiAmount: solBalance,
        valueUSD: solBalance * 174.33, // Mock price
        logo: TOKEN_REGISTRY['So11111111111111111111111111111111111111112'].logo
      });

      // Get token accounts
      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
        publicKey,
        { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') }
      );

      // Process each token account
      for (const account of tokenAccounts.value) {
        const parsedData = account.account.data as ParsedAccountData;
        const tokenData = parsedData.parsed.info;
        
        if (tokenData.tokenAmount.uiAmount > 0) {
          const mint = tokenData.mint;
          const tokenInfo = TOKEN_REGISTRY[mint as keyof typeof TOKEN_REGISTRY] || {
            symbol: 'UNKNOWN',
            name: 'Unknown Token',
            decimals: tokenData.tokenAmount.decimals,
            logo: undefined
          };

          const price = await this.getTokenPrice(mint);
          
          balances.push({
            mint,
            symbol: tokenInfo.symbol,
            name: tokenInfo.name,
            balance: parseInt(tokenData.tokenAmount.amount),
            decimals: tokenData.tokenAmount.decimals,
            uiAmount: tokenData.tokenAmount.uiAmount,
            valueUSD: tokenData.tokenAmount.uiAmount * price,
            logo: tokenInfo.logo
          });
        }
      }

      return balances.sort((a, b) => b.valueUSD - a.valueUSD);
    } catch (error) {
      console.error('Failed to fetch wallet balances:', error);
      return this.getSimulatedBalances(walletAddress);
    }
  }

  // Get specific token balance
  async getTokenBalance(walletAddress: string, tokenMint: string): Promise<number> {
    try {
      const publicKey = new PublicKey(walletAddress);
      const mintPublicKey = new PublicKey(tokenMint);

      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
        publicKey,
        { mint: mintPublicKey }
      );

      if (tokenAccounts.value.length === 0) return 0;

      const parsedData = tokenAccounts.value[0].account.data as ParsedAccountData;
      return parsedData.parsed.info.tokenAmount.uiAmount || 0;
    } catch (error) {
      console.error('Failed to fetch token balance:', error);
      return 0;
    }
  }

  // Get wallet transaction history
  async getWalletTransactions(walletAddress: string, limit = 20): Promise<WalletTransaction[]> {
    try {
      const publicKey = new PublicKey(walletAddress);
      
      const signatures = await this.connection.getSignaturesForAddress(publicKey, { limit });
      const transactions: WalletTransaction[] = [];

      // Fetch transaction details (simplified - would need more parsing in production)
      for (const sig of signatures.slice(0, 10)) { // Limit to avoid rate limits
        try {
          const tx = await this.connection.getParsedTransaction(sig.signature);
          if (tx && tx.meta && tx.blockTime) {
            transactions.push({
              signature: sig.signature,
              blockTime: tx.blockTime,
              type: this.determineTransactionType(tx),
              amount: this.extractTransactionAmount(tx),
              token: 'SOL', // Simplified
              fee: tx.meta.fee / 1e9,
              status: tx.meta.err ? 'failed' : 'success'
            });
          }
        } catch (error) {
          // Skip failed transaction parsing
          continue;
        }
      }

      return transactions;
    } catch (error) {
      console.error('Failed to fetch wallet transactions:', error);
      return this.getSimulatedTransactions(walletAddress);
    }
  }

  // Get token price (with caching)
  private async getTokenPrice(mint: string): Promise<number> {
    if (this.priceCache.has(mint)) {
      return this.priceCache.get(mint)!;
    }

    try {
      // In production, use actual price API like Jupiter or CoinGecko
      const mockPrices: { [key: string]: number } = {
        'So11111111111111111111111111111111111111112': 174.33,
        '3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe': 0.00011566,
        'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 1.00,
        '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R': 2.45
      };

      const price = mockPrices[mint] || 0;
      this.priceCache.set(mint, price);
      
      // Clear cache after 5 minutes
      setTimeout(() => this.priceCache.delete(mint), 5 * 60 * 1000);
      
      return price;
    } catch (error) {
      return 0;
    }
  }

  // Helper methods for transaction parsing
  private determineTransactionType(tx: any): 'send' | 'receive' | 'swap' | 'stake' | 'unstake' {
    // Simplified transaction type detection
    // In production, would analyze instruction data
    if (tx.transaction.message.instructions.some((ix: any) => ix.programId?.toString().includes('Stake'))) {
      return 'stake';
    }
    return 'send'; // Default
  }

  private extractTransactionAmount(tx: any): number {
    // Simplified amount extraction
    return tx.meta?.preBalances?.[0] ? 
      Math.abs((tx.meta.postBalances[0] - tx.meta.preBalances[0]) / 1e9) : 0;
  }

  // Simulation methods for development
  private getSimulatedWalletOverview(walletAddress: string): WalletOverview {
    return {
      address: walletAddress,
      totalValueUSD: 2847.32,
      solBalance: 15.67,
      auraBalance: 125000,
      tokenCount: 8,
      nftCount: 3,
      lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      isActive: true
    };
  }

  private getSimulatedBalances(walletAddress: string): WalletBalance[] {
    return [
      {
        mint: 'So11111111111111111111111111111111111111112',
        symbol: 'SOL',
        name: 'Solana',
        balance: 15670000000,
        decimals: 9,
        uiAmount: 15.67,
        valueUSD: 2732.21,
        logo: TOKEN_REGISTRY['So11111111111111111111111111111111111111112'].logo
      },
      {
        mint: '3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe',
        symbol: 'AURA',
        name: 'AuraBNB',
        balance: 125000000000,
        decimals: 6,
        uiAmount: 125000,
        valueUSD: 14.46,
        logo: TOKEN_REGISTRY['3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe'].logo
      },
      {
        mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        symbol: 'USDC',
        name: 'USD Coin',
        balance: 50000000,
        decimals: 6,
        uiAmount: 50,
        valueUSD: 50.00,
        logo: TOKEN_REGISTRY['EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'].logo
      }
    ];
  }

  private getSimulatedTransactions(walletAddress: string): WalletTransaction[] {
    return [
      {
        signature: '5k9v2JrKPz4mGqYHE8xN7pR6FT8sW3nX9vU2qL5dJ8hM',
        blockTime: Date.now() / 1000 - 3600,
        type: 'send',
        amount: 2.5,
        token: 'SOL',
        to: 'recipient_wallet',
        fee: 0.000005,
        status: 'success'
      },
      {
        signature: '7R2mN4pQ8sT9vX3nL6hJ5kG1fD8yW2qU9oP7eR4tY6uI',
        blockTime: Date.now() / 1000 - 7200,
        type: 'swap',
        amount: 1000,
        token: 'AURA',
        fee: 0.000005,
        status: 'success'
      },
      {
        signature: '9P5nQ2sR8tU4vW6xM7yN3oK8jL9iH1gF2eD5cB6aZ4hG',
        blockTime: Date.now() / 1000 - 14400,
        type: 'stake',
        amount: 500,
        token: 'AURA',
        fee: 0.000005,
        status: 'success'
      }
    ];
  }
}

// Export singleton instance
export const walletService = new WalletService();

// Convenience functions
export const getWalletOverview = (address: string) => walletService.getWalletOverview(address);
export const getWalletBalances = (address: string) => walletService.getWalletBalances(address);
export const getTokenBalance = (address: string, mint: string) => walletService.getTokenBalance(address, mint);
export const getWalletTransactions = (address: string, limit?: number) => walletService.getWalletTransactions(address, limit); 