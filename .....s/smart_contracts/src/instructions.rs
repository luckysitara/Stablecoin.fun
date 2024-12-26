use borsh::{BorshDeserialize, BorshSerialize};

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub enum Instruction {
    CreatePayment { amount: u64 },
    RefundPayment,
    CloseAccount,
}
