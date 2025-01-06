use solana_program::{
    program_error::ProgramError,
    program_pack::{IsInitialized, Pack, Sealed},
    pubkey::Pubkey,
};

/// Stablecoin account structure
#[derive(Clone, Copy, Debug, Default)]
pub struct Stablecoin {
    pub is_initialized: bool,
    pub name: [u8; 32],
    pub symbol: [u8; 10],
    pub backing_bond: Pubkey,
    pub yield_rate: f64,
    pub total_supply: u64,
}

// Required traits for serialization and deserialization
impl Sealed for Stablecoin {}

impl IsInitialized for Stablecoin {
    fn is_initialized(&self) -> bool {
        self.is_initialized
    }
}

impl Pack for Stablecoin {
    const LEN: usize = 91; // Fixed size in bytes

    fn pack_into_slice(&self, dst: &mut [u8]) {
        dst[0] = self.is_initialized as u8;
        dst[1..33].copy_from_slice(&self.name);
        dst[33..43].copy_from_slice(&self.symbol);
        dst[43..75].copy_from_slice(self.backing_bond.as_ref());
        dst[75..83].copy_from_slice(&self.yield_rate.to_le_bytes());
        dst[83..91].copy_from_slice(&self.total_supply.to_le_bytes());
    }

    fn unpack_from_slice(src: &[u8]) -> Result<Self, ProgramError> {
        if src.len() != Self::LEN {
            return Err(ProgramError::InvalidAccountData);
        }
        Ok(Self {
            is_initialized: src[0] != 0,
            name: src[1..33].try_into().unwrap(),
            symbol: src[33..43].try_into().unwrap(),
            backing_bond: Pubkey::new_from_array(src[43..75].try_into().unwrap()),
            yield_rate: f64::from_le_bytes(src[75..83].try_into().unwrap()),
            total_supply: u64::from_le_bytes(src[83..91].try_into().unwrap()),
        })
    }
}

/// UserAccount structure
#[derive(Clone, Copy, Debug, Default)]
pub struct UserAccount {
    pub owner: Pubkey,
    pub balances: [u64; 10],
}

// Required traits for serialization and deserialization
impl Sealed for UserAccount {}

impl IsInitialized for UserAccount {
    fn is_initialized(&self) -> bool {
        self.owner != Pubkey::default()
    }
}

impl Pack for UserAccount {
    const LEN: usize = 112;

    fn pack_into_slice(&self, dst: &mut [u8]) {
        dst[0..32].copy_from_slice(self.owner.as_ref());
        for (i, &balance) in self.balances.iter().enumerate() {
            dst[32 + i * 8..32 + (i + 1) * 8].copy_from_slice(&balance.to_le_bytes());
        }
    }

    fn unpack_from_slice(src: &[u8]) -> Result<Self, ProgramError> {
        if src.len() != Self::LEN {
            return Err(ProgramError::InvalidAccountData);
        }
        Ok(Self {
            owner: Pubkey::new_from_array(src[0..32].try_into().unwrap()),
            balances: {
                let mut balances = [0u64; 10];
                for i in 0..10 {
                    balances[i] = u64::from_le_bytes(
                        src[32 + i * 8..32 + (i + 1) * 8].try_into().unwrap(),
                    );
                }
                balances
            },
        })
    }
}
