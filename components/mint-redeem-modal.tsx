"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { useAnchorProgram } from "@/hooks/use-anchor-program"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { PublicKey } from "@solana/web3.js"
import type { Stablecoin } from "@/lib/types"
import { getAssociatedTokenAddress } from "@solana/spl-token"
import { SWITCHBOARD_FEED, findTreasuryPDA, findCoinAccountPDA } from "@/lib/api"
import { formatCurrency } from "@/lib/utils"

const formSchema = z.object({
  amount: z.string().refine(
    (val) => {
      const num = Number.parseFloat(val)
      return !isNaN(num) && num > 0
    },
    {
      message: "Amount must be a positive number",
    },
  ),
})

interface MintRedeemModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "mint" | "redeem"
  coin: Stablecoin
}

export function MintRedeemModal({ open, onOpenChange, mode, coin }: MintRedeemModalProps) {
  const { toast } = useToast()
  const { publicKey } = useWallet()
  const { connection } = useConnection()
  const { program } = useAnchorProgram()
  const [isProcessing, setIsProcessing] = useState(false)
  const [estimatedReturn, setEstimatedReturn] = useState<number>(0)
  const [currentPrice, setCurrentPrice] = useState<number>(Number.parseFloat(coin.price))

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: "",
    },
  })

  // Update estimated return when amount changes
  useEffect(() => {
    const amount = Number.parseFloat(form.watch("amount") || "0")
    if (mode === "mint") {
      // When minting, show how many tokens they'll receive
      setEstimatedReturn(amount / currentPrice)
    } else {
      // When redeeming, show how much SOL they'll receive
      setEstimatedReturn(amount * currentPrice)
    }
  }, [form.watch("amount"), mode, currentPrice])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!publicKey || !program) {
      toast({
        variant: "destructive",
        title: "Wallet not connected",
        description: "Please connect your wallet to continue.",
      })
      return
    }

    setIsProcessing(true)

    try {
      const amount = Number.parseFloat(values.amount)
      const mintPublicKey = new PublicKey(coin.mint)

      // Find the treasury PDA
      const treasuryPDA = await findTreasuryPDA()

      // Find the coin account PDA
      const coinAccountPDA = await findCoinAccountPDA(mintPublicKey)

      // Get the bond mint (in a real app, this would be fetched from the treasury account)
      const bondMint = new PublicKey("A433vq62iQbDToDeZ3XZcWj1VWFHYB95SYwnZgSoEmXy")

      // Get the treasury's bond ATA
      const treasuryBondATA = await getAssociatedTokenAddress(bondMint, treasuryPDA, true)

      // Get the coin account's bond ATA
      const coinAccountBondATA = await getAssociatedTokenAddress(bondMint, coinAccountPDA, true)

      if (mode === "mint") {
        // Call the tokens_mint instruction
        const solAmount = Math.floor(amount * 1_000_000_000) // Convert to lamports

        // Get the user's ATA for this token
        const userATA = await getAssociatedTokenAddress(mintPublicKey, publicKey, false)

        await program.methods
          .tokensMint(solAmount)
          .accounts({
            mint: mintPublicKey,
            destination: userATA,
            payer: publicKey,
            feed: SWITCHBOARD_FEED,
            coinAccount: coinAccountPDA,
            treasury: treasuryPDA,
            bondMint: bondMint,
            treasuryBondAta: treasuryBondATA,
            coinAccountBondAta: coinAccountBondATA,
          })
          .rpc()

        toast({
          title: "Tokens Minted",
          description: `Successfully minted ${estimatedReturn.toFixed(2)} ${coin.symbol}`,
        })
      } else {
        // Call the tokens_burn instruction
        const tokenAmount = Math.floor(amount * 1_000_000_000) // Convert to token decimals

        // Get the user's ATA for this token
        const userATA = await getAssociatedTokenAddress(mintPublicKey, publicKey, false)

        await program.methods
          .tokensBurn(tokenAmount)
          .accounts({
            mint: mintPublicKey,
            payer: publicKey,
            feed: SWITCHBOARD_FEED,
            userStablecoinAta: userATA,
            coinAccount: coinAccountPDA,
            treasury: treasuryPDA,
            bondMint: bondMint,
            treasuryBondAta: treasuryBondATA,
            coinAccountBondAta: coinAccountBondATA,
          })
          .rpc()

        toast({
          title: "Tokens Redeemed",
          description: `Successfully redeemed ${amount} ${coin.symbol} for ${estimatedReturn.toFixed(4)} SOL`,
        })
      }

      onOpenChange(false)
    } catch (error) {
      console.error(`Error ${mode === "mint" ? "minting" : "redeeming"} tokens:`, error)
      toast({
        variant: "destructive",
        title: `Failed to ${mode === "mint" ? "mint" : "redeem"} tokens`,
        description: error instanceof Error ? error.message : "Unknown error occurred",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "mint" ? "Mint" : "Redeem"} {coin.symbol}
          </DialogTitle>
          <DialogDescription>
            {mode === "mint"
              ? `Mint new ${coin.symbol} tokens by depositing collateral.`
              : `Redeem ${coin.symbol} tokens to withdraw collateral.`}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input placeholder="0.00" {...field} type="number" step="0.01" min="0.01" />
                  </FormControl>
                  <FormDescription>
                    {mode === "mint"
                      ? `You'll deposit ${field.value || "0"} SOL and receive approximately ${estimatedReturn.toFixed(2)} ${coin.symbol}`
                      : `You'll redeem ${field.value || "0"} ${coin.symbol} and receive approximately ${estimatedReturn.toFixed(4)} SOL`}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="text-sm text-muted-foreground">
              <p>
                Current price: {formatCurrency(currentPrice, "USD")} per {coin.symbol}
              </p>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                disabled={isProcessing}
                className={mode === "mint" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : mode === "mint" ? (
                  "Mint Tokens"
                ) : (
                  "Redeem Tokens"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

