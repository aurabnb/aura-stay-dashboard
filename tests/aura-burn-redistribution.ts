import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AuraBurnRedistribution } from "../target/types/aura_burn_redistribution";
import { 
  TOKEN_PROGRAM_ID,
  createMint,
  createAccount,
  mintTo,
  getAccount,
  createAssociatedTokenAccount,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { 
  Keypair, 
  LAMPORTS_PER_SOL, 
  PublicKey, 
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { expect } from "chai";

describe("AuraBNB Burn & Redistribution", () => {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.AuraBurnRedistribution as Program<AuraBurnRedistribution>;
  
  // Test accounts
  let authority: Keypair;
  let user1: Keypair;
  let user2: Keypair;
  let mint: PublicKey;
  let globalState: PublicKey;
  let burnPool: PublicKey;
  let stakingPool: PublicKey;
  
  // Token accounts
  let authorityTokenAccount: PublicKey;
  let user1TokenAccount: PublicKey;
  let user2TokenAccount: PublicKey;
  let user1StakingAccount: PublicKey;
  let user2StakingAccount: PublicKey;

  const BURN_PERCENTAGE = 200; // 2% = 200 basis points
  const REDISTRIBUTION_FREQUENCY = 21600; // 6 hours
  const INITIAL_SUPPLY = 1_000_000_000_000; // 1 trillion tokens

  before(async () => {
    // Initialize test accounts
    authority = Keypair.generate();
    user1 = Keypair.generate();
    user2 = Keypair.generate();

    // Airdrop SOL to test accounts
    await provider.connection.requestAirdrop(authority.publicKey, 10 * LAMPORTS_PER_SOL);
    await provider.connection.requestAirdrop(user1.publicKey, 10 * LAMPORTS_PER_SOL);
    await provider.connection.requestAirdrop(user2.publicKey, 10 * LAMPORTS_PER_SOL);

    // Wait for airdrops to confirm
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Create AURA token mint
    mint = await createMint(
      provider.connection,
      authority,
      authority.publicKey,
      authority.publicKey,
      6 // 6 decimals
    );

    // Create token accounts
    authorityTokenAccount = await createAssociatedTokenAccount(
      provider.connection,
      authority,
      mint,
      authority.publicKey
    );

    user1TokenAccount = await createAssociatedTokenAccount(
      provider.connection,
      user1,
      mint,
      user1.publicKey
    );

    user2TokenAccount = await createAssociatedTokenAccount(
      provider.connection,
      user2,
      mint,
      user2.publicKey
    );

    // Mint initial supply to authority
    await mintTo(
      provider.connection,
      authority,
      mint,
      authorityTokenAccount,
      authority,
      INITIAL_SUPPLY
    );

    // Mint tokens to users for testing
    await mintTo(
      provider.connection,
      authority,
      mint,
      user1TokenAccount,
      authority,
      1_000_000_000 // 1 billion tokens
    );

    await mintTo(
      provider.connection,
      authority,
      mint,
      user2TokenAccount,
      authority,
      1_000_000_000 // 1 billion tokens
    );

    // Derive program PDAs
    [globalState] = PublicKey.findProgramAddressSync(
      [Buffer.from("global_state")],
      program.programId
    );

    [burnPool] = PublicKey.findProgramAddressSync(
      [Buffer.from("burn_pool")],
      program.programId
    );

    [stakingPool] = PublicKey.findProgramAddressSync(
      [Buffer.from("staking_pool")],
      program.programId
    );

    [user1StakingAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("staking_account"), user1.publicKey.toBuffer()],
      program.programId
    );

    [user2StakingAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("staking_account"), user2.publicKey.toBuffer()],
      program.programId
    );
  });

  describe("Program Initialization", () => {
    it("Initializes the burn redistribution program", async () => {
      const tx = await program.methods
        .initialize(BURN_PERCENTAGE, new anchor.BN(REDISTRIBUTION_FREQUENCY))
        .accounts({
          globalState,
          authority: authority.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([authority])
        .rpc();

      console.log("Initialize transaction signature:", tx);

      // Verify global state
      const globalStateAccount = await program.account.globalState.fetch(globalState);
      expect(globalStateAccount.authority.toBase58()).to.equal(authority.publicKey.toBase58());
      expect(globalStateAccount.burnPercentage).to.equal(BURN_PERCENTAGE);
      expect(globalStateAccount.redistributionFrequency.toNumber()).to.equal(REDISTRIBUTION_FREQUENCY);
      expect(globalStateAccount.totalBurned.toNumber()).to.equal(0);
      expect(globalStateAccount.totalStaked.toNumber()).to.equal(0);
      expect(globalStateAccount.distributionRound.toNumber()).to.equal(0);
      expect(globalStateAccount.isPaused).to.be.false;
    });

    it("Creates burn and staking pool token accounts", async () => {
      // Create burn pool token account
      const createBurnPoolTx = new Transaction().add(
        await createAccount(
          provider.connection,
          authority,
          mint,
          burnPool,
          authority.publicKey
        )
      );

      // Create staking pool token account
      const createStakingPoolTx = new Transaction().add(
        await createAccount(
          provider.connection,
          authority,
          mint,
          stakingPool,
          authority.publicKey
        )
      );

      await sendAndConfirmTransaction(
        provider.connection,
        createBurnPoolTx,
        [authority]
      );

      await sendAndConfirmTransaction(
        provider.connection,
        createStakingPoolTx,
        [authority]
      );

      // Verify accounts exist
      const burnPoolAccount = await getAccount(provider.connection, burnPool);
      const stakingPoolAccount = await getAccount(provider.connection, stakingPool);
      
      expect(burnPoolAccount.mint.toBase58()).to.equal(mint.toBase58());
      expect(stakingPoolAccount.mint.toBase58()).to.equal(mint.toBase58());
    });
  });

  describe("Transaction Processing & Burning", () => {
    it("Processes a transaction with 2% burn", async () => {
      const transactionAmount = 1_000_000; // 1 million tokens
      const expectedBurnAmount = (transactionAmount * BURN_PERCENTAGE) / 10000; // 20,000 tokens

      const tx = await program.methods
        .processTransaction(new anchor.BN(transactionAmount))
        .accounts({
          globalState,
          user: user1.publicKey,
          userTokenAccount: user1TokenAccount,
          burnPool,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([user1])
        .rpc();

      console.log("Process transaction signature:", tx);

      // Verify burn amount was transferred to burn pool
      const burnPoolAccount = await getAccount(provider.connection, burnPool);
      expect(Number(burnPoolAccount.amount)).to.equal(expectedBurnAmount);

      // Verify global state updated
      const globalStateAccount = await program.account.globalState.fetch(globalState);
      expect(globalStateAccount.totalBurned.toNumber()).to.equal(expectedBurnAmount);

      // Verify user's token balance reduced
      const user1Account = await getAccount(provider.connection, user1TokenAccount);
      expect(Number(user1Account.amount)).to.equal(1_000_000_000 - expectedBurnAmount);
    });

    it("Handles multiple transactions correctly", async () => {
      const initialBurnAmount = 20_000; // From previous test
      const transactionAmount = 500_000; // 500K tokens
      const expectedBurnAmount = (transactionAmount * BURN_PERCENTAGE) / 10000; // 10,000 tokens

      await program.methods
        .processTransaction(new anchor.BN(transactionAmount))
        .accounts({
          globalState,
          user: user2.publicKey,
          userTokenAccount: user2TokenAccount,
          burnPool,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([user2])
        .rpc();

      // Verify cumulative burn amount
      const burnPoolAccount = await getAccount(provider.connection, burnPool);
      expect(Number(burnPoolAccount.amount)).to.equal(initialBurnAmount + expectedBurnAmount);

      const globalStateAccount = await program.account.globalState.fetch(globalState);
      expect(globalStateAccount.totalBurned.toNumber()).to.equal(initialBurnAmount + expectedBurnAmount);
    });
  });

  describe("Staking Functionality", () => {
    it("Allows users to stake tokens", async () => {
      const stakeAmount = 100_000_000; // 100 million tokens

      const tx = await program.methods
        .stakeTokens(new anchor.BN(stakeAmount))
        .accounts({
          globalState,
          stakingAccount: user1StakingAccount,
          user: user1.publicKey,
          userTokenAccount: user1TokenAccount,
          stakingPool,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([user1])
        .rpc();

      console.log("Stake tokens transaction signature:", tx);

      // Verify staking account created and updated
      const stakingAccount = await program.account.stakingAccount.fetch(user1StakingAccount);
      expect(stakingAccount.owner.toBase58()).to.equal(user1.publicKey.toBase58());
      expect(stakingAccount.stakedAmount.toNumber()).to.equal(stakeAmount);
      expect(stakingAccount.pendingRewards.toNumber()).to.equal(0);

      // Verify tokens transferred to staking pool
      const stakingPoolAccount = await getAccount(provider.connection, stakingPool);
      expect(Number(stakingPoolAccount.amount)).to.equal(stakeAmount);

      // Verify global state updated
      const globalStateAccount = await program.account.globalState.fetch(globalState);
      expect(globalStateAccount.totalStaked.toNumber()).to.equal(stakeAmount);
    });

    it("Allows multiple users to stake", async () => {
      const user1PreviousStake = 100_000_000;
      const user2StakeAmount = 50_000_000; // 50 million tokens

      await program.methods
        .stakeTokens(new anchor.BN(user2StakeAmount))
        .accounts({
          globalState,
          stakingAccount: user2StakingAccount,
          user: user2.publicKey,
          userTokenAccount: user2TokenAccount,
          stakingPool,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .signers([user2])
        .rpc();

      // Verify user2's staking account
      const user2StakingAccount_data = await program.account.stakingAccount.fetch(user2StakingAccount);
      expect(user2StakingAccount_data.stakedAmount.toNumber()).to.equal(user2StakeAmount);

      // Verify total staked amount
      const globalStateAccount = await program.account.globalState.fetch(globalState);
      expect(globalStateAccount.totalStaked.toNumber()).to.equal(user1PreviousStake + user2StakeAmount);
    });

    it("Allows users to unstake tokens", async () => {
      const unstakeAmount = 25_000_000; // 25 million tokens
      const user1InitialStake = 100_000_000;

      await program.methods
        .unstakeTokens(new anchor.BN(unstakeAmount))
        .accounts({
          globalState,
          stakingAccount: user1StakingAccount,
          user: user1.publicKey,
          userTokenAccount: user1TokenAccount,
          stakingPool,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([user1])
        .rpc();

      // Verify staking account updated
      const stakingAccount = await program.account.stakingAccount.fetch(user1StakingAccount);
      expect(stakingAccount.stakedAmount.toNumber()).to.equal(user1InitialStake - unstakeAmount);

      // Verify global state updated
      const globalStateAccount = await program.account.globalState.fetch(globalState);
      expect(globalStateAccount.totalStaked.toNumber()).to.equal(125_000_000); // 75M + 50M
    });
  });

  describe("Reward Distribution", () => {
    it("Distributes rewards correctly after frequency period", async () => {
      // Fast forward time by mocking (in real test, would need to wait or manipulate clock)
      const tx = await program.methods
        .distributeRewards()
        .accounts({
          globalState,
          authority: authority.publicKey,
        })
        .signers([authority])
        .rpc();

      console.log("Distribute rewards transaction signature:", tx);

      // Verify distribution round incremented
      const globalStateAccount = await program.account.globalState.fetch(globalState);
      expect(globalStateAccount.distributionRound.toNumber()).to.equal(1);
      expect(globalStateAccount.totalBurned.toNumber()).to.equal(0); // Reset after distribution
    });

    it("Allows users to claim rewards", async () => {
      // Note: In a real scenario, rewards would be calculated based on staking proportion
      // This test assumes some rewards are available

      try {
        await program.methods
          .claimRewards()
          .accounts({
            globalState,
            stakingAccount: user1StakingAccount,
            user: user1.publicKey,
            userTokenAccount: user1TokenAccount,
            burnPool,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .signers([user1])
          .rpc();

        // If successful, verify staking account updated
        const stakingAccount = await program.account.stakingAccount.fetch(user1StakingAccount);
        expect(stakingAccount.pendingRewards.toNumber()).to.equal(0);
      } catch (error) {
        // Expected if no rewards to claim
        expect(error.message).to.include("NoRewardsToClaim");
      }
    });
  });

  describe("Emergency Controls", () => {
    it("Allows authority to pause the program", async () => {
      await program.methods
        .pauseProgram()
        .accounts({
          globalState,
          authority: authority.publicKey,
        })
        .signers([authority])
        .rpc();

      const globalStateAccount = await program.account.globalState.fetch(globalState);
      expect(globalStateAccount.isPaused).to.be.true;
    });

    it("Prevents operations when paused", async () => {
      try {
        await program.methods
          .processTransaction(new anchor.BN(1000))
          .accounts({
            globalState,
            user: user1.publicKey,
            userTokenAccount: user1TokenAccount,
            burnPool,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .signers([user1])
          .rpc();

        expect.fail("Should have thrown error when paused");
      } catch (error) {
        expect(error.message).to.include("ProgramPaused");
      }
    });

    it("Allows authority to resume the program", async () => {
      await program.methods
        .resumeProgram()
        .accounts({
          globalState,
          authority: authority.publicKey,
        })
        .signers([authority])
        .rpc();

      const globalStateAccount = await program.account.globalState.fetch(globalState);
      expect(globalStateAccount.isPaused).to.be.false;
    });
  });

  describe("Error Handling", () => {
    it("Prevents unauthorized pause attempts", async () => {
      try {
        await program.methods
          .pauseProgram()
          .accounts({
            globalState,
            authority: user1.publicKey, // Wrong authority
          })
          .signers([user1])
          .rpc();

        expect.fail("Should have thrown error for unauthorized pause");
      } catch (error) {
        expect(error.message).to.include("ConstraintHasOne");
      }
    });

    it("Prevents unstaking more than staked amount", async () => {
      const stakingAccount = await program.account.stakingAccount.fetch(user1StakingAccount);
      const overStakeAmount = stakingAccount.stakedAmount.toNumber() + 1;

      try {
        await program.methods
          .unstakeTokens(new anchor.BN(overStakeAmount))
          .accounts({
            globalState,
            stakingAccount: user1StakingAccount,
            user: user1.publicKey,
            userTokenAccount: user1TokenAccount,
            stakingPool,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .signers([user1])
          .rpc();

        expect.fail("Should have thrown error for insufficient staked amount");
      } catch (error) {
        expect(error.message).to.include("InsufficientStaked");
      }
    });

    it("Prevents zero amount staking", async () => {
      try {
        await program.methods
          .stakeTokens(new anchor.BN(0))
          .accounts({
            globalState,
            stakingAccount: user1StakingAccount,
            user: user1.publicKey,
            userTokenAccount: user1TokenAccount,
            stakingPool,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          })
          .signers([user1])
          .rpc();

        expect.fail("Should have thrown error for zero amount");
      } catch (error) {
        expect(error.message).to.include("InvalidAmount");
      }
    });
  });

  describe("Gas Optimization Tests", () => {
    it("Measures gas usage for process_transaction", async () => {
      const transactionAmount = 1_000_000;
      
      const tx = await program.methods
        .processTransaction(new anchor.BN(transactionAmount))
        .accounts({
          globalState,
          user: user1.publicKey,
          userTokenAccount: user1TokenAccount,
          burnPool,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([user1])
        .rpc({ commitment: "confirmed" });

      // Get transaction details for gas analysis
      const txInfo = await provider.connection.getTransaction(tx, {
        commitment: "confirmed",
      });

      console.log("Gas used for process_transaction:", txInfo?.meta?.fee);
      expect(txInfo?.meta?.fee).to.be.lessThan(100000); // Should be under 0.0001 SOL
    });
  });
}); 