use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer, Mint};

declare_id!("AuRA1111111111111111111111111111111111111111");

#[program]
pub mod aura_staking {
    use super::*;

    const SECONDS_PER_DAY: i64 = 86_400;
    const EARLY_UNSTAKE_PENALTY_PERCENT: u64 = 5; // 5% penalty on rewards
    const UNSTAKE_FEE_PERCENT: u64 = 50; // 0.5% fee (50 basis points)
    const BASIS_POINTS: u64 = 10_000;

    /// Initialize the staking pool
    pub fn initialize_pool(
        ctx: Context<InitializePool>,
        authority: Pubkey,
        reward_rate_per_day: u64, // Basis points per day (e.g., 27 = 0.27% per day)
    ) -> Result<()> {
        let pool = &mut ctx.accounts.staking_pool;
        let clock = Clock::get()?;

        pool.authority = authority;
        pool.aura_mint = ctx.accounts.aura_mint.key();
        pool.total_staked = 0;
        pool.reward_rate_per_day = reward_rate_per_day;
        pool.bump = ctx.bumps.staking_pool;
        pool.vault_bump = ctx.bumps.stake_vault;
        pool.reward_vault_bump = ctx.bumps.reward_vault;
        pool.total_rewards_distributed = 0;
        pool.created_at = clock.unix_timestamp;
        pool.paused = false;

        msg!("AURA Staking Pool initialized with authority: {}", authority);
        msg!("Reward rate: {} basis points per day", reward_rate_per_day);
        Ok(())
    }

    /// Stake AURA tokens
    pub fn stake(ctx: Context<Stake>, amount: u64) -> Result<()> {
        require!(amount > 0, StakingError::InvalidAmount);
        
        let pool = &ctx.accounts.staking_pool;
        require!(!pool.paused, StakingError::PoolPaused);

        let user_stake = &mut ctx.accounts.user_stake;
        let clock = Clock::get()?;

        // If user already has an active stake, claim pending rewards first
        if user_stake.amount > 0 {
            let pending_rewards = calculate_pending_rewards(user_stake, pool, clock.unix_timestamp)?;
            user_stake.pending_rewards += pending_rewards;
        }

        // Transfer AURA tokens from user to stake vault
        let cpi_accounts = Transfer {
            from: ctx.accounts.user_token_account.to_account_info(),
            to: ctx.accounts.stake_vault.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, amount)?;

        // Update user stake data
        user_stake.owner = ctx.accounts.user.key();
        user_stake.amount += amount;
        user_stake.last_update_time = clock.unix_timestamp;
        
        // If this is the first stake, set the stake start time
        if user_stake.stake_start_time == 0 {
            user_stake.stake_start_time = clock.unix_timestamp;
        }

        // Update pool totals
        let pool = &mut ctx.accounts.staking_pool;
        pool.total_staked += amount;

        msg!("User {} staked {} AURA tokens", ctx.accounts.user.key(), amount);
        Ok(())
    }

    /// Unstake AURA tokens with penalties and fees
    pub fn unstake(ctx: Context<Unstake>, amount: u64) -> Result<()> {
        require!(amount > 0, StakingError::InvalidAmount);
        
        let pool = &ctx.accounts.staking_pool;
        require!(!pool.paused, StakingError::PoolPaused);

        let user_stake = &mut ctx.accounts.user_stake;
        require!(user_stake.amount >= amount, StakingError::InsufficientStake);

        let clock = Clock::get()?;
        
        // Calculate pending rewards
        let pending_rewards = calculate_pending_rewards(user_stake, pool, clock.unix_timestamp)?;
        let total_pending = user_stake.pending_rewards + pending_rewards;

        // Check if unstaking before 30 days
        let days_staked = (clock.unix_timestamp - user_stake.stake_start_time) / SECONDS_PER_DAY;
        let is_early_unstake = days_staked < 30;

        // Calculate penalties and fees
        let unstake_fee = amount
            .checked_mul(UNSTAKE_FEE_PERCENT)
            .ok_or(StakingError::MathOverflow)?
            .checked_div(BASIS_POINTS)
            .ok_or(StakingError::MathOverflow)?;

        let reward_penalty = if is_early_unstake {
            total_pending
                .checked_mul(EARLY_UNSTAKE_PENALTY_PERCENT)
                .ok_or(StakingError::MathOverflow)?
                .checked_div(100)
                .ok_or(StakingError::MathOverflow)?
        } else {
            0
        };

        let amount_after_fee = amount
            .checked_sub(unstake_fee)
            .ok_or(StakingError::MathOverflow)?;

        let rewards_after_penalty = total_pending
            .checked_sub(reward_penalty)
            .ok_or(StakingError::MathOverflow)?;

        // Transfer staked tokens back to user (minus fee)
        let staking_pool_key = ctx.accounts.staking_pool.key();
        let seeds = &[
            b"stake_vault".as_ref(),
            staking_pool_key.as_ref(),
            &[pool.vault_bump],
        ];
        let signer_seeds = &[&seeds[..]];

        let cpi_accounts = Transfer {
            from: ctx.accounts.stake_vault.to_account_info(),
            to: ctx.accounts.user_token_account.to_account_info(),
            authority: ctx.accounts.stake_vault.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);
        token::transfer(cpi_ctx, amount_after_fee)?;

        // Transfer rewards (if any) from reward vault
        if rewards_after_penalty > 0 {
            let reward_seeds = &[
                b"reward_vault".as_ref(),
                staking_pool_key.as_ref(),
                &[pool.reward_vault_bump],
            ];
            let reward_signer_seeds = &[&reward_seeds[..]];

            let reward_cpi_accounts = Transfer {
                from: ctx.accounts.reward_vault.to_account_info(),
                to: ctx.accounts.user_token_account.to_account_info(),
                authority: ctx.accounts.reward_vault.to_account_info(),
            };
            let reward_cpi_ctx = CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                reward_cpi_accounts,
                reward_signer_seeds,
            );
            token::transfer(reward_cpi_ctx, rewards_after_penalty)?;
        }

        // Update user stake
        user_stake.amount -= amount;
        user_stake.pending_rewards = 0;
        user_stake.total_rewards_claimed += rewards_after_penalty;
        user_stake.last_update_time = clock.unix_timestamp;

        // If fully unstaked, reset stake start time
        if user_stake.amount == 0 {
            user_stake.stake_start_time = 0;
        }

        // Update pool totals
        let pool = &mut ctx.accounts.staking_pool;
        pool.total_staked -= amount;
        pool.total_rewards_distributed += rewards_after_penalty;

        msg!(
            "User {} unstaked {} AURA (fee: {}, reward penalty: {}, rewards claimed: {})",
            ctx.accounts.user.key(),
            amount,
            unstake_fee,
            reward_penalty,
            rewards_after_penalty
        );

        Ok(())
    }

    /// Claim accumulated rewards without unstaking
    pub fn claim_rewards(ctx: Context<ClaimRewards>) -> Result<()> {
        let pool = &ctx.accounts.staking_pool;
        require!(!pool.paused, StakingError::PoolPaused);

        let user_stake = &mut ctx.accounts.user_stake;
        require!(user_stake.amount > 0, StakingError::NoActiveStake);

        let clock = Clock::get()?;
        
        // Calculate total pending rewards
        let pending_rewards = calculate_pending_rewards(user_stake, pool, clock.unix_timestamp)?;
        let total_rewards = user_stake.pending_rewards + pending_rewards;

        require!(total_rewards > 0, StakingError::NoRewardsToClaim);

        // Transfer rewards from reward vault to user
        let staking_pool_key = ctx.accounts.staking_pool.key();
        let seeds = &[
            b"reward_vault".as_ref(),
            staking_pool_key.as_ref(),
            &[pool.reward_vault_bump],
        ];
        let signer_seeds = &[&seeds[..]];

        let cpi_accounts = Transfer {
            from: ctx.accounts.reward_vault.to_account_info(),
            to: ctx.accounts.user_token_account.to_account_info(),
            authority: ctx.accounts.reward_vault.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);
        token::transfer(cpi_ctx, total_rewards)?;

        // Update user state
        user_stake.pending_rewards = 0;
        user_stake.total_rewards_claimed += total_rewards;
        user_stake.last_update_time = clock.unix_timestamp;

        // Update pool totals
        let pool = &mut ctx.accounts.staking_pool;
        pool.total_rewards_distributed += total_rewards;

        msg!("User {} claimed {} AURA rewards", ctx.accounts.user.key(), total_rewards);
        Ok(())
    }

    /// Admin: Deposit AURA tokens into reward vault
    pub fn deposit_rewards(ctx: Context<DepositRewards>, amount: u64) -> Result<()> {
        require!(amount > 0, StakingError::InvalidAmount);

        // Transfer AURA tokens from admin to reward vault
        let cpi_accounts = Transfer {
            from: ctx.accounts.admin_token_account.to_account_info(),
            to: ctx.accounts.reward_vault.to_account_info(),
            authority: ctx.accounts.admin.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, amount)?;

        msg!("Admin deposited {} AURA tokens to reward vault", amount);
        Ok(())
    }

    /// Admin: Emergency withdraw from stake vault
    pub fn admin_withdraw_stake(ctx: Context<AdminWithdrawStake>, amount: u64) -> Result<()> {
        require!(amount > 0, StakingError::InvalidAmount);

        let staking_pool_key = ctx.accounts.staking_pool.key();
        let seeds = &[
            b"stake_vault".as_ref(),
            staking_pool_key.as_ref(),
            &[ctx.accounts.staking_pool.vault_bump],
        ];
        let signer_seeds = &[&seeds[..]];

        let cpi_accounts = Transfer {
            from: ctx.accounts.stake_vault.to_account_info(),
            to: ctx.accounts.admin_token_account.to_account_info(),
            authority: ctx.accounts.stake_vault.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);
        token::transfer(cpi_ctx, amount)?;

        // Update pool total
        let pool = &mut ctx.accounts.staking_pool;
        pool.total_staked = pool.total_staked.saturating_sub(amount);

        msg!("Admin withdrew {} AURA tokens from stake vault", amount);
        Ok(())
    }

    /// Admin: Emergency withdraw from reward vault
    pub fn admin_withdraw_rewards(ctx: Context<AdminWithdrawRewards>, amount: u64) -> Result<()> {
        require!(amount > 0, StakingError::InvalidAmount);

        let staking_pool_key = ctx.accounts.staking_pool.key();
        let seeds = &[
            b"reward_vault".as_ref(),
            staking_pool_key.as_ref(),
            &[ctx.accounts.staking_pool.reward_vault_bump],
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

        msg!("Admin withdrew {} AURA tokens from reward vault", amount);
        Ok(())
    }

    /// Admin: Update reward rate
    pub fn update_reward_rate(ctx: Context<UpdateRewardRate>, new_rate: u64) -> Result<()> {
        let pool = &mut ctx.accounts.staking_pool;
        pool.reward_rate_per_day = new_rate;

        msg!("Reward rate updated to {} basis points per day", new_rate);
        Ok(())
    }

    /// Admin: Pause/unpause the pool
    pub fn set_pool_status(ctx: Context<SetPoolStatus>, paused: bool) -> Result<()> {
        let pool = &mut ctx.accounts.staking_pool;
        pool.paused = paused;

        msg!("Pool status changed to: {}", if paused { "PAUSED" } else { "ACTIVE" });
        Ok(())
    }
}

/// Calculate pending rewards for a user based on time and amount staked
fn calculate_pending_rewards(
    user_stake: &UserStake,
    pool: &StakingPool,
    current_time: i64,
) -> Result<u64> {
    if user_stake.amount == 0 || user_stake.last_update_time == 0 {
        return Ok(0);
    }

    let time_diff = current_time - user_stake.last_update_time;
    let days_elapsed = time_diff as u64 / SECONDS_PER_DAY as u64;
    
    if days_elapsed == 0 {
        return Ok(0);
    }

    // Calculate rewards: (amount * rate_per_day * days) / BASIS_POINTS
    let rewards = user_stake
        .amount
        .checked_mul(pool.reward_rate_per_day)
        .ok_or(StakingError::MathOverflow)?
        .checked_mul(days_elapsed)
        .ok_or(StakingError::MathOverflow)?
        .checked_div(BASIS_POINTS)
        .ok_or(StakingError::MathOverflow)?;

    Ok(rewards)
}

// Account Contexts

#[derive(Accounts)]
pub struct InitializePool<'info> {
    #[account(
        init,
        payer = payer,
        space = 8 + StakingPool::INIT_SPACE,
        seeds = [b"staking_pool", aura_mint.key().as_ref()],
        bump
    )]
    pub staking_pool: Account<'info, StakingPool>,

    #[account(
        init,
        payer = payer,
        token::mint = aura_mint,
        token::authority = stake_vault,
        seeds = [b"stake_vault", staking_pool.key().as_ref()],
        bump
    )]
    pub stake_vault: Account<'info, TokenAccount>,

    #[account(
        init,
        payer = payer,
        token::mint = aura_mint,
        token::authority = reward_vault,
        seeds = [b"reward_vault", staking_pool.key().as_ref()],
        bump
    )]
    pub reward_vault: Account<'info, TokenAccount>,

    pub aura_mint: Account<'info, Mint>,

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
        space = 8 + UserStake::INIT_SPACE,
        seeds = [b"user_stake", user.key().as_ref(), staking_pool.key().as_ref()],
        bump
    )]
    pub user_stake: Account<'info, UserStake>,

    #[account(
        mut,
        seeds = [b"stake_vault", staking_pool.key().as_ref()],
        bump = staking_pool.vault_bump,
        constraint = stake_vault.mint == staking_pool.aura_mint
    )]
    pub stake_vault: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = user_token_account.mint == staking_pool.aura_mint,
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
        bump,
        constraint = user_stake.owner == user.key()
    )]
    pub user_stake: Account<'info, UserStake>,

    #[account(
        mut,
        seeds = [b"stake_vault", staking_pool.key().as_ref()],
        bump = staking_pool.vault_bump
    )]
    pub stake_vault: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"reward_vault", staking_pool.key().as_ref()],
        bump = staking_pool.reward_vault_bump
    )]
    pub reward_vault: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = user_token_account.mint == staking_pool.aura_mint,
        constraint = user_token_account.owner == user.key()
    )]
    pub user_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub user: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct ClaimRewards<'info> {
    pub staking_pool: Account<'info, StakingPool>,

    #[account(
        mut,
        seeds = [b"user_stake", user.key().as_ref(), staking_pool.key().as_ref()],
        bump,
        constraint = user_stake.owner == user.key()
    )]
    pub user_stake: Account<'info, UserStake>,

    #[account(
        mut,
        seeds = [b"reward_vault", staking_pool.key().as_ref()],
        bump = staking_pool.reward_vault_bump
    )]
    pub reward_vault: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = user_token_account.mint == staking_pool.aura_mint,
        constraint = user_token_account.owner == user.key()
    )]
    pub user_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub user: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct DepositRewards<'info> {
    #[account(
        constraint = staking_pool.authority == admin.key()
    )]
    pub staking_pool: Account<'info, StakingPool>,

    #[account(
        mut,
        seeds = [b"reward_vault", staking_pool.key().as_ref()],
        bump = staking_pool.reward_vault_bump
    )]
    pub reward_vault: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = admin_token_account.mint == staking_pool.aura_mint,
        constraint = admin_token_account.owner == admin.key()
    )]
    pub admin_token_account: Account<'info, TokenAccount>,

    pub admin: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct AdminWithdrawStake<'info> {
    #[account(
        mut,
        constraint = staking_pool.authority == admin.key()
    )]
    pub staking_pool: Account<'info, StakingPool>,

    #[account(
        mut,
        seeds = [b"stake_vault", staking_pool.key().as_ref()],
        bump = staking_pool.vault_bump
    )]
    pub stake_vault: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = admin_token_account.mint == staking_pool.aura_mint,
        constraint = admin_token_account.owner == admin.key()
    )]
    pub admin_token_account: Account<'info, TokenAccount>,

    pub admin: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct AdminWithdrawRewards<'info> {
    #[account(
        constraint = staking_pool.authority == admin.key()
    )]
    pub staking_pool: Account<'info, StakingPool>,

    #[account(
        mut,
        seeds = [b"reward_vault", staking_pool.key().as_ref()],
        bump = staking_pool.reward_vault_bump
    )]
    pub reward_vault: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = admin_token_account.mint == staking_pool.aura_mint,
        constraint = admin_token_account.owner == admin.key()
    )]
    pub admin_token_account: Account<'info, TokenAccount>,

    pub admin: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct UpdateRewardRate<'info> {
    #[account(
        mut,
        constraint = staking_pool.authority == admin.key()
    )]
    pub staking_pool: Account<'info, StakingPool>,

    pub admin: Signer<'info>,
}

#[derive(Accounts)]
pub struct SetPoolStatus<'info> {
    #[account(
        mut,
        constraint = staking_pool.authority == admin.key()
    )]
    pub staking_pool: Account<'info, StakingPool>,

    pub admin: Signer<'info>,
}

// Account Data Structures

#[account]
#[derive(InitSpace)]
pub struct StakingPool {
    pub authority: Pubkey,           // 32 bytes
    pub aura_mint: Pubkey,          // 32 bytes
    pub total_staked: u64,          // 8 bytes
    pub reward_rate_per_day: u64,   // 8 bytes (basis points)
    pub bump: u8,                   // 1 byte
    pub vault_bump: u8,             // 1 byte
    pub reward_vault_bump: u8,      // 1 byte
    pub total_rewards_distributed: u64, // 8 bytes
    pub created_at: i64,            // 8 bytes
    pub paused: bool,               // 1 byte
}

#[account]
#[derive(InitSpace)]
pub struct UserStake {
    pub owner: Pubkey,              // 32 bytes
    pub amount: u64,                // 8 bytes
    pub pending_rewards: u64,       // 8 bytes
    pub total_rewards_claimed: u64, // 8 bytes
    pub stake_start_time: i64,      // 8 bytes
    pub last_update_time: i64,      // 8 bytes
}

// Error Types

#[error_code]
pub enum StakingError {
    #[msg("Invalid amount provided")]
    InvalidAmount,
    #[msg("Insufficient stake balance")]
    InsufficientStake,
    #[msg("No active stake found")]
    NoActiveStake,
    #[msg("No rewards to claim")]
    NoRewardsToClaim,
    #[msg("Math overflow occurred")]
    MathOverflow,
    #[msg("Pool is currently paused")]
    PoolPaused,
    #[msg("Unauthorized access")]
    Unauthorized,
} 