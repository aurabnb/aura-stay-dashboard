import { Connection, Keypair, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY, Transaction } from '@solana/web3.js'
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token'
import fs from 'fs'
import { getStakingPoolPDA, getPoolVaultPDA, TEST_AURA_TOKEN_MINT, TIME_WEIGHTED_STAKING_PROGRAM_ID } from '../src/lib/anchor/stakingProgram'

async function initializeStakingPool() {
  try {
    console.log('🚀 Initializing Staking Pool...')
    
    // Connect to devnet
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed')
    
    // Load the authority keypair
    const authorityKeypairData = JSON.parse(fs.readFileSync('dev-authority.json', 'utf8'))
    const authorityKeypair = Keypair.fromSecretKey(new Uint8Array(authorityKeypairData))
    
    console.log('Authority public key:', authorityKeypair.publicKey.toString())
    console.log('Program ID:', TIME_WEIGHTED_STAKING_PROGRAM_ID.toString())
    console.log('Token Mint:', TEST_AURA_TOKEN_MINT.toString())
    
    // Check current balance
    const balance = await connection.getBalance(authorityKeypair.publicKey)
    console.log('Authority balance:', balance / 1e9, 'SOL')
    
    // Get PDAs
    const [stakingPoolPDA, stakingPoolBump] = getStakingPoolPDA(TIME_WEIGHTED_STAKING_PROGRAM_ID)
    const [poolVaultPDA, poolVaultBump] = getPoolVaultPDA(stakingPoolPDA, TIME_WEIGHTED_STAKING_PROGRAM_ID)
    
    console.log('Staking Pool PDA:', stakingPoolPDA.toString(), 'bump:', stakingPoolBump)
    console.log('Pool Vault PDA:', poolVaultPDA.toString(), 'bump:', poolVaultBump)
    
    // Check if the staking pool account already exists
    try {
      const poolAccountInfo = await connection.getAccountInfo(stakingPoolPDA)
      if (poolAccountInfo) {
        console.log('✅ Staking pool already exists!')
        console.log('Account owner:', poolAccountInfo.owner.toString())
        console.log('Account size:', poolAccountInfo.data.length, 'bytes')
        return
      }
    } catch (error) {
      console.log('Pool account does not exist, will create...')
    }
    
    // Check program account
    const programAccountInfo = await connection.getAccountInfo(TIME_WEIGHTED_STAKING_PROGRAM_ID)
    if (!programAccountInfo) {
      console.error('❌ Program account not found! Make sure the program is deployed.')
      return
    }
    
    console.log('✅ Program account found')
    console.log('Program owner:', programAccountInfo.owner.toString())
    console.log('Program executable:', programAccountInfo.executable)
    
    console.log('🎯 Ready to initialize with real blockchain transactions!')
    console.log('Next step: Connect wallet in frontend and try staking.')
    console.log('The pool will be automatically initialized on first stake transaction.')
    
  } catch (error) {
    console.error('❌ Failed to check staking pool:', error)
    process.exit(1)
  }
}

// Run the check
initializeStakingPool()
  .then(() => {
    console.log('🎉 Check complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Check failed:', error)
    process.exit(1)
  }) 