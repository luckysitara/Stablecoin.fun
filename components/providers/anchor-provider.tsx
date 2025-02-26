"use client"

import { type FC, type ReactNode, createContext, useEffect, useState } from "react"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { AnchorProvider as SolanaAnchorProvider, Program } from "@project-serum/anchor"
import { PublicKey } from "@solana/web3.js"
import { PROGRAM_ID } from "@/lib/constants"
import { type Basic, BasicIDL } from "@/lib/idl"

interface AnchorContextState {
  provider: SolanaAnchorProvider | null
  program: Program<Basic> | null
}

export const AnchorContext = createContext<AnchorContextState>({
  provider: null,
  program: null,
})

export const AnchorProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { connection } = useConnection()
  const wallet = useWallet()
  const [provider, setProvider] = useState<SolanaAnchorProvider | null>(null)
  const [program, setProgram] = useState<Program<Basic> | null>(null)

  useEffect(() => {
    if (wallet && connection) {
      // Create the provider
      const anchorProvider = new SolanaAnchorProvider(connection, wallet as any, { commitment: "confirmed" })
      setProvider(anchorProvider)

      // Create the program
      try {
        const anchorProgram = new Program<Basic>(BasicIDL as any, new PublicKey(PROGRAM_ID), anchorProvider)
        setProgram(anchorProgram)
      } catch (error) {
        console.error("Error creating Anchor program:", error)
      }
    } else {
      setProvider(null)
      setProgram(null)
    }
  }, [wallet, connection])

  return <AnchorContext.Provider value={{ provider, program }}>{children}</AnchorContext.Provider>
}


