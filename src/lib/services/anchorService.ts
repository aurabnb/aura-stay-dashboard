import { AnchorProvider, Program, setProvider } from '@project-serum/anchor';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { WalletContextState } from '@solana/wallet-adapter-react';

// Program IDs from Anchor.toml
export const PROGRAM_IDS = {
  AURA_BURN_REDISTRIBUTION: new PublicKey('3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe'),
};

export class AnchorService {
  private connection: Connection;
  private provider: AnchorProvider | null = null;
  private programs: Map<string, Program> = new Map();

  constructor() {
    const endpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl('devnet');
    this.connection = new Connection(endpoint, 'confirmed');
  }

  async initializeWithWallet(wallet: WalletContextState) {
    if (!wallet || !wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    // Create provider
    this.provider = new AnchorProvider(
      this.connection,
      wallet as any,
      {
        commitment: 'confirmed',
        preflightCommitment: 'confirmed',
      }
    );

    setProvider(this.provider);
    
    // Initialize programs would go here
    // You'll need to add the IDL files for your programs
    
    return this.provider;
  }

  getConnection() {
    return this.connection;
  }

  getProvider() {
    if (!this.provider) {
      throw new Error('Provider not initialized. Call initializeWithWallet first.');
    }
    return this.provider;
  }

  // Add methods to interact with your specific programs
  async getBurnRedistributionProgram() {
    // This would return the initialized program instance
    // You'll need to add the IDL file for this program
    throw new Error('Program IDL not yet imported. Add your program IDL files.');
  }

  async getMultisigProgram() {
    // This would return the initialized multisig program instance
    throw new Error('Program IDL not yet imported. Add your program IDL files.');
  }

  // Helper methods for common operations
  async getAccountBalance(publicKey: PublicKey): Promise<number> {
    const balance = await this.connection.getBalance(publicKey);
    return balance / 1e9; // Convert lamports to SOL
  }

  async getTokenAccountBalance(tokenAccount: PublicKey): Promise<number> {
    try {
      const accountInfo = await this.connection.getTokenAccountBalance(tokenAccount);
      return parseFloat(accountInfo.value.amount) / Math.pow(10, accountInfo.value.decimals);
    } catch (error) {
      console.error('Error fetching token account balance:', error);
      return 0;
    }
  }
}

// Export a singleton instance
export const anchorService = new AnchorService(); 