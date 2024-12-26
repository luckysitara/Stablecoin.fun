use solana_program::program_error::ProgramError;

#[derive(Debug)]
pub enum PaymentError {
    InvalidInstruction,
    AccountNotFound,
    Unauthorized,
    InsufficientFunds,
}

impl From<PaymentError> for ProgramError {
    fn from(e: PaymentError) -> Self {
        ProgramError::Custom(e as u32)
    }
}
