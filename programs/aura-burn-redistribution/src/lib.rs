use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer, Burn};
use std::collections::HashMap;

declare_id!("3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe");

#[program]
pub mod aura_burn_redistribution {
    use super::*;

    /// Initialize the staking program with tax configuration
    pub fn initialize(
        ctx: Context<Initialize>,
        redistribution_frequency: i64, // Seconds (21600 = 6 hours)
        stake_tax_rate: u16,           // Basis points (100 = 1%)
        unstake_tax_rate: u16,         // Basis points (200 = 2%) 
        reward_tax_rate: u16,          // Basis points (150 = 1.5%)
    ) -> Result<()> {
        let global_state = &mut ctx.accounts.global_state;
        global_state.authority = ctx.accounts.authority.key();
        global_state.redistribution_frequency = redistribution_frequency;
        global_state.stake_tax_rate = stake_tax_rate;
        global_state.unstake_tax_rate = unstake_tax_rate;
        global_state.reward_tax_rate = reward_tax_rate;
        global_state.total_staked = 0;
        global_state.total_tax_collected = 0;
        global_state.last_distribution = Clock::get()?.unix_timestamp;
        global_state.distribution_round = 0;
        global_state.is_paused = false;
        
        emit!(ProgramInitialized {
            authority: global_state.authority,
            stake_tax_rate,
            unstake_tax_rate,
            reward_tax_rate,
            redistribution_frequency,
        });

        Ok(())
    }

    /// Update tax rates (only authority)
    pub fn update_tax_rates(
        ctx: Context<UpdateTaxRates>,
        stake_tax_rate: u16,
        unstake_tax_rate: u16,
        reward_tax_rate: u16,
    ) -> Result<()> {
        let global_state = &mut ctx.accounts.global_state;
        
        // Validate tax rates (max 10% = 1000 basis points)
        require!(stake_tax_rate <= 1000, ErrorCode::TaxRateTooHigh);
        require!(unstake_tax_rate <= 1000, ErrorCode::TaxRateTooHigh);
        require!(reward_tax_rate <= 1000, ErrorCode::TaxRateTooHigh);
        
        global_state.stake_tax_rate = stake_tax_rate;
        global_state.unstake_tax_rate = unstake_tax_rate;
        global_state.reward_tax_rate = reward_tax_rate;
        
        emit!(TaxRatesUpdated {
            authority: ctx.accounts.authority.key(),
            stake_tax_rate,
            unstake_tax_rate,
            reward_tax_rate,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    /// Stake AURA tokens with tax deduction
    pub fn stake_tokens(
        ctx: Context<StakeTokens>,
        amount: u64,
    ) -> Result<()> {
        let global_state = &mut ctx.accounts.global_state;
        let staking_account = &mut ctx.accounts.staking_account;
        
        require!(!global_state.is_paused, ErrorCode::ProgramPaused);
        require!(amount > 0, ErrorCode::InvalidAmount);

        // Calculate stake tax
        let tax_amount = (amount as u128)
            .checked_mul(global_state.stake_tax_rate as u128)
            .ok_or(ErrorCode::MathOverflow)?
            .checked_div(10000)
            .ok_or(ErrorCode::MathOverflow)? as u64;
            
        let net_stake_amount = amount
            .checked_sub(tax_amount)
            .ok_or(ErrorCode::MathOverflow)?;

        // Transfer total amount from user to staking pool
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

        // Tax stays in staking pool for redistribution to stakers
        // No need to transfer tax - it automatically becomes part of reward pool

        // Update staking account (only net amount counts toward staking)
        staking_account.owner = ctx.accounts.user.key();
        staking_account.staked_amount = staking_account.staked_amount
            .checked_add(net_stake_amount)
            .ok_or(ErrorCode::MathOverflow)?;
        staking_account.last_reward_claim = Clock::get()?.unix_timestamp;

        // Update global state
        global_state.total_staked = global_state.total_staked
            .checked_add(net_stake_amount)
            .ok_or(ErrorCode::MathOverflow)?;
        global_state.total_tax_collected = global_state.total_tax_collected
            .checked_add(tax_amount)
            .ok_or(ErrorCode::MathOverflow)?;

        emit!(TokensStaked {
            user: ctx.accounts.user.key(),
            gross_amount: amount,
            tax_amount,
            net_staked_amount: net_stake_amount,
            total_staked: staking_account.staked_amount,
            global_total_staked: global_state.total_staked,
        });

        Ok(())
    }

    /// Unstake AURA tokens with tax deduction
    pub fn unstake_tokens(
        ctx: Context<UnstakeTokens>,
        amount: u64,
    ) -> Result<()> {
        let global_state = &mut ctx.accounts.global_state;
        let staking_account = &mut ctx.accounts.staking_account;
        
        require!(!global_state.is_paused, ErrorCode::ProgramPaused);
        require!(amount > 0, ErrorCode::InvalidAmount);
        require!(staking_account.staked_amount >= amount, ErrorCode::InsufficientStaked);

        // Calculate unstake tax
        let tax_amount = (amount as u128)
            .checked_mul(global_state.unstake_tax_rate as u128)
            .ok_or(ErrorCode::MathOverflow)?
            .checked_div(10000)
            .ok_or(ErrorCode::MathOverflow)? as u64;
            
        let net_unstake_amount = amount
            .checked_sub(tax_amount)
            .ok_or(ErrorCode::MathOverflow)?;

        // Calculate pending rewards before unstaking
        calculate_pending_rewards(staking_account, global_state)?;

        let seeds = &[
            b"staking_pool".as_ref(),
            &[ctx.bumps.staking_pool],
        ];
        let signer = &[&seeds[..]];

        // Transfer net amount back to user
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
        
        token::transfer(transfer_ctx, net_unstake_amount)?;

        // Tax remains in staking pool to increase reward pool for all stakers

        // Update staking account
        staking_account.staked_amount = staking_account.staked_amount
            .checked_sub(amount)
            .ok_or(ErrorCode::MathOverflow)?;

        // Update global state
        global_state.total_staked = global_state.total_staked
            .checked_sub(amount)
            .ok_or(ErrorCode::MathOverflow)?;
        global_state.total_tax_collected = global_state.total_tax_collected
            .checked_add(tax_amount)
            .ok_or(ErrorCode::MathOverflow)?;

        emit!(TokensUnstaked {
            user: ctx.accounts.user.key(),
            gross_amount: amount,
            tax_amount,
            net_received_amount: net_unstake_amount,
            remaining_staked: staking_account.staked_amount,
            global_total_staked: global_state.total_staked,
        });

        Ok(())
    }

    /// Claim accumulated rewards with tax deduction
    pub fn claim_rewards(ctx: Context<ClaimRewards>) -> Result<()> {
        let global_state = &mut ctx.accounts.global_state;
        let staking_account = &mut ctx.accounts.staking_account;
        
        require!(!global_state.is_paused, ErrorCode::ProgramPaused);
        
        // Calculate pending rewards
        calculate_pending_rewards(staking_account, global_state)?;
        
        let gross_reward_amount = staking_account.pending_rewards;
        require!(gross_reward_amount > 0, ErrorCode::NoRewardsToClaim);

        // Calculate reward tax
        let tax_amount = (gross_reward_amount as u128)
            .checked_mul(global_state.reward_tax_rate as u128)
            .ok_or(ErrorCode::MathOverflow)?
            .checked_div(10000)
            .ok_or(ErrorCode::MathOverflow)? as u64;
            
        let net_reward_amount = gross_reward_amount
            .checked_sub(tax_amount)
            .ok_or(ErrorCode::MathOverflow)?;

        let seeds = &[
            b"staking_pool".as_ref(),
            &[ctx.bumps.staking_pool],
        ];
        let signer = &[&seeds[..]];

        // Transfer net rewards to user
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
        
        token::transfer(transfer_ctx, net_reward_amount)?;

        // Tax remains in staking pool to boost rewards for all stakers

        // Update global tax collection
        global_state.total_tax_collected = global_state.total_tax_collected
            .checked_add(tax_amount)
            .ok_or(ErrorCode::MathOverflow)?;

        // Reset pending rewards
        staking_account.pending_rewards = 0;
        staking_account.last_reward_claim = Clock::get()?.unix_timestamp;

        emit!(RewardsClaimed {
            user: ctx.accounts.user.key(),
            gross_reward_amount,
            tax_amount,
            net_reward_amount,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    /// Distribute rewards to stakers (called periodically)
    /// This includes both the natural yield AND the tax collected from all staking operations
    pub fn distribute_rewards(ctx: Context<DistributeRewards>) -> Result<()> {
        let global_state = &mut ctx.accounts.global_state;
        let clock = Clock::get()?;
        
        require!(!global_state.is_paused, ErrorCode::ProgramPaused);
        require!(
            clock.unix_timestamp >= global_state.last_distribution + global_state.redistribution_frequency,
            ErrorCode::DistributionTooEarly
        );
        require!(global_state.total_staked > 0, ErrorCode::NoStakers);

        // Calculate base reward per token (natural staking yield)
        let base_reward_per_token = if global_state.total_staked > 0 {
            // Base yield: 8% APY distributed proportionally
            let time_elapsed = clock.unix_timestamp - global_state.last_distribution;
            let annual_rate = 800; // 8% = 800 basis points
            let seconds_per_year = 365 * 24 * 60 * 60;
            
            (global_state.total_staked as u128)
                .checked_mul(annual_rate as u128)
                .ok_or(ErrorCode::MathOverflow)?
                .checked_mul(time_elapsed as u128)
                .ok_or(ErrorCode::MathOverflow)?
                .checked_div(10000)
                .ok_or(ErrorCode::MathOverflow)?
                .checked_div(seconds_per_year)
                .ok_or(ErrorCode::MathOverflow)?
                .checked_mul(1_000_000) // Scale for precision
                .ok_or(ErrorCode::MathOverflow)?
                .checked_div(global_state.total_staked as u128)
                .ok_or(ErrorCode::MathOverflow)? as u64
        } else {
            0
        };

        // Calculate tax bonus per token (redistributed tax rewards)
        let tax_bonus_per_token = if global_state.total_staked > 0 && global_state.total_tax_collected > 0 {
            (global_state.total_tax_collected as u128)
                .checked_mul(1_000_000) // Scale for precision
                .ok_or(ErrorCode::MathOverflow)?
                .checked_div(global_state.total_staked as u128)
                .ok_or(ErrorCode::MathOverflow)? as u64
        } else {
            0
        };

        let total_reward_per_token = base_reward_per_token + tax_bonus_per_token;

        // Update global state
        global_state.last_distribution = clock.unix_timestamp;
        global_state.distribution_round = global_state.distribution_round
            .checked_add(1)
            .ok_or(ErrorCode::MathOverflow)?;
        
        // Reset tax collection counter for next cycle
        let distributed_tax = global_state.total_tax_collected;
        global_state.total_tax_collected = 0;

        emit!(RewardsDistributed {
            distribution_round: global_state.distribution_round,
            reward_per_token: total_reward_per_token,
            tax_redistributed: distributed_tax,
            total_stakers: global_state.total_staked,
            timestamp: clock.unix_timestamp,
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
    
    // Calculate rewards based on time and staked amount (example: 12% APY)
    let annual_reward_rate = 1200; // 12% = 1200 basis points
    let seconds_per_year = 365 * 24 * 60 * 60;
    
    let time_based_reward = (staking_account.staked_amount as u128)
        .checked_mul(annual_reward_rate as u128)
        .ok_or(ErrorCode::MathOverflow)?
        .checked_mul(time_staked as u128)
        .ok_or(ErrorCode::MathOverflow)?
        .checked_div(10000)
        .ok_or(ErrorCode::MathOverflow)?
        .checked_div(seconds_per_year)
        .ok_or(ErrorCode::MathOverflow)? as u64;
    
    staking_account.pending_rewards = staking_account.pending_rewards
        .checked_add(time_based_reward)
        .ok_or(ErrorCode::MathOverflow)?;
    
    Ok(())
}

// Account Structures
#[account]
pub struct GlobalState {
    pub authority: Pubkey,
    pub redistribution_frequency: i64,
    pub stake_tax_rate: u16,        // Basis points (100 = 1%)
    pub unstake_tax_rate: u16,      // Basis points  
    pub reward_tax_rate: u16,       // Basis points
    pub total_staked: u64,
    pub total_tax_collected: u64,
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
pub struct UpdateTaxRates<'info> {
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
pub struct ClaimRewards<'info> {
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
    pub stake_tax_rate: u16,
    pub unstake_tax_rate: u16,
    pub reward_tax_rate: u16,
    pub redistribution_frequency: i64,
}

#[event]
pub struct TaxRatesUpdated {
    pub authority: Pubkey,
    pub stake_tax_rate: u16,
    pub unstake_tax_rate: u16,
    pub reward_tax_rate: u16,
    pub timestamp: i64,
}

#[event]
pub struct TokensStaked {
    pub user: Pubkey,
    pub gross_amount: u64,
    pub tax_amount: u64,
    pub net_staked_amount: u64,
    pub total_staked: u64,
    pub global_total_staked: u64,
}

#[event]
pub struct TokensUnstaked {
    pub user: Pubkey,
    pub gross_amount: u64,
    pub tax_amount: u64,
    pub net_received_amount: u64,
    pub remaining_staked: u64,
    pub global_total_staked: u64,
}

#[event]
pub struct RewardsClaimed {
    pub user: Pubkey,
    pub gross_reward_amount: u64,
    pub tax_amount: u64,
    pub net_reward_amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct RewardsDistributed {
    pub distribution_round: u64,
    pub reward_per_token: u64,
    pub tax_redistributed: u64,
    pub total_stakers: u64,
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
    #[msg("Tax rate too high (max 10%)")]
    TaxRateTooHigh,
} 