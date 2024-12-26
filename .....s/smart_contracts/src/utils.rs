use solana_program::{
    account_info::AccountInfo,
    program::invoke,
    system_instruction,
};

pub fn transfer_tokens(
    sender: &AccountInfo,
    recipient: &AccountInfo,
    amount: u64,
) -> Result<(), solana_program::program_error::ProgramError> {
    invoke(
        &system_instruction::transfer(sender.key, recipient.key, amount),
        &[sender.clone(), recipient.clone()],
    )
}
