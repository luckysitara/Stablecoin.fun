use solana_program::{
    account_info::AccountInfo, entrypoint::ProgramResult, msg, pubkey::Pubkey,
};
use crate::state::stablecoin::Stablecoin;

pub fn process_create_coin(
    _program_id: &Pubkey,
    _accounts: &[AccountInfo],
    input: &[u8],
) -> ProgramResult {
    let name = String::from_utf8(input[0..20].to_vec()).unwrap();
    let symbol = String::from_utf8(input[20..30].to_vec()).unwrap();
    let fiat_peg = String::from_utf8(input[30..40].to_vec()).unwrap();
    let collateral_type = String::from_utf8(input[40..50].to_vec()).unwrap();

    let stablecoin = Stablecoin {
        name,
        symbol,
        fiat_peg,
        collateral_type,
        total_supply: 0,
    };

    msg!("Stablecoin created: {:?}", stablecoin);
    Ok(())
}
