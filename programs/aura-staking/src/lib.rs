use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer, Mint};

declare_id!("9SNiVmYxKDG6Y1uRs2e6ivmjsG49KPygvwqmNCooiw4m");

#[program]
pub mod aura_staking {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, admin: Pubkey) -> Result<()> {
        let pool = &mut ctx.accounts.staking_pool;
        pool.admin = admin;
        pool.aura_mint = ctx.accounts.aura_mint.key();
        pool.total_staked = 0;
        pool.bump = *ctx.bumps.get("staking_pool").unwrap();
        pool.vault_bump = *ctx.bumps.get("stake_vault").unwrap();
        Ok(())
    }

    pub fn stake(ctx: Context<Stake>, amount: u64) -> Result<()> {
        require!(amount > 0, ErrorCode::InvalidAmount);
        
        let user_stake = &mut ctx.accounts.user_stake;
        let pool = &mut ctx.accounts.staking_pool;
        
        // Transfer tokens to vault
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.user_token_account.to_account_info(),
                    to: ctx.accounts.stake_vault.to_account_info(),
                    authority: ctx.accounts.user.to_account_info(),
                },
            ),
            amount,
        )?;

        // Update user stake
        user_stake.owner = ctx.accounts.user.key();
        user_stake.amount += amount;
        user_stake.last_update = Clock::get()?.unix_timestamp;

        // Update pool
        pool.total_staked += amount;

        Ok(())
    }

    pub fn claim(ctx: Context<Claim>) -> Result<()> {
        let user_stake = &mut ctx.accounts.user_stake;
        let clock = Clock::get()?;
        
        // Simple reward calculation: 1% per day
        let days_elapsed = (clock.unix_timestamp - user_stake.last_update) / 86400;
        let rewards = (user_stake.amount * days_elapsed as u64) / 100;

        if rewards > 0 {
            // Transfer rewards from vault
            let seeds = &[
                b"staking_pool",
                ctx.accounts.staking_pool.aura_mint.as_ref(),
                &[ctx.accounts.staking_pool.bump],
            ];
            let signer = &[&seeds[..]];

            token::transfer(
                CpiContext::new_with_signer(
                    ctx.accounts.token_program.to_account_info(),
                    Transfer {
                        from: ctx.accounts.stake_vault.to_account_info(),
                        to: ctx.accounts.user_token_account.to_account_info(),
                        authority: ctx.accounts.staking_pool.to_account_info(),
                    },
                    signer,
                ),
                rewards,
            )?;

            user_stake.last_update = clock.unix_timestamp;
        }

        Ok(())
    }

    pub fn unstake(ctx: Context<Unstake>, amount: u64) -> Result<()> {
        let user_stake = &mut ctx.accounts.user_stake;
        
        require!(amount <= user_stake.amount, ErrorCode::InsufficientStake);

        // Get needed values before mutable borrow
        let pool_aura_mint = ctx.accounts.staking_pool.aura_mint;
        let pool_bump = ctx.accounts.staking_pool.bump;

        // Transfer tokens back to user
        let seeds = &[
            b"staking_pool",
            pool_aura_mint.as_ref(),
            &[pool_bump],
        ];
        let signer = &[&seeds[..]];

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.stake_vault.to_account_info(),
                    to: ctx.accounts.user_token_account.to_account_info(),
                    authority: ctx.accounts.staking_pool.to_account_info(),
                },
                signer,
            ),
            amount,
        )?;

        // Update user stake
        user_stake.amount -= amount;
        
        // Update pool
        let pool = &mut ctx.accounts.staking_pool;
        pool.total_staked -= amount;

        Ok(())
    }

    pub fn admin_deposit(ctx: Context<AdminDeposit>, amount: u64) -> Result<()> {
        require!(
            ctx.accounts.admin.key() == ctx.accounts.staking_pool.admin,
            ErrorCode::Unauthorized
        );

        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.admin_token_account.to_account_info(),
                    to: ctx.accounts.stake_vault.to_account_info(),
                    authority: ctx.accounts.admin.to_account_info(),
                },
            ),
            amount,
        )?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = payer,
        space = 8 + 32 + 32 + 8 + 1 + 1,
        seeds = [b"staking_pool", aura_mint.key().as_ref()],
        bump
    )]
    pub staking_pool: Account<'info, StakingPool>,
    
    #[account(
        init,
        payer = payer,
        token::mint = aura_mint,
        token::authority = staking_pool,
        seeds = [b"stake_vault", staking_pool.key().as_ref()],
        bump
    )]
    pub stake_vault: Account<'info, TokenAccount>,
    
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
        space = 8 + 32 + 8 + 8,
        seeds = [b"user_stake", user.key().as_ref(), staking_pool.key().as_ref()],
        bump
    )]
    pub user_stake: Account<'info, UserStake>,
    
    #[account(mut)]
    pub stake_vault: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Claim<'info> {
    pub staking_pool: Account<'info, StakingPool>,
    
    #[account(
        mut,
        seeds = [b"user_stake", user.key().as_ref(), staking_pool.key().as_ref()],
        bump
    )]
    pub user_stake: Account<'info, UserStake>,
    
    #[account(mut)]
    pub stake_vault: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    
    pub user: Signer<'info>,
    pub token_program: Program<'info, Token>,
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
    
    #[account(mut)]
    pub stake_vault: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct AdminDeposit<'info> {
    pub staking_pool: Account<'info, StakingPool>,
    
    #[account(mut)]
    pub stake_vault: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub admin_token_account: Account<'info, TokenAccount>,
    
    pub admin: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[account]
pub struct StakingPool {
    pub admin: Pubkey,          // 32 bytes
    pub aura_mint: Pubkey,      // 32 bytes  
    pub total_staked: u64,      // 8 bytes
    pub bump: u8,               // 1 byte
    pub vault_bump: u8,         // 1 byte
}

#[account]
pub struct UserStake {
    pub owner: Pubkey,          // 32 bytes
    pub amount: u64,            // 8 bytes
    pub last_update: i64,       // 8 bytes
}

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid amount")]
    InvalidAmount,
    #[msg("Insufficient stake")]
    InsufficientStake,
    #[msg("Unauthorized")]
    Unauthorized,
} 