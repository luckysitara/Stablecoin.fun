use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    pubkey::Pubkey,
    program_error::ProgramError,
};
use borsh::{BorshDeserialize, BorshSerialize};

/// Stablecoin Data
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct Stablecoin {
    pub symbol: String,
    pub decimals: u8,
    pub total_supply: u64,
    pub price: u64, // Price in smallest units (e.g., cents for USD)
}

/// User Account Data
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct UserAccount {
    pub balance: u64,
}

/// Initialize Stablecoin
pub fn initialize(
    accounts: &[AccountInfo],
    symbol: String,
    decimals: u8,
    initial_price: u64,
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    let stablecoin_account = next_account_info(accounts_iter)?;

    let stablecoin_data = Stablecoin {
        symbol,
        decimals,
        total_supply: 0,
        price: initial_price,
    };

    stablecoin_data.serialize(&mut &mut stablecoin_account.data.borrow_mut()[..])?;
    msg!("Stablecoin initialized: {:?}", stablecoin_data);

    Ok(())
}

/// Mint Stablecoins
pub fn mint(accounts: &[AccountInfo], amount: u64) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    let stablecoin_account = next_account_info(accounts_iter)?;
    let user_account = next_account_info(accounts_iter)?;

    let mut stablecoin_data = Stablecoin::try_from_slice(&stablecoin_account.data.borrow())?;
    let mut user_data = UserAccount::try_from_slice(&user_account.data.borrow())?;

    stablecoin_data.total_supply += amount;
    user_data.balance += amount;

    stablecoin_data.serialize(&mut &mut stablecoin_account.data.borrow_mut()[..])?;
    user_data.serialize(&mut &mut user_account.data.borrow_mut()[..])?;
    msg!("Minted {} stablecoins for user.", amount);

    Ok(())
}

/// Burn Stablecoins
pub fn burn(accounts: &[AccountInfo], amount: u64) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    let stablecoin_account = next_account_info(accounts_iter)?;
    let user_account = next_account_info(accounts_iter)?;

    let mut stablecoin_data = Stablecoin::try_from_slice(&stablecoin_account.data.borrow())?;
    let mut user_data = UserAccount::try_from_slice(&user_account.data.borrow())?;

    if user_data.balance < amount {
        msg!("Insufficient balance for burning.");
        return Err(ProgramError::InsufficientFunds);
    }

    stablecoin_data.total_supply -= amount;
    user_data.balance -= amount;

    stablecoin_data.serialize(&mut &mut stablecoin_account.data.borrow_mut()[..])?;
    user_data.serialize(&mut &mut user_account.data.borrow_mut()[..])?;
    msg!("Burned {} stablecoins from user.", amount);

    Ok(())
}

/// Update Stablecoin Price
pub fn update_price(accounts: &[AccountInfo], new_price: u64) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    let stablecoin_account = next_account_info(accounts_iter)?;

    let mut stablecoin_data = Stablecoin::try_from_slice(&stablecoin_account.data.borrow())?;
    stablecoin_data.price = new_price;

    stablecoin_data.serialize(&mut &mut stablecoin_account.data.borrow_mut()[..])?;
    msg!("Updated stablecoin price to {}.", new_price);

    Ok(())
}

entrypoint!(process_instruction);

pub fn process_instruction(
    _program_id: &Pubkey, // Unused variable prefixed with underscore
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let command = instruction_data[0];

    match command {
        0 => {
            let args: (String, u8, u64) = borsh::BorshDeserialize::try_from_slice(&instruction_data[1..])?;
            initialize(accounts, args.0, args.1, args.2)
        }
        1 => {
            let amount = u64::from_le_bytes(instruction_data[1..9].try_into().unwrap());
            mint(accounts, amount)
        }
        2 => {
            let amount = u64::from_le_bytes(instruction_data[1..9].try_into().unwrap());
            burn(accounts, amount)
        }
        3 => {
            let new_price = u64::from_le_bytes(instruction_data[1..9].try_into().unwrap());
            update_price(accounts, new_price)
        }
        _ => Err(ProgramError::InvalidInstructionData),
    }
}
