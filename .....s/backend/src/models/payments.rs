use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Payment {
    pub sender: String,
    pub recipient: String,
    pub amount: u64,
    pub timestamp: String,
}
