use borsh::{BorshDeserialize, BorshSerialize};

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct Stablecoin {
    pub name: String,
    pub symbol: String,
    pub fiat_peg: String,
    pub collateral_type: String,
    pub total_supply: u64,
}
