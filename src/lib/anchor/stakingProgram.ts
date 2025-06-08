import { 
  Connection, 
  PublicKey, 
  SystemProgram, 
  SYSVAR_RENT_PUBKEY,
  Transaction
} from '@solana/web3.js'
import { AnchorProvider, BN } from '@coral-xyz/anchor'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'

// Use the deployed program ID
export const TIME_WEIGHTED_STAKING_PROGRAM_ID = new PublicKey('3qbuonQKjYW5XhYWohpHu1trKazvr7UwBYP5xk9hKMF6')
export const TEST_AURA_TOKEN_MINT = new PublicKey('3SPBiVPiJTqnqmrBxxRVnRDEywsqBHeTEDQs34PmXon9')

export interface UserStakeAccount {
  user: PublicKey
  amount: BN
  stakeTime: BN
  weightedStake: BN
  isActive: boolean
  penaltyAmount: BN
}

export interface StakingPoolAccount {
  authority: PublicKey
  totalStaked: BN
  totalWeightedStake: BN
  rewardRate: number
  lastUpdateTime: BN
}

// PDA helper functions
export function getStakingPoolPDA(programId: PublicKey = TIME_WEIGHTED_STAKING_PROGRAM_ID): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("staking_pool")],
    programId
  )
}

export function getUserStakePDA(
  userPubkey: PublicKey,
  stakingPool: PublicKey,
  programId: PublicKey = TIME_WEIGHTED_STAKING_PROGRAM_ID
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("user_stake"), userPubkey.toBuffer(), stakingPool.toBuffer()],
    programId
  )
}

export class StakingProgram {
  private connection: Connection
  private provider: AnchorProvider | null = null
  private stakingPoolPDA: PublicKey
  
  constructor(connection: Connection, programId: PublicKey = TIME_WEIGHTED_STAKING_PROGRAM_ID) {
    this.connection = connection
    
    // Calculate staking pool PDA
    const [stakingPoolPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("staking_pool")],
      programId
    )
    this.stakingPoolPDA = stakingPoolPDA
  }

  async initialize(provider: AnchorProvider) {
    try {
      this.provider = provider
      console.log('Staking program initialized with provider')
    } catch (error) {
      console.error('Failed to initialize staking program:', error)
      throw error
    }
  }

  async getStakingPool(): Promise<StakingPoolAccount | null> {
    try {
      // For development, return mock data
      return {
        authority: this.stakingPoolPDA,
        totalStaked: new BN(50000000), // 50M tokens
        totalWeightedStake: new BN(60000000), // 60M weighted
        rewardRate: 0.095, // 9.5% APY
        lastUpdateTime: new BN(Date.now() / 1000)
      }
    } catch (error) {
      console.error('Error fetching staking pool:', error)
      return null
    }
  }

  async getUserStake(userPublicKey: PublicKey): Promise<UserStakeAccount | null> {
    try {
      // For development, return mock data
      return {
        user: userPublicKey,
        amount: new BN(1000000), // 1M tokens
        stakeTime: new BN(Date.now() / 1000 - 86400), // 1 day ago
        weightedStake: new BN(1100000), // 1.1M weighted
        isActive: true,
        penaltyAmount: new BN(50000) // 5% penalty
      }
    } catch (error) {
      console.error('Error fetching user stake:', error)
      return null
    }
  }

  async stake(userPublicKey: PublicKey, amount: BN): Promise<string> {
    try {
      if (!this.provider) throw new Error('Program not initialized')
      
      // For development, return mock transaction signature
      console.log(`Mock staking ${amount.toString()} tokens for user ${userPublicKey.toString()}`)
      
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      return `mock_stake_signature_${Date.now()}`
    } catch (error) {
      console.error('Error staking:', error)
      throw error
    }
  }

  async unstake(userPublicKey: PublicKey, amount: BN): Promise<string> {
    try {
      if (!this.provider) throw new Error('Program not initialized')
      
      // For development, return mock transaction signature
      console.log(`Mock unstaking ${amount.toString()} tokens for user ${userPublicKey.toString()}`)
      
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      return `mock_unstake_signature_${Date.now()}`
    } catch (error) {
      console.error('Error unstaking:', error)
      throw error
    }
  }

  async claimRewards(userPublicKey: PublicKey): Promise<string> {
    try {
      if (!this.provider) throw new Error('Program not initialized')
      
      // For development, return mock transaction signature
      console.log(`Mock claiming rewards for user ${userPublicKey.toString()}`)
      
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      return `mock_claim_signature_${Date.now()}`
    } catch (error) {
      console.error('Error claiming rewards:', error)
      throw error
    }
  }

  async updateRewards(userPublicKey: PublicKey): Promise<string> {
    try {
      if (!this.provider) throw new Error('Program not initialized')
      
      // For development, return mock transaction signature
      console.log(`Mock updating rewards for user ${userPublicKey.toString()}`)
      
      return `mock_update_signature_${Date.now()}`
    } catch (error) {
      console.error('Error updating rewards:', error)
      throw error
    }
  }
}

// Mock staking program for development
export class MockStakingProgram {
  private connection: Connection
  
  constructor(connection: Connection) {
    this.connection = connection
  }

  async getStakingPool(): Promise<StakingPoolAccount | null> {
    return {
      authority: new PublicKey('11111111111111111111111111111111'),
      totalStaked: new BN(1000000),
      totalWeightedStake: new BN(1200000),
      rewardRate: 0.095,
      lastUpdateTime: new BN(Date.now() / 1000)
    }
  }

  async getUserStake(userPubkey: PublicKey): Promise<UserStakeAccount | null> {
    return {
      user: userPubkey,
      amount: new BN(100000),
      stakeTime: new BN(Date.now() / 1000 - 86400),
      weightedStake: new BN(120000),
      isActive: true,
      penaltyAmount: new BN(0)
    }
  }

  async stake(userPubkey: PublicKey, amount: BN): Promise<string> {
    console.log(`Mock staking ${amount.toString()} for ${userPubkey.toString()}`)
    await new Promise(resolve => setTimeout(resolve, 1000))
    return `mock_stake_${Date.now()}`
  }

  async unstake(userPubkey: PublicKey, amount: BN): Promise<string> {
    console.log(`Mock unstaking ${amount.toString()} for ${userPubkey.toString()}`)
    await new Promise(resolve => setTimeout(resolve, 1000))
    return `mock_unstake_${Date.now()}`
  }

  async claimRewards(userPubkey: PublicKey): Promise<string> {
    console.log(`Mock claiming rewards for ${userPubkey.toString()}`)
    await new Promise(resolve => setTimeout(resolve, 1000))
    return `mock_claim_${Date.now()}`
  }
}

// Factory function to create the appropriate staking program
export function createStakingProgram(
  connection: Connection,
  wallet?: any,
  programId: PublicKey = TIME_WEIGHTED_STAKING_PROGRAM_ID,
  useMock: boolean = true
): StakingProgram | MockStakingProgram {
  if (useMock || !wallet) {
    console.log('🔧 Using mock staking program for development')
    return new MockStakingProgram(connection)
  } else {
    console.log('🚀 Using real staking program')
    return new StakingProgram(connection, programId)
  }
}

// Utility functions
export function formatTokenAmount(amount: BN, decimals: number = 9): string {
  const divisor = new BN(10).pow(new BN(decimals))
  const quotient = amount.div(divisor)
  const remainder = amount.mod(divisor)
  return `${quotient.toString()}.${remainder.toString().padStart(decimals, '0')}`
}

export function parseTokenAmount(amount: string, decimals: number = 9): BN {
  const parts = amount.split('.')
  const wholePart = new BN(parts[0] || '0')
  const fractionalPart = new BN((parts[1] || '').padEnd(decimals, '0').slice(0, decimals))
  
  const multiplier = new BN(10).pow(new BN(decimals))
  return wholePart.mul(multiplier).add(fractionalPart)
} 