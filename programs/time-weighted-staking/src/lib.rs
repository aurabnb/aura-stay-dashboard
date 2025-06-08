use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("4kw6UUWLQ4GFpeGcQbBqEZX6Tbfrysrx3RcyJYc8eh58");

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
        
        msg!("Staking pool initialized with authority: {}", authority);
        Ok(())
    }

    /// ADMIN ONLY: Start reward distribution (triggers calculation period)
    pub fn start_distribution(ctx: Context<StartDistribution>) -> Result<()> {
        let pool = &mut ctx.accounts.staking_pool;
        let current_time = Clock::get()?.unix_timestamp;

        require!(!pool.distribution_active, StakingError::DistributionAlreadyActive);
        require!(!pool.distribution_ended, StakingError::DistributionPermanentlyEnded);

        pool.distribution_active = true;
        pool.last_reward_distribution = current_time;
        pool.current_distribution_epoch += 1;
        pool.global_sequence = Clock::get()?.slot; // Update global sequence
        
        // Reset total weighted stake for new distribution period
        pool.total_weighted_stake = 0;

        msg!("Reward distribution started for epoch: {}", pool.current_distribution_epoch);
        Ok(())
    }

    /// ADMIN ONLY: Stop reward distribution (ends calculation period)
    pub fn stop_distribution(ctx: Context<StopDistribution>) -> Result<()> {
        let pool = &mut ctx.accounts.staking_pool;
        let current_time = Clock::get()?.unix_timestamp;

        require!(pool.distribution_active, StakingError::DistributionNotActive);
        require!(!pool.distribution_ended, StakingError::DistributionPermanentlyEnded);

        // Final update of weighted stakes before stopping
        if pool.total_staked > 0 {
            let time_diff = current_time - pool.last_reward_distribution;
            pool.total_weighted_stake += pool.total_staked * time_diff as u64;
        }
        
        pool.distribution_active = false;
        pool.global_sequence = Clock::get()?.slot; // Update global sequence

        msg!("Reward distribution stopped for epoch: {}", pool.current_distribution_epoch);
        Ok(())
    }

    /// ADMIN ONLY: Permanently end distribution (no more epochs can start)
    pub fn end_distribution_permanently(ctx: Context<EndDistributionPermanently>) -> Result<()> {
        let pool = &mut ctx.accounts.staking_pool;
        
        require!(!pool.distribution_active, StakingError::DistributionStillActive);
        require!(!pool.distribution_ended, StakingError::DistributionPermanentlyEnded);
        
        pool.distribution_ended = true;
        pool.global_sequence = Clock::get()?.slot;
        
        msg!("Distribution permanently ended - no new epochs can start");
        Ok(())
    }

    /// Stake tokens (only calculates time weight if distribution is active)
    pub fn stake(ctx: Context<Stake>, amount: u64) -> Result<()> {
        require!(amount > 0, StakingError::InvalidAmount);
        
        let pool = &mut ctx.accounts.staking_pool;
        let user_stake = &mut ctx.accounts.user_stake;
        let current_time = Clock::get()?.unix_timestamp;
        let current_slot = Clock::get()?.slot;

        // Security checks
        require!(!pool.distribution_ended, StakingError::DistributionPermanentlyEnded);
        require!(current_slot > user_stake.last_action_sequence, StakingError::ReplayAttack);

        // Only update weighted stake if distribution is active
        if pool.distribution_active {
            let time_diff = current_time - pool.last_reward_distribution;
            pool.total_weighted_stake += pool.total_staked * time_diff as u64;
            pool.last_reward_distribution = current_time;
            
            if user_stake.amount > 0 {
                let user_time_diff = current_time - user_stake.last_stake_time;
                user_stake.weighted_stake += user_stake.amount * user_time_diff as u64;
            }
        }

        // Transfer tokens from user to pool vault (PDA)
        let cpi_accounts = Transfer {
            from: ctx.accounts.user_token_account.to_account_info(),
            to: ctx.accounts.pool_token_vault.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, amount)?;

        // Update user stake with replay protection
        user_stake.amount += amount;
        user_stake.last_stake_time = current_time;
        user_stake.lock_start_time = current_time;
        user_stake.owner = ctx.accounts.user.key();
        user_stake.distribution_epoch = pool.current_distribution_epoch;
        user_stake.last_action_sequence = current_slot; // Replay protection
        user_stake.is_active = true;

        // Update pool totals
        pool.total_staked += amount;
        pool.global_sequence = current_slot;

        msg!("User {} staked {} tokens (distribution active: {})", 
             ctx.accounts.user.key(), amount, pool.distribution_active);
        Ok(())
    }

    /// Unstake tokens with penalties
    pub fn unstake(ctx: Context<Unstake>, amount: u64) -> Result<()> {
        require!(amount > 0, StakingError::InvalidAmount);
        
        // Get keys early to avoid borrowing issues
        let staking_pool_key = ctx.accounts.staking_pool.key();
        
        let pool = &mut ctx.accounts.staking_pool;
        let user_stake = &mut ctx.accounts.user_stake;
        let current_time = Clock::get()?.unix_timestamp;
        let current_slot = Clock::get()?.slot;

        // Security checks
        require!(user_stake.amount >= amount, StakingError::InsufficientStake);
        require!(user_stake.is_active, StakingError::StakeNotActive);
        require!(current_slot > user_stake.last_action_sequence, StakingError::ReplayAttack);

        // Only update weighted stakes if distribution is active
        if pool.distribution_active {
            let time_diff = current_time - pool.last_reward_distribution;
            pool.total_weighted_stake += pool.total_staked * time_diff as u64;
            pool.last_reward_distribution = current_time;
            
            if user_stake.amount > 0 {
                let user_time_diff = current_time - user_stake.last_stake_time;
                user_stake.weighted_stake += user_stake.amount * user_time_diff as u64;
            }
        }

        // Calculate penalties
        let lock_period_days = (current_time - user_stake.lock_start_time) / 86400;
        let is_early_unstake = lock_period_days < 30;
        
        // 0.5% unstake fee on staked tokens
        let unstake_fee = amount.saturating_mul(5).saturating_div(1000);
        let amount_after_fee = amount.saturating_sub(unstake_fee);

        // Early unstake penalty (5% on pending rewards only) - only if distribution active
        if is_early_unstake && pool.distribution_active {
            let user_rewards = calculate_user_rewards(pool, user_stake, current_time)?;
            let penalty = user_rewards.saturating_mul(5).saturating_div(100);
            user_stake.penalty_amount += penalty;
            msg!("Early unstake penalty applied: {} tokens", penalty);
        }

        // Transfer tokens back to user from PDA vault
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

        // Update user stake with replay protection
        user_stake.amount -= amount;
        user_stake.last_stake_time = current_time;
        user_stake.last_action_sequence = current_slot; // Replay protection
        
        // Deactivate stake if fully unstaked
        if user_stake.amount == 0 {
            user_stake.is_active = false;
        }

        pool.total_staked -= amount;
        pool.global_sequence = current_slot;

        msg!("User {} unstaked {} tokens (fee: {})", ctx.accounts.user.key(), amount_after_fee, unstake_fee);
        Ok(())
    }

    /// Claim SOL rewards (only available when distribution is stopped)
    pub fn claim_sol_rewards(ctx: Context<ClaimSolRewards>) -> Result<()> {
        // Get account info early to avoid borrowing issues
        let staking_pool_info = ctx.accounts.staking_pool.to_account_info();
        let user_info = ctx.accounts.user.to_account_info();
        
        let pool = &mut ctx.accounts.staking_pool;
        let user_stake = &mut ctx.accounts.user_stake;
        let current_slot = Clock::get()?.slot;

        // Security and state checks
        require!(user_stake.amount > 0, StakingError::NoStake);
        require!(user_stake.is_active, StakingError::StakeNotActive);
        require!(!pool.distribution_active, StakingError::DistributionStillActive);
        require!(user_stake.distribution_epoch == pool.current_distribution_epoch, StakingError::WrongDistributionEpoch);
        require!(user_stake.has_claimed_epoch != pool.current_distribution_epoch, StakingError::AlreadyClaimed);
        require!(current_slot > user_stake.last_action_sequence, StakingError::ReplayAttack);

        // If distribution ended permanently, allow withdrawal
        if pool.distribution_ended {
            msg!("Claiming rewards after permanent distribution end");
        }

        // Calculate user's share of SOL rewards based on their weighted stake
        let user_sol_rewards = if pool.total_weighted_stake > 0 && pool.sol_rewards_available > 0 {
            pool.sol_rewards_available
                .saturating_mul(user_stake.weighted_stake)
                .saturating_div(pool.total_weighted_stake)
        } else {
            0
        };
        
        if user_sol_rewards > 0 {
            **staking_pool_info.try_borrow_mut_lamports()? -= user_sol_rewards;
            **user_info.try_borrow_mut_lamports()? += user_sol_rewards;

            // Update pool SOL balance
            pool.sol_rewards_available -= user_sol_rewards;
        }
            
        // Mark user as claimed for this epoch with replay protection
        user_stake.has_claimed_epoch = pool.current_distribution_epoch;
        user_stake.last_action_sequence = current_slot;
        pool.global_sequence = current_slot;
        
        msg!("User {} claimed {} SOL rewards from epoch {}", 
             ctx.accounts.user.key(), user_sol_rewards, pool.current_distribution_epoch);

        Ok(())
    }

    /// Claim SPL token rewards from PDA vault (only available when distribution is stopped)
    pub fn claim_spl_rewards(ctx: Context<ClaimSplRewards>) -> Result<()> {
        // Get keys early to avoid borrowing issues
        let staking_pool_key = ctx.accounts.staking_pool.key();
        
        let pool = &mut ctx.accounts.staking_pool;
        let user_stake = &mut ctx.accounts.user_stake;
        let current_slot = Clock::get()?.slot;

        // Security and state checks
        require!(user_stake.amount > 0, StakingError::NoStake);
        require!(user_stake.is_active, StakingError::StakeNotActive);
        require!(!pool.distribution_active, StakingError::DistributionStillActive);
        require!(user_stake.distribution_epoch == pool.current_distribution_epoch, StakingError::WrongDistributionEpoch);
        require!(user_stake.has_claimed_epoch != pool.current_distribution_epoch, StakingError::AlreadyClaimed);
        require!(current_slot > user_stake.last_action_sequence, StakingError::ReplayAttack);

        // If distribution ended permanently, allow withdrawal
        if pool.distribution_ended {
            msg!("Claiming SPL rewards after permanent distribution end");
        }

        // Calculate user's share of rewards from this specific PDA vault
        let vault_balance = ctx.accounts.reward_vault.amount;
        let user_rewards = if pool.total_weighted_stake > 0 && vault_balance > 0 {
            vault_balance
                .saturating_mul(user_stake.weighted_stake)
                .saturating_div(pool.total_weighted_stake)
        } else {
            0
        };

        if user_rewards > 0 {
            // Get the correct bump for reward vault PDA
            let (_, bump) = Pubkey::find_program_address(
                &[
                    b"reward_vault",
                    staking_pool_key.as_ref(),
                    ctx.accounts.reward_vault.mint.as_ref(),
                ],
                ctx.program_id,
            );

            // Transfer SPL tokens from PDA vault to user
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

        // Mark user as claimed for this epoch with replay protection
        user_stake.has_claimed_epoch = pool.current_distribution_epoch;
        user_stake.last_action_sequence = current_slot;
        pool.global_sequence = current_slot;
        
        msg!("User {} claimed {} SPL token rewards from epoch {}", 
             ctx.accounts.user.key(), user_rewards, pool.current_distribution_epoch);

        Ok(())
    }

    /// Deposit SOL rewards to pool PDA (can be done anytime, admin only)
    pub fn deposit_sol_rewards(ctx: Context<DepositSolRewards>, amount: u64) -> Result<()> {
        require!(amount > 0, StakingError::InvalidAmount);
        
        // Get account info early to avoid borrowing issues
        let authority_info = ctx.accounts.authority.to_account_info();
        let staking_pool_info = ctx.accounts.staking_pool.to_account_info();
        
        let pool = &mut ctx.accounts.staking_pool;

        // Transfer SOL to the staking pool PDA
        **authority_info.try_borrow_mut_lamports()? -= amount;
        **staking_pool_info.try_borrow_mut_lamports()? += amount;

        // Update SOL rewards tracking (no automatic distribution)
        pool.sol_rewards_available += amount;

        msg!("Deposited {} SOL as rewards to pool PDA (distribution status: {})", amount, pool.distribution_active);
        Ok(())
    }

    /// Deposit SPL token rewards to PDA vault (can be done anytime, admin only)
    pub fn deposit_spl_rewards(
        ctx: Context<DepositSplRewards>,
        amount: u64,
    ) -> Result<()> {
        require!(amount > 0, StakingError::InvalidAmount);

        // Transfer SPL tokens to PDA reward vault
        let cpi_accounts = Transfer {
            from: ctx.accounts.authority_token_account.to_account_info(),
            to: ctx.accounts.reward_vault.to_account_info(),
            authority: ctx.accounts.authority.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, amount)?;

        msg!("Deposited {} SPL tokens as rewards to PDA vault (no automatic distribution)", amount);
        Ok(())
    }

    /// Create a new PDA reward vault for a specific token
    pub fn create_reward_vault(
        _ctx: Context<CreateRewardVault>,
        reward_token_mint: Pubkey,
        bump: u8,
    ) -> Result<()> {
        msg!("Created PDA reward vault for token mint: {} with bump: {}", reward_token_mint, bump);
        Ok(())
    }

    /// ADMIN ONLY: Withdraw SOL from pool (emergency/admin function)
    pub fn admin_withdraw_sol(ctx: Context<AdminWithdrawSol>, amount: u64) -> Result<()> {
        require!(amount > 0, StakingError::InvalidAmount);
        
        // Get account info early to avoid borrowing issues
        let staking_pool_info = ctx.accounts.staking_pool.to_account_info();
        let admin_info = ctx.accounts.admin.to_account_info();
        let pool_lamports = staking_pool_info.lamports();
        
        let pool = &mut ctx.accounts.staking_pool;
        
        // Ensure pool has enough SOL
        require!(pool_lamports >= amount, StakingError::InsufficientBalance);

        // Transfer SOL from pool PDA to admin
        **staking_pool_info.try_borrow_mut_lamports()? -= amount;
        **admin_info.try_borrow_mut_lamports()? += amount;

        // Update tracked SOL rewards if withdrawing from rewards
        if pool.sol_rewards_available >= amount {
            pool.sol_rewards_available -= amount;
        } else {
            pool.sol_rewards_available = 0;
        }

        msg!("Admin withdrew {} SOL from pool", amount);
        Ok(())
    }

    /// ADMIN ONLY: Withdraw SPL tokens from any reward vault (emergency/admin function)
    pub fn admin_withdraw_spl(ctx: Context<AdminWithdrawSpl>, amount: u64) -> Result<()> {
        require!(amount > 0, StakingError::InvalidAmount);
        
        // Get keys early to avoid borrowing issues
        let staking_pool_key = ctx.accounts.staking_pool.key();
        
        // Ensure vault has enough tokens
        let vault_balance = ctx.accounts.reward_vault.amount;
        require!(vault_balance >= amount, StakingError::InsufficientBalance);

        // Get the correct bump for reward vault PDA
        let (_, bump) = Pubkey::find_program_address(
            &[
                b"reward_vault",
                staking_pool_key.as_ref(),
                ctx.accounts.reward_vault.mint.as_ref(),
            ],
            ctx.program_id,
        );

        // Transfer SPL tokens from PDA vault to admin
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

        msg!("Admin withdrew {} tokens from reward vault (mint: {})", 
             amount, ctx.accounts.reward_vault.mint);
        Ok(())
    }

    /// ADMIN ONLY: Withdraw staked tokens from pool vault (emergency function)
    pub fn admin_withdraw_stake_tokens(ctx: Context<AdminWithdrawStakeTokens>, amount: u64) -> Result<()> {
        require!(amount > 0, StakingError::InvalidAmount);
        
        // Get keys early to avoid borrowing issues
        let staking_pool_key = ctx.accounts.staking_pool.key();
        
        let pool = &mut ctx.accounts.staking_pool;
        
        // Ensure vault has enough tokens
        let vault_balance = ctx.accounts.pool_token_vault.amount;
        require!(vault_balance >= amount, StakingError::InsufficientBalance);

        // Transfer staked tokens from PDA vault to admin
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

        // Update pool tracking (admin withdrawal reduces total staked)
        if pool.total_staked >= amount {
            pool.total_staked -= amount;
        } else {
            pool.total_staked = 0;
        }

        msg!("Admin withdrew {} staked tokens from pool vault", amount);
        Ok(())
    }
}

// Helper functions
fn calculate_user_rewards(
    pool: &StakingPool,
    user_stake: &UserStake,
    current_time: i64,
) -> Result<u64> {
    if pool.total_weighted_stake == 0 {
        return Ok(0);
    }

    let time_diff = current_time - user_stake.last_stake_time;
    let user_weighted_stake = user_stake.weighted_stake + (user_stake.amount * time_diff as u64);
    
    let reward_share = user_weighted_stake
        .checked_mul(1000000) // Scale for precision
        .unwrap_or(0)
        .checked_div(pool.total_weighted_stake)
        .unwrap_or(0);

    Ok(reward_share)
}

// Account Structures with PDA constraints
#[derive(Accounts)]
#[instruction(authority: Pubkey, bump: u8, vault_bump: u8)]
pub struct InitializePool<'info> {
    #[account(
        init,
        payer = payer,
        space = 8 + 32 + 32 + 8 + 8 + 8 + 1 + 1 + 8 + 1 + 1 + 8 + 8, // Updated for new fields
        seeds = [b"staking_pool"],
        bump
    )]
    pub staking_pool: Account<'info, StakingPool>,
    
    #[account(
        init,
        payer = payer,
        token::mint = stake_token_mint,
        token::authority = pool_token_vault, // PDA is its own authority
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
        space = 8 + 32 + 8 + 8 + 8 + 8 + 8 + 8 + 8 + 8 + 1, // Updated for new fields
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
#[instruction(reward_token_mint: Pubkey, bump: u8)]
pub struct CreateRewardVault<'info> {
    #[account(
        constraint = staking_pool.authority == authority.key()
    )]
    pub staking_pool: Account<'info, StakingPool>,
    
    #[account(
        init,
        payer = authority,
        token::mint = reward_token_mint,
        token::authority = reward_vault, // PDA is its own authority
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

// Account Data Structures  
#[account]
pub struct StakingPool {
    pub authority: Pubkey,
    pub stake_token_mint: Pubkey,
    pub total_staked: u64,
    pub total_weighted_stake: u64,
    pub last_reward_distribution: i64,
    pub bump: u8,
    pub vault_bump: u8, // NEW: Bump for pool token vault PDA
    pub sol_rewards_available: u64,
    pub distribution_active: bool,
    pub distribution_ended: bool, // NEW: Permanent end state
    pub current_distribution_epoch: u64,
    pub global_sequence: u64, // NEW: For replay protection
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
    pub last_action_sequence: u64, // NEW: Prevent replay attacks
    pub is_active: bool, // NEW: Prevent operations on inactive stakes
}

// Error codes
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
} 