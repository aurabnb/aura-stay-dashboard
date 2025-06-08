# AURA Staking Contract

A comprehensive Solana-based staking smart contract built with Anchor framework for the $AURA token. This contract provides time-based rewards, penalty mechanisms, and administrative controls for a robust DeFi staking experience.

## 🌟 Features

### Core Staking Functionality
- **Flexible Staking**: Users can stake any amount of $AURA tokens
- **Anytime Unstaking**: No hard lock periods - users can unstake whenever they want
- **Time-based Rewards**: Rewards accumulate daily based on staking duration and amount
- **Penalty System**: Early unstaking (before 30 days) incurs a 5% penalty on earned rewards only
- **Unstaking Fee**: 0.5% fee on all unstaked amounts (not applied to rewards)

### Reward System
- **Daily Compounding**: Rewards are calculated and compounded daily
- **Flexible Rate**: Configurable daily reward rate (set in basis points)
- **$AURA Rewards**: All rewards are distributed in $AURA tokens
- **Separate Claiming**: Users can claim rewards without unstaking

### Admin Controls
- **Reward Management**: Deposit $AURA tokens into the reward vault
- **Emergency Functions**: Withdraw from both stake and reward vaults
- **Rate Adjustment**: Update reward rates on-the-fly
- **Pool Management**: Pause/unpause staking operations

### Security Features
- **PDA Vaults**: Secure Program Derived Addresses for token storage
- **Account Constraints**: Comprehensive validation and authorization checks
- **Math Overflow Protection**: Safe arithmetic operations throughout
- **Authority Controls**: Role-based access for admin functions

## 📊 Contract Constants

```rust
const SECONDS_PER_DAY: i64 = 86_400;
const EARLY_UNSTAKE_PENALTY_PERCENT: u64 = 5;     // 5% penalty on rewards
const UNSTAKE_FEE_PERCENT: u64 = 50;              // 0.5% fee (50 basis points)
const BASIS_POINTS: u64 = 10_000;                 // For percentage calculations
```

## 🏗️ Contract Structure

### Account Types

#### StakingPool
```rust
pub struct StakingPool {
    pub authority: Pubkey,           // Admin authority
    pub aura_mint: Pubkey,          // $AURA token mint address
    pub total_staked: u64,          // Total tokens staked in pool
    pub reward_rate_per_day: u64,   // Daily reward rate (basis points)
    pub bump: u8,                   // Pool PDA bump
    pub vault_bump: u8,             // Stake vault PDA bump
    pub reward_vault_bump: u8,      // Reward vault PDA bump
    pub total_rewards_distributed: u64, // Lifetime rewards distributed
    pub created_at: i64,            // Pool creation timestamp
    pub paused: bool,               // Emergency pause state
}
```

#### UserStake
```rust
pub struct UserStake {
    pub owner: Pubkey,              // Stake owner
    pub amount: u64,                // Amount of tokens staked
    pub pending_rewards: u64,       // Accumulated unclaimed rewards
    pub total_rewards_claimed: u64, // Lifetime rewards claimed
    pub stake_start_time: i64,      // When user first staked
    pub last_update_time: i64,      // Last reward calculation time
}
```

## 🚀 Instructions

### 1. Initialize Pool
```rust
pub fn initialize_pool(
    ctx: Context<InitializePool>,
    authority: Pubkey,
    reward_rate_per_day: u64, // Basis points per day (e.g., 27 = 0.27%)
) -> Result<()>
```

### 2. Stake Tokens
```rust
pub fn stake(ctx: Context<Stake>, amount: u64) -> Result<()>
```

### 3. Unstake Tokens
```rust
pub fn unstake(ctx: Context<Unstake>, amount: u64) -> Result<()>
```

### 4. Claim Rewards
```rust
pub fn claim_rewards(ctx: Context<ClaimRewards>) -> Result<()>
```

### 5. Admin Functions
```rust
pub fn deposit_rewards(ctx: Context<DepositRewards>, amount: u64) -> Result<()>
pub fn admin_withdraw_stake(ctx: Context<AdminWithdrawStake>, amount: u64) -> Result<()>
pub fn admin_withdraw_rewards(ctx: Context<AdminWithdrawRewards>, amount: u64) -> Result<()>
pub fn update_reward_rate(ctx: Context<UpdateRewardRate>, new_rate: u64) -> Result<()>
pub fn set_pool_status(ctx: Context<SetPoolStatus>, paused: bool) -> Result<()>
```

## 💰 Reward Calculation

Rewards are calculated using the formula:
```
rewards = (staked_amount * reward_rate_per_day * days_elapsed) / BASIS_POINTS
```

### Example:
- Staked Amount: 10,000 $AURA
- Reward Rate: 27 basis points per day (0.27%)
- Days Elapsed: 1 day
- Rewards = (10,000 * 27 * 1) / 10,000 = 27 $AURA

## ⚠️ Penalty System

### Early Unstaking Penalty
- **Trigger**: Unstaking before 30 days from first stake
- **Penalty**: 5% of earned rewards (not principal)
- **Application**: Reduces claimable rewards only

### Unstaking Fee
- **Always Applied**: On every unstaking operation
- **Rate**: 0.5% of unstaked amount
- **Purpose**: Discourage frequent unstaking

### Example Unstaking Scenario:
- User stakes 10,000 $AURA
- After 15 days, earned 100 $AURA in rewards
- User unstakes 5,000 $AURA:
  - Unstaking fee: 5,000 * 0.5% = 25 $AURA
  - Early penalty: 100 * 5% = 5 $AURA (on rewards)
  - User receives: 4,975 $AURA + 95 $AURA rewards

## 🔐 PDA Seeds

```rust
// Staking Pool
["staking_pool", aura_mint.key()]

// Stake Vault
["stake_vault", staking_pool.key()]

// Reward Vault
["reward_vault", staking_pool.key()]

// User Stake
["user_stake", user.key(), staking_pool.key()]
```

## 🧪 Testing

Run the comprehensive test suite:

```bash
cd programs/aura-staking
anchor test
```

### Test Coverage:
- Pool initialization
- Token staking and unstaking
- Reward calculation and claiming
- Penalty system validation
- Admin functionality
- Error conditions
- State consistency

## 📈 Usage Examples

### Initialize a Pool
```typescript
await program.methods
  .initializePool(adminKey, new BN(27)) // 0.27% daily rate
  .accounts({
    stakingPool,
    stakeVault,
    rewardVault,
    auraMint,
    payer: admin.publicKey,
    // ... other accounts
  })
  .signers([admin])
  .rpc();
```

### Stake Tokens
```typescript
await program.methods
  .stake(new BN(10_000 * 1e6)) // 10k tokens
  .accounts({
    stakingPool,
    userStake,
    stakeVault,
    userTokenAccount,
    user: user.publicKey,
    // ... other accounts
  })
  .signers([user])
  .rpc();
```

### Claim Rewards
```typescript
await program.methods
  .claimRewards()
  .accounts({
    stakingPool,
    userStake,
    rewardVault,
    userTokenAccount,
    user: user.publicKey,
    // ... other accounts
  })
  .signers([user])
  .rpc();
```

## 🛡️ Security Considerations

1. **Authority Checks**: All admin functions validate caller authority
2. **Account Validation**: Comprehensive constraint checks on all accounts
3. **Math Safety**: Overflow protection with checked arithmetic
4. **PDA Security**: Proper seed validation for all PDAs
5. **State Consistency**: Atomic operations maintain consistent state

## 🎯 Deployment

1. Update the program ID in `declare_id!()` macro
2. Build the program: `anchor build`
3. Deploy to your target cluster: `anchor deploy`
4. Initialize the staking pool with desired parameters

## 📄 License

This contract is provided as-is for educational and development purposes. Please ensure thorough testing and auditing before mainnet deployment.

---

**Program ID**: `AuRA1111111111111111111111111111111111111111`

**Built with**: Anchor Framework v0.29.0 