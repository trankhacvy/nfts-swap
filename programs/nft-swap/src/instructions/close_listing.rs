use crate::errors::AppError;
use crate::state::{NftEscrow, CancelListingEvent};
use anchor_lang::prelude::*;
use anchor_spl::token::{self, CloseAccount, Mint, Token, TokenAccount, Transfer};

#[derive(Accounts)]
pub struct CloseListing<'info> {
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

pub fn handler(ctx: Context<CloseListing>) -> Result<()> {
    // transfer nft back to initializer
    let initializer_nft_mint_key = ctx.accounts.initializer_nft_mint.key();
    let signer: &[&[&[u8]]] = &[&[
        "escrow".as_ref(),
        initializer_nft_mint_key.as_ref(),
        &[*ctx.bumps.get("nft_escrow").unwrap()],
    ]];
    
    let cpi_accounts = Transfer {
        from: ctx.accounts.nft_escrow_token_account.to_account_info(),
        to: ctx.accounts.initializer_nft_token_account.to_account_info(),
        authority: ctx.accounts.nft_escrow.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
    token::transfer(cpi_ctx, 1)?;

    // close token account
    let cpi_accounts1 = CloseAccount {
        account: ctx.accounts.nft_escrow_token_account.to_account_info(),
        destination: ctx.accounts.initializer.to_account_info(),
        authority: ctx.accounts.nft_escrow.to_account_info(),
    };
    let cpi_program1 = ctx.accounts.token_program.to_account_info();
    let cpi_ctx1 = CpiContext::new_with_signer(cpi_program1, cpi_accounts1, signer);
    token::close_account(cpi_ctx1)?;

    emit!(CancelListingEvent {
        initializer: ctx.accounts.initializer.key(),
        nft_mint: ctx.accounts.initializer_nft_mint.key(),
    });

    Ok(())
}
