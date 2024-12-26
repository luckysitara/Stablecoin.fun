use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
};
use crate::state::{stablecoin::Stablecoin, user_data::UserData};
use borsh::{BorshDeserialize, BorshSerialize};

pub fn process_burn(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    input: &[u8],
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();

    // Accounts: [0] Stablecoin data, [1] User data
    let stablecoin_account = next_account_info(accounts_iter)?;
    let user_account = next_account_info(accounts_iter)?;

    // Parse burn amount
    let burn_amount = u64::from_le_bytes(input[0..8].try_into().unwrap());

    // Load stablecoin data
    let mut stablecoin = Stablecoin::try_from_slice(&stablecoin_account.data.borrow())?;
    let mut user_data = UserData::try_from_slice(&user_account.data.borrow())?;

    // Check if user has enough stablecoins to burn
    if user_data.stablecoin_balance < burn_amount {
        msg!("Insufficient stablecoin balance");
        return Err(ProgramError::InsufficientFunds);
    }

    // Update user balances and stablecoin total supply
    user_data.stablecoin_balance -= burn_amount;
    user_data.collateral_balance += burn_amount; // 1:1 ratio
    stablecoin.total_supply -= burn_amount;

    // Save updated data
    stablecoin.serialize(&mut &mut stablecoin_account.data.borrow_mut()[..])?;
    user_data.serialize(&mut &mut user_account.data.borrow_mut()[..])?;

    msg!("Burned {} stablecoins successfully!", burn_amount);
    Ok(())
}
