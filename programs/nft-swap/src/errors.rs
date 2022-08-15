use anchor_lang::prelude::*;

#[error_code]
pub enum AppError {
    #[msg("Have Correct Owner")]
    CorrectOwner,
    #[msg("Have Correct Mint")]
    CorrectMint,
}
