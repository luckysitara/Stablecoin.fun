"use client"

import { useEffect, useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import { fetchTransactions } from "@/lib/api"
import type { Transaction } from "@/lib/types"
import { shortenAddress } from "@/lib/utils"

export function TransactionHistory() {
  const { publicKey } = useWallet()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadTransactions() {
      if (publicKey) {
        setLoading(true)
        try {
          const txs = await fetchTransactions(publicKey.toString())
          setTransactions(txs)
        } catch (error) {
          console.error("Error loading transactions:", error)
        } finally {
          setLoading(false)
        }
      }
    }

    loadTransactions()
  }, [publicKey])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (transactions.length === 0) {
    return <div className="text-center py-10 text-muted-foreground">No transactions found</div>
  }

  return (
    <Table>
      <TableCaption>Your recent stablecoin transactions</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Type</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Symbol</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Transaction ID</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((tx) => (
          <TableRow key={tx.id}>
            <TableCell>
              <Badge variant={tx.type === "mint" ? "default" : "destructive"}>
                {tx.type === "mint" ? "Mint" : "Redeem"}
              </Badge>
            </TableCell>
            <TableCell>{tx.amount}</TableCell>
            <TableCell>{tx.symbol}</TableCell>
            <TableCell>{new Date(tx.timestamp).toLocaleString()}</TableCell>
            <TableCell>
              <Badge variant={tx.status === "confirmed" ? "outline" : "secondary"}>{tx.status}</Badge>
            </TableCell>
            <TableCell className="text-right font-mono text-xs">
              <a
                href={`https://explorer.solana.com/tx/${tx.id}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                {shortenAddress(tx.id, 8)}
              </a>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

