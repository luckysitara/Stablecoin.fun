"use client"

import { useContext } from "react"
import { AnchorContext } from "@/components/providers/anchor-provider"

export function useAnchorProgram() {
  return useContext(AnchorContext)
}

