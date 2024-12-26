use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Subscription {
    pub user_id: String,
    pub account_address: String,
    pub subscription_type: String,
    pub amount: u64,
    pub active: bool,
}
