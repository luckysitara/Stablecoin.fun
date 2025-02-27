"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import * as z from "zod"

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
import { useProgram } from "@/hooks/use-program"
import type { Stablecoin } from "./stablecoin-list"

const formSchema = z.object({
  amount: z.number().positive(),
})

interface MintDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  coin: Stablecoin
}

export function MintDialog({ open, onOpenChange, coin }: MintDialogProps) {
  const { connection } = useConnection()
  const { publicKey } = useWallet()
  const { program } = useProgram()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    if (!publicKey || !program) return

    try {
      setLoading(true)

      const tx = await program.methods
        .tokensMint(data.amount)
        .accounts({
          mint: coin.mint,
          // Add other required accounts here
        })
        .rpc()

      toast({
        title: "Success",
        description: `Minted ${data.amount} ${coin.symbol}`,
      })

      onOpenChange(false)
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to mint tokens",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mint {coin.symbol}</DialogTitle>
          <DialogDescription>Mint new stablecoins by depositing SOL.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="any"
                      {...field}
                      onChange={(e) => field.onChange(Number.parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>Amount of {coin.symbol} to mint.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                Mint
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

