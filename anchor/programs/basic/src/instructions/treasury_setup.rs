use anchor_lang::prelude::*;
use crate::state::{Treasury, TREASURY_SEED};


    pub fn treasury_setup(ctx: Context<InitializeTreasury>, bond_ata: Pubkey, bond_coin_mint: Pubkey) -> Result<()> {
        msg!("Initializing treasury");
        let bump = &ctx.bumps.treasury_pda;
        let treasury = &mut ctx.accounts.treasury_pda;
        treasury.bond_ata = bond_ata;
        treasury.bond_coin_mint = bond_coin_mint;
        treasury.balance = 0;
        treasury.bump = *bump;
        Ok(())
    }




#[derive(Accounts)]
pub struct InitializeTreasury<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        init, 
        payer = payer, 
        space = 8 + Treasury::INIT_SPACE, 
        seeds = [TREASURY_SEED],
        bump)]
    pub treasury_pda: Account<'info, Treasury>,
    pub system_program: Program<'info, System>,
}


