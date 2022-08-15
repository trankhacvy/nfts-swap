use crate::errors::AppError;
use crate::state::{ListingEvent, NftEscrow};
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

#[derive(Accounts)]
pub struct CreateListing<'info> {
    #[account(mut)]
    pub initializer: Signer<'info>,
    #[account(constraint = initializer_nft_mint.decimals == 0)]
    pub initializer_nft_mint: Box<Account<'info, Mint>>,
    #[account(
        mut,
        constraint = initializer_nft_token_account.owner == initializer.key() @ AppError::CorrectOwner,
        constraint = initializer_nft_token_account.mint == initializer_nft_mint.key() @ AppError::CorrectMint,
    )]
    pub initializer_nft_token_account: Box<Account<'info, TokenAccount>>,
    #[account(
        init,
        seeds = [b"escrow".as_ref(), initializer_nft_mint.key().as_ref()],
        bump,
        space = NftEscrow::SIZE + 8,
        payer = initializer
    )]
    pub nft_escrow: Box<Account<'info, NftEscrow>>,
    #[account(
        init,
        token::mint = initializer_nft_mint,
        token::authority = nft_escrow,
        seeds = [b"escrow_token_account", initializer_nft_mint.key().as_ref()],
        bump,
        payer = initializer
    )]
    pub nft_escrow_token_account: Box<Account<'info, TokenAccount>>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(ctx: Context<CreateListing>) -> Result<()> {
    ctx.accounts.nft_escrow.initializer = ctx.accounts.initializer.key();
    ctx.accounts.nft_escrow.nft_mint = ctx.accounts.initializer_nft_mint.key();
    ctx.accounts.nft_escrow.nft_escrow_token_account = ctx.accounts.nft_escrow_token_account.key();

    token::transfer(ctx.accounts.into_transfer_to_escrow_context(), 1)?;

    emit!(ListingEvent {
        initializer: ctx.accounts.initializer.key(),
        nft_mint: ctx.accounts.initializer_nft_mint.key(),
    });

    Ok(())
}

impl<'info> CreateListing<'info> {
    fn into_transfer_to_escrow_context(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.initializer_nft_token_account.to_account_info().clone(),
            to: self.nft_escrow_token_account.to_account_info().clone(),
            authority: self.initializer.to_account_info().clone(),
        };
        let cpi_program = self.token_program.to_account_info();
        CpiContext::new(cpi_program, cpi_accounts)
    }
}