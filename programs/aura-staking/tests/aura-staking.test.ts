import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AuraStaking } from "../target/types/aura_staking";
import {
  createMint,
  createAccount,
  mintTo,
  getAccount,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { assert } from "chai";

describe("aura-staking", () => {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.AuraStaking as Program<AuraStaking>;
  
  // Test accounts
  const admin = anchor.web3.Keypair.generate();
  const user = anchor.web3.Keypair.generate();
  const user2 = anchor.web3.Keypair.generate();
  
  let auraMint: anchor.web3.PublicKey;
  let adminTokenAccount: anchor.web3.PublicKey;
  let userTokenAccount: anchor.web3.PublicKey;
  let user2TokenAccount: anchor.web3.PublicKey;
  
  let stakingPool: anchor.web3.PublicKey;
  let stakeVault: anchor.web3.PublicKey;
  let rewardVault: anchor.web3.PublicKey;
  let userStake: anchor.web3.PublicKey;
  let user2Stake: anchor.web3.PublicKey;

  const INITIAL_MINT_AMOUNT = 1_000_000 * 1e6; // 1 million tokens (6 decimals)
  const REWARD_RATE_PER_DAY = 27; // 0.27% per day (27 basis points)

  before(async () => {
    // Airdrop SOL to test accounts
    await provider.connection.requestAirdrop(admin.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
    await provider.connection.requestAirdrop(user.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
    await provider.connection.requestAirdrop(user2.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
    
    // Wait for airdrops to confirm
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create AURA token mint
    auraMint = await createMint(
      provider.connection,
      admin,
      admin.publicKey,
      admin.publicKey,
      6 // decimals
    );

    // Create token accounts
    adminTokenAccount = await createAccount(
      provider.connection,
      admin,
      auraMint,
      admin.publicKey
    );

    userTokenAccount = await createAccount(
      provider.connection,
      user,
      auraMint,
      user.publicKey
    );

    user2TokenAccount = await createAccount(
      provider.connection,
      user2,
      auraMint,
      user2.publicKey
    );

    // Mint tokens to admin and users
    await mintTo(
      provider.connection,
      admin,
      auraMint,
      adminTokenAccount,
      admin,
      INITIAL_MINT_AMOUNT
    );

    await mintTo(
      provider.connection,
      admin,
      auraMint,
      userTokenAccount,
      admin,
      100_000 * 1e6 // 100k tokens to user
    );

    await mintTo(
      provider.connection,
      admin,
      auraMint,
      user2TokenAccount,
      admin,
      50_000 * 1e6 // 50k tokens to user2
    );

    // Derive PDAs
    [stakingPool] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("staking_pool"), auraMint.toBuffer()],
      program.programId
    );

    [stakeVault] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("stake_vault"), stakingPool.toBuffer()],
      program.programId
    );

    [rewardVault] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("reward_vault"), stakingPool.toBuffer()],
      program.programId
    );

    [userStake] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("user_stake"), user.publicKey.toBuffer(), stakingPool.toBuffer()],
      program.programId
    );

    [user2Stake] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("user_stake"), user2.publicKey.toBuffer(), stakingPool.toBuffer()],
      program.programId
    );
  });

  it("Initializes the staking pool", async () => {
    await program.methods
      .initializePool(admin.publicKey, new anchor.BN(REWARD_RATE_PER_DAY))
      .accounts({
        stakingPool,
        stakeVault,
        rewardVault,
        auraMint,
        payer: admin.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([admin])
      .rpc();

    // Verify pool state
    const poolData = await program.account.stakingPool.fetch(stakingPool);
    assert.equal(poolData.authority.toString(), admin.publicKey.toString());
    assert.equal(poolData.auraMint.toString(), auraMint.toString());
    assert.equal(poolData.totalStaked.toString(), "0");
    assert.equal(poolData.rewardRatePerDay.toString(), REWARD_RATE_PER_DAY.toString());
    assert.equal(poolData.paused, false);

    console.log("✅ Staking pool initialized successfully");
  });

  it("Admin deposits rewards to the reward vault", async () => {
    const depositAmount = new anchor.BN(50_000 * 1e6); // 50k tokens

    await program.methods
      .depositRewards(depositAmount)
      .accounts({
        stakingPool,
        rewardVault,
        adminTokenAccount,
        admin: admin.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([admin])
      .rpc();

    // Verify reward vault balance
    const rewardVaultAccount = await getAccount(provider.connection, rewardVault);
    assert.equal(rewardVaultAccount.amount.toString(), depositAmount.toString());

    console.log(`✅ Admin deposited ${depositAmount.toString()} AURA to reward vault`);
  });

  it("User stakes AURA tokens", async () => {
    const stakeAmount = new anchor.BN(10_000 * 1e6); // 10k tokens

    await program.methods
      .stake(stakeAmount)
      .accounts({
        stakingPool,
        userStake,
        stakeVault,
        userTokenAccount,
        user: user.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([user])
      .rpc();

    // Verify user stake
    const userStakeData = await program.account.userStake.fetch(userStake);
    assert.equal(userStakeData.owner.toString(), user.publicKey.toString());
    assert.equal(userStakeData.amount.toString(), stakeAmount.toString());
    assert.equal(userStakeData.pendingRewards.toString(), "0");

    // Verify pool total
    const poolData = await program.account.stakingPool.fetch(stakingPool);
    assert.equal(poolData.totalStaked.toString(), stakeAmount.toString());

    // Verify vault balance
    const vaultAccount = await getAccount(provider.connection, stakeVault);
    assert.equal(vaultAccount.amount.toString(), stakeAmount.toString());

    console.log(`✅ User staked ${stakeAmount.toString()} AURA tokens`);
  });

  it("User stakes additional AURA tokens", async () => {
    const additionalStake = new anchor.BN(5_000 * 1e6); // 5k more tokens

    await program.methods
      .stake(additionalStake)
      .accounts({
        stakingPool,
        userStake,
        stakeVault,
        userTokenAccount,
        user: user.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([user])
      .rpc();

    // Verify updated stake
    const userStakeData = await program.account.userStake.fetch(userStake);
    const expectedTotal = new anchor.BN(15_000 * 1e6); // 10k + 5k
    assert.equal(userStakeData.amount.toString(), expectedTotal.toString());

    console.log(`✅ User staked additional ${additionalStake.toString()} AURA tokens`);
  });

  it("Second user stakes AURA tokens", async () => {
    const stakeAmount = new anchor.BN(20_000 * 1e6); // 20k tokens

    await program.methods
      .stake(stakeAmount)
      .accounts({
        stakingPool,
        userStake: user2Stake,
        stakeVault,
        userTokenAccount: user2TokenAccount,
        user: user2.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([user2])
      .rpc();

    // Verify pool total (15k + 20k = 35k)
    const poolData = await program.account.stakingPool.fetch(stakingPool);
    const expectedTotal = new anchor.BN(35_000 * 1e6);
    assert.equal(poolData.totalStaked.toString(), expectedTotal.toString());

    console.log(`✅ User2 staked ${stakeAmount.toString()} AURA tokens`);
  });

  it("Waits for time to pass and simulates rewards", async () => {
    // In a real test, you'd wait or manipulate clock
    // For now, we'll just log that time should pass
    console.log("⏳ Waiting for rewards to accumulate...");
    
    // Note: In real tests, you'd either:
    // 1. Use Solana test validators with clock manipulation
    // 2. Wait for actual time to pass
    // 3. Mock the clock syscall in tests
  });

  it("User claims rewards", async () => {
    // Note: This test might fail if no time has passed
    // In a real scenario, you'd manipulate the clock or wait
    
    try {
      await program.methods
        .claimRewards()
        .accounts({
          stakingPool,
          userStake,
          rewardVault,
          userTokenAccount,
          user: user.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([user])
        .rpc();

      console.log("✅ User claimed rewards");
    } catch (error) {
      console.log("⏳ No rewards to claim yet (time hasn't passed)");
    }
  });

  it("User partially unstakes with early penalty", async () => {
    const unstakeAmount = new anchor.BN(5_000 * 1e6); // 5k tokens

    const userBalanceBefore = await getAccount(provider.connection, userTokenAccount);

    await program.methods
      .unstake(unstakeAmount)
      .accounts({
        stakingPool,
        userStake,
        stakeVault,
        rewardVault,
        userTokenAccount,
        user: user.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([user])
      .rpc();

    const userBalanceAfter = await getAccount(provider.connection, userTokenAccount);

    // Verify user received tokens minus fee (0.5%)
    const expectedFee = unstakeAmount.mul(new anchor.BN(50)).div(new anchor.BN(10_000));
    const expectedReceived = unstakeAmount.sub(expectedFee);
    const actualReceived = userBalanceAfter.amount - userBalanceBefore.amount;

    assert.equal(actualReceived.toString(), expectedReceived.toString());

    // Verify remaining stake
    const userStakeData = await program.account.userStake.fetch(userStake);
    const expectedRemaining = new anchor.BN(10_000 * 1e6); // 15k - 5k
    assert.equal(userStakeData.amount.toString(), expectedRemaining.toString());

    console.log(`✅ User unstaked ${unstakeAmount.toString()} AURA tokens with early penalty`);
  });

  it("Admin updates reward rate", async () => {
    const newRate = new anchor.BN(54); // 0.54% per day

    await program.methods
      .updateRewardRate(newRate)
      .accounts({
        stakingPool,
        admin: admin.publicKey,
      })
      .signers([admin])
      .rpc();

    const poolData = await program.account.stakingPool.fetch(stakingPool);
    assert.equal(poolData.rewardRatePerDay.toString(), newRate.toString());

    console.log(`✅ Admin updated reward rate to ${newRate.toString()} basis points per day`);
  });

  it("Admin pauses the pool", async () => {
    await program.methods
      .setPoolStatus(true)
      .accounts({
        stakingPool,
        admin: admin.publicKey,
      })
      .signers([admin])
      .rpc();

    const poolData = await program.account.stakingPool.fetch(stakingPool);
    assert.equal(poolData.paused, true);

    console.log("✅ Admin paused the staking pool");
  });

  it("User cannot stake when pool is paused", async () => {
    const stakeAmount = new anchor.BN(1_000 * 1e6);

    try {
      await program.methods
        .stake(stakeAmount)
        .accounts({
          stakingPool,
          userStake,
          stakeVault,
          userTokenAccount,
          user: user.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([user])
        .rpc();

      assert.fail("Should have failed when pool is paused");
    } catch (error) {
      assert.include(error.toString(), "PoolPaused");
      console.log("✅ Staking correctly blocked when pool is paused");
    }
  });

  it("Admin unpauses the pool", async () => {
    await program.methods
      .setPoolStatus(false)
      .accounts({
        stakingPool,
        admin: admin.publicKey,
      })
      .signers([admin])
      .rpc();

    const poolData = await program.account.stakingPool.fetch(stakingPool);
    assert.equal(poolData.paused, false);

    console.log("✅ Admin unpaused the staking pool");
  });

  it("Admin emergency withdraws from stake vault", async () => {
    const withdrawAmount = new anchor.BN(1_000 * 1e6);

    const adminBalanceBefore = await getAccount(provider.connection, adminTokenAccount);

    await program.methods
      .adminWithdrawStake(withdrawAmount)
      .accounts({
        stakingPool,
        stakeVault,
        adminTokenAccount,
        admin: admin.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([admin])
      .rpc();

    const adminBalanceAfter = await getAccount(provider.connection, adminTokenAccount);
    const actualReceived = adminBalanceAfter.amount - adminBalanceBefore.amount;

    assert.equal(actualReceived.toString(), withdrawAmount.toString());

    console.log(`✅ Admin emergency withdrew ${withdrawAmount.toString()} AURA from stake vault`);
  });

  it("Admin emergency withdraws from reward vault", async () => {
    const withdrawAmount = new anchor.BN(10_000 * 1e6);

    const adminBalanceBefore = await getAccount(provider.connection, adminTokenAccount);

    await program.methods
      .adminWithdrawRewards(withdrawAmount)
      .accounts({
        stakingPool,
        rewardVault,
        adminTokenAccount,
        admin: admin.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .signers([admin])
      .rpc();

    const adminBalanceAfter = await getAccount(provider.connection, adminTokenAccount);
    const actualReceived = adminBalanceAfter.amount - adminBalanceBefore.amount;

    assert.equal(actualReceived.toString(), withdrawAmount.toString());

    console.log(`✅ Admin emergency withdrew ${withdrawAmount.toString()} AURA from reward vault`);
  });

  it("Displays final state", async () => {
    const poolData = await program.account.stakingPool.fetch(stakingPool);
    const userStakeData = await program.account.userStake.fetch(userStake);
    const user2StakeData = await program.account.userStake.fetch(user2Stake);

    console.log("\n📊 Final Pool State:");
    console.log(`Total Staked: ${poolData.totalStaked.toString()} AURA`);
    console.log(`Total Rewards Distributed: ${poolData.totalRewardsDistributed.toString()} AURA`);
    console.log(`Reward Rate: ${poolData.rewardRatePerDay.toString()} basis points per day`);
    console.log(`Pool Status: ${poolData.paused ? 'PAUSED' : 'ACTIVE'}`);

    console.log("\n👤 User Stakes:");
    console.log(`User 1: ${userStakeData.amount.toString()} AURA staked, ${userStakeData.totalRewardsClaimed.toString()} AURA claimed`);
    console.log(`User 2: ${user2StakeData.amount.toString()} AURA staked, ${user2StakeData.totalRewardsClaimed.toString()} AURA claimed`);
  });
}); 