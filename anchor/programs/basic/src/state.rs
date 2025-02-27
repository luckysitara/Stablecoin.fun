use anchor_lang::prelude::*;


pub const TREASURY_SEED: &[u8] = b"TREASURY3"; 
pub const COIN_ACCOUNT_SEED: &[u8] = b"COIN_ACCOUNT";
pub const COIN_MINT_SEED: &[u8] = b"COIN_MINT";

#[account]
#[derive(InitSpace)]
pub struct Treasury {
    pub bond_ata: Pubkey,
    pub bond_coin_mint: Pubkey,
    pub balance: u64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct CoinAccount {
    pub balance: u64,
    pub mint: Pubkey,
    pub bump: u8,
    #[max_len(5)]
    pub symbol: String,
    #[max_len(32)]
    pub name: String,
    #[max_len(32)]
    pub coin_type: String,
    #[max_len(5)]
    pub currency: String,
    #[max_len(100)]
    pub uri: String,
    #[max_len(100)]
    pub image: String,
    #[max_len(100)]
    pub description: String,
}