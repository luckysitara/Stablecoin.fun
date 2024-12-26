use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
};
use crate::state::{stablecoin::Stablecoin, user_data::UserData};
use borsh::{BorshDeserialize, BorshSerialize};

pub fn process_mint(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    input: &[u8],
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();

    // Accounts: [0] Stablecoin data, [1] User data
    let stablecoin_account = next_account_info(accounts_iter)?;
    let user_account = next_account_info(accounts_iter)?;

    // Parse mint amount
    let mint_amount = u64::from_le_bytes(input[0..8].try_into().unwrap());

    // Load stablecoin data
    let mut stablecoin = Stablecoin::try_from_slice(&stablecoin_account.data.borrow())?;
    let mut user_data = UserData::try_from_slice(&user_account.data.borrow())?;

    // Check if user has enough collateral
    let required_collateral = mint_amount; // 1:1 ratio
    if user_data.collateral_balance < required_collateral {
        msg!("Insufficient collateral balance");
        return Err(ProgramError::InsufficientFunds);
    }

    // Update user balances and stablecoin total supply
    user_data.collateral_balance -= required_collateral;
    user_data.stablecoin_balance += mint_amount;
    stablecoin.total_supply += mint_amount;

    // Save updated data
    stablecoin.serialize(&mut &mut stablecoin_account.data.borrow_mut()[..])?;
    user_data.serialize(&mut &mut user_account.data.borrow_mut()[..])?;

    msg!("Minted {} stablecoins successfully!", mint_amount);
    Ok(())
}
