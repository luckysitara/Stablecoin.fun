use crate::{
    error::SolPayError,
    instruction::SolPayInstruction,
    state::{Payment, Subscription},
    utils,
};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    msg,
    program::invoke_signed,
    program_error::ProgramError,
    pubkey::Pubkey,
    sysvar::{clock::Clock, Sysvar},
};

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> Result<(), ProgramError> {
    let instruction = SolPayInstruction::unpack(instruction_data)?;

    match instruction {
        SolPayInstruction::ProcessPayment { amount, fee } => {
            msg!("Processing payment...");
            process_payment(accounts, amount, fee, program_id)
        }
        SolPayInstruction::TokenSwap { amount } => {
            msg!("Processing token swap...");
            token_swap(accounts, amount, program_id)
        }
        SolPayInstruction::Refund { transaction_id } => {
            msg!("Processing refund...");
            refund(accounts, transaction_id, program_id)
        }
        SolPayInstruction::SetupSubscription { interval, amount } => {
            msg!("Setting up subscription...");
            setup_subscription(accounts, interval, amount, program_id)
        }
    }
}

/// Processes a payment by transferring tokens and deducting fees.
fn process_payment(
    accounts: &[AccountInfo],
    amount: u64,
    fee: u64,
    program_id: &Pubkey,
) -> Result<(), ProgramError> {
    let accounts_iter = &mut accounts.iter();
    let sender = next_account_info(accounts_iter)?;
    let recipient = next_account_info(accounts_iter)?;
    let platform_account = next_account_info(accounts_iter)?;

    if !sender.is_signer {
        return Err(SolPayError::UnauthorizedAccess.into());
    }

    msg!("Transferring payment amount...");
    utils::transfer_tokens(sender, recipient, amount)?;

    msg!("Transferring platform fee...");
    utils::transfer_tokens(sender, platform_account, fee)?;

    msg!("Payment processed successfully.");
    Ok(())
}

/// Swaps tokens using a placeholder DEX integration.
fn token_swap(
    accounts: &[AccountInfo],
    amount: u64,
    program_id: &Pubkey,
) -> Result<(), ProgramError> {
    let accounts_iter = &mut accounts.iter();
    let sender = next_account_info(accounts_iter)?;
    let swap_pool_account = next_account_info(accounts_iter)?;
    let recipient = next_account_info(accounts_iter)?;

    if !sender.is_signer {
        return Err(SolPayError::UnauthorizedAccess.into());
    }

    // Placeholder for DEX logic
    msg!("Simulating token swap...");
    utils::transfer_tokens(sender, swap_pool_account, amount)?;

    // Assuming the pool returns swapped tokens directly to the recipient
    msg!("Swapped tokens successfully delivered to recipient.");
    Ok(())
}

/// Processes a refund by transferring tokens back to the sender.
fn refund(
    accounts: &[AccountInfo],
    transaction_id: u64,
    program_id: &Pubkey,
) -> Result<(), ProgramError> {
    let accounts_iter = &mut accounts.iter();
    let merchant = next_account_info(accounts_iter)?;
    let customer = next_account_info(accounts_iter)?;

    if !merchant.is_signer {
        return Err(SolPayError::UnauthorizedAccess.into());
    }

    // Refund amount would be fetched from transaction data (hardcoded for this example)
    let refund_amount = 100; // Placeholder

    msg!("Processing refund...");
    utils::transfer_tokens(merchant, customer, refund_amount)?;

    msg!("Refund processed successfully.");
    Ok(())
}

/// Sets up a subscription and schedules the first payment.
fn setup_subscription(
    accounts: &[AccountInfo],
    interval: u64,
    amount: u64,
    program_id: &Pubkey,
) -> Result<(), ProgramError> {
    let accounts_iter = &mut accounts.iter();
    let user = next_account_info(accounts_iter)?;
    let merchant = next_account_info(accounts_iter)?;

    if !user.is_signer {
        return Err(SolPayError::UnauthorizedAccess.into());
    }

    let clock = Clock::get()?;
    let next_payment_due = clock.unix_timestamp as u64 + interval;

    msg!("Setting up subscription...");
    let subscription = Subscription {
        user: *user.key,
        merchant: *merchant.key,
        token_mint: Pubkey::new_unique(),
        interval,
        next_payment_due,
        amount,
    };

    msg!(
        "Subscription created for user {} to merchant {}, amount: {}, interval: {} seconds",
        subscription.user,
        subscription.merchant,
        subscription.amount,
        subscription.interval
    );

    // Store subscription details in program state (implementation skipped for simplicity)

    msg!("Subscription setup successfully.");
    Ok(())
}
