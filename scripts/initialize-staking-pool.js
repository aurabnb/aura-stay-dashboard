const { 
  Connection, 
  Keypair, 
  PublicKey, 
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  LAMPORTS_PER_SOL
} = require('@solana/web3.js')
const { 
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  getAccount
} = require('@solana/spl-token')
const { AnchorProvider, BN, Program, Wallet } = require('@coral-xyz/anchor')
const fs = require('fs')

// Contract addresses
const TIME_WEIGHTED_STAKING_PROGRAM_ID = new PublicKey('BN2DqSycxKERFRxt5Z4E9KEexBZQvxyR3bX7qNKVYj2F')
const TS_AURA_TOKEN_MINT = new PublicKey('9Rsxc4qfyYdHaVPwwxY6Ap7nusQr3p1qdQG2sHL3PFBf')

// Load IDL
const idl = JSON.parse(fs.readFileSync('src/lib/anchor/time_weighted_staking_idl.json', 'utf8'))

// PDA helper functions
function getStakingPoolPDA() {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("staking_pool")],
    TIME_WEIGHTED_STAKING_PROGRAM_ID
  )
}

function getPoolVaultPDA(stakingPool) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("pool_vault"), stakingPool.toBuffer()],
    TIME_WEIGHTED_STAKING_PROGRAM_ID
  )
}

async function initializeStakingPool() {
  try {
    console.log('🚀 Initializing Staking Pool...')
    
    // Connect to devnet
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed')
    
    // Load the authority keypair
    const authorityKeypairData = JSON.parse(fs.readFileSync('dev-authority.json', 'utf8'))
    const authorityKeypair = Keypair.fromSecretKey(new Uint8Array(authorityKeypairData))
    
    console.log('Authority public key:', authorityKeypair.publicKey.toString())
    console.log('TS AURA Token mint:', TS_AURA_TOKEN_MINT.toString())
    console.log('Staking Program ID:', TIME_WEIGHTED_STAKING_PROGRAM_ID.toString())
    
    // Check authority balance
    const balance = await connection.getBalance(authorityKeypair.publicKey)
    console.log('Authority balance:', balance / LAMPORTS_PER_SOL, 'SOL')
    
    if (balance < 0.1 * LAMPORTS_PER_SOL) {
      console.log('⚠️  Low SOL balance. You may need to request more SOL from faucet.')
      console.log('Visit: https://faucet.solana.com/')
    }
    
    // Create provider and program
    const wallet = new Wallet(authorityKeypair)
    const provider = new AnchorProvider(connection, wallet, { commitment: 'confirmed' })
    const program = new Program(idl, provider)
    
    console.log('✅ Program initialized')
    
    // Calculate PDAs
    const [stakingPoolPDA, stakingPoolBump] = getStakingPoolPDA()
    const [poolVaultPDA, poolVaultBump] = getPoolVaultPDA(stakingPoolPDA)
    
    console.log('Staking Pool PDA:', stakingPoolPDA.toString())
    console.log('Pool Vault PDA:', poolVaultPDA.toString())
    
    // Check if pool already exists
    try {
      const existingPool = await program.account.stakingPool.fetch(stakingPoolPDA)
      console.log('✅ Staking pool already exists!')
      console.log('Pool authority:', existingPool.authority.toString())
      console.log('Total staked:', existingPool.totalStaked.toString())
      return stakingPoolPDA.toString()
    } catch (error) {
      console.log('📝 Pool does not exist yet, creating...')
    }
    
    // Initialize the staking pool
    console.log('Initializing staking pool...')
    
    const tx = await program.methods
      .initializePool(
        authorityKeypair.publicKey,
        stakingPoolBump,
        poolVaultBump
      )
      .accounts({
        stakingPool: stakingPoolPDA,
        poolTokenVault: poolVaultPDA,
        stakeTokenMint: TS_AURA_TOKEN_MINT,
        payer: authorityKeypair.publicKey,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .rpc()
    
    console.log('✅ Staking pool initialized successfully!')
    console.log('Transaction signature:', tx)
    console.log('Pool address:', stakingPoolPDA.toString())
    
    // Verify the pool was created
    const poolData = await program.account.stakingPool.fetch(stakingPoolPDA)
    console.log('\n📊 Pool Details:')
    console.log('Authority:', poolData.authority.toString())
    console.log('Total staked:', poolData.totalStaked.toString())
    console.log('Vault address:', poolVaultPDA.toString())
    
    console.log('\n🎯 Staking pool is ready!')
    console.log('Users can now stake their TS AURA tokens')
    
    return stakingPoolPDA.toString()
    
  } catch (error) {
    console.error('❌ Failed to initialize staking pool:', error)
    
    // More detailed error logging
    if (error.logs) {
      console.log('\n📝 Transaction Logs:')
      error.logs.forEach(log => console.log(log))
    }
    
    if (error.message) {
      console.log('\n💬 Error Message:', error.message)
    }
    
    process.exit(1)
  }
}

// Run the initialization
initializeStakingPool()
  .then((poolAddress) => {
    console.log(`\n🎉 Initialization complete! Pool: ${poolAddress}`)
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Initialization failed:', error)
    process.exit(1)
  }) 