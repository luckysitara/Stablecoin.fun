use axum::Router;

pub fn payment_routes() -> Router {
    Router::new().route("/payments/process-payment", post(handlers::process_payment))
}

pub fn subscription_routes() -> Router {
    Router::new().route("/subscriptions/setup-subscription", post(handlers::setup_subscription))
}
