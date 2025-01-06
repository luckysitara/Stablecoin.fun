use thiserror::Error;
use solana_program::program_error::ProgramError;

#[derive(Error, Debug)]
pub enum StablecoinError {
    #[error("Name is too long")]
    NameTooLong,
    #[error("Symbol is too long")]
    SymbolTooLong,
    #[error("Invalid yield rate")]
    InvalidYieldRate,
    #[error("Insufficient balance")]
    InsufficientBalance,
    #[error("Arithmetic overflow")]
    Overflow,
    #[error("Arithmetic underflow")]
    Underflow,
    #[error("Invalid instruction")]
    InvalidInstruction,
}

impl From<StablecoinError> for ProgramError {
    fn from(e: StablecoinError) -> Self {
        ProgramError::Custom(e as u32)
    }
}
