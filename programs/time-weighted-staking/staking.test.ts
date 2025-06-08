import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TimeWeightedStaking } from "../../target/types/time_weighted_staking";
import {
  PublicKey,
  Keypair,
  SystemProgram,
  LAMPORTS_PER_SOL,
  Transaction,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  createMint,
  createAccount,
  mintTo,
  getAccount,
} from "@solana/spl-token";
import { assert, expect } from "chai";

describe("Time Weighted Staking", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.TimeWeightedStaking as Program<TimeWeightedStaking>;
  
  // Test accounts
  let authority: Keypair;
  let user1: Keypair;
  let user2: Keypair;
  let stakingPool: PublicKey;
  let poolTokenVault: PublicKey;
  let stakeTokenMint: PublicKey;
  let rewardTokenMint: PublicKey;
  let user1StakeTokenAccount: PublicKey;
  let user2StakeTokenAccount: PublicKey;
  let user1RewardTokenAccount: PublicKey;
  let user2RewardTokenAccount: PublicKey;
  let authorityStakeTokenAccount: PublicKey;
  let authorityRewardTokenAccount: PublicKey;
  let user1Stake: PublicKey;
  let user2Stake: PublicKey;
  let rewardVault: PublicKey;
  
  // PDA bumps
  let poolBump: number;
  let vaultBump: number;
  let user1StakeBump: number;
  let user2StakeBump: number;
  let rewardVaultBump: number;

  before(async () => {
    // Initialize test accounts
    authority = Keypair.generate();
    user1 = Keypair.generate();
    user2 = Keypair.generate();

    // Airdrop SOL to test accounts
    await provider.connection.requestAirdrop(authority.publicKey, 10 * LAMPORTS_PER_SOL);
    await provider.connection.requestAirdrop(user1.publicKey, 5 * LAMPORTS_PER_SOL);
    await provider.connection.requestAirdrop(user2.publicKey, 5 * LAMPORTS_PER_SOL);
    
    // Wait for airdrops
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create stake token mint
    stakeTokenMint = await createMint(
      provider.connection,
      authority,
      authority.publicKey,
      authority.publicKey,
      9 // 9 decimals
    );

    // Create reward token mint  
    rewardTokenMint = await createMint(
      provider.connection,
      authority,
      authority.publicKey,
      authority.publicKey,
      9
    );

    // Create token accounts
    user1StakeTokenAccount = await createAccount(
      provider.connection,
      user1,
      stakeTokenMint,
      user1.publicKey
    );

    user2StakeTokenAccount = await createAccount(
      provider.connection,
      user2,
      stakeTokenMint,
      user2.publicKey
    );

    user1RewardTokenAccount = await createAccount(
      provider.connection,
      user1,
      rewardTokenMint,
      user1.publicKey
    );

    user2RewardTokenAccount = await createAccount(
      provider.connection,
      user2,
      rewardTokenMint,
      user2.publicKey
    );

    authorityStakeTokenAccount = await createAccount(
      provider.connection,
      authority,
      stakeTokenMint,
      authority.publicKey
    );

    authorityRewardTokenAccount = await createAccount(
      provider.connection,
      authority,
      rewardTokenMint,
      authority.publicKey
    );

    // Mint tokens to users and authority
    await mintTo(
      provider.connection,
      authority,
      stakeTokenMint,
      user1StakeTokenAccount,
      authority,
      1000 * LAMPORTS_PER_SOL
    );

    await mintTo(
      provider.connection,
      authority,
      stakeTokenMint,
      user2StakeTokenAccount,
      authority,
      1000 * LAMPORTS_PER_SOL
    );

    await mintTo(
      provider.connection,
      authority,
      rewardTokenMint,
      authorityRewardTokenAccount,
      authority,
      10000 * LAMPORTS_PER_SOL
    );

    // Derive PDAs
    [stakingPool, poolBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("staking_pool")],
      program.programId
    );

    [poolTokenVault, vaultBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("pool_vault"), stakingPool.toBuffer()],
      program.programId
    );

    [user1Stake, user1StakeBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("user_stake"), user1.publicKey.toBuffer(), stakingPool.toBuffer()],
      program.programId
    );

    [user2Stake, user2StakeBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("user_stake"), user2.publicKey.toBuffer(), stakingPool.toBuffer()],
      program.programId
    );

    [rewardVault, rewardVaultBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("reward_vault"), stakingPool.toBuffer(), rewardTokenMint.toBuffer()],
      program.programId
    );
  });

  describe("Initialization", () => {
    it("Should initialize the staking pool", async () => {
      await program.methods
        .initializePool(authority.publicKey, stakeTokenMint, poolBump, vaultBump)
        .accounts({
          stakingPool,
          poolTokenVault,
          payer: authority.publicKey,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .signers([authority])
        .rpc();

      const poolAccount = await program.account.stakingPool.fetch(stakingPool);
      assert.equal(poolAccount.authority.toString(), authority.publicKey.toString());
      assert.equal(poolAccount.stakeTokenMint.toString(), stakeTokenMint.toString());
      assert.equal(poolAccount.totalStaked.toNumber(), 0);
      assert.equal(poolAccount.distributionActive, false);
      assert.equal(poolAccount.distributionEnded, false);
      assert.equal(poolAccount.currentDistributionEpoch.toNumber(), 0);
    });

    it("Should create reward vault", async () => {
      await program.methods
        .createRewardVault(rewardTokenMint, rewardVaultBump)
        .accounts({
          stakingPool,
          rewardVault,
          rewardTokenMint,
          authority: authority.publicKey,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .signers([authority])
        .rpc();

      const vaultAccount = await getAccount(provider.connection, rewardVault);
      assert.equal(vaultAccount.mint.toString(), rewardTokenMint.toString());
      assert.equal(vaultAccount.amount.toString(), "0");
    });
  });

  describe("Distribution Management", () => {
    it("Should start distribution", async () => {
      await program.methods
        .startDistribution()
        .accounts({
          stakingPool,
          authority: authority.publicKey,
        })
        .signers([authority])
        .rpc();

      const poolAccount = await program.account.stakingPool.fetch(stakingPool);
      assert.equal(poolAccount.distributionActive, true);
      assert.equal(poolAccount.currentDistributionEpoch.toNumber(), 1);
    });

    it("Should fail to start distribution when already active", async () => {
      try {
        await program.methods
          .startDistribution()
          .accounts({
            stakingPool,
            authority: authority.publicKey,
          })
          .signers([authority])
          .rpc();
        assert.fail("Should have failed");
      } catch (error) {
        assert.include(error.message, "DistributionAlreadyActive");
      }
    });
  });

  describe("Staking", () => {
    it("Should allow user1 to stake tokens", async () => {
      const stakeAmount = new anchor.BN(100 * LAMPORTS_PER_SOL);

      await program.methods
        .stake(stakeAmount)
        .accounts({
          stakingPool,
          userStake: user1Stake,
          poolTokenVault,
          userTokenAccount: user1StakeTokenAccount,
          user: user1.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([user1])
        .rpc();

      const userStakeAccount = await program.account.userStake.fetch(user1Stake);
      const poolAccount = await program.account.stakingPool.fetch(stakingPool);
      
      assert.equal(userStakeAccount.amount.toString(), stakeAmount.toString());
      assert.equal(userStakeAccount.isActive, true);
      assert.equal(poolAccount.totalStaked.toString(), stakeAmount.toString());
    });

    it("Should allow user2 to stake tokens", async () => {
      const stakeAmount = new anchor.BN(200 * LAMPORTS_PER_SOL);

      await program.methods
        .stake(stakeAmount)
        .accounts({
          stakingPool,
          userStake: user2Stake,
          poolTokenVault,
          userTokenAccount: user2StakeTokenAccount,
          user: user2.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([user2])
        .rpc();

      const userStakeAccount = await program.account.userStake.fetch(user2Stake);
      const poolAccount = await program.account.stakingPool.fetch(stakingPool);
      
      assert.equal(userStakeAccount.amount.toString(), stakeAmount.toString());
      assert.equal(poolAccount.totalStaked.toString(), (300 * LAMPORTS_PER_SOL).toString());
    });

    it("Should fail to stake when distribution ended", async () => {
      // First stop distribution
      await program.methods
        .stopDistribution()
        .accounts({
          stakingPool,
          authority: authority.publicKey,
        })
        .signers([authority])
        .rpc();

      // Then permanently end distribution
      await program.methods
        .endDistributionPermanently()
        .accounts({
          stakingPool,
          authority: authority.publicKey,
        })
        .signers([authority])
        .rpc();

      try {
        await program.methods
          .stake(new anchor.BN(50 * LAMPORTS_PER_SOL))
          .accounts({
            stakingPool,
            userStake: user1Stake,
            poolTokenVault,
            userTokenAccount: user1StakeTokenAccount,
            user: user1.publicKey,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .signers([user1])
          .rpc();
        assert.fail("Should have failed");
      } catch (error) {
        assert.include(error.message, "DistributionPermanentlyEnded");
      }
    });
  });

  describe("Unstaking", () => {
    before(async () => {
      // Reset for unstaking tests - restart distribution
      await program.methods
        .startDistribution()
        .accounts({
          stakingPool,
          authority: authority.publicKey,
        })
        .signers([authority])
        .rpc();
    });

    it("Should allow partial unstaking", async () => {
      const unstakeAmount = new anchor.BN(50 * LAMPORTS_PER_SOL);
      
      await program.methods
        .unstake(unstakeAmount)
        .accounts({
          stakingPool,
          userStake: user1Stake,
          poolTokenVault,
          userTokenAccount: user1StakeTokenAccount,
          user: user1.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([user1])
        .rpc();

      const userStakeAccount = await program.account.userStake.fetch(user1Stake);
      assert.equal(userStakeAccount.amount.toString(), (50 * LAMPORTS_PER_SOL).toString());
      assert.equal(userStakeAccount.isActive, true);
    });

    it("Should deactivate stake when fully unstaked", async () => {
      const remainingAmount = new anchor.BN(50 * LAMPORTS_PER_SOL);
      
      await program.methods
        .unstake(remainingAmount)
        .accounts({
          stakingPool,
          userStake: user1Stake,
          poolTokenVault,
          userTokenAccount: user1StakeTokenAccount,
          user: user1.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([user1])
        .rpc();

      const userStakeAccount = await program.account.userStake.fetch(user1Stake);
      assert.equal(userStakeAccount.amount.toNumber(), 0);
      assert.equal(userStakeAccount.isActive, false);
    });

    it("Should fail to unstake from inactive stake", async () => {
      try {
        await program.methods
          .unstake(new anchor.BN(10 * LAMPORTS_PER_SOL))
          .accounts({
            stakingPool,
            userStake: user1Stake,
            poolTokenVault,
            userTokenAccount: user1StakeTokenAccount,
            user: user1.publicKey,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .signers([user1])
          .rpc();
        assert.fail("Should have failed");
      } catch (error) {
        assert.include(error.message, "StakeNotActive");
      }
    });
  });

  describe("Reward Distribution", () => {
    before(async () => {
      // Stop distribution to allow reward deposits and claims
      await program.methods
        .stopDistribution()
        .accounts({
          stakingPool,
          authority: authority.publicKey,
        })
        .signers([authority])
        .rpc();
    });

    it("Should deposit SOL rewards", async () => {
      const rewardAmount = new anchor.BN(5 * LAMPORTS_PER_SOL);
      
      await program.methods
        .depositSolRewards(rewardAmount)
        .accounts({
          stakingPool,
          authority: authority.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([authority])
        .rpc();

      const poolAccount = await program.account.stakingPool.fetch(stakingPool);
      assert.equal(poolAccount.solRewardsAvailable.toString(), rewardAmount.toString());
    });

    it("Should deposit SPL token rewards", async () => {
      const rewardAmount = new anchor.BN(1000 * LAMPORTS_PER_SOL);
      
      await program.methods
        .depositSplRewards(rewardAmount)
        .accounts({
          stakingPool,
          rewardVault,
          authorityTokenAccount: authorityRewardTokenAccount,
          authority: authority.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([authority])
        .rpc();

      const vaultAccount = await getAccount(provider.connection, rewardVault);
      assert.equal(vaultAccount.amount.toString(), rewardAmount.toString());
    });

    it("Should allow claiming SOL rewards", async () => {
      const initialBalance = await provider.connection.getBalance(user2.publicKey);
      
      await program.methods
        .claimSolRewards()
        .accounts({
          stakingPool,
          userStake: user2Stake,
          user: user2.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([user2])
        .rpc();

      const finalBalance = await provider.connection.getBalance(user2.publicKey);
      assert.isTrue(finalBalance > initialBalance, "User should receive SOL rewards");

      const userStakeAccount = await program.account.userStake.fetch(user2Stake);
      assert.equal(userStakeAccount.hasClaimedEpoch.toNumber(), 2);
    });

    it("Should allow claiming SPL token rewards", async () => {
      const initialBalance = await getAccount(provider.connection, user2RewardTokenAccount);
      
      await program.methods
        .claimSplRewards()
        .accounts({
          stakingPool,
          userStake: user2Stake,
          rewardVault,
          userRewardAccount: user2RewardTokenAccount,
          user: user2.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([user2])
        .rpc();

      const finalBalance = await getAccount(provider.connection, user2RewardTokenAccount);
      assert.isTrue(finalBalance.amount > initialBalance.amount, "User should receive token rewards");
    });

    it("Should fail to claim rewards twice", async () => {
      try {
        await program.methods
          .claimSolRewards()
          .accounts({
            stakingPool,
            userStake: user2Stake,
            user: user2.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([user2])
          .rpc();
        assert.fail("Should have failed");
      } catch (error) {
        assert.include(error.message, "AlreadyClaimed");
      }
    });

    it("Should fail to claim during active distribution", async () => {
      // Start new distribution
      await program.methods
        .startDistribution()
        .accounts({
          stakingPool,
          authority: authority.publicKey,
        })
        .signers([authority])
        .rpc();

      try {
        await program.methods
          .claimSolRewards()
          .accounts({
            stakingPool,
            userStake: user2Stake,
            user: user2.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([user2])
          .rpc();
        assert.fail("Should have failed");
      } catch (error) {
        assert.include(error.message, "DistributionStillActive");
      }
    });
  });

  describe("Admin Functions", () => {
    before(async () => {
      // Stop distribution for admin functions
      await program.methods
        .stopDistribution()
        .accounts({
          stakingPool,
          authority: authority.publicKey,
        })
        .signers([authority])
        .rpc();
    });

    it("Should allow admin to withdraw SOL", async () => {
      const withdrawAmount = new anchor.BN(1 * LAMPORTS_PER_SOL);
      const initialBalance = await provider.connection.getBalance(authority.publicKey);
      
      await program.methods
        .adminWithdrawSol(withdrawAmount)
        .accounts({
          stakingPool,
          admin: authority.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([authority])
        .rpc();

      const finalBalance = await provider.connection.getBalance(authority.publicKey);
      assert.isTrue(finalBalance > initialBalance, "Admin should receive SOL");
    });

    it("Should allow admin to withdraw SPL tokens", async () => {
      const withdrawAmount = new anchor.BN(100 * LAMPORTS_PER_SOL);
      const initialBalance = await getAccount(provider.connection, authorityRewardTokenAccount);
      
      await program.methods
        .adminWithdrawSpl(withdrawAmount)
        .accounts({
          stakingPool,
          rewardVault,
          adminTokenAccount: authorityRewardTokenAccount,
          admin: authority.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([authority])
        .rpc();

      const finalBalance = await getAccount(provider.connection, authorityRewardTokenAccount);
      assert.isTrue(finalBalance.amount > initialBalance.amount, "Admin should receive tokens");
    });

    it("Should allow admin to withdraw staked tokens", async () => {
      const withdrawAmount = new anchor.BN(50 * LAMPORTS_PER_SOL);
      const initialBalance = await getAccount(provider.connection, authorityStakeTokenAccount);
      
      await program.methods
        .adminWithdrawStakeTokens(withdrawAmount)
        .accounts({
          stakingPool,
          poolTokenVault,
          adminTokenAccount: authorityStakeTokenAccount,
          admin: authority.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([authority])
        .rpc();

      const finalBalance = await getAccount(provider.connection, authorityStakeTokenAccount);
      assert.isTrue(finalBalance.amount > initialBalance.amount, "Admin should receive staked tokens");
    });

    it("Should fail admin withdrawal for non-authority", async () => {
      try {
        await program.methods
          .adminWithdrawSol(new anchor.BN(1 * LAMPORTS_PER_SOL))
          .accounts({
            stakingPool,
            admin: user1.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([user1])
          .rpc();
        assert.fail("Should have failed");
      } catch (error) {
        assert.include(error.message, "ConstraintRaw");
      }
    });
  });

  describe("Security Features", () => {
    it("Should prevent operations after permanent end", async () => {
      await program.methods
        .endDistributionPermanently()
        .accounts({
          stakingPool,
          authority: authority.publicKey,
        })
        .signers([authority])
        .rpc();

      const poolAccount = await program.account.stakingPool.fetch(stakingPool);
      assert.equal(poolAccount.distributionEnded, true);

      // Try to start distribution - should fail
      try {
        await program.methods
          .startDistribution()
          .accounts({
            stakingPool,
            authority: authority.publicKey,
          })
          .signers([authority])
          .rpc();
        assert.fail("Should have failed");
      } catch (error) {
        assert.include(error.message, "DistributionPermanentlyEnded");
      }
    });

    it("Should update sequence numbers for replay protection", async () => {
      const poolAccount = await program.account.stakingPool.fetch(stakingPool);
      const userStakeAccount = await program.account.userStake.fetch(user2Stake);
      
      // Both should have sequence numbers > 0
      assert.isTrue(poolAccount.globalSequence.toNumber() > 0);
      assert.isTrue(userStakeAccount.lastActionSequence.toNumber() > 0);
    });
  });

  describe("Edge Cases", () => {
    it("Should handle zero amounts gracefully", async () => {
      try {
        await program.methods
          .depositSolRewards(new anchor.BN(0))
          .accounts({
            stakingPool,
            authority: authority.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([authority])
          .rpc();
        assert.fail("Should have failed");
      } catch (error) {
        assert.include(error.message, "InvalidAmount");
      }
    });

    it("Should handle insufficient balance withdrawals", async () => {
      try {
        await program.methods
          .adminWithdrawSol(new anchor.BN(1000 * LAMPORTS_PER_SOL))
          .accounts({
            stakingPool,
            admin: authority.publicKey,
            systemProgram: SystemProgram.programId,
          })
          .signers([authority])
          .rpc();
        assert.fail("Should have failed");
      } catch (error) {
        assert.include(error.message, "InsufficientBalance");
      }
    });
  });
}); 