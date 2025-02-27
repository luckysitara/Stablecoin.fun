use crate::state::*;
// use crate::errors::*;
use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{burn, Burn, Mint, Token, TokenAccount},
    token_2022::{transfer_checked, Token2022, TransferChecked},
};
use switchboard_on_demand::on_demand::accounts::pull_feed::PullFeedAccountData;

pub fn burn_tokens(ctx: Context<BurnTokens>, amount: u64) -> Result<()> {
    // 1. Logging and Initial Checks:
    msg!("burn_tokens called with amount: {}", amount);
    msg!("bond_mint key: {}", ctx.accounts.bond_mint.key());
    msg!("coin_account key: {}", ctx.accounts.coin_account.key());
    msg!("treasury key: {}", ctx.accounts.treasury.key());
    msg!(
        "treasury_bond_ata key: {}",
        ctx.accounts.treasury_bond_ata.key()
    );
    msg!(
        "coin_account_bond_ata key: {}",
        ctx.accounts.coin_account_bond_ata.key()
    );

    // 2. Burn Stablecoins:
    let cpi_accounts = Burn {
        mint: ctx.accounts.mint.to_account_info(),
        from: ctx.accounts.user_stablecoin_ata.to_account_info(),
        authority: ctx.accounts.payer.to_account_info(),
    };
    let cpi_context = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        cpi_accounts,
    );
    burn(cpi_context, amount)?;
    msg!("Stablecoins burned: {}", amount);

     // Fetch Price Data from Switchboard:
     let feed_account = ctx.accounts.feed.data.borrow();
     let feed = PullFeedAccountData::parse(feed_account).unwrap();
     let price_decimal = feed.value().unwrap();
     let price_f64 = price_decimal
         .to_string()
         .parse::<f64>()
         .expect("Failed to convert Decimal to f64");
     msg!("Price: {}", price_f64);
 
    //  // Calculate Bond Token Amount:
     let reduction_factor: f64 = 0.0001;
     let bond_decimals = 6;
    //  let bond_amount_f64 = amount as f64 * price_f64; // Corrected to multiply
    //  let reduced_bond_amount_f64 = bond_amount_f64 * reduction_factor;
    //  let bond_amount = (reduced_bond_amount_f64 * 10_f64.powi(bond_decimals as i32)) as u64;
    //  msg!("Burn - Calculated bond_amount: {:?}", amount);

    // 5. Transfer Bond Tokens (Corrected Order):
    let coin_account_bump = ctx.accounts.coin_account.bump;
    let mint_key = ctx.accounts.mint.key();
    let seeds = &[
        COIN_ACCOUNT_SEED.as_ref(),
        mint_key.as_ref(),
        &[coin_account_bump],
    ];
    let signer = &[&seeds[..]];

    let cpi_accounts = TransferChecked {
        from: ctx.accounts.coin_account_bond_ata.to_account_info(),
        to: ctx.accounts.treasury_bond_ata.to_account_info(),
        authority: ctx.accounts.coin_account.to_account_info(),
        mint: ctx.accounts.bond_mint.to_account_info(),
    };
    let cpi_context = CpiContext::new_with_signer(
        ctx.accounts.token_program_2022.to_account_info(),
        cpi_accounts,
        signer,
    );

    // **Crucially, use the calculated bond_amount here:**
    transfer_checked(cpi_context, amount, bond_decimals)?;
    msg!("Bond tokens transferred: {}", amount);

    //  Calculate SOL Amount:
    let sol_decimals = 9;
    let sol_amount_f64 = amount as f64 * price_f64;
    let reduced_sol_amount_f64 = sol_amount_f64 / reduction_factor;
    let sol_amount = (reduced_sol_amount_f64 / 10_f64.powi(sol_decimals as i32)) as u64;
    msg!("Burn - Calculated sol_amount: {:?}", sol_amount);


    
    // 7. Transfer SOL:
    let coin_account_lamports = ctx.accounts.coin_account.to_account_info().lamports();
    let payer_lamports = ctx.accounts.payer.to_account_info().lamports();
    msg!("coin_account_lamports: {}", coin_account_lamports);
    msg!("payer_lamports: {}", payer_lamports);

    **ctx.accounts
        .coin_account
        .to_account_info()
        .try_borrow_mut_lamports()? = coin_account_lamports
        .checked_sub(sol_amount)
        .ok_or(ProgramError::InsufficientFunds)?;
    **ctx.accounts
        .payer
        .to_account_info()
        .try_borrow_mut_lamports()? = payer_lamports
        .checked_add(sol_amount)
        .ok_or(ProgramError::InvalidArgument)?;

    Ok(())
}




#[derive(Accounts)]
pub struct BurnTokens<'info> {
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub payer: Signer<'info>,
    /// CHECK: manually deserialize and verify the account data
    pub feed: AccountInfo<'info>,
    #[account(mut)]
    pub user_stablecoin_ata: Account<'info, TokenAccount>,
    #[account(
        mut,
        seeds = [COIN_ACCOUNT_SEED, mint.key().as_ref()],
        bump,
    )]
    pub coin_account: Account<'info, CoinAccount>,
    #[account(
        mut,
        seeds = [TREASURY_SEED],
        bump,
    )]
    pub treasury: Account<'info, Treasury>,
    /// CHECK: This is safe because we check its mint
    #[account(mut)]
    pub bond_mint: AccountInfo<'info>,
    /// CHECK: treasury bond ata
    #[account(mut)]
    pub treasury_bond_ata: UncheckedAccount<'info>,
    /// CHECK: coin account bond ata
    #[account(mut)]
    pub coin_account_bond_ata: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub token_program_2022: Program<'info, Token2022>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}
