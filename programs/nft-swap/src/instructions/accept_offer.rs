use crate::state::{NftEscrow, NftOfferEscrow};
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

#[derive(Accounts)]
pub struct AcceptOffer<'info> {
    #[account(mut)]
    pub initializer: Signer<'info>,
    #[account(constraint = initializer_nft_mint.decimals == 0)]
    pub initializer_nft_mint: Box<Account<'info, Mint>>,
    #[account(
        seeds = [b"escrow".as_ref(), initializer_nft_mint.key().as_ref()],
        bump,
    )]
    pub nft_listing_escrow: Box<Account<'info, NftEscrow>>,
    #[account(
        mut,
        seeds = [b"escrow_token_account", initializer_nft_mint.key().as_ref()],
        bump
    )]
    pub nft_listing_escrow_token_account: Box<Account<'info, TokenAccount>>,
    #[account(constraint = bidder_nft_mint.decimals == 0)]
    pub bidder_nft_mint: Box<Account<'info, Mint>>,
    #[account(
        seeds = [b"escrow", initializer_nft_mint.key().as_ref(), bidder_nft_mint.key().as_ref()],
        bump,
    )]
    pub nft_offer_escrow: Box<Account<'info, NftOfferEscrow>>,
    #[account(
        mut,
        seeds = [b"escrow_token_account", bidder_nft_mint.key().as_ref()],
        bump
    )]
    pub nft_offer_escrow_token_account: Box<Account<'info, TokenAccount>>,
    #[account(mut)]
    pub initializer_receive_nft_token_account: Box<Account<'info, TokenAccount>>,
    #[account(mut)]
    pub bidder_receive_nft_token_account: Box<Account<'info, TokenAccount>>,
    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<AcceptOffer>) -> Result<()> {
    // transfer nft from nft_listing_escrow to offerer
    let nft_listing_escrow = &ctx.accounts.nft_listing_escrow;

    let initializer_nft_mint_key = ctx.accounts.initializer_nft_mint.key();
    let signer: &[&[&[u8]]] = &[&[
        "escrow".as_ref(),
        initializer_nft_mint_key.as_ref(),
        &[*ctx.bumps.get("nft_listing_escrow").unwrap()],
    ]];

    let cpi_accounts1 = Transfer {
        from: ctx
            .accounts
            .nft_listing_escrow_token_account
            .to_account_info(),
        to: ctx
            .accounts
            .bidder_receive_nft_token_account
            .to_account_info(),
        authority: nft_listing_escrow.to_account_info(),
    };
    let cpi_program1 = ctx.accounts.token_program.to_account_info();
    let cpi_ctx1 = CpiContext::new_with_signer(cpi_program1, cpi_accounts1, signer);
    token::transfer(cpi_ctx1, 1)?;

    // transfer nft from nft_offer_escrow to creator
    let bidder_nft_mint_key = ctx.accounts.bidder_nft_mint.key();
    let signer: &[&[&[u8]]] = &[&[
        "escrow".as_ref(),
        initializer_nft_mint_key.as_ref(),
        bidder_nft_mint_key.as_ref(),
        &[*ctx.bumps.get("nft_offer_escrow").unwrap()],
    ]];

    let cpi_accounts2 = Transfer {
        from: ctx
            .accounts
            .nft_offer_escrow_token_account
            .to_account_info(),
        to: ctx
            .accounts
            .initializer_receive_nft_token_account
            .to_account_info(),
        authority: ctx.accounts.nft_offer_escrow.to_account_info(),
    };
    let cpi_program2 = ctx.accounts.token_program.to_account_info();
    let cpi_ctx2 = CpiContext::new_with_signer(cpi_program2, cpi_accounts2, signer);
    token::transfer(cpi_ctx2, 1)?;

    Ok(())
}
