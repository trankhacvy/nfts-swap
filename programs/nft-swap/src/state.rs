use anchor_lang::prelude::*;

#[account]
pub struct NftEscrow {
    pub initializer: Pubkey,
    pub nft_mint: Pubkey,
    pub nft_escrow_token_account: Pubkey,
}

impl NftEscrow {
    pub const SIZE: usize = 32 + 32 + 32;
}

#[account]
pub struct NftOfferEscrow {
    pub listing_escrow: Pubkey,
    pub initializer: Pubkey,
    pub nft_mint: Pubkey,
    pub nft_escrow_token_account: Pubkey,
}

impl NftOfferEscrow {
    pub const SIZE: usize = 32 + 32 + 32 + 32;
}

#[event]
pub struct ListingEvent {
    pub nft_mint: Pubkey,
    pub initializer: Pubkey,
}

#[event]
pub struct CancelListingEvent {
    pub nft_mint: Pubkey,
    pub initializer: Pubkey,
}
