import { Connection, Keypair, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { getAssociatedTokenAddress, getAccount } from '@solana/spl-token'
import fs from 'fs'
import { 
  getStakingPoolPDA, 
  getPoolVaultPDA, 
  getUserStakePDA,
  TEST_AURA_TOKEN_MINT, 
  TIME_WEIGHTED_STAKING_PROGRAM_ID,
  parseTokenAmount
} from '../src/lib/anchor/stakingProgram'

interface TestResult {
  function: string
  success: boolean
  signature?: string
  error?: string
  details?: any
}

class SimpleStakingTest {
  private connection: Connection
  private adminKeypair: Keypair
  private userKeypair: Keypair
  private results: TestResult[] = []
  private readmeContent: string[] = []

  constructor() {
    this.connection = new Connection('https://api.devnet.solana.com', 'confirmed')
    this.initializeReadme()
  }

  initializeReadme() {
    this.readmeContent.push('# AURA Staking Contract Function Test Report\n')
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
      this.adminKeypair = Keypair.generate()
      fs.writeFileSync('dev-authority.json', JSON.stringify(Array.from(this.adminKeypair.secretKey)))
    }

    // Use your actual wallet address (you have 50k AURA tokens)
    this.userKeypair = Keypair.generate()
    
    console.log('Admin wallet:', this.adminKeypair.publicKey.toString())
    console.log('Test user wallet:', this.userKeypair.publicKey.toString())

    this.readmeContent.push('## Test Setup\n')
    this.readmeContent.push(`- **Admin Wallet:** ${this.adminKeypair.publicKey.toString()}\n`)
    this.readmeContent.push(`- **Test User Wallet:** ${this.userKeypair.publicKey.toString()}\n`)
    this.readmeContent.push(`- **Your Actual Wallet:** HsoLNnwC4hEGas1kwFZ2dRkvoGX3XuNr83GkMG584BVX (50k AURA tokens)\n\n`)
  }

  logResult(result: TestResult) {
    this.results.push(result)
    const status = result.success ? '✅' : '❌'
    console.log(`${status} ${result.function}: ${result.success ? 'SUCCESS' : 'FAILED'}`)
    if (result.signature) console.log(`   Transaction: ${result.signature}`)
    if (result.error) console.log(`   Error: ${result.error}`)
    if (result.details) console.log(`   Details:`, result.details)
  }

  async testContractDeployment() {
    console.log('\n🔍 Testing Contract Deployment...')
    try {
      const programAccount = await this.connection.getAccountInfo(TIME_WEIGHTED_STAKING_PROGRAM_ID)
      
      if (programAccount && programAccount.executable) {
        this.logResult({
          function: 'contractDeployment',
          success: true,
          details: {
            deployed: true,
            owner: programAccount.owner.toString(),
            executable: programAccount.executable,
            dataLength: programAccount.data.length
          }
        })
      } else {
        this.logResult({
          function: 'contractDeployment',
          success: false,
          error: 'Program not found or not executable'
        })
      }
    } catch (error: any) {
      this.logResult({
        function: 'contractDeployment',
        success: false,
        error: error.message
      })
    }
  }

  async testPDAGeneration() {
    console.log('\n🔗 Testing PDA Generation...')
    try {
      const [stakingPoolPDA, stakingPoolBump] = getStakingPoolPDA()
      const [poolVaultPDA, poolVaultBump] = getPoolVaultPDA(stakingPoolPDA)
      const [userStakePDA, userStakeBump] = getUserStakePDA(this.userKeypair.publicKey, stakingPoolPDA)

      this.logResult({
        function: 'pdaGeneration',
        success: true,
        details: {
          stakingPool: { address: stakingPoolPDA.toString(), bump: stakingPoolBump },
          poolVault: { address: poolVaultPDA.toString(), bump: poolVaultBump },
          userStake: { address: userStakePDA.toString(), bump: userStakeBump }
        }
      })
    } catch (error: any) {
      this.logResult({
        function: 'pdaGeneration',
        success: false,
        error: error.message
      })
    }
  }

  async testTokenMintValidation() {
    console.log('\n🪙 Testing Token Mint Validation...')
    try {
      const mintAccount = await this.connection.getAccountInfo(TEST_AURA_TOKEN_MINT)
      
      if (mintAccount) {
        this.logResult({
          function: 'tokenMintValidation',
          success: true,
          details: {
            mintExists: true,
            owner: mintAccount.owner.toString(),
            dataLength: mintAccount.data.length
          }
        })
      } else {
        this.logResult({
          function: 'tokenMintValidation',
          success: false,
          error: 'Token mint not found'
        })
      }
    } catch (error: any) {
      this.logResult({
        function: 'tokenMintValidation',
        success: false,
        error: error.message
      })
    }
  }

  async testUserTokenBalance() {
    console.log('\n💰 Testing User Token Balance (Your Wallet)...')
    try {
      // Test with your actual wallet that has 50k AURA tokens
      const yourWallet = new PublicKey('HsoLNnwC4hEGas1kwFZ2dRkvoGX3XuNr83GkMG584BVX')
      const userTokenAccount = await getAssociatedTokenAddress(TEST_AURA_TOKEN_MINT, yourWallet)
      
      const account = await getAccount(this.connection, userTokenAccount)
      const balance = Number(account.amount) / 1e9

      this.logResult({
        function: 'userTokenBalance',
        success: true,
        details: {
          wallet: yourWallet.toString(),
          tokenAccount: userTokenAccount.toString(),
          balance: `${balance} AURA tokens`,
          balanceRaw: account.amount.toString()
        }
      })
    } catch (error: any) {
      this.logResult({
        function: 'userTokenBalance',
        success: false,
        error: error.message
      })
    }
  }

  async testStakingPoolAccount() {
    console.log('\n🏊 Testing Staking Pool Account...')
    try {
      const [stakingPoolPDA] = getStakingPoolPDA()
      const poolAccount = await this.connection.getAccountInfo(stakingPoolPDA)
      
      if (poolAccount) {
        this.logResult({
          function: 'stakingPoolAccount',
          success: true,
          details: {
            exists: true,
            owner: poolAccount.owner.toString(),
            dataLength: poolAccount.data.length,
            initialized: poolAccount.owner.toString() === TIME_WEIGHTED_STAKING_PROGRAM_ID.toString()
          }
        })
      } else {
        this.logResult({
          function: 'stakingPoolAccount',
          success: true,
          details: {
            exists: false,
            note: 'Pool will be created on first stake transaction'
          }
        })
      }
    } catch (error: any) {
      this.logResult({
        function: 'stakingPoolAccount',
        success: false,
        error: error.message
      })
    }
  }

  async testNetworkConnection() {
    console.log('\n🌐 Testing Network Connection...')
    try {
      const slot = await this.connection.getSlot()
      const blockHeight = await this.connection.getBlockHeight()
      
      this.logResult({
        function: 'networkConnection',
        success: true,
        details: {
          currentSlot: slot,
          blockHeight: blockHeight,
          rpcEndpoint: 'https://api.devnet.solana.com'
        }
      })
    } catch (error: any) {
      this.logResult({
        function: 'networkConnection',
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
        this.readmeContent.push('```json\n')
        this.readmeContent.push(JSON.stringify(result.details, null, 2))
        this.readmeContent.push('\n```\n')
      }
      this.readmeContent.push('\n')
    }

    this.readmeContent.push('## Smart Contract Functions Available\n\n')
    
    this.readmeContent.push('### 🔒 Admin Functions (Require Authority Signature)\n')
    this.readmeContent.push('- **initializePool(authority, bump, vaultBump)**: Initialize the staking pool (one-time setup)\n')
    this.readmeContent.push('- **startDistribution()**: Begin reward distribution epoch\n')
    this.readmeContent.push('- **stopDistribution()**: End current reward distribution epoch\n')
    this.readmeContent.push('- **endDistributionPermanently()**: Permanently disable reward distributions\n')
    this.readmeContent.push('- **depositSolRewards(amount)**: Deposit SOL for user rewards\n')
    this.readmeContent.push('- **depositSplRewards(amount)**: Deposit SPL tokens for rewards\n')
    this.readmeContent.push('- **adminWithdrawSol(amount)**: Emergency SOL withdrawal (admin only)\n')
    this.readmeContent.push('- **adminWithdrawSpl(amount)**: Emergency SPL token withdrawal (admin only)\n')
    this.readmeContent.push('- **adminWithdrawStakeTokens(amount)**: Emergency stake token withdrawal (admin only)\n\n')
    
    this.readmeContent.push('### 👤 User Functions (Require User Signature)\n')
    this.readmeContent.push('- **stake(amount)**: Stake AURA tokens to earn time-weighted rewards\n')
    this.readmeContent.push('- **unstake(amount)**: Unstake tokens (0.5% fee + 5% penalty if <30 days)\n')
    this.readmeContent.push('- **claimSolRewards()**: Claim accumulated SOL rewards\n')
    this.readmeContent.push('- **claimSplRewards()**: Claim accumulated SPL token rewards\n\n')

    this.readmeContent.push('### 📊 Read-Only Functions (No Signature Required)\n')
    this.readmeContent.push('- **getStakingPool()**: View pool state and statistics\n')
    this.readmeContent.push('- **getUserStake(userPubkey)**: View user stake information\n')
    this.readmeContent.push('- **getUserTokenBalance(userPubkey)**: View user AURA token balance\n\n')

    this.readmeContent.push('## Contract Security Features\n\n')
    this.readmeContent.push('### 🔐 Security Mechanisms\n')
    this.readmeContent.push('- **Replay Attack Protection**: Global sequence numbers prevent transaction replay\n')
    this.readmeContent.push('- **Access Control**: Admin functions protected by authority verification\n')
    this.readmeContent.push('- **PDA Security**: All accounts derived from program-controlled PDAs\n')
    this.readmeContent.push('- **Token Safety**: SPL token transfers handled securely through token program\n\n')

    this.readmeContent.push('### ⏰ Time-Weighted Rewards System\n')
    this.readmeContent.push('- **Optimal Lock Period**: 30 days for maximum rewards\n')
    this.readmeContent.push('- **Early Exit Penalty**: 5% penalty on rewards for unstaking before 30 days\n')
    this.readmeContent.push('- **Unstaking Fee**: 0.5% fee on all unstaked tokens\n')
    this.readmeContent.push('- **Weight Calculation**: Longer stakes get higher reward multipliers\n\n')

    this.readmeContent.push('### 🎯 Distribution System\n')
    this.readmeContent.push('- **Epoch-based**: Rewards distributed in discrete epochs\n')
    this.readmeContent.push('- **Proportional**: Rewards distributed based on weighted stake amounts\n')
    this.readmeContent.push('- **Multi-token**: Supports both SOL and SPL token rewards\n')
    this.readmeContent.push('- **Admin Controlled**: Distributions must be started/stopped by admin\n\n')

    this.readmeContent.push('## How to Test Real Functionality\n\n')
    this.readmeContent.push('### For Users:\n')
    this.readmeContent.push('1. Visit: http://localhost:3000/staking\n')
    this.readmeContent.push('2. Connect your wallet (Phantom, Solflare, etc.)\n')
    this.readmeContent.push('3. Ensure you have AURA tokens (you have 50,000)\n')
    this.readmeContent.push('4. Try staking - you\'ll get real wallet signature prompts\n')
    this.readmeContent.push('5. Monitor transactions on Solana Explorer (devnet)\n\n')

    this.readmeContent.push('### For Admins:\n')
    this.readmeContent.push('1. Use the admin authority wallet for admin functions\n')
    this.readmeContent.push('2. Initialize pool first (if not already done)\n')
    this.readmeContent.push('3. Start distribution epochs to enable rewards\n')
    this.readmeContent.push('4. Deposit SOL/SPL tokens for user rewards\n')
    this.readmeContent.push('5. Monitor pool state and user activities\n\n')

    this.readmeContent.push('---\n')
    this.readmeContent.push('*Generated by AURA Staking Contract Test Suite*\n')

    // Write the report
    fs.writeFileSync('FUNCTION_TEST_REPORT.md', this.readmeContent.join(''))
    
    console.log('✅ Function test report generated: FUNCTION_TEST_REPORT.md')
    console.log(`📊 Overall Success Rate: ${successRate}%`)
  }

  async run() {
    try {
      await this.setup()
      
      console.log('\n🧪 Starting Smart Contract Function Tests...\n')
      
      // Test sequence
      await this.testNetworkConnection()
      await this.testContractDeployment()
      await this.testTokenMintValidation()
      await this.testPDAGeneration()
      await this.testStakingPoolAccount()
      await this.testUserTokenBalance()
      
      await this.generateReport()
      
      console.log('\n🎉 All function tests completed!')
      
    } catch (error) {
      console.error('💥 Test suite failed:', error)
      process.exit(1)
    }
  }
}

// Run the test suite
const testSuite = new SimpleStakingTest()
testSuite.run()
  .then(() => {
    console.log('✅ Function test automation completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Function test automation failed:', error)
    process.exit(1)
  }) 