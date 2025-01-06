use solana_program::account_info::{next_account_info, AccountInfo};
use solana_program::entrypoint::ProgramResult;
use solana_program::program_pack::Pack;
use solana_program::pubkey::Pubkey;
use crate::state::{Stablecoin, UserAccount};
use crate::error::StablecoinError;

pub struct Processor;

impl Processor {
    pub fn process(
        program_id: &Pubkey,
        accounts: &[AccountInfo],
        instruction_data: &[u8],
    ) -> ProgramResult {
        if instruction_data.is_empty() {
            return Err(StablecoinError::InvalidInstruction.into());
        }

        match instruction_data[0] {
            0 => Self::create_stablecoin(accounts, &instruction_data[1..], program_id),
            1 => Self::issue_tokens(accounts, &instruction_data[1..]),
            _ => Err(StablecoinError::InvalidInstruction.into()),
        }
    }

    pub fn create_stablecoin(
        accounts: &[AccountInfo],
        data: &[u8],
        program_id: &Pubkey,
    ) -> ProgramResult {
        if data.len() < 82 {
            return Err(StablecoinError::InvalidInstruction.into());
        }

        let account_info_iter = &mut accounts.iter();
        let stablecoin_account = next_account_info(account_info_iter)?;
        let owner_account = next_account_info(account_info_iter)?;

        let name = &data[0..32];
        let symbol = &data[32..42];
        let backing_bond = Pubkey::new_from_array(data[42..74].try_into().unwrap());
        let yield_rate = f64::from_le_bytes(data[74..82].try_into().unwrap());

        if name.len() > 32 {
            return Err(StablecoinError::NameTooLong.into());
        }
        if symbol.len() > 10 {
            return Err(StablecoinError::SymbolTooLong.into());
        }
        if yield_rate < 0.0 || yield_rate > 0.2 {
            return Err(StablecoinError::InvalidYieldRate.into());
        }

        let mut stablecoin = Stablecoin::default();
        stablecoin.is_initialized = true;
        stablecoin.name.copy_from_slice(name);
        stablecoin.symbol.copy_from_slice(symbol);
        stablecoin.backing_bond = backing_bond;
        stablecoin.yield_rate = yield_rate;
        stablecoin.total_supply = 0;

        stablecoin.pack_into_slice(&mut stablecoin_account.data.borrow_mut());

        Ok(())
    }

    pub fn issue_tokens(accounts: &[AccountInfo], data: &[u8]) -> ProgramResult {
        let account_info_iter = &mut accounts.iter();
        let stablecoin_account = next_account_info(account_info_iter)?;
        let user_account = next_account_info(account_info_iter)?;
        let amount = u64::from_le_bytes(data.try_into().unwrap());

        let mut stablecoin = Stablecoin::unpack(&stablecoin_account.data.borrow())?;
        let mut user = UserAccount::unpack(&user_account.data.borrow())?;

        stablecoin.total_supply = stablecoin.total_supply.checked_add(amount)
            .ok_or(StablecoinError::Overflow)?;
        user.balances[0] = user.balances[0].checked_add(amount)
            .ok_or(StablecoinError::Overflow)?;

        stablecoin.pack_into_slice(&mut stablecoin_account.data.borrow_mut());
        user.pack_into_slice(&mut user_account.data.borrow_mut());

        Ok(())
    }
}
