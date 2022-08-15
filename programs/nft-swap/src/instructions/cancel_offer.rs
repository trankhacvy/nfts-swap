use crate::errors::AppError;
use crate::state::NftOfferEscrow;
use anchor_lang::prelude::*;
use anchor_spl::token::{self, CloseAccount, Mint, Token, TokenAccount, Transfer};

#[derive(Accounts)]
pub struct CancelOffer<'info> {
    #[account(mut)]
    pub bidder: Signer<'info>,
    #[account(constraint = bidder_nft_mint.decimals == 0)]
    pub bidder_nft_mint: Box<Account<'info, Mint>>,
    #[account(
        mut,
        constraint = bidder_nft_token_account.owner == bidder.key() @ AppError::CorrectOwner,
        constraint = bidder_nft_token_account.mint == bidder_nft_mint.key() @ AppError::CorrectMint,
    )]
    pub bidder_nft_token_account: Box<Account<'info, TokenAccount>>,
    #[account(constraint = bidder_nft_mint.decimals == 0)]
    pub initializer_nft_mint: Box<Account<'info, Mint>>,
    #[account(
        mut,
        seeds = [b"escrow", initializer_nft_mint.key().as_ref(), bidder_nft_mint.key().as_ref()],
        bump,
        close = bidder
    )]
    pub nft_offer_escrow: Box<Account<'info, NftOfferEscrow>>,
    #[account(
        mut,
        seeds = [b"escrow_token_account", bidder_nft_mint.key().as_ref()],
        bump,
    )]
    pub nft_escrow_token_account: Box<Account<'info, TokenAccount>>,
    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<CancelOffer>) -> Result<()> {
    // transfer nft back to bidder
    let bidder_nft_mint_key = ctx.accounts.bidder_nft_mint.key();
    let initializer_nft_mint_key = ctx.accounts.initializer_nft_mint.key();
    let signer: &[&[&[u8]]] = &[&[
        "escrow".as_ref(),
        initializer_nft_mint_key.as_ref(),
        bidder_nft_mint_key.as_ref(),
        &[*ctx.bumps.get("nft_offer_escrow").unwrap()],
    ]];

    token::transfer(
        ctx.accounts
            .into_transfer_to_bidder_context()
            .with_signer(signer),
        1,
    )?;

    token::close_account(
        ctx.accounts
            .into_close_account_context()
            .with_signer(signer),
    )?;

    Ok(())
}

impl<'info> CancelOffer<'info> {
    fn into_transfer_to_bidder_context(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.nft_escrow_token_account.to_account_info().clone(),
            to: self.bidder_nft_token_account.to_account_info().clone(),
            authority: self.nft_offer_escrow.to_account_info().clone(),
        };
        let cpi_program = self.token_program.to_account_info();
        CpiContext::new(cpi_program, cpi_accounts)
    }

    fn into_close_account_context(&self) -> CpiContext<'_, '_, '_, 'info, CloseAccount<'info>> {
        let cpi_accounts = CloseAccount {
            account: self.nft_escrow_token_account.to_account_info().clone(),
            destination: self.bidder.to_account_info().clone(),
            authority: self.nft_offer_escrow.to_account_info().clone(),
        };
        let cpi_program = self.token_program.to_account_info();
        CpiContext::new(cpi_program, cpi_accounts)
    }
}
