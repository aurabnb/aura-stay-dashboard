import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AuraBurnRedistribution } from "../target/types/aura_burn_redistribution";
import { 
  TOKEN_PROGRAM_ID,
  createMint,
  createAccount,
  mintTo,
  getAssociatedTokenAddress,
  createAssociatedTokenAccount,
} from "@solana/spl-token";
import { 
  Keypair, 
  LAMPORTS_PER_SOL, 
  PublicKey, 
  SystemProgram,
  Connection,
  clusterApiUrl,
} from "@solana/web3.js";
import * as fs from 'fs';
import * as path from 'path';

// Environment configuration
interface DeploymentConfig {
  cluster: 'localnet' | 'devnet' | 'mainnet-beta';
  rpcUrl: string;
  programId: string;
  authorityKeypair: string;
  burnPercentage: number;
  redistributionFrequency: number;
  initialMintSupply: number;
}

const DEPLOYMENT_CONFIGS: Record<string, DeploymentConfig> = {
  localnet: {
    cluster: 'localnet',
    rpcUrl: 'http://127.0.0.1:8899',
    programId: '3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe',
    authorityKeypair: 'deploy-keypairs/localnet-authority.json',
    burnPercentage: 200, // 2%
    redistributionFrequency: 21600, // 6 hours
    initialMintSupply: 50_000_000_000_000_000 // 50 billion tokens (with 6 decimals)
  },
  devnet: {
    cluster: 'devnet',
    rpcUrl: clusterApiUrl('devnet'),
    programId: '3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe',
    authorityKeypair: 'deploy-keypairs/devnet-authority.json',
    burnPercentage: 200, // 2%
    redistributionFrequency: 21600, // 6 hours
    initialMintSupply: 50_000_000_000_000_000 // 50 billion tokens (with 6 decimals)
  },
  mainnet: {
    cluster: 'mainnet-beta',
    rpcUrl: 'https://api.mainnet-beta.solana.com',
    programId: '3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe',
    authorityKeypair: 'deploy-keypairs/mainnet-authority.json',
    burnPercentage: 200, // 2%
    redistributionFrequency: 21600, // 6 hours
    initialMintSupply: 50_000_000_000_000_000 // 50 billion tokens (with 6 decimals)
  }
};

class AuraDeployer {
  private connection: Connection;
  private provider: anchor.AnchorProvider;
  private program: Program<AuraBurnRedistribution>;
  private config: DeploymentConfig;
  private authority: Keypair;

  constructor(environment: string) {
    this.config = DEPLOYMENT_CONFIGS[environment];
    if (!this.config) {
      throw new Error(`Unknown environment: ${environment}`);
    }

    this.connection = new Connection(this.config.rpcUrl, 'confirmed');
    this.authority = this.loadOrCreateAuthority();
    
    const wallet = new anchor.Wallet(this.authority);
    this.provider = new anchor.AnchorProvider(this.connection, wallet, {
      commitment: 'confirmed',
    });
    
    anchor.setProvider(this.provider);
    this.program = anchor.workspace.AuraBurnRedistribution as Program<AuraBurnRedistribution>;
  }

  private loadOrCreateAuthority(): Keypair {
    const keypairPath = path.join(__dirname, '..', this.config.authorityKeypair);
    
    try {
      if (fs.existsSync(keypairPath)) {
        const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf8'));
        return Keypair.fromSecretKey(new Uint8Array(keypairData));
      }
    } catch (error) {
      console.log('No existing authority keypair found, generating new one...');
    }

    // Generate new keypair
    const newKeypair = Keypair.generate();
    
    // Ensure directory exists
    fs.mkdirSync(path.dirname(keypairPath), { recursive: true });
    
    // Save keypair
    fs.writeFileSync(keypairPath, JSON.stringify(Array.from(newKeypair.secretKey)));
    console.log(`New authority keypair saved to: ${keypairPath}`);
    console.log(`Authority public key: ${newKeypair.publicKey.toBase58()}`);
    
    return newKeypair;
  }

  private async checkPrerequisites(): Promise<void> {
    console.log('🔍 Checking deployment prerequisites...');
    
    // Check authority balance
    const balance = await this.connection.getBalance(this.authority.publicKey);
    const requiredBalance = 10 * LAMPORTS_PER_SOL; // Require at least 10 SOL
    
    if (balance < requiredBalance) {
      if (this.config.cluster === 'localnet' || this.config.cluster === 'devnet') {
        console.log('💰 Requesting airdrop...');
        await this.connection.requestAirdrop(this.authority.publicKey, requiredBalance);
        await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for confirmation
      } else {
        throw new Error(`Insufficient balance. Required: ${requiredBalance / LAMPORTS_PER_SOL} SOL, Current: ${balance / LAMPORTS_PER_SOL} SOL`);
      }
    }

    console.log(`✅ Authority balance: ${balance / LAMPORTS_PER_SOL} SOL`);
    console.log(`✅ Authority address: ${this.authority.publicKey.toBase58()}`);
    console.log(`✅ RPC endpoint: ${this.config.rpcUrl}`);
    console.log(`✅ Cluster: ${this.config.cluster}`);
  }

  private async deployProgram(): Promise<void> {
    console.log('🚀 Deploying AuraBNB Burn & Redistribution program...');
    
    try {
      // Derive program accounts
      const [globalState] = PublicKey.findProgramAddressSync(
        [Buffer.from("global_state")],
        this.program.programId
      );

      // Check if already initialized
      try {
        const existingState = await this.program.account.globalState.fetch(globalState);
        console.log('⚠️  Program already initialized!');
        console.log(`   Authority: ${existingState.authority.toBase58()}`);
        console.log(`   Burn percentage: ${existingState.burnPercentage} (${existingState.burnPercentage / 100}%)`);
        console.log(`   Distribution frequency: ${existingState.redistributionFrequency} seconds`);
        return;
      } catch (error) {
        // Program not initialized, continue with deployment
      }

      // Initialize the program
      const tx = await this.program.methods
        .initialize(
          this.config.burnPercentage,
          new anchor.BN(this.config.redistributionFrequency)
        )
        .accounts({
          globalState,
          authority: this.authority.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([this.authority])
        .rpc();

      console.log(`✅ Program initialized! Transaction: ${tx}`);
      console.log(`   Global state account: ${globalState.toBase58()}`);
      
    } catch (error) {
      console.error('❌ Program deployment failed:', error);
      throw error;
    }
  }

  private async createTokenMint(): Promise<{ mint: PublicKey; burnPool: PublicKey; stakingPool: PublicKey }> {
    console.log('🪙 Creating AURA token mint...');
    
    try {
      // Create AURA token mint
      const mint = await createMint(
        this.connection,
        this.authority,
        this.authority.publicKey, // Mint authority
        this.authority.publicKey, // Freeze authority
        6 // 6 decimals
      );

      console.log(`✅ AURA token mint created: ${mint.toBase58()}`);

      // Derive pool accounts
      const [burnPool] = PublicKey.findProgramAddressSync(
        [Buffer.from("burn_pool")],
        this.program.programId
      );

      const [stakingPool] = PublicKey.findProgramAddressSync(
        [Buffer.from("staking_pool")],
        this.program.programId
      );

      // Create burn pool token account
      const burnPoolAccount = await createAccount(
        this.connection,
        this.authority,
        mint,
        burnPool
      );

      // Create staking pool token account  
      const stakingPoolAccount = await createAccount(
        this.connection,
        this.authority,
        mint,
        stakingPool
      );

      console.log(`✅ Burn pool created: ${burnPool.toBase58()}`);
      console.log(`✅ Staking pool created: ${stakingPool.toBase58()}`);

      // Create authority token account for initial supply
      const authorityTokenAccount = await createAssociatedTokenAccount(
        this.connection,
        this.authority,
        mint,
        this.authority.publicKey
      );

      // Mint initial supply
      await mintTo(
        this.connection,
        this.authority,
        mint,
        authorityTokenAccount,
        this.authority,
        this.config.initialMintSupply
      );

      console.log(`✅ Initial supply minted: ${this.config.initialMintSupply / 1_000_000} AURA tokens`);
      console.log(`✅ Authority token account: ${authorityTokenAccount.toBase58()}`);

      return { mint, burnPool, stakingPool };
    } catch (error) {
      console.error('❌ Token mint creation failed:', error);
      throw error;
    }
  }

  private async verifyDeployment(): Promise<void> {
    console.log('🔍 Verifying deployment...');
    
    try {
      const [globalState] = PublicKey.findProgramAddressSync(
        [Buffer.from("global_state")],
        this.program.programId
      );

      const globalStateAccount = await this.program.account.globalState.fetch(globalState);
      
      console.log('✅ Deployment verification successful!');
      console.log(`   Program ID: ${this.program.programId.toBase58()}`);
      console.log(`   Global state: ${globalState.toBase58()}`);
      console.log(`   Authority: ${globalStateAccount.authority.toBase58()}`);
      console.log(`   Burn percentage: ${globalStateAccount.burnPercentage} (${globalStateAccount.burnPercentage / 100}%)`);
      console.log(`   Distribution frequency: ${globalStateAccount.redistributionFrequency} seconds`);
      console.log(`   Total burned: ${globalStateAccount.totalBurned}`);
      console.log(`   Total staked: ${globalStateAccount.totalStaked}`);
      console.log(`   Is paused: ${globalStateAccount.isPaused}`);
      
    } catch (error) {
      console.error('❌ Deployment verification failed:', error);
      throw error;
    }
  }

  private async saveDeploymentInfo(mint?: PublicKey, burnPool?: PublicKey, stakingPool?: PublicKey): Promise<void> {
    const [globalState] = PublicKey.findProgramAddressSync(
      [Buffer.from("global_state")],
      this.program.programId
    );

    const deploymentInfo = {
      cluster: this.config.cluster,
      timestamp: new Date().toISOString(),
      programId: this.program.programId.toBase58(),
      authority: this.authority.publicKey.toBase58(),
      globalState: globalState.toBase58(),
      mint: mint?.toBase58(),
      burnPool: burnPool?.toBase58(),
      stakingPool: stakingPool?.toBase58(),
      burnPercentage: this.config.burnPercentage,
      redistributionFrequency: this.config.redistributionFrequency,
      rpcUrl: this.config.rpcUrl
    };

    const outputPath = path.join(__dirname, '..', 'deployment-info', `${this.config.cluster}.json`);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(deploymentInfo, null, 2));
    
    console.log(`📝 Deployment info saved to: ${outputPath}`);
  }

  public async deploy(createToken = false): Promise<void> {
    console.log(`🌟 Starting AuraBNB deployment to ${this.config.cluster}...`);
    
    try {
      await this.checkPrerequisites();
      await this.deployProgram();
      
      let mint, burnPool, stakingPool;
      if (createToken) {
        const tokenInfo = await this.createTokenMint();
        mint = tokenInfo.mint;
        burnPool = tokenInfo.burnPool;
        stakingPool = tokenInfo.stakingPool;
      }
      
      await this.verifyDeployment();
      await this.saveDeploymentInfo(mint, burnPool, stakingPool);
      
      console.log('🎉 Deployment completed successfully!');
      
    } catch (error) {
      console.error('💥 Deployment failed:', error);
      process.exit(1);
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const environment = args[0] || 'localnet';
  const createToken = args.includes('--create-token');
  
  if (!['localnet', 'devnet', 'mainnet'].includes(environment)) {
    console.error('❌ Invalid environment. Use: localnet, devnet, or mainnet');
    process.exit(1);
  }

  if (environment === 'mainnet') {
    console.log('⚠️  WARNING: You are deploying to MAINNET!');
    console.log('   This will use real SOL and create real tokens.');
    console.log('   Make sure you have reviewed and tested everything thoroughly.');
    
    // In a real deployment, you might want to add a confirmation prompt here
  }

  const deployer = new AuraDeployer(environment);
  await deployer.deploy(createToken);
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { AuraDeployer, DEPLOYMENT_CONFIGS }; 