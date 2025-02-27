"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { useWallet } from "@solana/wallet-adapter-react"

import { Button } from "@/components/ui/button"
import { CreateStablecoinDialog } from "./create-dialog"

export function CreateStablecoinButton() {
  const { connected } = useWallet()
  const [open, setOpen] = useState(false)

  if (!connected) {
    return null
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Create Stablecoin
      </Button>
      <CreateStablecoinDialog open={open} onOpenChange={setOpen} />
    </>
  )
}

