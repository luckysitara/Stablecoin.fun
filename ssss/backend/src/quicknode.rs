use reqwest::{Client, Error};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
struct QuickNodeStream {
    subscription: String,
    data: String,
}

pub async fn setup_stream(api_key: &str) -> Result<(), Error> {
    let client = Client::new();
    let endpoint = format!("https://stream.quicknode.com/v1/{api_key}");

    let body = QuickNodeStream {
        subscription: "account_activity".to_string(),
        data: "Your data here".to_string(),
    };

    let res = client.post(&endpoint).json(&body).send().await?;
    println!("QuickNode stream setup response: {:?}", res.text().await?);
    Ok(())
}

pub async fn call_function(api_key: &str, payload: &str) -> Result<String, Error> {
    let client = Client::new();
    let endpoint = format!("https://functions.quicknode.com/v1/{api_key}");

    let res = client.post(&endpoint).body(payload.to_string()).send().await?;
    Ok(res.text().await?)
}
