use crate::errors::AppError;
use crate::state::{NftEscrow, NftOfferEscrow};
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

#[derive(Accounts)]
pub struct CreateOffer<'info> {
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
    #[account(constraint = initializer_nft_mint.decimals == 0)]
    pub initializer_nft_mint: Box<Account<'info, Mint>>,
    #[account(
        seeds = [b"escrow".as_ref(), initializer_nft_mint.key().as_ref()],
        bump,
    )]
    pub listing_escrow: Box<Account<'info, NftEscrow>>,
    #[account(
        init,
        seeds = [b"escrow", initializer_nft_mint.key().as_ref(), bidder_nft_mint.key().as_ref()],
        bump,
        space = NftOfferEscrow::SIZE + 8,
        payer = bidder
    )]
    pub nft_offer_escrow: Box<Account<'info, NftOfferEscrow>>,
    #[account(
        init,
        token::mint = bidder_nft_mint,
        token::authority = nft_offer_escrow,
        seeds = [b"escrow_token_account", bidder_nft_mint.key().as_ref()],
        bump,
        payer = bidder
    )]
    pub nft_escrow_token_account: Box<Account<'info, TokenAccount>>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(ctx: Context<CreateOffer>) -> Result<()> {
    ctx.accounts.nft_offer_escrow.initializer = ctx.accounts.bidder.key();
    ctx.accounts.nft_offer_escrow.nft_mint = ctx.accounts.bidder_nft_mint.key();
    ctx.accounts.nft_offer_escrow.nft_escrow_token_account =
        ctx.accounts.nft_escrow_token_account.key();
    ctx.accounts.nft_offer_escrow.listing_escrow = ctx.accounts.listing_escrow.key();

    // transfer nft from initializer to escrow
    let cpi_accounts = Transfer {
        from: ctx.accounts.bidder_nft_token_account.to_account_info(),
        to: ctx.accounts.nft_escrow_token_account.to_account_info(),
        authority: ctx.accounts.bidder.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    token::transfer(cpi_ctx, 1)?;

    Ok(())
}
