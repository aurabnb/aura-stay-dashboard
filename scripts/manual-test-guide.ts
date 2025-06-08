import fs from 'fs'
import { TIME_WEIGHTED_STAKING_PROGRAM_ID, TEST_AURA_TOKEN_MINT } from '../src/lib/anchor/stakingProgram'

interface TestStep {
  category: string
  function: string
  description: string
  prerequisites: string[]
  steps: string[]
  expectedResults: string[]
  troubleshooting?: string[]
}

class ManualTestGuide {
  private testSteps: TestStep[] = []
  private readmeContent: string[] = []

  constructor() {
    this.initializeGuide()
    this.setupTestSteps()
  }

  initializeGuide() {
    this.readmeContent.push('# AURA Staking Contract Manual Testing Guide\n')
    this.readmeContent.push(`**Generated:** ${new Date().toISOString()}\n`)
    this.readmeContent.push(`**Program ID:** ${TIME_WEIGHTED_STAKING_PROGRAM_ID.toString()}\n`)
    this.readmeContent.push(`**Token Mint:** ${TEST_AURA_TOKEN_MINT.toString()}\n`)
    this.readmeContent.push(`**Network:** Solana Devnet\n`)
    this.readmeContent.push(`**Frontend URL:** http://localhost:3000/staking\n\n`)
    
    this.readmeContent.push('## Prerequisites\n')
    this.readmeContent.push('- Wallet with devnet SOL (for transaction fees)\n')
    this.readmeContent.push('- AURA tokens in wallet (you have 50,000)\n')
    this.readmeContent.push('- Frontend running on localhost:3000\n')
    this.readmeContent.push('- Browser with wallet extension (Phantom, Solflare, etc.)\n\n')
  }

  setupTestSteps() {
    // User Function Tests
    this.testSteps.push({
      category: 'User Functions',
      function: 'stake',
      description: 'Test staking AURA tokens with real blockchain transaction',
      prerequisites: [
        'Wallet connected to frontend',
        'At least 100 AURA tokens in wallet',
        'Some SOL for transaction fees (~0.001 SOL)'
      ],
      steps: [
        'Visit http://localhost:3000/staking',
        'Click "Connect Wallet" and approve connection',
        'Verify green "Live Blockchain Integration" banner appears',
        'Go to "Stake" tab in the manage section',
        'Enter amount to stake (try 100 AURA)',
        'Click "Stake Tokens" button',
        'Approve wallet signature prompt',
        'Wait for transaction confirmation'
      ],
      expectedResults: [
        'Wallet signature popup appears',
        'Transaction completes successfully',
        'Transaction signature shown in success toast',
        'User stake appears in "Your Position" section',
        'Total staked amount updates in pool statistics',
        'Transaction appears on Solana Explorer (devnet)'
      ],
      troubleshooting: [
        'If no signature prompt: Check wallet connection status',
        'If transaction fails: Ensure sufficient SOL for fees',
        'If insufficient tokens error: Check AURA token balance',
        'If pool not initialized: Contact admin to initialize'
      ]
    })

    this.testSteps.push({
      category: 'User Functions',
      function: 'unstake',
      description: 'Test unstaking AURA tokens with penalty calculation',
      prerequisites: [
        'Active stake position',
        'Wallet connected',
        'SOL for transaction fees'
      ],
      steps: [
        'Ensure you have an active stake position',
        'Go to "Unstake" tab',
        'Note the available amount to unstake',
        'Enter partial amount (e.g., 50% of staked)',
        'Click "Unstake Tokens"',
        'Review penalty warning if unstaking early',
        'Approve wallet signature',
        'Confirm transaction'
      ],
      expectedResults: [
        'Penalty calculation displayed if <30 days staked',
        'Wallet signature required',
        'Transaction completes with fees deducted',
        'Remaining stake position updated',
        'Unstaked tokens returned to wallet (minus fees)',
        'User position reflects new amounts'
      ]
    })

    this.testSteps.push({
      category: 'User Functions',
      function: 'claimRewards',
      description: 'Test claiming accumulated SOL rewards',
      prerequisites: [
        'Active stake position with rewards',
        'Rewards distribution active',
        'SOL for transaction fees'
      ],
      steps: [
        'Check "Available Rewards" section',
        'Note current reward amount in SOL',
        'Go to "Claim" tab',
        'Review reward amount in SOL and USD',
        'Click "Claim Rewards"',
        'Approve wallet signature',
        'Confirm transaction'
      ],
      expectedResults: [
        'SOL rewards transferred to wallet',
        'Reward balance resets to 0',
        'SOL balance in wallet increases',
        'Transaction signature provided',
        'Claim history updated'
      ]
    })

    // Read-Only Function Tests
    this.testSteps.push({
      category: 'Read-Only Functions',
      function: 'getStakingPool',
      description: 'Verify pool state information displays correctly',
      prerequisites: [
        'Frontend loaded',
        'Network connection'
      ],
      steps: [
        'Load the staking page',
        'Observe the staking pool information',
        'Check "Total $AURA Staked" statistic',
        'Verify current APY display',
        'Note distribution status'
      ],
      expectedResults: [
        'Pool statistics display real values',
        'APY shows current rate (not hardcoded)',
        'Total staked updates with new stakes',
        'Live indicators show green dots',
        'Pool status reflects actual state'
      ]
    })

    this.testSteps.push({
      category: 'Read-Only Functions',
      function: 'getUserStake',
      description: 'Verify user stake information accuracy',
      prerequisites: [
        'Wallet connected',
        'Active stake position'
      ],
      steps: [
        'Connect wallet',
        'Check "Your Position" card',
        'Verify staked amount matches expectations',
        'Check weighted stake calculation',
        'Review time-based reward accumulation',
        'Note penalty amounts if applicable'
      ],
      expectedResults: [
        'Stake amount exactly matches blockchain state',
        'Weighted stake reflects time bonus',
        'Active status indicator',
        'Accurate penalty calculations',
        'Real-time reward updates'
      ]
    })

    // Admin Function Tests (Note: These require admin authority)
    this.testSteps.push({
      category: 'Admin Functions',
      function: 'initializePool',
      description: 'Initialize staking pool (admin only)',
      prerequisites: [
        'Admin authority wallet',
        'SOL for initialization fees',
        'Pool not yet initialized'
      ],
      steps: [
        'Connect with admin authority wallet',
        'Use admin script or build custom transaction',
        'Call initializePool function',
        'Set authority address',
        'Approve transaction with admin signature'
      ],
      expectedResults: [
        'Staking pool account created',
        'Pool vault account created',
        'Admin authority set correctly',
        'Pool ready for user operations',
        'Pool appears in blockchain state'
      ]
    })

    this.testSteps.push({
      category: 'Admin Functions',
      function: 'startDistribution',
      description: 'Start reward distribution epoch (admin only)',
      prerequisites: [
        'Admin authority access',
        'Pool initialized',
        'SOL/SPL rewards deposited'
      ],
      steps: [
        'Connect admin wallet',
        'Ensure rewards are deposited',
        'Call startDistribution function',
        'Approve admin signature',
        'Verify distribution status'
      ],
      expectedResults: [
        'Distribution status becomes active',
        'Users can now earn rewards',
        'Epoch counter increments',
        'Distribution timestamp set'
      ]
    })

    this.testSteps.push({
      category: 'Integration Tests',
      function: 'fullUserJourney',
      description: 'Complete user journey from stake to claim',
      prerequisites: [
        'Fresh wallet with AURA tokens',
        'Active reward distribution',
        'SOL for fees'
      ],
      steps: [
        'Connect new wallet',
        'Stake initial amount (e.g., 1000 AURA)',
        'Wait or simulate time passage',
        'Check accumulated rewards',
        'Stake additional amount',
        'Verify weighted stake calculation',
        'Attempt early unstake (check penalty)',
        'Wait for optimal period (30 days simulation)',
        'Unstake without penalty',
        'Claim all accumulated rewards',
        'Verify final balances'
      ],
      expectedResults: [
        'All transactions require signatures',
        'Blockchain state accurately reflects actions',
        'Time-weighted rewards calculated correctly',
        'Penalties applied appropriately',
        'Final balances match expectations',
        'No simulation artifacts in real data'
      ]
    })
  }

  generateGuide() {
    console.log('📋 Generating Manual Test Guide...')

    // Group by category
    const categories = [...new Set(this.testSteps.map(step => step.category))]
    
    for (const category of categories) {
      this.readmeContent.push(`## ${category}\n`)
      
      const categorySteps = this.testSteps.filter(step => step.category === category)
      
      for (const step of categorySteps) {
        this.readmeContent.push(`### ${step.function}\n`)
        this.readmeContent.push(`**Description:** ${step.description}\n\n`)
        
        this.readmeContent.push('**Prerequisites:**\n')
        for (const prereq of step.prerequisites) {
          this.readmeContent.push(`- ${prereq}\n`)
        }
        this.readmeContent.push('\n')
        
        this.readmeContent.push('**Test Steps:**\n')
        for (let i = 0; i < step.steps.length; i++) {
          this.readmeContent.push(`${i + 1}. ${step.steps[i]}\n`)
        }
        this.readmeContent.push('\n')
        
        this.readmeContent.push('**Expected Results:**\n')
        for (const result of step.expectedResults) {
          this.readmeContent.push(`- ✅ ${result}\n`)
        }
        this.readmeContent.push('\n')
        
        if (step.troubleshooting) {
          this.readmeContent.push('**Troubleshooting:**\n')
          for (const tip of step.troubleshooting) {
            this.readmeContent.push(`- ⚠️ ${tip}\n`)
          }
          this.readmeContent.push('\n')
        }
        
        this.readmeContent.push('---\n\n')
      }
    }

    // Add additional sections
    this.addAdditionalSections()

    // Write the guide
    fs.writeFileSync('MANUAL_TESTING_GUIDE.md', this.readmeContent.join(''))
    console.log('✅ Manual testing guide generated: MANUAL_TESTING_GUIDE.md')
  }

  addAdditionalSections() {
    this.readmeContent.push('## Testing Checklist\n\n')
    this.readmeContent.push('### Basic Functionality\n')
    this.readmeContent.push('- [ ] Wallet connection works\n')
    this.readmeContent.push('- [ ] Real blockchain integration active\n')
    this.readmeContent.push('- [ ] AURA token balance displays correctly\n')
    this.readmeContent.push('- [ ] SOL price updates in real-time\n')
    this.readmeContent.push('- [ ] Network statistics are live\n\n')

    this.readmeContent.push('### User Operations\n')
    this.readmeContent.push('- [ ] Stake transaction requires signature\n')
    this.readmeContent.push('- [ ] Stake amount reflected in position\n')
    this.readmeContent.push('- [ ] Weighted stake calculated correctly\n')
    this.readmeContent.push('- [ ] Unstake transaction requires signature\n')
    this.readmeContent.push('- [ ] Early unstake penalty calculated\n')
    this.readmeContent.push('- [ ] Unstake fees applied correctly\n')
    this.readmeContent.push('- [ ] Reward claim requires signature\n')
    this.readmeContent.push('- [ ] SOL rewards transferred to wallet\n\n')

    this.readmeContent.push('### Security Verification\n')
    this.readmeContent.push('- [ ] All transactions show real signatures\n')
    this.readmeContent.push('- [ ] No transactions execute without approval\n')
    this.readmeContent.push('- [ ] Balances match blockchain explorer\n')
    this.readmeContent.push('- [ ] PDAs derived correctly\n')
    this.readmeContent.push('- [ ] Program ID matches deployed contract\n\n')

    this.readmeContent.push('### Performance & UX\n')
    this.readmeContent.push('- [ ] Transaction confirmation times reasonable\n')
    this.readmeContent.push('- [ ] Error messages are helpful\n')
    this.readmeContent.push('- [ ] Loading states work properly\n')
    this.readmeContent.push('- [ ] Success notifications display\n')
    this.readmeContent.push('- [ ] Real-time updates work\n\n')

    this.readmeContent.push('## Important Notes\n\n')
    this.readmeContent.push('### Live Integration Indicators\n')
    this.readmeContent.push('When the system is working correctly, you should see:\n')
    this.readmeContent.push('- 🟢 Green "Live Blockchain Integration" banner\n')
    this.readmeContent.push('- 🟢 Pulsing green dots next to live data\n')
    this.readmeContent.push('- 🟢 "Connected" wallet status\n')
    this.readmeContent.push('- 🟢 Real transaction signatures in success messages\n\n')

    this.readmeContent.push('### If You See Simulation Mode\n')
    this.readmeContent.push('- 🟡 Yellow warning banner\n')
    this.readmeContent.push('- 🟡 No wallet signature prompts\n')
    this.readmeContent.push('- 🟡 Fake transaction IDs starting with "sim_tx_"\n')
    this.readmeContent.push('- 🟡 Stakes don\'t persist after page reload\n\n')

    this.readmeContent.push('### Transaction Verification\n')
    this.readmeContent.push('Real transactions will:\n')
    this.readmeContent.push('- Always require wallet approval/signature\n')
    this.readmeContent.push('- Return actual Solana transaction signatures (64 chars)\n')
    this.readmeContent.push('- Be viewable on Solana Explorer (devnet)\n')
    this.readmeContent.push('- Update blockchain state permanently\n')
    this.readmeContent.push('- Consume actual SOL for transaction fees\n\n')

    this.readmeContent.push('### Useful Links\n')
    this.readmeContent.push(`- **Solana Explorer (Devnet):** https://explorer.solana.com/?cluster=devnet\n`)
    this.readmeContent.push(`- **Program Account:** https://explorer.solana.com/address/${TIME_WEIGHTED_STAKING_PROGRAM_ID.toString()}?cluster=devnet\n`)
    this.readmeContent.push(`- **AURA Token Mint:** https://explorer.solana.com/address/${TEST_AURA_TOKEN_MINT.toString()}?cluster=devnet\n`)
    this.readmeContent.push(`- **Your Token Account:** https://explorer.solana.com/address/DDqroKbrC6ZVXqUF2Db5eBVcKhTNDX2jvsmRNCSK11Km?cluster=devnet\n\n`)

    this.readmeContent.push('---\n')
    this.readmeContent.push('*Generated by AURA Staking Manual Test Guide Generator*\n')
  }

  run() {
    console.log('🧪 Generating Manual Testing Guide for AURA Staking Contract...\n')
    this.generateGuide()
    console.log('📋 Guide includes step-by-step testing for all contract functions')
    console.log('🎯 Use this guide to verify real blockchain integration works correctly')
  }
}

// Generate the manual testing guide
const guide = new ManualTestGuide()
guide.run() 