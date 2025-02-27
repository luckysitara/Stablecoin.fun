"use client"

import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { Program, AnchorProvider } from "@coral-xyz/anchor"
import { useMemo } from "react"
import { BasicIDL } from "../anchor"

export function useProgram() {
  const { connection } = useConnection()
  const wallet = useWallet()

  const provider = useMemo(() => {
    if (!wallet) return null
    return new AnchorProvider(connection, wallet as any, {
      commitment: "confirmed",
    })
  }, [connection, wallet])

  const program = useMemo(() => {
    if (!provider) return null
    return new Program(BasicIDL, BasicIDL.address, provider)
  }, [provider])

  return { program }
}

