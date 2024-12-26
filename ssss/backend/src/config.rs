#[derive(Clone)]
pub struct Config {
    pub server_url: String,
    pub solana_rpc_url: String,
    pub program_id: String,
}

pub fn load_config() -> Config {
    Config {
        server_url: "127.0.0.1:8080".to_string(),
        solana_rpc_url: "https://api.devnet.solana.com".to_string(),
        program_id: "YourProgramPublicKey".to_string(),
    }
}
