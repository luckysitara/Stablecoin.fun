"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { TableCell, TableRow } from "@/components/ui/table"
import type { Stablecoin } from "./stablecoin-list"
import { MintDialog } from "./mint-dialog"
import { BurnDialog } from "./burn-dialog"

interface StablecoinRowProps {
  coin: Stablecoin
}

export function StablecoinRow({ coin }: StablecoinRowProps) {
  const [mintOpen, setMintOpen] = useState(false)
  const [burnOpen, setBurnOpen] = useState(false)

  return (
    <TableRow>
      <TableCell>{coin.name}</TableCell>
      <TableCell>{coin.symbol}</TableCell>
      <TableCell>{coin.currency}</TableCell>
      <TableCell>{coin.balance}</TableCell>
      <TableCell className="space-x-2">
        <Button variant="outline" size="sm" onClick={() => setMintOpen(true)}>
          Mint
        </Button>
        <Button variant="outline" size="sm" onClick={() => setBurnOpen(true)}>
          Burn
        </Button>
        <MintDialog open={mintOpen} onOpenChange={setMintOpen} coin={coin} />
        <BurnDialog open={burnOpen} onOpenChange={setBurnOpen} coin={coin} />
      </TableCell>
    </TableRow>
  )
}

