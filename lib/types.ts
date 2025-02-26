export interface Stablecoin {
  name: string
  symbol: string
  mint: string
  currency: string
  description: string
  imageUrl: string
  balance: string
  price: string
}

export interface Transaction {
  id: string
  type: "mint" | "redeem" | "transfer"
  amount: string
  symbol: string
  timestamp: string
  status: "pending" | "confirmed" | "failed"
}

