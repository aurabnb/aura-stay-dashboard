use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer, Burn};
use std::collections::HashMap;

declare_id!("3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe");

#[program]
pub mod aura_burn_redistribution {
    use super::*;

    /// Initialize the burn redistribution program
    pub fn initialize(
        ctx: Context<Initialize>,
        burn_percentage: u16, // Basis points (200 = 2%)
        redistribution_frequency: i64, // Seconds (21600 = 6 hours)
    ) -> Result<()> {
        let global_state = &mut ctx.accounts.global_state;
        global_state.authority = ctx.accounts.authority.key();
        global_state.burn_percentage = burn_percentage;
        global_state.redistribution_frequency = redistribution_frequency;
        global_state.total_burned = 0;
        global_state.total_staked = 0;
        global_state.last_distribution = Clock::get()?.unix_timestamp;
        global_state.distribution_round = 0;
        global_state.is_paused = false;
        
        emit!(ProgramInitialized {
            authority: global_state.authority,
            burn_percentage,
            redistribution_frequency,
        });

        Ok(())
    }

    /// Process a transaction with 2% burn
    pub fn process_transaction(
        ctx: Context<ProcessTransaction>,
        amount: u64,
    ) -> Result<()> {
        let global_state = &mut ctx.accounts.global_state;
        
        // Check if program is paused
        require!(!global_state.is_paused, ErrorCode::ProgramPaused);
        
        // Calculate burn amount (2% = 200 basis points)
        let burn_amount = (amount as u128)
            .checked_mul(global_state.burn_percentage as u128)
            .ok_or(ErrorCode::MathOverflow)?
            .checked_div(10000)
            .ok_or(ErrorCode::MathOverflow)? as u64;

        // Transfer tokens from user to burn pool
        let transfer_instruction = Transfer {
            from: ctx.accounts.user_token_account.to_account_info(),
            to: ctx.accounts.burn_pool.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };
        
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            transfer_instruction,
        );
        
        token::transfer(transfer_ctx, burn_amount)?;

        // Update global state
        global_state.total_burned = global_state.total_burned
            .checked_add(burn_amount)
            .ok_or(ErrorCode::MathOverflow)?;

        emit!(TransactionProcessed {
            user: ctx.accounts.user.key(),
            original_amount: amount,
            burn_amount,
            total_burned: global_state.total_burned,
        });

        Ok(())
    }

    /// Stake AURA tokens to earn redistribution rewards
    pub fn stake_tokens(
        ctx: Context<StakeTokens>,
        amount: u64,
    ) -> Result<()> {
        let global_state = &mut ctx.accounts.global_state;
        let staking_account = &mut ctx.accounts.staking_account;
        
        require!(!global_state.is_paused, ErrorCode::ProgramPaused);
        require!(amount > 0, ErrorCode::InvalidAmount);

        // Transfer tokens from user to staking pool
        let transfer_instruction = Transfer {
            from: ctx.accounts.user_token_account.to_account_info(),
            to: ctx.accounts.staking_pool.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };
        
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            transfer_instruction,
        );
        
        token::transfer(transfer_ctx, amount)?;

        // Update staking account
        staking_account.owner = ctx.accounts.user.key();
        staking_account.staked_amount = staking_account.staked_amount
            .checked_add(amount)
            .ok_or(ErrorCode::MathOverflow)?;
        staking_account.last_reward_claim = Clock::get()?.unix_timestamp;
        staking_account.pending_rewards = 0;

        // Update global state
        global_state.total_staked = global_state.total_staked
            .checked_add(amount)
            .ok_or(ErrorCode::MathOverflow)?;

        emit!(TokensStaked {
            user: ctx.accounts.user.key(),
            amount,
            total_staked: staking_account.staked_amount,
            global_total_staked: global_state.total_staked,
        });

        Ok(())
    }

    /// Unstake AURA tokens
    pub fn unstake_tokens(
        ctx: Context<UnstakeTokens>,
        amount: u64,
    ) -> Result<()> {
        let global_state = &mut ctx.accounts.global_state;
        let staking_account = &mut ctx.accounts.staking_account;
        
        require!(!global_state.is_paused, ErrorCode::ProgramPaused);
        require!(amount > 0, ErrorCode::InvalidAmount);
        require!(staking_account.staked_amount >= amount, ErrorCode::InsufficientStaked);

        // Calculate pending rewards before unstaking
        calculate_pending_rewards(staking_account, global_state)?;

        // Transfer tokens back to user
        let seeds = &[
            b"staking_pool".as_ref(),
            &[ctx.bumps.staking_pool],
        ];
        let signer = &[&seeds[..]];

        let transfer_instruction = Transfer {
            from: ctx.accounts.staking_pool.to_account_info(),
            to: ctx.accounts.user_token_account.to_account_info(),
            authority: ctx.accounts.staking_pool.to_account_info(),
        };
        
        let transfer_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            transfer_instruction,
            signer,
        );
        
        token::transfer(transfer_ctx, amount)?;

        // Update staking account
        staking_account.staked_amount = staking_account.staked_amount
            .checked_sub(amount)
            .ok_or(ErrorCode::MathOverflow)?;

        // Update global state
        global_state.total_staked = global_state.total_staked
            .checked_sub(amount)
            .ok_or(ErrorCode::MathOverflow)?;

        emit!(TokensUnstaked {
            user: ctx.accounts.user.key(),
            amount,
            remaining_staked: staking_account.staked_amount,
            global_total_staked: global_state.total_staked,
        });

        Ok(())
    }

    /// Distribute rewards to stakers (called every 6 hours)
    pub fn distribute_rewards(ctx: Context<DistributeRewards>) -> Result<()> {
        let global_state = &mut ctx.accounts.global_state;
        let clock = Clock::get()?;
        
        require!(!global_state.is_paused, ErrorCode::ProgramPaused);
        require!(
            clock.unix_timestamp >= global_state.last_distribution + global_state.redistribution_frequency,
            ErrorCode::DistributionTooEarly
        );
        require!(global_state.total_staked > 0, ErrorCode::NoStakers);

        // Calculate reward per token
        let reward_per_token = if global_state.total_staked > 0 {
            (global_state.total_burned as u128)
                .checked_mul(1_000_000) // Scale for precision
                .ok_or(ErrorCode::MathOverflow)?
                .checked_div(global_state.total_staked as u128)
                .ok_or(ErrorCode::MathOverflow)? as u64
        } else {
            0
        };

        // Update global state
        global_state.last_distribution = clock.unix_timestamp;
        global_state.distribution_round = global_state.distribution_round
            .checked_add(1)
            .ok_or(ErrorCode::MathOverflow)?;
        
        // Reset burn pool for next cycle
        global_state.total_burned = 0;

        emit!(RewardsDistributed {
            distribution_round: global_state.distribution_round,
            reward_per_token,
            total_stakers: global_state.total_staked,
            timestamp: clock.unix_timestamp,
        });

        Ok(())
    }

    /// Claim accumulated rewards
    pub fn claim_rewards(ctx: Context<ClaimRewards>) -> Result<()> {
        let global_state = &ctx.accounts.global_state;
        let staking_account = &mut ctx.accounts.staking_account;
        
        require!(!global_state.is_paused, ErrorCode::ProgramPaused);
        
        // Calculate pending rewards
        calculate_pending_rewards(staking_account, global_state)?;
        
        let reward_amount = staking_account.pending_rewards;
        require!(reward_amount > 0, ErrorCode::NoRewardsToClaim);

        // Transfer rewards from burn pool to user
        let seeds = &[
            b"burn_pool".as_ref(),
            &[ctx.bumps.burn_pool],
        ];
        let signer = &[&seeds[..]];

        let transfer_instruction = Transfer {
            from: ctx.accounts.burn_pool.to_account_info(),
            to: ctx.accounts.user_token_account.to_account_info(),
            authority: ctx.accounts.burn_pool.to_account_info(),
        };
        
        let transfer_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            transfer_instruction,
            signer,
        );
        
        token::transfer(transfer_ctx, reward_amount)?;

        // Reset pending rewards
        staking_account.pending_rewards = 0;
        staking_account.last_reward_claim = Clock::get()?.unix_timestamp;

        emit!(RewardsClaimed {
            user: ctx.accounts.user.key(),
            amount: reward_amount,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    /// Emergency pause (only authority)
    pub fn pause_program(ctx: Context<PauseProgram>) -> Result<()> {
        let global_state = &mut ctx.accounts.global_state;
        global_state.is_paused = true;
        
        emit!(ProgramPaused {
            authority: ctx.accounts.authority.key(),
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    /// Resume program (only authority)
    pub fn resume_program(ctx: Context<ResumeProgram>) -> Result<()> {
        let global_state = &mut ctx.accounts.global_state;
        global_state.is_paused = false;
        
        emit!(ProgramResumed {
            authority: ctx.accounts.authority.key(),
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }
}

// Helper function to calculate pending rewards
fn calculate_pending_rewards(
    staking_account: &mut StakingAccount,
    global_state: &GlobalState,
) -> Result<()> {
    // Simplified reward calculation - in production, this would be more sophisticated
    let time_staked = Clock::get()?.unix_timestamp - staking_account.last_reward_claim;
    let daily_rewards = (staking_account.staked_amount as u128)
        .checked_mul(global_state.total_burned as u128)
        .ok_or(ErrorCode::MathOverflow)?
        .checked_div(global_state.total_staked as u128)
        .ok_or(ErrorCode::MathOverflow)? as u64;
    
    staking_account.pending_rewards = staking_account.pending_rewards
        .checked_add(daily_rewards)
        .ok_or(ErrorCode::MathOverflow)?;
    
    Ok(())
}

// Account Structures
#[account]
pub struct GlobalState {
    pub authority: Pubkey,
    pub burn_percentage: u16,
    pub redistribution_frequency: i64,
    pub total_burned: u64,
    pub total_staked: u64,
    pub last_distribution: i64,
    pub distribution_round: u64,
    pub is_paused: bool,
}

#[account]
pub struct StakingAccount {
    pub owner: Pubkey,
    pub staked_amount: u64,
    pub pending_rewards: u64,
    pub last_reward_claim: i64,
}

// Context Structures
#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + std::mem::size_of::<GlobalState>(),
        seeds = [b"global_state"],
        bump
    )]
    pub global_state: Account<'info, GlobalState>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ProcessTransaction<'info> {
    #[account(mut, seeds = [b"global_state"], bump)]
    pub global_state: Account<'info, GlobalState>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        seeds = [b"burn_pool"],
        bump
    )]
    pub burn_pool: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct StakeTokens<'info> {
    #[account(mut, seeds = [b"global_state"], bump)]
    pub global_state: Account<'info, GlobalState>,
    
    #[account(
        init_if_needed,
        payer = user,
        space = 8 + std::mem::size_of::<StakingAccount>(),
        seeds = [b"staking_account", user.key().as_ref()],
        bump
    )]
    pub staking_account: Account<'info, StakingAccount>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        seeds = [b"staking_pool"],
        bump
    )]
    pub staking_pool: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UnstakeTokens<'info> {
    #[account(mut, seeds = [b"global_state"], bump)]
    pub global_state: Account<'info, GlobalState>,
    
    #[account(
        mut,
        seeds = [b"staking_account", user.key().as_ref()],
        bump
    )]
    pub staking_account: Account<'info, StakingAccount>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        seeds = [b"staking_pool"],
        bump
    )]
    pub staking_pool: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct DistributeRewards<'info> {
    #[account(mut, seeds = [b"global_state"], bump)]
    pub global_state: Account<'info, GlobalState>,
    
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct ClaimRewards<'info> {
    #[account(seeds = [b"global_state"], bump)]
    pub global_state: Account<'info, GlobalState>,
    
    #[account(
        mut,
        seeds = [b"staking_account", user.key().as_ref()],
        bump
    )]
    pub staking_account: Account<'info, StakingAccount>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        seeds = [b"burn_pool"],
        bump
    )]
    pub burn_pool: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct PauseProgram<'info> {
    #[account(
        mut,
        seeds = [b"global_state"],
        bump,
        has_one = authority
    )]
    pub global_state: Account<'info, GlobalState>,
    
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct ResumeProgram<'info> {
    #[account(
        mut,
        seeds = [b"global_state"],
        bump,
        has_one = authority
    )]
    pub global_state: Account<'info, GlobalState>,
    
    pub authority: Signer<'info>,
}

// Events
#[event]
pub struct ProgramInitialized {
    pub authority: Pubkey,
    pub burn_percentage: u16,
    pub redistribution_frequency: i64,
}

#[event]
pub struct TransactionProcessed {
    pub user: Pubkey,
    pub original_amount: u64,
    pub burn_amount: u64,
    pub total_burned: u64,
}

#[event]
pub struct TokensStaked {
    pub user: Pubkey,
    pub amount: u64,
    pub total_staked: u64,
    pub global_total_staked: u64,
}

#[event]
pub struct TokensUnstaked {
    pub user: Pubkey,
    pub amount: u64,
    pub remaining_staked: u64,
    pub global_total_staked: u64,
}

#[event]
pub struct RewardsDistributed {
    pub distribution_round: u64,
    pub reward_per_token: u64,
    pub total_stakers: u64,
    pub timestamp: i64,
}

#[event]
pub struct RewardsClaimed {
    pub user: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct ProgramPaused {
    pub authority: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct ProgramResumed {
    pub authority: Pubkey,
    pub timestamp: i64,
}

// Error Codes
#[error_code]
pub enum ErrorCode {
    #[msg("Program is currently paused")]
    ProgramPaused,
    #[msg("Math operation overflow")]
    MathOverflow,
    #[msg("Invalid amount provided")]
    InvalidAmount,
    #[msg("Insufficient staked tokens")]
    InsufficientStaked,
    #[msg("Distribution called too early")]
    DistributionTooEarly,
    #[msg("No stakers in the pool")]
    NoStakers,
    #[msg("No rewards to claim")]
    NoRewardsToClaim,
} 