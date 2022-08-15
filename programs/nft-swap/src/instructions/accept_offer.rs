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

    token::transfer(
        ctx.accounts
            .into_transfer_to_bidder_context()
            .with_signer(signer),
        1,
    )?;

    // transfer nft from nft_offer_escrow to creator
    let bidder_nft_mint_key = ctx.accounts.bidder_nft_mint.key();
    let signer: &[&[&[u8]]] = &[&[
        "escrow".as_ref(),
        initializer_nft_mint_key.as_ref(),
        bidder_nft_mint_key.as_ref(),
        &[*ctx.bumps.get("nft_offer_escrow").unwrap()],
    ]];

    token::transfer(
        ctx.accounts
            .into_transfer_to_initializer_context()
            .with_signer(signer),
        1,
    )?;

    Ok(())
}

impl<'info> AcceptOffer<'info> {
    fn into_transfer_to_bidder_context(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self
                .nft_listing_escrow_token_account
                .to_account_info()
                .clone(),
            to: self
                .bidder_receive_nft_token_account
                .to_account_info()
                .clone(),
            authority: self.nft_listing_escrow.to_account_info().clone(),
        };
        let cpi_program = self.token_program.to_account_info();
        CpiContext::new(cpi_program, cpi_accounts)
    }

    fn into_transfer_to_initializer_context(
        &self,
    ) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self
                .nft_offer_escrow_token_account
                .to_account_info()
                .clone(),
            to: self
                .initializer_receive_nft_token_account
                .to_account_info()
                .clone(),
            authority: self.nft_offer_escrow.to_account_info().clone(),
        };
        let cpi_program = self.token_program.to_account_info();
        CpiContext::new(cpi_program, cpi_accounts)
    }
}
