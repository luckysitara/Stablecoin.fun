use actix_web::{web, App, HttpServer};
mod routes;
mod services;
mod models;
mod config;
use axum::{routing::post, Router};
use std::net::SocketAddr;
use crate::handlers::subscription::{create_subscription, update_subscription, delete_subscription};

#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/create-subscription", post(create_subscription))
        .route("/update-subscription", post(update_subscription))
        .route("/delete-subscription", post(delete_subscription));

    let addr = SocketAddr::from(([127, 0, 0, 1], 8080));
    println!("Server running at http://{}", addr);

    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}
