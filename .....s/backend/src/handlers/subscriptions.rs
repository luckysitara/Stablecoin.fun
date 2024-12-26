use axum::{extract::Json, response::IntoResponse, Extension};
use serde::{Deserialize, Serialize};
use crate::quicknode::setup_stream;

#[derive(Serialize, Deserialize)]
pub struct SubscriptionRequest {
    pub user_id: String,
    pub account_address: String,
    pub subscription_type: String,
    pub amount: u64,
}

#[derive(Serialize, Deserialize)]
pub struct SubscriptionResponse {
    pub success: bool,
    pub message: String,
}

pub async fn create_subscription(
    Json(payload): Json<SubscriptionRequest>,
    Extension(api_key): Extension<String>,
) -> impl IntoResponse {
    // Simulate saving subscription data
    let subscription = payload.clone();
    println!("Creating subscription for: {:?}", subscription);

    // Setup a QuickNode Stream to monitor the user's account
    match setup_stream(&api_key).await {
        Ok(_) => (
            200,
            Json(SubscriptionResponse {
                success: true,
                message: "Subscription created and QuickNode stream setup successfully.".to_string(),
            }),
        ),
        Err(err) => (
            500,
            Json(SubscriptionResponse {
                success: false,
                message: format!("Failed to set up QuickNode stream: {}", err),
            }),
        ),
    }
}

pub async fn update_subscription(
    Json(payload): Json<SubscriptionRequest>,
) -> impl IntoResponse {
    // Simulate updating subscription data
    println!("Updating subscription for user: {:?}", payload.user_id);

    (
        200,
        Json(SubscriptionResponse {
            success: true,
            message: "Subscription updated successfully.".to_string(),
        }),
    )
}

pub async fn delete_subscription(Json(payload): Json<SubscriptionRequest>) -> impl IntoResponse {
    // Simulate deleting subscription data
    println!("Deleting subscription for user: {:?}", payload.user_id);

    (
        200,
        Json(SubscriptionResponse {
            success: true,
            message: "Subscription deleted successfully.".to_string(),
        }),
    )
}
