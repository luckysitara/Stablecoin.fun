use anchor_lang::prelude::*;

use crate::state::*;

use crate::errors::*;
use anchor_spl::{
    metadata::{
        create_metadata_accounts_v3, mpl_token_metadata::types::DataV2, CreateMetadataAccountsV3,
    },
    token::{ Mint, Token},
};


pub fn init_token(
    ctx: Context<InitToken>,
    metadata: InitCoinParams,
    currency: String,
    image: String,
    description: String,
    coin_type: String,
) -> Result<()> {
    // Setup coin account and save data
    let coin_account = &mut ctx.accounts.coin_account;
    coin_account.mint = ctx.accounts.mint.key();
    coin_account.bump = ctx.bumps.coin_account;
    coin_account.symbol = metadata.symbol.clone();
    coin_account.name = metadata.name.clone();
    coin_account.currency = currency;
    coin_account.uri = metadata.uri.clone();
    coin_account.image = image;
    coin_account.description = description;
    coin_account.coin_type = coin_type;
    coin_account.balance = 0;

    // Validate symbol
    require!(metadata.symbol.len() <= 4, CustomError::SymbolTooLong);
    require!(
        metadata.symbol.chars().all(|c| c.is_alphanumeric()),
        CustomError::SymbolNotAlphanumeric
    );

    // Coin Account Seeds
    let mint_key = ctx.accounts.mint.key();
    let coin_account_seeds = &[
        COIN_ACCOUNT_SEED.as_ref(),
        mint_key.as_ref(),
        &[ctx.bumps.coin_account]
    ];
    
    // Mint PDA seeds
    let mint_pda_signer_seeds = &[
        COIN_MINT_SEED.as_ref(),
        ctx.accounts.payer.key.as_ref(),
        metadata.symbol.as_bytes(),
        &[ctx.bumps.mint]
    ];

    // Setup Token Metadata
    let token_data: DataV2 = DataV2 {
        name: metadata.name.clone(),
        symbol: metadata.symbol.clone(),
        uri: metadata.uri.clone(),
        seller_fee_basis_points: 0,
        creators: None,
        collection: None,
        uses: None,
    };

    // Correct CPI context
    let signers_seeds = &[
        &coin_account_seeds[..],
        &mint_pda_signer_seeds[..]
    ];

    let metadata_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_metadata_program.to_account_info(),
        CreateMetadataAccountsV3 {
            payer: ctx.accounts.payer.to_account_info(),
            update_authority: ctx.accounts.payer.to_account_info(),
            mint: ctx.accounts.mint.to_account_info(),
            metadata: ctx.accounts.metadata.to_account_info(),
            mint_authority: coin_account.to_account_info(),
            system_program: ctx.accounts.system_program.to_account_info(),
            rent: ctx.accounts.rent.to_account_info(),
        },
        signers_seeds,
    );

    create_metadata_accounts_v3(
        metadata_ctx,
        token_data,
        false,
        true,
        None,
    )?;

    msg!("Token Mint Address: {:?}", ctx.accounts.mint.key());
    msg!("Coin Account Address: {:?}", ctx.accounts.coin_account.key());
    msg!("Metadata Address: {:?}", ctx.accounts.metadata.key());
    msg!(
        "Token successfully created with Symbol: {:?}",
        metadata.symbol
    );

    Ok(())
}

#[derive(Accounts)]
#[instruction(params: InitCoinParams)]
pub struct InitToken<'info> {
    /// CHECK: New Metaplex Account being created
    #[account(mut)]
    pub metadata: UncheckedAccount<'info>,
    #[account(
        init,
        seeds = [COIN_MINT_SEED, payer.key().as_ref(), params.symbol.as_bytes()], 
        bump,
        payer = payer,
        mint::decimals = params.decimals,
        mint::authority = coin_account, // Coin account PDA is the mint authority
    )]
    pub mint: Account<'info, Mint>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    /// CHECK: Metaplex program ID
    pub token_metadata_program: UncheckedAccount<'info>,
    #[account(
        init,
        seeds = [COIN_ACCOUNT_SEED, mint.key().as_ref()], // Use "coin_account" and mint key for seeds
        bump,
        payer = payer,
        space = 8 + CoinAccount::INIT_SPACE
    )]
    pub coin_account: Account<'info, CoinAccount>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Debug, Clone)]
pub struct InitCoinParams {
    pub name: String,
    pub symbol: String,
    pub uri: String,
    pub decimals: u8,
}

