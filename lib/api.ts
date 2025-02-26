import type { Stablecoin, Transaction } from "./types"
import { PublicKey, type Connection } from "@solana/web3.js"
import { getAssociatedTokenAddress } from "@solana/spl-token"
import { PROGRAM_ID } from "./constants"

// Switchboard Oracle feed public key for price data
export const SWITCHBOARD_FEED = new PublicKey("66bVyxuQ6a4XCAqQHWoiCbG6wjZsZkHgwbGVY7NqQjS5")

export async function fetchStablecoins(wallet: string): Promise<Stablecoin[]> {
  try {
    // In a production app, we would query the blockchain directly
    // For now, we'll use our API endpoint that returns mock data
    const response = await fetch(`/api/stablecoins?wallet=${wallet}`)
    if (!response.ok) {
      throw new Error(`Error fetching stablecoins: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error("Error in fetchStablecoins:", error)
    return []
  }
}

export async function fetchOraclePrice(currency: string): Promise<number> {
  try {
    const response = await fetch(`/api/oracle-price/${currency}`)
    if (!response.ok) {
      throw new Error(`Error fetching price: ${response.statusText}`)
    }
    const data = await response.json()
    return data.price
  } catch (error) {
    console.error(`Error fetching ${currency} price:`, error)
    return 0
  }
}

export async function fetchTransactions(wallet: string): Promise<Transaction[]> {
  try {
    const response = await fetch(`/api/transactions/${wallet}`)
    if (!response.ok) {
      throw new Error(`Error fetching transactions: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return []
  }
}

export async function getTokenBalance(
  connection: Connection,
  walletAddress: PublicKey,
  mintAddress: PublicKey,
): Promise<number> {
  try {
    // Get the associated token account for this wallet and token mint
    const tokenAccount = await getAssociatedTokenAddress(mintAddress, walletAddress, false)

    // Fetch the token account info
    const accountInfo = await connection.getTokenAccountBalance(tokenAccount)

    // Return the balance
    return accountInfo.value.uiAmount || 0
  } catch (error) {
    console.error("Error fetching token balance:", error)
    return 0
  }
}

export async function findTreasuryPDA(): Promise<PublicKey> {
  const [treasuryPDA] = PublicKey.findProgramAddressSync([Buffer.from("TREASURY3")], new PublicKey(PROGRAM_ID))
  return treasuryPDA
}

export async function findCoinAccountPDA(mintAddress: PublicKey): Promise<PublicKey> {
  const [coinAccountPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("COIN_ACCOUNT"), mintAddress.toBuffer()],
    new PublicKey(PROGRAM_ID),
  )
  return coinAccountPDA
}

