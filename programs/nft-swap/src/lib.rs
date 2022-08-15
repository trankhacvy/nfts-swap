use anchor_lang::prelude::*;

pub mod instructions;
pub use instructions::*;

pub mod state;
pub use state::*;

pub mod errors;
pub use errors::*;

declare_id!("GMUrDTez1LG6QfrWEAfaN8JQjqHgmCW3ZhcftbohtwZn");

#[program]
pub mod nft_swap {
    use super::*;

    pub fn create_listing(ctx: Context<CreateListing>) -> Result<()> {
        create_listing::handler(ctx)
    }

    pub fn cancel_listing(ctx: Context<CancelListing>) -> Result<()> {
        cancel_listing::handler(ctx)
    }

    pub fn create_offer(ctx: Context<CreateOffer>) -> Result<()> {
        create_offer::handler(ctx)
    }

    pub fn cancel_offer(ctx: Context<CancelOffer>) -> Result<()> {
        cancel_offer::handler(ctx)
    }

    pub fn accept_offer(ctx: Context<AcceptOffer>) -> Result<()> {
        accept_offer::handler(ctx)
    }
}
