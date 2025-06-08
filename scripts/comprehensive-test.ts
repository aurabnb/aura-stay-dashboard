import { Connection, Keypair, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createAssociatedTokenAccount, mintTo, createMint, getAccount } from '@solana/spl-token'
import fs from 'fs'
import { 
  RealStakingProgram, 
  getStakingPoolPDA, 
  getPoolVaultPDA, 
  TEST_AURA_TOKEN_MINT, 
  TIME_WEIGHTED_STAKING_PROGRAM_ID,
  parseTokenAmount,
  formatTokenAmount
} from '../src/lib/anchor/stakingProgram'

interface TestResult {
  function: string
  success: boolean
  signature?: string
  error?: string
  gasUsed?: number
  details?: any
}

class StakingTestSuite {
  private connection: Connection
  private adminKeypair: Keypair
  private userKeypair: Keypair
  private stakingProgram: RealStakingProgram
  private results: TestResult[] = []
  private readmeContent: string[] = []

  constructor() {
    this.connection = new Connection('https://api.devnet.solana.com', 'confirmed')
    this.readmeContent.push('# AURA Staking Contract Test Results\n')
    this.readmeContent.push(`**Test Date:** ${new Date().toISOString()}\n`)
    this.readmeContent.push(`**Network:** Solana Devnet\n`)
    this.readmeContent.push(`**Program ID:** ${TIME_WEIGHTED_STAKING_PROGRAM_ID.toString()}\n`)
    this.readmeContent.push(`**Token Mint:** ${TEST_AURA_TOKEN_MINT.toString()}\n\n`)
  }

  async setup() {
    console.log('🚀 Setting up test environment...')
    
    // Load admin keypair
    try {
      const adminKeypairData = JSON.parse(fs.readFileSync('dev-authority.json', 'utf8'))
      this.adminKeypair = Keypair.fromSecretKey(new Uint8Array(adminKeypairData))
    } catch {
      // Create new admin keypair if not exists
      this.adminKeypair = Keypair.generate()
      fs.writeFileSync('dev-authority.json', JSON.stringify(Array.from(this.adminKeypair.secretKey)))
    }

    // Create test user keypair
    this.userKeypair = Keypair.generate()

    // Airdrop SOL to both accounts
    try {
      await this.connection.requestAirdrop(this.adminKeypair.publicKey, 2 * LAMPORTS_PER_SOL)
      await this.connection.requestAirdrop(this.userKeypair.publicKey, 1 * LAMPORTS_PER_SOL)
      await new Promise(resolve => setTimeout(resolve, 3000)) // Wait for airdrops
    } catch (error) {
      console.log('Airdrop may have failed, continuing with existing balances...')
    }

    // Create wallet interfaces
    const adminWallet = {
      publicKey: this.adminKeypair.publicKey,
      signTransaction: async (tx: any) => {
        tx.partialSign(this.adminKeypair)
        return tx
      },
      signAllTransactions: async (txs: any[]) => {
        txs.forEach(tx => tx.partialSign(this.adminKeypair))
        return txs
      }
    }

    this.stakingProgram = new RealStakingProgram(this.connection, adminWallet, TIME_WEIGHTED_STAKING_PROGRAM_ID)

    console.log('Admin wallet:', this.adminKeypair.publicKey.toString())
    console.log('User wallet:', this.userKeypair.publicKey.toString())

    this.readmeContent.push('## Test Setup\n')
    this.readmeContent.push(`- **Admin Wallet:** ${this.adminKeypair.publicKey.toString()}\n`)
    this.readmeContent.push(`- **Test User Wallet:** ${this.userKeypair.publicKey.toString()}\n\n`)
  }

  async logResult(result: TestResult) {
    this.results.push(result)
    const status = result.success ? '✅' : '❌'
    console.log(`${status} ${result.function}: ${result.success ? 'SUCCESS' : 'FAILED'}`)
    if (result.signature) console.log(`   Transaction: ${result.signature}`)
    if (result.error) console.log(`   Error: ${result.error}`)
    if (result.details) console.log(`   Details:`, result.details)
  }

  async testInitializePool() {
    console.log('\n📋 Testing Pool Initialization...')
    try {
      // Check if pool already exists
      const existingPool = await this.stakingProgram.getStakingPool()
      if (existingPool) {
        await this.logResult({
          function: 'initializePool',
          success: true,
          details: 'Pool already initialized',
          signature: 'N/A'
        })
        return
      }

      const signature = await this.stakingProgram.initializePool(
        this.adminKeypair.publicKey,
        this.adminKeypair
      )

      await this.logResult({
        function: 'initializePool',
        success: true,
        signature
      })
    } catch (error: any) {
      await this.logResult({
        function: 'initializePool',
        success: false,
        error: error.message
      })
    }
  }

  async testUserTokenSetup() {
    console.log('\n🪙 Setting up user tokens...')
    try {
      // Create associated token account for user
      const userTokenAccount = await getAssociatedTokenAddress(TEST_AURA_TOKEN_MINT, this.userKeypair.publicKey)
      
      try {
        await getAccount(this.connection, userTokenAccount)
        console.log('User token account already exists')
      } catch {
        console.log('Creating user token account...')
        await createAssociatedTokenAccount(
          this.connection,
          this.adminKeypair,
          TEST_AURA_TOKEN_MINT,
          this.userKeypair.publicKey
        )
      }

      // Check if user has tokens, if not simulate having them
      const account = await getAccount(this.connection, userTokenAccount)
      const balance = Number(account.amount)
      
      await this.logResult({
        function: 'userTokenSetup',
        success: true,
        details: `User has ${balance / 1e9} AURA tokens`
      })

      if (balance === 0) {
        console.log('⚠️  User has no AURA tokens. In production, user would need to acquire tokens first.')
      }

    } catch (error: any) {
      await this.logResult({
        function: 'userTokenSetup',
        success: false,
        error: error.message
      })
    }
  }

  async testStakeFunction() {
    console.log('\n🎯 Testing Stake Function...')
    try {
      const stakeAmount = parseTokenAmount('100') // 100 AURA tokens

      // Create user wallet interface
      const userWallet = {
        publicKey: this.userKeypair.publicKey,
        signTransaction: async (tx: any) => {
          tx.partialSign(this.userKeypair)
          return tx
        },
        signAllTransactions: async (txs: any[]) => {
          txs.forEach(tx => tx.partialSign(this.userKeypair))
          return txs
        }
      }

      const userStakingProgram = new RealStakingProgram(this.connection, userWallet, TIME_WEIGHTED_STAKING_PROGRAM_ID)
      
      const signature = await userStakingProgram.stake(stakeAmount, this.userKeypair.publicKey)

      await this.logResult({
        function: 'stake',
        success: true,
        signature,
        details: `Staked 100 AURA tokens`
      })
    } catch (error: any) {
      await this.logResult({
        function: 'stake',
        success: false,
        error: error.message
      })
    }
  }

  async testGetUserStake() {
    console.log('\n📊 Testing Get User Stake...')
    try {
      const userStake = await this.stakingProgram.getUserStake(this.userKeypair.publicKey)
      
      if (userStake) {
        await this.logResult({
          function: 'getUserStake',
          success: true,
          details: {
            amount: formatTokenAmount(userStake.amount),
            weightedStake: formatTokenAmount(userStake.weightedStake),
            isActive: userStake.isActive,
            lastStakeTime: userStake.lastStakeTime.toString()
          }
        })
      } else {
        await this.logResult({
          function: 'getUserStake',
          success: true,
          details: 'No user stake found'
        })
      }
    } catch (error: any) {
      await this.logResult({
        function: 'getUserStake',
        success: false,
        error: error.message
      })
    }
  }

  async testUnstakeFunction() {
    console.log('\n🔄 Testing Unstake Function...')
    try {
      const unstakeAmount = parseTokenAmount('50') // 50 AURA tokens

      const userWallet = {
        publicKey: this.userKeypair.publicKey,
        signTransaction: async (tx: any) => {
          tx.partialSign(this.userKeypair)
          return tx
        },
        signAllTransactions: async (txs: any[]) => {
          txs.forEach(tx => tx.partialSign(this.userKeypair))
          return txs
        }
      }

      const userStakingProgram = new RealStakingProgram(this.connection, userWallet, TIME_WEIGHTED_STAKING_PROGRAM_ID)
      
      const signature = await userStakingProgram.unstake(unstakeAmount, this.userKeypair.publicKey)

      await this.logResult({
        function: 'unstake',
        success: true,
        signature,
        details: `Unstaked 50 AURA tokens`
      })
    } catch (error: any) {
      await this.logResult({
        function: 'unstake',
        success: false,
        error: error.message
      })
    }
  }

  async testClaimRewards() {
    console.log('\n🎁 Testing Claim Rewards...')
    try {
      const userWallet = {
        publicKey: this.userKeypair.publicKey,
        signTransaction: async (tx: any) => {
          tx.partialSign(this.userKeypair)
          return tx
        },
        signAllTransactions: async (txs: any[]) => {
          txs.forEach(tx => tx.partialSign(this.userKeypair))
          return txs
        }
      }

      const userStakingProgram = new RealStakingProgram(this.connection, userWallet, TIME_WEIGHTED_STAKING_PROGRAM_ID)
      
      const signature = await userStakingProgram.claimRewards(this.userKeypair.publicKey)

      await this.logResult({
        function: 'claimRewards',
        success: true,
        signature,
        details: 'Claimed SOL rewards'
      })
    } catch (error: any) {
      await this.logResult({
        function: 'claimRewards',
        success: false,
        error: error.message
      })
    }
  }

  async testGetStakingPool() {
    console.log('\n🏊 Testing Get Staking Pool...')
    try {
      const pool = await this.stakingProgram.getStakingPool()
      
      if (pool) {
        await this.logResult({
          function: 'getStakingPool',
          success: true,
          details: {
            authority: pool.authority.toString(),
            totalStaked: formatTokenAmount(pool.totalStaked),
            totalWeightedStake: formatTokenAmount(pool.totalWeightedStake),
            distributionActive: pool.distributionActive,
            distributionEnded: pool.distributionEnded,
            currentEpoch: pool.currentDistributionEpoch.toString()
          }
        })
      } else {
        await this.logResult({
          function: 'getStakingPool',
          success: false,
          error: 'Pool not found'
        })
      }
    } catch (error: any) {
      await this.logResult({
        function: 'getStakingPool',
        success: false,
        error: error.message
      })
    }
  }

  async testStartDistribution() {
    console.log('\n▶️  Testing Start Distribution (Admin)...')
    try {
      // This would require building a transaction manually since we don't have this in our RealStakingProgram
      await this.logResult({
        function: 'startDistribution',
        success: false,
        error: 'Function not implemented in test interface - requires admin privileges'
      })
    } catch (error: any) {
      await this.logResult({
        function: 'startDistribution',
        success: false,
        error: error.message
      })
    }
  }

  async generateReport() {
    console.log('\n📋 Generating Test Report...')
    
    const successCount = this.results.filter(r => r.success).length
    const totalTests = this.results.length
    const successRate = (successCount / totalTests * 100).toFixed(1)

    this.readmeContent.push('## Test Summary\n')
    this.readmeContent.push(`- **Total Tests:** ${totalTests}\n`)
    this.readmeContent.push(`- **Successful:** ${successCount}\n`)
    this.readmeContent.push(`- **Failed:** ${totalTests - successCount}\n`)
    this.readmeContent.push(`- **Success Rate:** ${successRate}%\n\n`)

    this.readmeContent.push('## Detailed Test Results\n')
    
    for (const result of this.results) {
      const status = result.success ? '✅ PASS' : '❌ FAIL'
      this.readmeContent.push(`### ${result.function}\n`)
      this.readmeContent.push(`**Status:** ${status}\n`)
      
      if (result.signature && result.signature !== 'N/A') {
        this.readmeContent.push(`**Transaction:** [${result.signature}](https://explorer.solana.com/tx/${result.signature}?cluster=devnet)\n`)
      }
      
      if (result.error) {
        this.readmeContent.push(`**Error:** ${result.error}\n`)
      }
      
      if (result.details) {
        this.readmeContent.push(`**Details:**\n`)
        if (typeof result.details === 'string') {
          this.readmeContent.push(`${result.details}\n`)
        } else {
          this.readmeContent.push('```json\n')
          this.readmeContent.push(JSON.stringify(result.details, null, 2))
          this.readmeContent.push('\n```\n')
        }
      }
      this.readmeContent.push('\n')
    }

    this.readmeContent.push('## Contract Functions Overview\n')
    this.readmeContent.push('### User Functions\n')
    this.readmeContent.push('- **stake(amount)**: Stake AURA tokens to earn rewards\n')
    this.readmeContent.push('- **unstake(amount)**: Unstake tokens (with penalties if before 30 days)\n')
    this.readmeContent.push('- **claimRewards()**: Claim accumulated SOL rewards\n')
    this.readmeContent.push('- **getUserStake()**: View current stake information\n\n')
    
    this.readmeContent.push('### Admin Functions\n')
    this.readmeContent.push('- **initializePool()**: Initialize the staking pool (one-time)\n')
    this.readmeContent.push('- **startDistribution()**: Start reward distribution epoch\n')
    this.readmeContent.push('- **stopDistribution()**: Stop reward distribution epoch\n')
    this.readmeContent.push('- **endDistributionPermanently()**: Permanently end distributions\n')
    this.readmeContent.push('- **depositSolRewards()**: Deposit SOL for user rewards\n')
    this.readmeContent.push('- **depositSplRewards()**: Deposit SPL tokens for rewards\n')
    this.readmeContent.push('- **adminWithdrawSol()**: Admin emergency SOL withdrawal\n')
    this.readmeContent.push('- **adminWithdrawSpl()**: Admin emergency SPL withdrawal\n')
    this.readmeContent.push('- **adminWithdrawStakeTokens()**: Admin emergency stake token withdrawal\n\n')

    this.readmeContent.push('## Security Features\n')
    this.readmeContent.push('- **Replay Attack Protection**: Sequence numbers prevent replay attacks\n')
    this.readmeContent.push('- **Access Control**: Admin-only functions protected by authority checks\n')
    this.readmeContent.push('- **Time-Weighted Rewards**: Longer stakes earn higher rewards\n')
    this.readmeContent.push('- **Early Exit Penalties**: 5% penalty on rewards for unstaking before 30 days\n')
    this.readmeContent.push('- **Unstaking Fees**: 0.5% fee on unstaked tokens\n\n')

    // Write the report
    fs.writeFileSync('STAKING_TEST_REPORT.md', this.readmeContent.join(''))
    
    console.log('✅ Test report generated: STAKING_TEST_REPORT.md')
    console.log(`📊 Overall Success Rate: ${successRate}%`)
  }

  async run() {
    try {
      await this.setup()
      
      console.log('\n🧪 Starting Comprehensive Staking Tests...\n')
      
      // Test sequence
      await this.testInitializePool()
      await this.testGetStakingPool()
      await this.testUserTokenSetup()
      await this.testStakeFunction()
      await this.testGetUserStake()
      await this.testUnstakeFunction()
      await this.testGetUserStake() // Check state after unstake
      await this.testClaimRewards()
      await this.testStartDistribution()
      
      await this.generateReport()
      
      console.log('\n🎉 All tests completed!')
      
    } catch (error) {
      console.error('💥 Test suite failed:', error)
      process.exit(1)
    }
  }
}

// Run the test suite
const testSuite = new StakingTestSuite()
testSuite.run()
  .then(() => {
    console.log('✅ Test automation completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Test automation failed:', error)
    process.exit(1)
  }) 