use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("11111111111111111111111111111111");

#[program]
pub mod aura_multisig {
    use super::*;

    pub fn initialize_multisig(
        ctx: Context<InitializeMultisig>,
        owners: Vec<Pubkey>,
        threshold: u8,
    ) -> Result<()> {
        require!(threshold > 0 && threshold <= owners.len() as u8, MultisigError::InvalidThreshold);
        require!(owners.len() <= 10, MultisigError::TooManyOwners);
        
        let multisig = &mut ctx.accounts.multisig;
        multisig.owners = owners;
        multisig.threshold = threshold;
        multisig.nonce = 0;
        multisig.bump = *ctx.bumps.get("multisig").unwrap();
        
        emit!(MultisigInitialized {
            multisig: multisig.key(),
            owners: multisig.owners.clone(),
            threshold: multisig.threshold,
        });
        
        Ok(())
    }

    pub fn create_transaction(
        ctx: Context<CreateTransaction>,
        amount: u64,
        destination: Pubkey,
        category: TransactionCategory,
    ) -> Result<()> {
        let transaction = &mut ctx.accounts.transaction;
        let multisig = &ctx.accounts.multisig;
        
        transaction.multisig = multisig.key();
        transaction.amount = amount;
        transaction.destination = destination;
        transaction.category = category;
        transaction.executed = false;
        transaction.approvals = vec![false; multisig.owners.len()];
        transaction.created_at = Clock::get()?.unix_timestamp;
        transaction.bump = *ctx.bumps.get("transaction").unwrap();
        
        emit!(TransactionCreated {
            multisig: multisig.key(),
            transaction: transaction.key(),
            amount,
            destination,
            category,
            created_at: transaction.created_at,
        });
        
        Ok(())
    }

    pub fn approve_transaction(ctx: Context<ApproveTransaction>) -> Result<()> {
        let transaction = &mut ctx.accounts.transaction;
        let multisig = &ctx.accounts.multisig;
        let signer = ctx.accounts.signer.key();
        
        // Find signer in owners list
        let owner_index = multisig.owners.iter()
            .position(|&owner| owner == signer)
            .ok_or(MultisigError::NotOwner)?;
        
        require!(!transaction.approvals[owner_index], MultisigError::AlreadyApproved);
        
        transaction.approvals[owner_index] = true;
        
        emit!(TransactionApproved {
            multisig: multisig.key(),
            transaction: transaction.key(),
            approver: signer,
            approval_count: transaction.approvals.iter().filter(|&&approved| approved).count() as u8,
        });
        
        Ok(())
    }

    pub fn execute_transaction(ctx: Context<ExecuteTransaction>) -> Result<()> {
        let transaction = &mut ctx.accounts.transaction;
        let multisig = &ctx.accounts.multisig;
        
        require!(!transaction.executed, MultisigError::AlreadyExecuted);
        
        let approval_count = transaction.approvals.iter().filter(|&&approved| approved).count() as u8;
        require!(approval_count >= multisig.threshold, MultisigError::InsufficientApprovals);
        
        // Execute SOL transfer
        let cpi_context = CpiContext::new_with_signer(
            ctx.accounts.system_program.to_account_info(),
            anchor_lang::system_program::Transfer {
                from: ctx.accounts.multisig_vault.to_account_info(),
                to: ctx.accounts.destination.to_account_info(),
            },
            &[&[
                b"multisig",
                &multisig.key().to_bytes(),
                &[multisig.bump],
            ]],
        );
        
        anchor_lang::system_program::transfer(cpi_context, transaction.amount)?;
        
        transaction.executed = true;
        transaction.executed_at = Some(Clock::get()?.unix_timestamp);
        
        emit!(TransactionExecuted {
            multisig: multisig.key(),
            transaction: transaction.key(),
            amount: transaction.amount,
            destination: transaction.destination,
            category: transaction.category,
            executed_at: transaction.executed_at.unwrap(),
        });
        
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeMultisig<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 * 10 + 1 + 8 + 1, // discriminator + owners + threshold + nonce + bump
        seeds = [b"multisig"],
        bump
    )]
    pub multisig: Account<'info, Multisig>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateTransaction<'info> {
    #[account(
        init,
        payer = signer,
        space = 8 + 32 + 8 + 32 + 1 + 1 + 10 + 8 + 8 + 1, // discriminator + multisig + amount + destination + category + executed + approvals + created_at + executed_at + bump
        seeds = [b"transaction", multisig.key().as_ref(), &multisig.nonce.to_le_bytes()],
        bump
    )]
    pub transaction: Account<'info, MultisigTransaction>,
    
    #[account(mut)]
    pub multisig: Account<'info, Multisig>,
    
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ApproveTransaction<'info> {
    #[account(mut)]
    pub transaction: Account<'info, MultisigTransaction>,
    
    pub multisig: Account<'info, Multisig>,
    pub signer: Signer<'info>,
}

#[derive(Accounts)]
pub struct ExecuteTransaction<'info> {
    #[account(mut)]
    pub transaction: Account<'info, MultisigTransaction>,
    
    #[account(mut)]
    pub multisig: Account<'info, Multisig>,
    
    #[account(mut)]
    pub multisig_vault: SystemAccount<'info>,
    
    #[account(mut)]
    /// CHECK: Destination account for transfer
    pub destination: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Multisig {
    pub owners: Vec<Pubkey>,
    pub threshold: u8,
    pub nonce: u64,
    pub bump: u8,
}

#[account]
pub struct MultisigTransaction {
    pub multisig: Pubkey,
    pub amount: u64,
    pub destination: Pubkey,
    pub category: TransactionCategory,
    pub executed: bool,
    pub approvals: Vec<bool>,
    pub created_at: i64,
    pub executed_at: Option<i64>,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum TransactionCategory {
    Operations,
    BusinessCosts,
    Marketing,
    ProjectFunding,
}

#[event]
pub struct MultisigInitialized {
    pub multisig: Pubkey,
    pub owners: Vec<Pubkey>,
    pub threshold: u8,
}

#[event]
pub struct TransactionCreated {
    pub multisig: Pubkey,
    pub transaction: Pubkey,
    pub amount: u64,
    pub destination: Pubkey,
    pub category: TransactionCategory,
    pub created_at: i64,
}

#[event]
pub struct TransactionApproved {
    pub multisig: Pubkey,
    pub transaction: Pubkey,
    pub approver: Pubkey,
    pub approval_count: u8,
}

#[event]
pub struct TransactionExecuted {
    pub multisig: Pubkey,
    pub transaction: Pubkey,
    pub amount: u64,
    pub destination: Pubkey,
    pub category: TransactionCategory,
    pub executed_at: i64,
}

#[error_code]
pub enum MultisigError {
    #[msg("Invalid threshold")]
    InvalidThreshold,
    #[msg("Too many owners")]
    TooManyOwners,
    #[msg("Not an owner")]
    NotOwner,
    #[msg("Already approved")]
    AlreadyApproved,
    #[msg("Already executed")]
    AlreadyExecuted,
    #[msg("Insufficient approvals")]
    InsufficientApprovals,
} 