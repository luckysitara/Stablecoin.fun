use solana_program::{
    account_info::AccountInfo,
    pubkey::Pubkey,
};
use borsh::{BorshDeserialize, BorshSerialize};
use super::*;

#[cfg(test)]
mod tests {
    use super::*;
    use solana_program::clock::Epoch;
    use solana_program::program_error::ProgramError;
    use std::cell::RefCell;

    struct TestAccount {
        pubkey: Pubkey,
        is_signer: bool,
        is_writable: bool,
        data: RefCell<Vec<u8>>,
    }

    impl TestAccount {
        fn new(data_size: usize) -> Self {
            TestAccount {
                pubkey: Pubkey::new_unique(),
                is_signer: true,
                is_writable: true,
                data: RefCell::new(vec![0; data_size]),
            }
        }

        fn to_account_info(&self) -> AccountInfo {
            AccountInfo {
                key: &self.pubkey,
                is_signer: self.is_signer,
                is_writable: self.is_writable,
                lamports: &mut 0,
                data: self.data.borrow_mut(),
                owner: &Pubkey::default(),
                executable: false,
                rent_epoch: Epoch::default(),
            }
        }
    }

    #[test]
    fn test_initialize() {
        let stablecoin_account = TestAccount::new(100);
        let accounts = vec![stablecoin_account.to_account_info()];

        let symbol = "USD".to_string();
        let decimals = 2;
        let initial_price = 100;

        let result = initialize(&accounts, symbol, decimals, initial_price);
        assert!(result.is_ok());

        let stablecoin_data = Stablecoin::try_from_slice(&stablecoin_account.data.borrow()).unwrap();
        assert_eq!(stablecoin_data.symbol, [85, 83, 68, 0, 0, 0, 0, 0, 0, 0]); // "USD" padded
        assert_eq!(stablecoin_data.decimals, decimals);
        assert_eq!(stablecoin_data.price, initial_price);
        assert_eq!(stablecoin_data.total_supply, 0);
    }

    #[test]
    fn test_mint() {
        let stablecoin_account = TestAccount::new(100);
        let user_account = TestAccount::new(100);
        let accounts = vec![
            stablecoin_account.to_account_info(),
            user_account.to_account_info(),
        ];

        initialize(&accounts[..1], "USD".to_string(), 2, 100).unwrap();

        let amount = 500;
        let result = mint(&accounts, amount);
        assert!(result.is_ok());

        let stablecoin_data = Stablecoin::try_from_slice(&stablecoin_account.data.borrow()).unwrap();
        let user_data = UserAccount::try_from_slice(&user_account.data.borrow()).unwrap();

        assert_eq!(stablecoin_data.total_supply, amount);
        assert_eq!(user_data.balance, amount);
    }

    #[test]
    fn test_burn() {
        let stablecoin_account = TestAccount::new(100);
        let user_account = TestAccount::new(100);
        let accounts = vec![
            stablecoin_account.to_account_info(),
            user_account.to_account_info(),
        ];

        initialize(&accounts[..1], "USD".to_string(), 2, 100).unwrap();
        mint(&accounts, 500).unwrap();

        let burn_amount = 200;
        let result = burn(&accounts, burn_amount);
        assert!(result.is_ok());

        let stablecoin_data = Stablecoin::try_from_slice(&stablecoin_account.data.borrow()).unwrap();
        let user_data = UserAccount::try_from_slice(&user_account.data.borrow()).unwrap();

        assert_eq!(stablecoin_data.total_supply, 300);
        assert_eq!(user_data.balance, 300);
    }

    #[test]
    fn test_update_price() {
        let stablecoin_account = TestAccount::new(100);
        let accounts = vec![stablecoin_account.to_account_info()];

        initialize(&accounts, "USD".to_string(), 2, 100).unwrap();

        let new_price = 200;
        let result = update_price(&accounts, new_price);
        assert!(result.is_ok());

        let stablecoin_data = Stablecoin::try_from_slice(&stablecoin_account.data.borrow()).unwrap();
        assert_eq!(stablecoin_data.price, new_price);
    }
}
