use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};
use anchor_spl::token_2022::{Token2022, TransferChecked};
use anchor_spl::associated_token::AssociatedToken;

use crate::state::{Treasury, TREASURY_SEED};


    pub fn transfer_out(ctx: Context<TransferOut>, amount: u64) -> Result<()> {
        let seeds = &[TREASURY_SEED, &[ctx.accounts.treasury.bump]];
        let signer_seeds = &[&seeds[..]];

        let cpi_accounts = TransferChecked {
            from: ctx.accounts.treasury_token_account.to_account_info(),
            to: ctx.accounts.recipient_token_account.to_account_info(),
            mint: ctx.accounts.mint.to_account_info(),
            authority: ctx.accounts.treasury.to_account_info(),
        };

        let cpi_program = ctx.accounts.token_2022_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);

        anchor_spl::token_2022::transfer_checked(cpi_ctx, amount, ctx.accounts.mint.decimals)?;

        Ok(())
    }


#[derive(Accounts)]
pub struct TransferOut<'info> {
    #[account(
        seeds = [b"treasury"],
        bump,
    )]
    pub treasury: Account<'info, Treasury>,
    #[account(mut)]
    pub treasury_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub recipient_token_account: Account<'info, TokenAccount>,
    pub mint: Account<'info, Mint>,
    pub token_2022_program: Program<'info, Token2022>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

