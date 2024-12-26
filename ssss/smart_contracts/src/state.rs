use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::pubkey::Pubkey;

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct PaymentAccount {
    pub owner: Pubkey,
    pub recipient: Pubkey,
    pub amount: u64,
    pub is_active: bool,
}
