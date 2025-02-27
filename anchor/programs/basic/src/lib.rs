
use anchor_lang::prelude::*;
use instructions::*;
// use state::*;
// use errors::*;

mod instructions;
mod state;
mod errors;


declare_id!("ETwg2dCnvVCqf7JQ4qcp9dBuYmsbLDnPHirAyQFVT817");

#[program]
pub mod basic {
    use super::*;

    pub fn init_treasury(ctx: Context<InitializeTreasury>,  bond_ata: Pubkey, bond_coin_mint: Pubkey) -> Result<()> {
        instructions::treasury_setup(ctx, bond_ata, bond_coin_mint)
     }
 
     pub fn create_token(ctx: Context<InitToken>, params: InitCoinParams, currency: String, image: String, description: String, coin_type: String) -> Result<()> {
         instructions::init_token(ctx, params, currency, image, description, coin_type)
     }
 
     pub fn treasury_to_tokenpda(ctx: Context<TransferOut>, amount: u64) -> Result<()> {
         instructions::transfer_out(ctx, amount)
     }

     pub fn tokens_mint(ctx: Context<MintTokens>, sol_amount: u64) -> Result<()> {
         instructions::mint_tokens(ctx, sol_amount)
     }

     pub fn tokens_burn(ctx: Context<BurnTokens>, amount: u64) -> Result<()> {
         instructions::burn_tokens(ctx, amount)
     }
}

