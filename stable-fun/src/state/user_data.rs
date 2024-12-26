use borsh::{BorshDeserialize, BorshSerialize};

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct UserData {
    pub stablecoin_balance: u64,
    pub collateral_balance: u64,
}
