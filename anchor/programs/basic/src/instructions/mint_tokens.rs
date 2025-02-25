use crate::state::*;
use crate::errors::*;
use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{ mint_to, Mint, MintTo, Token, TokenAccount},
    token_2022::{
        transfer_checked, TransferChecked,
        Token2022,
    },
};
use switchboard_on_demand::on_demand::accounts::pull_feed::PullFeedAccountData;

pub fn mint_tokens(ctx: Context<MintTokens>, sol_amount: u64) -> Result<()> {
    // 1. Logging the input sol_amount
    msg!("mint_tokens called with sol_amount: {}", sol_amount);


    msg!("bond_mint key: {}", ctx.accounts.bond_mint.key());
    msg!("coin_account key: {}", ctx.accounts.coin_account.key());
    msg!("treasury key: {}", ctx.accounts.treasury.key());
    msg!("treasury_bond_ata key: {}", ctx.accounts.treasury_bond_ata.key());
    msg!("coin_account_bond_ata key: {}", ctx.accounts.coin_account_bond_ata.key());

     // Fetching the SOL/USD price from the Switchboard feed
     let feed_account = ctx.accounts.feed.data.borrow();
     let feed = PullFeedAccountData::parse(feed_account).unwrap();
     let price = feed.value().unwrap();
     msg!("price: {:?}", price);
 
     let price_f64 = price.to_string().parse::<f64>().expect("Failed to convert Decimal to f64");
     msg!("price_f64: {:?}", price_f64);
 
     // Adding a reduction factor
     let reduction_factor: f64 = 0.0001;
 
     // Calculate the bond amount
     let bond_decimals = 6;
     let bond_amount_f64 = sol_amount as f64 / price_f64;
     let reduced_bond_amount_f64 = bond_amount_f64 * reduction_factor;
     let bond_amount = (reduced_bond_amount_f64 * 10_f64.powi(bond_decimals as i32)) as u64; // Correct for bond decimals
     msg!("bond_amount: {:?}", bond_amount);
 
     // Stablecoin amount to mint
     let tokens_to_mint = bond_amount;
     msg!("tokens_to_mint: {:?}", tokens_to_mint);
 
     // ... (SOL Transfer code)
 
     // Update CoinAccount balance
     let coin_account = &mut ctx.accounts.coin_account;
     coin_account.balance += sol_amount;

    // SOL Transfer 
    anchor_lang::system_program::transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            anchor_lang::system_program::Transfer {
                from: ctx.accounts.payer.to_account_info(),
                to: ctx.accounts.coin_account.to_account_info(),
            },
        ),
        sol_amount,
    )?;

    // 6. Update CoinAccount balance
    let coin_account = &mut ctx.accounts.coin_account;
    coin_account.balance += sol_amount;

    // --- 7. Bond Token Transfer (Treasury to CoinAccount) ---
    let treasury_bump = ctx.accounts.treasury.bump;
    let treasury_seeds = &[&TREASURY_SEED[..], &[treasury_bump]];
    let signer = &[&treasury_seeds[..]];

    // 8. Calculate bond amount based on 6 decimal places
//     let bond_decimals = 6;
//     let bond_amount_f64 = sol_amount as f64 / price_f64;
// let adjusted_bond_amount = bond_amount_f64 * 1000.0; // Adjust for decimal difference
// let adjusted_bond_amount = adjusted_bond_amount as u64; 
//     msg!("adjusted_bond_amount: {:?}", adjusted_bond_amount);

    // 9. Create CPI context for transferring bond tokens
    let cpi_accounts = TransferChecked {
        from: ctx.accounts.treasury_bond_ata.to_account_info(), // Treasury's ATA
        to: ctx.accounts.coin_account_bond_ata.to_account_info(), // CoinAccount's ATA
        authority: ctx.accounts.treasury.to_account_info(), // Treasury is the authority
        mint: ctx.accounts.bond_mint.to_account_info(),         // Bond token mint
    };
    let cpi_context = CpiContext::new_with_signer(
        ctx.accounts.token_program_2022.to_account_info(), // Token 2022 program
        cpi_accounts,
        signer
    );

    // 10. Transfer bond tokens
    transfer_checked(cpi_context, bond_amount, bond_decimals)?;

    // --- 11. Stablecoin Minting (CoinAccount to User) ---
    let coin_account_bump = ctx.accounts.coin_account.bump;
    let mint_key = ctx.accounts.mint.key();
    let seeds = &[
        COIN_ACCOUNT_SEED.as_ref(),
        mint_key.as_ref(),
        &[coin_account_bump]
    ];
    let signer = &seeds[..];

    mint_to(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(), // Token program for stablecoin
            MintTo {
                mint: ctx.accounts.mint.to_account_info(),         // Stablecoin mint
                to: ctx.accounts.destination.to_account_info(),    // User's ATA
                authority: ctx.accounts.coin_account.to_account_info(), // CoinAccount is the authority
            },
            &[signer],
        ),
        tokens_to_mint, // Mint the calculated amount of stablecoins
    )?;

    Ok(())
}

#[derive(Accounts)]
#[instruction(sol_amount: u64)]
pub struct MintTokens<'info> {
    #[account(mut)]
    pub mint: Account<'info, Mint>,
    // user ATA for the minted coin
    #[account(
        init_if_needed,
        payer = payer,
        associated_token::mint = mint,
        associated_token::authority = payer,
    )]
    pub destination: Account<'info, TokenAccount>,
    #[account(mut)]
    pub payer: Signer<'info>,
    /// CHECK: This is safe because we manually deserialize and verify the account data
    pub feed: AccountInfo<'info>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>, // Token program for stablecoin
    pub token_program_2022: Program<'info, Token2022>, // Token 2022 program for bond token
    pub associated_token_program: Program<'info, AssociatedToken>,
    // Coin Account (holds SOL and is mint authority)
    #[account(
        mut,
        seeds = [COIN_ACCOUNT_SEED, mint.key().as_ref()],
        bump,
    )]
    pub coin_account: Account<'info, CoinAccount>,
    // Treasury Account
    #[account(
        mut,
        seeds = [TREASURY_SEED], 
        bump,
    )]
    pub treasury: Account<'info, Treasury>,
    /// CHECK: mint address of the bond token
    #[account(mut)]
    pub bond_mint: AccountInfo<'info>,
    // treasury ATA for the bond token
    /// CHECK: treasury bond ata
    #[account(
        mut,
        // constraint = treasury_bond_ata.owner == treasury.key(),
        // constraint = treasury_bond_ata.mint == bond_mint.key()
    )]
    pub treasury_bond_ata: UncheckedAccount<'info>,
    /// CHECK: The associated token account for the CoinAccount to hold the bond token
    #[account(mut)]
    pub coin_account_bond_ata: UncheckedAccount<'info>,
}