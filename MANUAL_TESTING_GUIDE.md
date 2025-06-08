# AURA Staking Contract Manual Testing Guide
**Generated:** 2025-06-08T14:29:14.198Z
**Program ID:** 3qbuonQKjYW5XhYWohpHu1trKazvr7UwBYP5xk9hKMF6
**Token Mint:** 3SPBiVPiJTqnqmrBxxRVnRDEywsqBHeTEDQs34PmXon9
**Network:** Solana Devnet
**Frontend URL:** http://localhost:3000/staking

## Prerequisites
- Wallet with devnet SOL (for transaction fees)
- AURA tokens in wallet (you have 50,000)
- Frontend running on localhost:3000
- Browser with wallet extension (Phantom, Solflare, etc.)

## User Functions
### stake
**Description:** Test staking AURA tokens with real blockchain transaction

**Prerequisites:**
- Wallet connected to frontend
- At least 100 AURA tokens in wallet
- Some SOL for transaction fees (~0.001 SOL)

**Test Steps:**
1. Visit http://localhost:3000/staking
2. Click "Connect Wallet" and approve connection
3. Verify green "Live Blockchain Integration" banner appears
4. Go to "Stake" tab in the manage section
5. Enter amount to stake (try 100 AURA)
6. Click "Stake Tokens" button
7. Approve wallet signature prompt
8. Wait for transaction confirmation

**Expected Results:**
- ✅ Wallet signature popup appears
- ✅ Transaction completes successfully
- ✅ Transaction signature shown in success toast
- ✅ User stake appears in "Your Position" section
- ✅ Total staked amount updates in pool statistics
- ✅ Transaction appears on Solana Explorer (devnet)

**Troubleshooting:**
- ⚠️ If no signature prompt: Check wallet connection status
- ⚠️ If transaction fails: Ensure sufficient SOL for fees
- ⚠️ If insufficient tokens error: Check AURA token balance
- ⚠️ If pool not initialized: Contact admin to initialize

---

### unstake
**Description:** Test unstaking AURA tokens with penalty calculation

**Prerequisites:**
- Active stake position
- Wallet connected
- SOL for transaction fees

**Test Steps:**
1. Ensure you have an active stake position
2. Go to "Unstake" tab
3. Note the available amount to unstake
4. Enter partial amount (e.g., 50% of staked)
5. Click "Unstake Tokens"
6. Review penalty warning if unstaking early
7. Approve wallet signature
8. Confirm transaction

**Expected Results:**
- ✅ Penalty calculation displayed if <30 days staked
- ✅ Wallet signature required
- ✅ Transaction completes with fees deducted
- ✅ Remaining stake position updated
- ✅ Unstaked tokens returned to wallet (minus fees)
- ✅ User position reflects new amounts

---

### claimRewards
**Description:** Test claiming accumulated SOL rewards

**Prerequisites:**
- Active stake position with rewards
- Rewards distribution active
- SOL for transaction fees

**Test Steps:**
1. Check "Available Rewards" section
2. Note current reward amount in SOL
3. Go to "Claim" tab
4. Review reward amount in SOL and USD
5. Click "Claim Rewards"
6. Approve wallet signature
7. Confirm transaction

**Expected Results:**
- ✅ SOL rewards transferred to wallet
- ✅ Reward balance resets to 0
- ✅ SOL balance in wallet increases
- ✅ Transaction signature provided
- ✅ Claim history updated

---

## Read-Only Functions
### getStakingPool
**Description:** Verify pool state information displays correctly

**Prerequisites:**
- Frontend loaded
- Network connection

**Test Steps:**
1. Load the staking page
2. Observe the staking pool information
3. Check "Total $AURA Staked" statistic
4. Verify current APY display
5. Note distribution status

**Expected Results:**
- ✅ Pool statistics display real values
- ✅ APY shows current rate (not hardcoded)
- ✅ Total staked updates with new stakes
- ✅ Live indicators show green dots
- ✅ Pool status reflects actual state

---

### getUserStake
**Description:** Verify user stake information accuracy

**Prerequisites:**
- Wallet connected
- Active stake position

**Test Steps:**
1. Connect wallet
2. Check "Your Position" card
3. Verify staked amount matches expectations
4. Check weighted stake calculation
5. Review time-based reward accumulation
6. Note penalty amounts if applicable

**Expected Results:**
- ✅ Stake amount exactly matches blockchain state
- ✅ Weighted stake reflects time bonus
- ✅ Active status indicator
- ✅ Accurate penalty calculations
- ✅ Real-time reward updates

---

## Admin Functions
### initializePool
**Description:** Initialize staking pool (admin only)

**Prerequisites:**
- Admin authority wallet
- SOL for initialization fees
- Pool not yet initialized

**Test Steps:**
1. Connect with admin authority wallet
2. Use admin script or build custom transaction
3. Call initializePool function
4. Set authority address
5. Approve transaction with admin signature

**Expected Results:**
- ✅ Staking pool account created
- ✅ Pool vault account created
- ✅ Admin authority set correctly
- ✅ Pool ready for user operations
- ✅ Pool appears in blockchain state

---

### startDistribution
**Description:** Start reward distribution epoch (admin only)

**Prerequisites:**
- Admin authority access
- Pool initialized
- SOL/SPL rewards deposited

**Test Steps:**
1. Connect admin wallet
2. Ensure rewards are deposited
3. Call startDistribution function
4. Approve admin signature
5. Verify distribution status

**Expected Results:**
- ✅ Distribution status becomes active
- ✅ Users can now earn rewards
- ✅ Epoch counter increments
- ✅ Distribution timestamp set

---

## Integration Tests
### fullUserJourney
**Description:** Complete user journey from stake to claim

**Prerequisites:**
- Fresh wallet with AURA tokens
- Active reward distribution
- SOL for fees

**Test Steps:**
1. Connect new wallet
2. Stake initial amount (e.g., 1000 AURA)
3. Wait or simulate time passage
4. Check accumulated rewards
5. Stake additional amount
6. Verify weighted stake calculation
7. Attempt early unstake (check penalty)
8. Wait for optimal period (30 days simulation)
9. Unstake without penalty
10. Claim all accumulated rewards
11. Verify final balances

**Expected Results:**
- ✅ All transactions require signatures
- ✅ Blockchain state accurately reflects actions
- ✅ Time-weighted rewards calculated correctly
- ✅ Penalties applied appropriately
- ✅ Final balances match expectations
- ✅ No simulation artifacts in real data

---

## Testing Checklist

### Basic Functionality
- [ ] Wallet connection works
- [ ] Real blockchain integration active
- [ ] AURA token balance displays correctly
- [ ] SOL price updates in real-time
- [ ] Network statistics are live

### User Operations
- [ ] Stake transaction requires signature
- [ ] Stake amount reflected in position
- [ ] Weighted stake calculated correctly
- [ ] Unstake transaction requires signature
- [ ] Early unstake penalty calculated
- [ ] Unstake fees applied correctly
- [ ] Reward claim requires signature
- [ ] SOL rewards transferred to wallet

### Security Verification
- [ ] All transactions show real signatures
- [ ] No transactions execute without approval
- [ ] Balances match blockchain explorer
- [ ] PDAs derived correctly
- [ ] Program ID matches deployed contract

### Performance & UX
- [ ] Transaction confirmation times reasonable
- [ ] Error messages are helpful
- [ ] Loading states work properly
- [ ] Success notifications display
- [ ] Real-time updates work

## Important Notes

### Live Integration Indicators
When the system is working correctly, you should see:
- 🟢 Green "Live Blockchain Integration" banner
- 🟢 Pulsing green dots next to live data
- 🟢 "Connected" wallet status
- 🟢 Real transaction signatures in success messages

### If You See Simulation Mode
- 🟡 Yellow warning banner
- 🟡 No wallet signature prompts
- 🟡 Fake transaction IDs starting with "sim_tx_"
- 🟡 Stakes don't persist after page reload

### Transaction Verification
Real transactions will:
- Always require wallet approval/signature
- Return actual Solana transaction signatures (64 chars)
- Be viewable on Solana Explorer (devnet)
- Update blockchain state permanently
- Consume actual SOL for transaction fees

### Useful Links
- **Solana Explorer (Devnet):** https://explorer.solana.com/?cluster=devnet
- **Program Account:** https://explorer.solana.com/address/3qbuonQKjYW5XhYWohpHu1trKazvr7UwBYP5xk9hKMF6?cluster=devnet
- **AURA Token Mint:** https://explorer.solana.com/address/3SPBiVPiJTqnqmrBxxRVnRDEywsqBHeTEDQs34PmXon9?cluster=devnet
- **Your Token Account:** https://explorer.solana.com/address/DDqroKbrC6ZVXqUF2Db5eBVcKhTNDX2jvsmRNCSK11Km?cluster=devnet

---
*Generated by AURA Staking Manual Test Guide Generator*
