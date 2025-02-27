"use client"

import { useEffect, useState } from "react"
import { useConnection } from "@solana/wallet-adapter-react"
import type { PublicKey } from "@solana/web3.js"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useProgram } from "@/hooks/use-program"
import { StablecoinRow } from "./stablecoin-row"

export interface Stablecoin {
  mint: PublicKey
  name: string
  symbol: string
  decimals: number
  currency: string
  balance: number
}

export function StablecoinList() {
  const { connection } = useConnection()
  const { program } = useProgram()
  const [stablecoins, setStablecoins] = useState<Stablecoin[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStablecoins() {
      if (!program) return

      try {
        // Fetch all CoinAccount PDAs
        const accounts = await program.account.coinAccount.all()

        // Map the accounts to our Stablecoin interface
        const coins = accounts.map((account) => ({
          mint: account.account.mint,
          name: account.account.name,
          symbol: account.account.symbol,
          decimals: 9, // Hardcoded for now
          currency: account.account.currency,
          balance: Number(account.account.balance),
        }))

        setStablecoins(coins)
      } catch (error) {
        console.error("Error fetching stablecoins:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStablecoins()
  }, [program])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Symbol</TableHead>
          <TableHead>Currency</TableHead>
          <TableHead>Balance</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {stablecoins.map((coin) => (
          <StablecoinRow key={coin.mint.toString()} coin={coin} />
        ))}
        {stablecoins.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} className="text-center">
              No stablecoins found. Create one to get started.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}

