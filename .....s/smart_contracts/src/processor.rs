use crate::{
    instructions::Instruction,
    state::PaymentAccount,
    errors::PaymentError,
};
use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    program_error::ProgramError,
    pubkey::Pubkey,
};

pub struct Processor;

impl Processor {
    pub fn process(
        program_id: &Pubkey,
        accounts: &[AccountInfo],
        instruction_data: &[u8],
    ) -> ProgramResult {
        let instruction = Instruction::try_from_slice(instruction_data)
            .map_err(|_| ProgramError::from(PaymentError::InvalidInstruction))?;

        match instruction {
            Instruction::CreatePayment { amount } => {
                Self::process_create_payment(accounts, amount, program_id)
            }
            Instruction::RefundPayment => Self::process_refund_payment(accounts, program_id),
            Instruction::CloseAccount => Self::process_close_account(accounts, program_id),
        }
    }

    fn process_create_payment(
        accounts: &[AccountInfo],
        amount: u64,
        program_id: &Pubkey,
    ) -> ProgramResult {
        let account_info_iter = &mut accounts.iter();
        let payer = next_account_info(account_info_iter)?;
        let payment_account = next_account_info(account_info_iter)?;

        let mut payment_data = PaymentAccount::try_from_slice(&payment_account.data.borrow())?;

        if payment_account.owner != program_id {
            return Err(PaymentError::Unauthorized.into());
        }

        payment_data.owner = *payer.key;
        payment_data.amount = amount;
        payment_data.is_active = true;

        payment_data.serialize(&mut *payment_account.data.borrow_mut())?;
        Ok(())
    }

    fn process_refund_payment(accounts: &[AccountInfo], program_id: &Pubkey) -> ProgramResult {
        let account_info_iter = &mut accounts.iter();
        let payer = next_account_info(account_info_iter)?;
        let payment_account = next_account_info(account_info_iter)?;

        let mut payment_data = PaymentAccount::try_from_slice(&payment_account.data.borrow())?;

        if payment_account.owner != program_id {
            return Err(PaymentError::Unauthorized.into());
        }

        if payment_data.owner != *payer.key {
            return Err(PaymentError::Unauthorized.into());
        }

        payment_data.amount = 0;
        payment_data.is_active = false;

        payment_data.serialize(&mut *payment_account.data.borrow_mut())?;
        Ok(())
    }

    fn process_close_account(accounts: &[AccountInfo], program_id: &Pubkey) -> ProgramResult {
        let account_info_iter = &mut accounts.iter();
        let payer = next_account_info(account_info_iter)?;
        let payment_account = next_account_info(account_info_iter)?;

        let payment_data = PaymentAccount::try_from_slice(&payment_account.data.borrow())?;

        if payment_account.owner != program_id {
            return Err(PaymentError::Unauthorized.into());
        }

        if payment_data.owner != *payer.key {
            return Err(PaymentError::Unauthorized.into());
        }

        **payment_account.lamports.borrow_mut() = 0;
        Ok(())
    }
}
