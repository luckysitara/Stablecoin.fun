use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
};
use borsh::{BorshDeserialize, BorshSerialize};
use std::collections::HashMap;
use thiserror::Error;

// Entry point for the program
entrypoint!(process_instruction);

// ----------------- Error Handling -----------------
#[derive(Error, Debug, Copy, Clone)]
pub enum StablecoinError {
    #[error("Invalid Instruction")]
    InvalidInstruction,
    #[error("Insufficient Funds")]
    InsufficientFunds,
    #[error("Unauthorized Access")]
    Unauthorized,
}

impl From<StablecoinError> for ProgramError {
    fn from(e: StablecoinError) -> Self {
        ProgramError::Custom(e as u32)
    }
}

// ----------------- Stablecoin State -----------------
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct Stablecoin {
    pub name: String,
    pub symbol: String,
    pub decimals: u8,
    pub fiat_currency: String,
    pub supply: u64,
    pub price_in_cents: u64,
    pub owner: Pubkey,
}

// ----------------- Instructions -----------------
#[derive(BorshSerialize, BorshDeserialize)]
pub enum StablecoinInstruction {
    CreateStablecoin {
        name: String,
        symbol: String,
        decimals: u8,
        fiat_currency: String,
    },
    Mint {
        amount: u64,
    },
    Burn {
        amount: u64,
    },
    Transfer {
        amount: u64,
        to: Pubkey,
    },
}

// ----------------- Process Instructions -----------------
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    msg!("Processing instruction");

    let instruction = StablecoinInstruction::try_from_slice(instruction_data)
        .map_err(|_| StablecoinError::InvalidInstruction)?;

    match instruction {
        StablecoinInstruction::CreateStablecoin {
            name,
            symbol,
            decimals,
            fiat_currency,
        } => create_stablecoin(accounts, name, symbol, decimals, fiat_currency),
        StablecoinInstruction::Mint { amount } => mint(accounts, amount),
        StablecoinInstruction::Burn { amount } => burn(accounts, amount),
        StablecoinInstruction::Transfer { amount, to } => transfer(accounts, amount, to),
    }
}

// ----------------- Utility: Fetch Price -----------------
pub fn fetch_price(fiat_currency: &str) -> Result<u64, ProgramError> {
    match fiat_currency {
        "USD" => Ok(100), // Mock price for USD (1 USD = 100 cents)
        "EUR" => Ok(110), // Mock price for EUR (1 EUR = 110 cents)
        _ => Err(ProgramError::InvalidArgument),
    }
}

// ----------------- Stablecoin Features -----------------
fn create_stablecoin(
    accounts: &[AccountInfo],
    name: String,
    symbol: String,
    decimals: u8,
    fiat_currency: String,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let stablecoin_account = next_account_info(account_info_iter)?;
    let owner = next_account_info(account_info_iter)?;

    // Check if owner is signer
    if !owner.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    // Create stablecoin
    let stablecoin = Stablecoin {
        name,
        symbol,
        decimals,
        fiat_currency: fiat_currency.clone(),
        supply: 0,
        price_in_cents: fetch_price(&fiat_currency)?,
        owner: *owner.key,
    };

    msg!("Stablecoin created: {:?}", stablecoin);
    Ok(())
}

fn mint(accounts: &[AccountInfo], amount: u64) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let stablecoin_account = next_account_info(account_info_iter)?;
    let owner = next_account_info(account_info_iter)?;

    if !owner.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    // Increase supply
    let mut stablecoin: Stablecoin =
        Stablecoin::try_from_slice(&stablecoin_account.data.borrow())?;
    if stablecoin.owner != *owner.key {
        return Err(StablecoinError::Unauthorized.into());
    }

    stablecoin.supply += amount;
    stablecoin.serialize(&mut &mut stablecoin_account.data.borrow_mut()[..])?;

    msg!("Minted {} tokens", amount);
    Ok(())
}

fn burn(accounts: &[AccountInfo], amount: u64) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let stablecoin_account = next_account_info(account_info_iter)?;
    let owner = next_account_info(account_info_iter)?;

    if !owner.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    let mut stablecoin: Stablecoin =
        Stablecoin::try_from_slice(&stablecoin_account.data.borrow())?;
    if stablecoin.owner != *owner.key {
        return Err(StablecoinError::Unauthorized.into());
    }

    if amount > stablecoin.supply {
        return Err(StablecoinError::InsufficientFunds.into());
    }

    stablecoin.supply -= amount;
    stablecoin.serialize(&mut &mut stablecoin_account.data.borrow_mut()[..])?;

    msg!("Burned {} tokens", amount);
    Ok(())
}

fn transfer(accounts: &[AccountInfo], amount: u64, to: Pubkey) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let stablecoin_account = next_account_info(account_info_iter)?;
    let owner = next_account_info(account_info_iter)?;

    if !owner.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    let mut balances: HashMap<Pubkey, u64> = HashMap::new();
    if let Some(balance) = balances.get_mut(&owner.key) {
        if *balance < amount {
            return Err(StablecoinError::InsufficientFunds.into());
        }
        *balance -= amount;
    } else {
        return Err(StablecoinError::InsufficientFunds.into());
    }

    balances
        .entry(to)
        .and_modify(|b| *b += amount)
        .or_insert(amount);

    msg!("Transferred {} tokens to {:?}", amount, to);
    Ok(())
}
