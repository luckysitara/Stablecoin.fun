#![cfg(not(feature = "no_std"))]

use solana_program::{
    account_info::AccountInfo,
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
};
use instructions::{mint, burn, create_coin};
use state::{stablecoin::Stablecoin, user_data::UserData};

mod instructions;
mod state;

entrypoint!(process_instruction);

fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    msg!("Stablecoin Program: Instruction received");

    match instruction_data[0] {
        0 => mint::process_mint(program_id, accounts, instruction_data),  // Mint
        1 => burn::process_burn(program_id, accounts, instruction_data),  // Burn
        2 => create_coin::process_create_coin(program_id, accounts, instruction_data),  // Create Coin
        _ => Err(ProgramError::InvalidInstructionData),
    }
}
