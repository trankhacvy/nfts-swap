use crate::errors::AppError;
use crate::state::{CancelListingEvent, NftEscrow};
use anchor_lang::prelude::*;
use anchor_spl::token::{self, CloseAccount, Mint, Token, TokenAccount, Transfer};

#[derive(Accounts)]
pub struct CancelListing<'info> {
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
        mut,
        seeds = [b"escrow".as_ref(), initializer_nft_mint.key().as_ref()],
        bump,
        close = initializer
    )]
    pub nft_escrow: Box<Account<'info, NftEscrow>>,
    #[account(
        mut,
        seeds = [b"escrow_token_account", initializer_nft_mint.key().as_ref()],
        bump,
    )]
    pub nft_escrow_token_account: Box<Account<'info, TokenAccount>>,
    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<CancelListing>) -> Result<()> {
    // transfer nft back to initializer
    let initializer_nft_mint_key = ctx.accounts.initializer_nft_mint.key();
    let signer: &[&[&[u8]]] = &[&[
        "escrow".as_ref(),
        initializer_nft_mint_key.as_ref(),
        &[*ctx.bumps.get("nft_escrow").unwrap()],
    ]];

    token::transfer(
        ctx.accounts
            .into_transfer_to_initializer_context()
            .with_signer(signer),
        1,
    )?;

    token::close_account(
        ctx.accounts
            .into_close_account_context()
            .with_signer(signer),
    )?;

    emit!(CancelListingEvent {
        initializer: ctx.accounts.initializer.key(),
        nft_mint: ctx.accounts.initializer_nft_mint.key(),
    });

    Ok(())
}

impl<'info> CancelListing<'info> {
    fn into_transfer_to_initializer_context(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.nft_escrow_token_account.to_account_info().clone(),
            to: self.initializer_nft_token_account.to_account_info().clone(),
            authority: self.nft_escrow.to_account_info().clone(),
        };
        let cpi_program = self.token_program.to_account_info();
        CpiContext::new(cpi_program, cpi_accounts)
    }

    fn into_close_account_context(
        &self,
    ) -> CpiContext<'_, '_, '_, 'info, CloseAccount<'info>> {
        let cpi_accounts = CloseAccount {
            account: self.nft_escrow_token_account.to_account_info().clone(),
            destination: self.initializer.to_account_info().clone(),
            authority: self.nft_escrow.to_account_info().clone(),
        };
        let cpi_program = self.token_program.to_account_info();
        CpiContext::new(cpi_program, cpi_accounts)
    }
}
