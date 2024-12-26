use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct QuickNodeStream {
    pub subscription: String,
    pub data: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct QuickNodeFunctionPayload {
    pub method: String,
    pub params: Vec<String>,
}
