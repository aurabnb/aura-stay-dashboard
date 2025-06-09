use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("35C2x1zY4b1z5Gv2RhTf1rG3jc7UKzbjgSgv6Ww8ixeJ");

// Security audit constants
const MAX_STAKE_AMOUNT: u64 = 1_000_000_000_000; // 1M tokens max per stake
const MAX_UNSTAKE_FEE_BASIS_POINTS: u64 = 500; // 5% max fee
const MIN_LOCK_PERIOD_DAYS: i64 = 30; // 30 days minimum lock

#[program]
pub mod time_weighted_staking {
    use super::*;

    /// Initialize the staking pool
    pub fn initialize_pool(
        ctx: Context<InitializePool>,
        authority: Pubkey,
        bump: u8,
        vault_bump: u8,
    ) -> Result<()> {
        let pool = &mut ctx.accounts.staking_pool;
        pool.authority = authority;
        pool.stake_token_mint = ctx.accounts.stake_token_mint.key();
        pool.total_staked = 0;
        pool.total_weighted_stake = 0;
        pool.last_reward_distribution = Clock::get()?.unix_timestamp;
        pool.bump = bump;
        pool.vault_bump = vault_bump;
        pool.sol_rewards_available = 0;
        pool.distribution_active = false;
        pool.distribution_ended = false;
        pool.current_distribution_epoch = 0;
        pool.global_sequence = Clock::get()?.slot;
        pool.paused = false;
        pool.created_at = Clock::get()?.unix_timestamp;
        pool.total_fees_collected = 0;
        
        msg!("Staking pool initialized with authority: {}", authority);
        Ok(())
    }

    /// ADMIN ONLY: Pause the staking pool (emergency function)
    pub fn pause_pool(ctx: Context<PausePool>) -> Result<()> {
        let pool = &mut ctx.accounts.staking_pool;
        
        require!(!pool.paused, StakingError::AlreadyPaused);
        
        pool.paused = true;
        pool.global_sequence = Clock::get()?.slot;
        
        emit!(PoolPaused {
            pool: pool.key(),
            authority: ctx.accounts.authority.key(),
            timestamp: Clock::get()?.unix_timestamp,
        });
        
        msg!("Staking pool paused by authority: {}", ctx.accounts.authority.key());
        Ok(())
    }

    /// ADMIN ONLY: Unpause the staking pool
    pub fn unpause_pool(ctx: Context<UnpausePool>) -> Result<()> {
        let pool = &mut ctx.accounts.staking_pool;
        
        require!(pool.paused, StakingError::NotPaused);
        
        pool.paused = false;
        pool.global_sequence = Clock::get()?.slot;
        
        emit!(PoolUnpaused {
            pool: pool.key(),
            authority: ctx.accounts.authority.key(),
            timestamp: Clock::get()?.unix_timestamp,
        });
        
        msg!("Staking pool unpaused by authority: {}", ctx.accounts.authority.key());
        Ok(())
    }

    /// ADMIN ONLY: Transfer pool authority (security audit improvement)
    pub fn transfer_authority(
        ctx: Context<TransferAuthority>,
        new_authority: Pubkey,
    ) -> Result<()> {
        let pool = &mut ctx.accounts.staking_pool;
        let old_authority = pool.authority;
        
        require!(new_authority != Pubkey::default(), StakingError::InvalidAuthority);
        require!(new_authority != old_authority, StakingError::SameAuthority);
        
        pool.authority = new_authority;
        pool.global_sequence = Clock::get()?.slot;
        
        emit!(AuthorityTransferred {
            pool: pool.key(),
            old_authority,
            new_authority,
            timestamp: Clock::get()?.unix_timestamp,
        });
        
        msg!("Pool authority transferred from {} to {}", old_authority, new_authority);
        Ok(())
    }

    /// ADMIN ONLY: Start reward distribution
    pub fn start_distribution(ctx: Context<StartDistribution>) -> Result<()> {
        let pool = &mut ctx.accounts.staking_pool;
        let current_time = Clock::get()?.unix_timestamp;

        require!(!pool.paused, StakingError::PoolPaused);
        require!(!pool.distribution_active, StakingError::DistributionAlreadyActive);
        require!(!pool.distribution_ended, StakingError::DistributionPermanentlyEnded);

        pool.distribution_active = true;
        pool.last_reward_distribution = current_time;
        pool.current_distribution_epoch = pool.current_distribution_epoch
            .checked_add(1)
            .ok_or(StakingError::MathOverflow)?;
        pool.global_sequence = Clock::get()?.slot;
        
        pool.total_weighted_stake = 0;

        emit!(DistributionStarted {
            pool: pool.key(),
            epoch: pool.current_distribution_epoch,
            timestamp: current_time,
        });

        msg!("Reward distribution started for epoch: {}", pool.current_distribution_epoch);
        Ok(())
    }

    /// ADMIN ONLY: Stop reward distribution
    pub fn stop_distribution(ctx: Context<StopDistribution>) -> Result<()> {
        let pool = &mut ctx.accounts.staking_pool;
        let current_time = Clock::get()?.unix_timestamp;

        require!(!pool.paused, StakingError::PoolPaused);
        require!(pool.distribution_active, StakingError::DistributionNotActive);
        require!(!pool.distribution_ended, StakingError::DistributionPermanentlyEnded);

        if pool.total_staked > 0 {
            let time_diff = current_time
                .checked_sub(pool.last_reward_distribution)
                .ok_or(StakingError::MathOverflow)?;
            let weighted_addition = pool.total_staked
                .checked_mul(time_diff as u64)
                .ok_or(StakingError::MathOverflow)?;
            pool.total_weighted_stake = pool.total_weighted_stake
                .checked_add(weighted_addition)
                .ok_or(StakingError::MathOverflow)?;
        }
        
        pool.distribution_active = false;
        pool.global_sequence = Clock::get()?.slot;

        emit!(DistributionStopped {
            pool: pool.key(),
            epoch: pool.current_distribution_epoch,
            total_weighted_stake: pool.total_weighted_stake,
            timestamp: current_time,
        });

        msg!("Reward distribution stopped for epoch: {}", pool.current_distribution_epoch);
        Ok(())
    }

    /// ADMIN ONLY: Permanently end distribution
    pub fn end_distribution_permanently(ctx: Context<EndDistributionPermanently>) -> Result<()> {
        let pool = &mut ctx.accounts.staking_pool;
        
        require!(!pool.distribution_active, StakingError::DistributionStillActive);
        require!(!pool.distribution_ended, StakingError::DistributionPermanentlyEnded);
        
        pool.distribution_ended = true;
        pool.global_sequence = Clock::get()?.slot;
        
        emit!(DistributionEndedPermanently {
            pool: pool.key(),
            final_epoch: pool.current_distribution_epoch,
            timestamp: Clock::get()?.unix_timestamp,
        });
        
        msg!("Distribution permanently ended - no new epochs can start");
        Ok(())
    }

    /// Stake tokens with enhanced security
    pub fn stake(ctx: Context<Stake>, amount: u64) -> Result<()> {
        require!(amount > 0, StakingError::InvalidAmount);
        require!(amount <= MAX_STAKE_AMOUNT, StakingError::ExceedsMaxStake);
        
        let pool = &mut ctx.accounts.staking_pool;
        let user_stake = &mut ctx.accounts.user_stake;
        let current_time = Clock::get()?.unix_timestamp;
        let current_slot = Clock::get()?.slot;

        require!(!pool.paused, StakingError::PoolPaused);
        require!(!pool.distribution_ended, StakingError::DistributionPermanentlyEnded);
        require!(current_slot > user_stake.last_action_sequence, StakingError::ReplayAttack);
        
        let new_user_amount = user_stake.amount
            .checked_add(amount)
            .ok_or(StakingError::MathOverflow)?;
        let new_total_staked = pool.total_staked
            .checked_add(amount)
            .ok_or(StakingError::MathOverflow)?;

        if pool.distribution_active {
            let time_diff = current_time
                .checked_sub(pool.last_reward_distribution)
                .ok_or(StakingError::MathOverflow)?;
            let weighted_addition = pool.total_staked
                .checked_mul(time_diff as u64)
                .ok_or(StakingError::MathOverflow)?;
            pool.total_weighted_stake = pool.total_weighted_stake
                .checked_add(weighted_addition)
                .ok_or(StakingError::MathOverflow)?;
            pool.last_reward_distribution = current_time;
            
            if user_stake.amount > 0 {
                let user_time_diff = current_time
                    .checked_sub(user_stake.last_stake_time)
                    .ok_or(StakingError::MathOverflow)?;
                let user_weighted_addition = user_stake.amount
                    .checked_mul(user_time_diff as u64)
                    .ok_or(StakingError::MathOverflow)?;
                user_stake.weighted_stake = user_stake.weighted_stake
                    .checked_add(user_weighted_addition)
                    .ok_or(StakingError::MathOverflow)?;
            }
        }

        let cpi_accounts = Transfer {
            from: ctx.accounts.user_token_account.to_account_info(),
            to: ctx.accounts.pool_token_vault.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, amount)?;

        user_stake.amount = new_user_amount;
        user_stake.last_stake_time = current_time;
        user_stake.lock_start_time = current_time;
        user_stake.owner = ctx.accounts.user.key();
        user_stake.distribution_epoch = pool.current_distribution_epoch;
        user_stake.last_action_sequence = current_slot;
        user_stake.is_active = true;

        pool.total_staked = new_total_staked;
        pool.global_sequence = current_slot;

        emit!(TokensStaked {
            pool: pool.key(),
            user: ctx.accounts.user.key(),
            amount,
            new_total: new_user_amount,
            epoch: pool.current_distribution_epoch,
            timestamp: current_time,
        });

        msg!("User {} staked {} tokens", ctx.accounts.user.key(), amount);
        Ok(())
    }

    /// Unstake tokens with penalties and enhanced security
    pub fn unstake(ctx: Context<Unstake>, amount: u64) -> Result<()> {
        require!(amount > 0, StakingError::InvalidAmount);
        
        let staking_pool_key = ctx.accounts.staking_pool.key();
        let pool = &mut ctx.accounts.staking_pool;
        let user_stake = &mut ctx.accounts.user_stake;
        let current_time = Clock::get()?.unix_timestamp;
        let current_slot = Clock::get()?.slot;

        require!(!pool.paused, StakingError::PoolPaused);
        require!(user_stake.amount >= amount, StakingError::InsufficientStake);
        require!(user_stake.is_active, StakingError::StakeNotActive);
        require!(current_slot > user_stake.last_action_sequence, StakingError::ReplayAttack);

        let remaining_amount = user_stake.amount
            .checked_sub(amount)
            .ok_or(StakingError::MathOverflow)?;
        let new_total_staked = pool.total_staked
            .checked_sub(amount)
            .ok_or(StakingError::MathOverflow)?;

        if pool.distribution_active {
            let time_diff = current_time
                .checked_sub(pool.last_reward_distribution)
                .ok_or(StakingError::MathOverflow)?;
            let weighted_addition = pool.total_staked
                .checked_mul(time_diff as u64)
                .ok_or(StakingError::MathOverflow)?;
            pool.total_weighted_stake = pool.total_weighted_stake
                .checked_add(weighted_addition)
                .ok_or(StakingError::MathOverflow)?;
            pool.last_reward_distribution = current_time;
            
            if user_stake.amount > 0 {
                let user_time_diff = current_time
                    .checked_sub(user_stake.last_stake_time)
                    .ok_or(StakingError::MathOverflow)?;
                let user_weighted_addition = user_stake.amount
                    .checked_mul(user_time_diff as u64)
                    .ok_or(StakingError::MathOverflow)?;
                user_stake.weighted_stake = user_stake.weighted_stake
                    .checked_add(user_weighted_addition)
                    .ok_or(StakingError::MathOverflow)?;
            }
        }

        let lock_period_days = current_time
            .checked_sub(user_stake.lock_start_time)
            .ok_or(StakingError::MathOverflow)?
            .checked_div(86400)
            .unwrap_or(0);
        let is_early_unstake = lock_period_days < MIN_LOCK_PERIOD_DAYS;
        
        let unstake_fee = amount
            .saturating_mul(5)
            .saturating_div(1000)
            .min(amount.saturating_mul(MAX_UNSTAKE_FEE_BASIS_POINTS).saturating_div(10000));
        let amount_after_fee = amount.saturating_sub(unstake_fee);

        let penalty = if is_early_unstake && pool.distribution_active {
            let user_rewards = calculate_user_rewards(pool, user_stake, current_time)?;
            let calculated_penalty = user_rewards.saturating_mul(5).saturating_div(100);
            user_stake.penalty_amount = user_stake.penalty_amount
                .checked_add(calculated_penalty)
                .ok_or(StakingError::MathOverflow)?;
            calculated_penalty
        } else {
            0
        };

        let seeds = &[
            b"pool_vault".as_ref(),
            staking_pool_key.as_ref(),
            &[pool.vault_bump],
        ];
        let signer_seeds = &[&seeds[..]];

        let cpi_accounts = Transfer {
            from: ctx.accounts.pool_token_vault.to_account_info(),
            to: ctx.accounts.user_token_account.to_account_info(),
            authority: ctx.accounts.pool_token_vault.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);
        token::transfer(cpi_ctx, amount_after_fee)?;

        user_stake.amount = remaining_amount;
        user_stake.last_stake_time = current_time;
        user_stake.last_action_sequence = current_slot;
        
        if user_stake.amount == 0 {
            user_stake.is_active = false;
        }

        pool.total_staked = new_total_staked;
        pool.total_fees_collected = pool.total_fees_collected
            .checked_add(unstake_fee)
            .ok_or(StakingError::MathOverflow)?;
        pool.global_sequence = current_slot;

        emit!(TokensUnstaked {
            pool: pool.key(),
            user: ctx.accounts.user.key(),
            amount,
            fee: unstake_fee,
            penalty,
            remaining_stake: remaining_amount,
            timestamp: current_time,
        });

        msg!("User {} unstaked {} tokens (fee: {}, penalty: {})", 
             ctx.accounts.user.key(), amount_after_fee, unstake_fee, penalty);
        Ok(())
    }

    /// Claim SOL rewards (enhanced security)
    pub fn claim_sol_rewards(ctx: Context<ClaimSolRewards>) -> Result<()> {
        let staking_pool_info = ctx.accounts.staking_pool.to_account_info();
        let user_info = ctx.accounts.user.to_account_info();
        
        let pool = &mut ctx.accounts.staking_pool;
        let user_stake = &mut ctx.accounts.user_stake;
        let current_time = Clock::get()?.unix_timestamp;
        let current_slot = Clock::get()?.slot;

        require!(!pool.paused, StakingError::PoolPaused);
        require!(user_stake.amount > 0, StakingError::NoStake);
        require!(user_stake.is_active, StakingError::StakeNotActive);
        require!(pool.current_distribution_epoch > user_stake.has_claimed_epoch, StakingError::AlreadyClaimed);
        require!(!pool.distribution_active || pool.distribution_ended, StakingError::DistributionStillActive);
        require!(current_slot > user_stake.last_action_sequence, StakingError::ReplayAttack);

        let user_sol_rewards = if pool.total_weighted_stake > 0 && pool.sol_rewards_available > 0 {
            pool.sol_rewards_available
                .checked_mul(user_stake.weighted_stake)
                .ok_or(StakingError::MathOverflow)?
                .checked_div(pool.total_weighted_stake)
                .unwrap_or(0)
        } else {
            0
        };

        if user_sol_rewards > 0 {
            let pool_lamports = staking_pool_info.lamports();
            require!(pool_lamports >= user_sol_rewards, StakingError::InsufficientBalance);
            
            **staking_pool_info.try_borrow_mut_lamports()? = pool_lamports
                .checked_sub(user_sol_rewards)
                .ok_or(StakingError::MathOverflow)?;
            **user_info.try_borrow_mut_lamports()? = user_info.lamports()
                .checked_add(user_sol_rewards)
                .ok_or(StakingError::MathOverflow)?;

            pool.sol_rewards_available = pool.sol_rewards_available
                .checked_sub(user_sol_rewards)
                .ok_or(StakingError::MathOverflow)?;
        }
            
        user_stake.has_claimed_epoch = pool.current_distribution_epoch;
        user_stake.last_action_sequence = current_slot;
        pool.global_sequence = current_slot;

        emit!(SolRewardsClaimed {
            pool: pool.key(),
            user: ctx.accounts.user.key(),
            amount: user_sol_rewards,
            epoch: pool.current_distribution_epoch,
            timestamp: current_time,
        });

        msg!("User {} claimed {} SOL rewards", ctx.accounts.user.key(), user_sol_rewards);
        Ok(())
    }

    /// Claim SPL token rewards (enhanced security)
    pub fn claim_spl_rewards(ctx: Context<ClaimSplRewards>) -> Result<()> {
        let staking_pool_key = ctx.accounts.staking_pool.key();
        let pool = &mut ctx.accounts.staking_pool;
        let user_stake = &mut ctx.accounts.user_stake;
        let current_time = Clock::get()?.unix_timestamp;
        let current_slot = Clock::get()?.slot;

        require!(!pool.paused, StakingError::PoolPaused);
        require!(user_stake.amount > 0, StakingError::NoStake);
        require!(user_stake.is_active, StakingError::StakeNotActive);
        require!(pool.current_distribution_epoch > user_stake.has_claimed_epoch, StakingError::AlreadyClaimed);
        require!(!pool.distribution_active || pool.distribution_ended, StakingError::DistributionStillActive);
        require!(current_slot > user_stake.last_action_sequence, StakingError::ReplayAttack);

        let vault_balance = ctx.accounts.reward_vault.amount;
        let user_rewards = if pool.total_weighted_stake > 0 && vault_balance > 0 {
            vault_balance
                .checked_mul(user_stake.weighted_stake)
                .ok_or(StakingError::MathOverflow)?
                .checked_div(pool.total_weighted_stake)
                .unwrap_or(0)
        } else {
            0
        };

        if user_rewards > 0 {
            let (_, bump) = Pubkey::find_program_address(
                &[
                    b"reward_vault".as_ref(),
                    staking_pool_key.as_ref(),
                    ctx.accounts.reward_vault.mint.as_ref(),
                ],
                ctx.program_id,
            );

            let seeds = &[
                b"reward_vault".as_ref(),
                staking_pool_key.as_ref(),
                ctx.accounts.reward_vault.mint.as_ref(),
                &[bump],
            ];
            let signer_seeds = &[&seeds[..]];

            let cpi_accounts = Transfer {
                from: ctx.accounts.reward_vault.to_account_info(),
                to: ctx.accounts.user_reward_account.to_account_info(),
                authority: ctx.accounts.reward_vault.to_account_info(),
            };
            let cpi_program = ctx.accounts.token_program.to_account_info();
            let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);
            token::transfer(cpi_ctx, user_rewards)?;
        }

        user_stake.has_claimed_epoch = pool.current_distribution_epoch;
        user_stake.last_action_sequence = current_slot;
        pool.global_sequence = current_slot;

        emit!(SplRewardsClaimed {
            pool: pool.key(),
            user: ctx.accounts.user.key(),
            token_mint: ctx.accounts.reward_vault.mint,
            amount: user_rewards,
            epoch: pool.current_distribution_epoch,
            timestamp: current_time,
        });

        msg!("User {} claimed {} SPL token rewards", ctx.accounts.user.key(), user_rewards);
        Ok(())
    }

    /// ADMIN ONLY: Deposit SOL rewards for distribution
    pub fn deposit_sol_rewards(ctx: Context<DepositSolRewards>, amount: u64) -> Result<()> {
        require!(amount > 0, StakingError::InvalidAmount);
        
        let authority_info = ctx.accounts.authority.to_account_info();
        let staking_pool_info = ctx.accounts.staking_pool.to_account_info();
        let pool = &mut ctx.accounts.staking_pool;

        **authority_info.try_borrow_mut_lamports()? = authority_info.lamports()
            .checked_sub(amount)
            .ok_or(StakingError::InsufficientBalance)?;
        **staking_pool_info.try_borrow_mut_lamports()? = staking_pool_info.lamports()
            .checked_add(amount)
            .ok_or(StakingError::MathOverflow)?;

        pool.sol_rewards_available = pool.sol_rewards_available
            .checked_add(amount)
            .ok_or(StakingError::MathOverflow)?;

        msg!("Deposited {} SOL as rewards", amount);
        Ok(())
    }

    /// ADMIN ONLY: Deposit SPL token rewards for distribution
    pub fn deposit_spl_rewards(ctx: Context<DepositSplRewards>, amount: u64) -> Result<()> {
        require!(amount > 0, StakingError::InvalidAmount);

        let cpi_accounts = Transfer {
            from: ctx.accounts.authority_token_account.to_account_info(),
            to: ctx.accounts.reward_vault.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, amount)?;

        msg!("Deposited {} SPL tokens as rewards", amount);
        Ok(())
    }

    /// ADMIN ONLY: Create reward vault for new token
    pub fn create_reward_vault(
        _ctx: Context<CreateRewardVault>,
        _reward_token_mint: Pubkey,
        _bump: u8,
    ) -> Result<()> {
        msg!("Reward vault created successfully");
        Ok(())
    }

    /// ADMIN ONLY: Emergency withdraw SOL
    pub fn admin_withdraw_sol(ctx: Context<AdminWithdrawSol>, amount: u64) -> Result<()> {
        require!(amount > 0, StakingError::InvalidAmount);
        
        let staking_pool_info = ctx.accounts.staking_pool.to_account_info();
        let admin_info = ctx.accounts.admin.to_account_info();
        let pool_lamports = staking_pool_info.lamports();
        let pool = &mut ctx.accounts.staking_pool;
        
        require!(pool_lamports >= amount, StakingError::InsufficientBalance);

        **staking_pool_info.try_borrow_mut_lamports()? = pool_lamports
            .checked_sub(amount)
            .ok_or(StakingError::MathOverflow)?;
        **admin_info.try_borrow_mut_lamports()? = admin_info.lamports()
            .checked_add(amount)
            .ok_or(StakingError::MathOverflow)?;

        if pool.sol_rewards_available >= amount {
            pool.sol_rewards_available = pool.sol_rewards_available
                .checked_sub(amount)
                .ok_or(StakingError::MathOverflow)?;
        }

        msg!("Admin withdrew {} SOL", amount);
        Ok(())
    }

    /// ADMIN ONLY: Emergency withdraw SPL tokens
    pub fn admin_withdraw_spl(ctx: Context<AdminWithdrawSpl>, amount: u64) -> Result<()> {
        require!(amount > 0, StakingError::InvalidAmount);
        
        let staking_pool_key = ctx.accounts.staking_pool.key();
        let vault_balance = ctx.accounts.reward_vault.amount;
        require!(vault_balance >= amount, StakingError::InsufficientBalance);

        let (_, bump) = Pubkey::find_program_address(
            &[
                b"reward_vault".as_ref(),
                staking_pool_key.as_ref(),
                ctx.accounts.reward_vault.mint.as_ref(),
            ],
            ctx.program_id,
        );

        let seeds = &[
            b"reward_vault".as_ref(),
            staking_pool_key.as_ref(),
            ctx.accounts.reward_vault.mint.as_ref(),
            &[bump],
        ];
        let signer_seeds = &[&seeds[..]];

        let cpi_accounts = Transfer {
            from: ctx.accounts.reward_vault.to_account_info(),
            to: ctx.accounts.admin_token_account.to_account_info(),
            authority: ctx.accounts.reward_vault.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);
        token::transfer(cpi_ctx, amount)?;

        msg!("Admin withdrew {} SPL tokens", amount);
        Ok(())
    }

    /// ADMIN ONLY: Emergency withdraw staked tokens
    pub fn admin_withdraw_stake_tokens(ctx: Context<AdminWithdrawStakeTokens>, amount: u64) -> Result<()> {
        require!(amount > 0, StakingError::InvalidAmount);
        
        let staking_pool_key = ctx.accounts.staking_pool.key();
        let pool = &mut ctx.accounts.staking_pool;
        let vault_balance = ctx.accounts.pool_token_vault.amount;
        require!(vault_balance >= amount, StakingError::InsufficientBalance);

        let seeds = &[
            b"pool_vault".as_ref(),
            staking_pool_key.as_ref(),
            &[pool.vault_bump],
        ];
        let signer_seeds = &[&seeds[..]];

        let cpi_accounts = Transfer {
            from: ctx.accounts.pool_token_vault.to_account_info(),
            to: ctx.accounts.admin_token_account.to_account_info(),
            authority: ctx.accounts.pool_token_vault.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);
        token::transfer(cpi_ctx, amount)?;

        if pool.total_staked >= amount {
            pool.total_staked = pool.total_staked
                .checked_sub(amount)
                .ok_or(StakingError::MathOverflow)?;
        }

        msg!("Admin withdrew {} staked tokens", amount);
        Ok(())
    }
}

// Helper function for reward calculations
fn calculate_user_rewards(
    pool: &StakingPool,
    user_stake: &UserStake,
    current_time: i64,
) -> Result<u64> {
    if pool.total_weighted_stake == 0 || !pool.distribution_active {
        return Ok(0);
    }

    let time_diff = current_time
        .checked_sub(user_stake.last_stake_time)
        .ok_or(StakingError::MathOverflow)?;
    let user_weighted_stake = user_stake.weighted_stake
        .checked_add(
            user_stake.amount
                .checked_mul(time_diff as u64)
                .ok_or(StakingError::MathOverflow)?
        )
        .ok_or(StakingError::MathOverflow)?;
      
    let reward_share = user_weighted_stake
        .checked_mul(1000000)
        .unwrap_or(0)
        .checked_div(pool.total_weighted_stake)
        .unwrap_or(0);

    Ok(reward_share)
}

#[derive(Accounts)]
#[instruction(authority: Pubkey, bump: u8, vault_bump: u8)]
pub struct InitializePool<'info> {
    #[account(
        init,
        payer = payer,
        space = 8 + 32 + 32 + 8 + 8 + 8 + 1 + 1 + 8 + 1 + 1 + 8 + 8 + 1 + 8 + 8,
        seeds = [b"staking_pool"],
        bump
    )]
    pub staking_pool: Account<'info, StakingPool>,
    
    #[account(
        init,
        payer = payer,
        token::mint = stake_token_mint,
        token::authority = pool_token_vault,
        seeds = [b"pool_vault", staking_pool.key().as_ref()],
        bump
    )]
    pub pool_token_vault: Account<'info, TokenAccount>,
    
    pub stake_token_mint: Account<'info, anchor_spl::token::Mint>,
    
    #[account(mut)]
    pub payer: Signer<'info>,
    
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct Stake<'info> {
    #[account(mut)]
    pub staking_pool: Account<'info, StakingPool>,
    
    #[account(
        init_if_needed,
        payer = user,
        space = 8 + 32 + 8 + 8 + 8 + 8 + 8 + 8 + 8 + 8 + 1,
        seeds = [b"user_stake", user.key().as_ref(), staking_pool.key().as_ref()],
        bump
    )]
    pub user_stake: Account<'info, UserStake>,
    
    #[account(
        mut,
        seeds = [b"pool_vault", staking_pool.key().as_ref()],
        bump = staking_pool.vault_bump
    )]
    pub pool_token_vault: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = user_token_account.mint == staking_pool.stake_token_mint,
        constraint = user_token_account.owner == user.key()
    )]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct StartDistribution<'info> {
    #[account(
        mut,
        constraint = staking_pool.authority == authority.key()
    )]
    pub staking_pool: Account<'info, StakingPool>,
    
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct StopDistribution<'info> {
    #[account(
        mut,
        constraint = staking_pool.authority == authority.key()
    )]
    pub staking_pool: Account<'info, StakingPool>,
    
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct EndDistributionPermanently<'info> {
    #[account(
        mut,
        constraint = staking_pool.authority == authority.key()
    )]
    pub staking_pool: Account<'info, StakingPool>,
    
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct PausePool<'info> {
    #[account(
        mut,
        constraint = staking_pool.authority == authority.key()
    )]
    pub staking_pool: Account<'info, StakingPool>,
    
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct UnpausePool<'info> {
    #[account(
        mut,
        constraint = staking_pool.authority == authority.key()
    )]
    pub staking_pool: Account<'info, StakingPool>,
    
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct TransferAuthority<'info> {
    #[account(
        mut,
        constraint = staking_pool.authority == admin.key()
    )]
    pub staking_pool: Account<'info, StakingPool>,
    
    pub admin: Signer<'info>,
}

#[derive(Accounts)]
pub struct Unstake<'info> {
    #[account(mut)]
    pub staking_pool: Account<'info, StakingPool>,
    
    #[account(
        mut,
        seeds = [b"user_stake", user.key().as_ref(), staking_pool.key().as_ref()],
        bump
    )]
    pub user_stake: Account<'info, UserStake>,
    
    #[account(
        mut,
        seeds = [b"pool_vault", staking_pool.key().as_ref()],
        bump = staking_pool.vault_bump
    )]
    pub pool_token_vault: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = user_token_account.mint == staking_pool.stake_token_mint,
        constraint = user_token_account.owner == user.key()
    )]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct ClaimSolRewards<'info> {
    #[account(
        mut,
        seeds = [b"staking_pool"],
        bump = staking_pool.bump
    )]
    pub staking_pool: Account<'info, StakingPool>,
    
    #[account(
        mut,
        seeds = [b"user_stake", user.key().as_ref(), staking_pool.key().as_ref()],
        bump
    )]
    pub user_stake: Account<'info, UserStake>,
    
    /// CHECK: User receiving SOL rewards
    #[account(mut)]
    pub user: Signer<'info>,
}

#[derive(Accounts)]
pub struct ClaimSplRewards<'info> {
    #[account(mut)]
    pub staking_pool: Account<'info, StakingPool>,
    
    #[account(
        mut,
        seeds = [b"user_stake", user.key().as_ref(), staking_pool.key().as_ref()],
        bump
    )]
    pub user_stake: Account<'info, UserStake>,
    
    #[account(
        mut,
        seeds = [b"reward_vault", staking_pool.key().as_ref(), reward_vault.mint.as_ref()],
        bump
    )]
    pub reward_vault: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = user_reward_account.mint == reward_vault.mint,
        constraint = user_reward_account.owner == user.key()
    )]
    pub user_reward_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct DepositSolRewards<'info> {
    #[account(
        mut,
        constraint = staking_pool.authority == authority.key(),
        seeds = [b"staking_pool"],
        bump = staking_pool.bump
    )]
    pub staking_pool: Account<'info, StakingPool>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct DepositSplRewards<'info> {
    #[account(
        mut,
        constraint = staking_pool.authority == authority.key()
    )]
    pub staking_pool: Account<'info, StakingPool>,
    
    #[account(
        mut,
        seeds = [b"reward_vault", staking_pool.key().as_ref(), reward_vault.mint.as_ref()],
        bump
    )]
    pub reward_vault: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = authority_token_account.mint == reward_vault.mint,
        constraint = authority_token_account.owner == authority.key()
    )]
    pub authority_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct CreateRewardVault<'info> {
    #[account(
        constraint = staking_pool.authority == authority.key()
    )]
    pub staking_pool: Account<'info, StakingPool>,
    
    #[account(
        init,
        payer = authority,
        token::mint = reward_token_mint,
        token::authority = reward_vault,
        seeds = [b"reward_vault", staking_pool.key().as_ref(), reward_token_mint.key().as_ref()],
        bump
    )]
    pub reward_vault: Account<'info, TokenAccount>,
    
    pub reward_token_mint: Account<'info, anchor_spl::token::Mint>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct AdminWithdrawSol<'info> {
    #[account(
        mut,
        constraint = staking_pool.authority == admin.key(),
        seeds = [b"staking_pool"],
        bump = staking_pool.bump
    )]
    pub staking_pool: Account<'info, StakingPool>,
    
    /// CHECK: Admin receiving SOL
    #[account(mut)]
    pub admin: Signer<'info>,
}

#[derive(Accounts)]
pub struct AdminWithdrawSpl<'info> {
    #[account(
        constraint = staking_pool.authority == admin.key()
    )]
    pub staking_pool: Account<'info, StakingPool>,
    
    #[account(
        mut,
        seeds = [b"reward_vault", staking_pool.key().as_ref(), reward_vault.mint.as_ref()],
        bump
    )]
    pub reward_vault: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = admin_token_account.mint == reward_vault.mint,
        constraint = admin_token_account.owner == admin.key()
    )]
    pub admin_token_account: Account<'info, TokenAccount>,
    
    pub admin: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct AdminWithdrawStakeTokens<'info> {
    #[account(
        mut,
        constraint = staking_pool.authority == admin.key()
    )]
    pub staking_pool: Account<'info, StakingPool>,
    
    #[account(
        mut,
        seeds = [b"pool_vault", staking_pool.key().as_ref()],
        bump = staking_pool.vault_bump
    )]
    pub pool_token_vault: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = admin_token_account.mint == staking_pool.stake_token_mint,
        constraint = admin_token_account.owner == admin.key()
    )]
    pub admin_token_account: Account<'info, TokenAccount>,
    
    pub admin: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[account]
pub struct StakingPool {
    pub authority: Pubkey,
    pub stake_token_mint: Pubkey,
    pub total_staked: u64,
    pub total_weighted_stake: u64,
    pub last_reward_distribution: i64,
    pub bump: u8,
    pub vault_bump: u8,
    pub sol_rewards_available: u64,
    pub distribution_active: bool,
    pub distribution_ended: bool,
    pub current_distribution_epoch: u64,
    pub global_sequence: u64,
    pub paused: bool,
    pub created_at: i64,
    pub total_fees_collected: u64,
}

#[account]
pub struct UserStake {
    pub owner: Pubkey,
    pub amount: u64,
    pub weighted_stake: u64,
    pub last_stake_time: i64,
    pub lock_start_time: i64,
    pub penalty_amount: u64,
    pub distribution_epoch: u64,
    pub has_claimed_epoch: u64,
    pub last_action_sequence: u64,
    pub is_active: bool,
}

// Event definitions
#[event]
pub struct PoolPaused {
    pub pool: Pubkey,
    pub authority: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct PoolUnpaused {
    pub pool: Pubkey,
    pub authority: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct AuthorityTransferred {
    pub pool: Pubkey,
    pub old_authority: Pubkey,
    pub new_authority: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct DistributionStarted {
    pub pool: Pubkey,
    pub epoch: u64,
    pub timestamp: i64,
}

#[event]
pub struct DistributionStopped {
    pub pool: Pubkey,
    pub epoch: u64,
    pub total_weighted_stake: u64,
    pub timestamp: i64,
}

#[event]
pub struct DistributionEndedPermanently {
    pub pool: Pubkey,
    pub final_epoch: u64,
    pub timestamp: i64,
}

#[event]
pub struct TokensStaked {
    pub pool: Pubkey,
    pub user: Pubkey,
    pub amount: u64,
    pub new_total: u64,
    pub epoch: u64,
    pub timestamp: i64,
}

#[event]
pub struct TokensUnstaked {
    pub pool: Pubkey,
    pub user: Pubkey,
    pub amount: u64,
    pub fee: u64,
    pub penalty: u64,
    pub remaining_stake: u64,
    pub timestamp: i64,
}

#[event]
pub struct SolRewardsClaimed {
    pub pool: Pubkey,
    pub user: Pubkey,
    pub amount: u64,
    pub epoch: u64,
    pub timestamp: i64,
}

#[event]
pub struct SplRewardsClaimed {
    pub pool: Pubkey,
    pub user: Pubkey,
    pub token_mint: Pubkey,
    pub amount: u64,
    pub epoch: u64,
    pub timestamp: i64,
}

#[error_code]
pub enum StakingError {
    #[msg("Invalid amount provided")]
    InvalidAmount,
    #[msg("Insufficient stake balance")]
    InsufficientStake,
    #[msg("Insufficient balance for withdrawal")]
    InsufficientBalance,
    #[msg("No stake found")]
    NoStake,
    #[msg("Unauthorized access")]
    Unauthorized,
    #[msg("Invalid token mint")]
    InvalidTokenMint,
    #[msg("Math overflow")]
    MathOverflow,
    #[msg("Distribution already active")]
    DistributionAlreadyActive,
    #[msg("Distribution not active")]
    DistributionNotActive,
    #[msg("Distribution still active, cannot claim yet")]
    DistributionStillActive,
    #[msg("User not in current distribution epoch")]
    WrongDistributionEpoch,
    #[msg("Distribution permanently ended, cannot start new distribution")]
    DistributionPermanentlyEnded,
    #[msg("Replay attack detected")]
    ReplayAttack,
    #[msg("Already claimed rewards for this epoch")]
    AlreadyClaimed,
    #[msg("Stake not active")]
    StakeNotActive,
    #[msg("Pool paused")]
    PoolPaused,
    #[msg("Already paused")]
    AlreadyPaused,
    #[msg("Not paused")]
    NotPaused,
    #[msg("Invalid authority")]
    InvalidAuthority,
    #[msg("Same authority")]
    SameAuthority,
    #[msg("Exceeds max stake")]
    ExceedsMaxStake,
} 