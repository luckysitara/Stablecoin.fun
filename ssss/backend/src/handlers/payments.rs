use crate::quicknode::{call_function, setup_stream};
use axum::{Json, extract::Extension};
use serde::Deserialize;

#[derive(Deserialize)]
struct PaymentRequest {
    sender: String,
    recipient: String,
    amount: u64,
}

pub async fn process_payment(
    Json(payload): Json<PaymentRequest>,
    Extension(api_key): Extension<String>,
) -> Json<String> {
    // Example of using QuickNode Functions for payment validation
    let payload_json = serde_json::to_string(&payload).unwrap();
    match call_function(&api_key, &payload_json).await {
        Ok(response) => Json(response),
        Err(e) => Json(format!("Error processing payment: {}", e)),
    }
}

pub async fn setup_real_time_stream(
    Extension(api_key): Extension<String>,
) -> Json<String> {
    match setup_stream(&api_key).await {
        Ok(_) => Json("QuickNode stream set up successfully.".to_string()),
        Err(e) => Json(format!("Failed to set up stream: {}", e)),
    }
}
