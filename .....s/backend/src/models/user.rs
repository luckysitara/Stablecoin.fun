use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct User {
    pub user_id: String,
    pub username: String,
    pub account_address: String,
    pub email: Option<String>,
}
