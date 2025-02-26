import { NextResponse } from "next/server"
import { Connection, PublicKey } from "@solana/web3.js"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const wallet = searchParams.get("wallet")

  if (!wallet) {
    return NextResponse.json({ error: "Wallet address is required" }, { status: 400 })
  }

  try {
    // Validate wallet address
    const walletPublicKey = new PublicKey(wallet)

    // Connect to Solana
    const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com")

    // In a real implementation, we would:
    // 1. Create an Anchor provider
    // 2. Initialize the program
    // 3. Query all CoinAccount PDAs created by this wallet
    // 4. Fetch token balances for each stablecoin
    // 5. Return the formatted data

    // For demo purposes, we'll return mock data
    // In production, you would replace this with actual blockchain data
    const mockStablecoins = [
      {
        name: "US Dollar Coin",
        symbol: "USDC",
        mint: "ETwg2dCnvVCqf7JQ4qcp9dBuYmsbLDnPHirAyQFVT817",
        currency: "USD",
        description: "A stablecoin pegged to the US Dollar",
        imageUrl: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
        balance: "1000.00",
        price: "1.00",
      },
      {
        name: "Euro Stablecoin",
        symbol: "EURC",
        mint: "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr",
        currency: "EUR",
        description: "A stablecoin pegged to the Euro",
        imageUrl: "https://cryptologos.cc/logos/euro-eur-logo.png",
        balance: "500.00",
        price: "1.08",
      },
    ]

    return NextResponse.json(mockStablecoins)
  } catch (error) {
    console.error("Error fetching stablecoins:", error)
    return NextResponse.json({ error: "Failed to fetch stablecoins" }, { status: 500 })
  }
}

