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

const formSchema = z.object({
  name: z.string().min(1).max(32),
  symbol: z.string().min(1).max(4),
  decimals: z.number().min(0).max(9),
  currency: z.string().min(1).max(5),
  image: z.string().url(),
  description: z.string().min(1).max(100),
})

type FormData = z.infer<typeof formSchema>

interface CreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateStablecoinDialog({ open, onOpenChange }: CreateDialogProps) {
  const { connection } = useConnection()
  const { publicKey } = useWallet()
  const { program } = useProgram()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      decimals: 9,
      currency: "USD",
    },
  })

  async function onSubmit(data: FormData) {
    if (!publicKey || !program) return

    try {
      setLoading(true)

      const params = {
        name: data.name,
        symbol: data.symbol,
        uri: "https://arweave.net/your-metadata-uri",
        decimals: data.decimals,
      }

      const tx = await program.methods
        .createToken(params, data.currency, data.image, data.description, "cryptocurrency")
        .rpc()

      toast({
        title: "Success",
        description: "Stablecoin created successfully",
      })

      onOpenChange(false)
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to create stablecoin",
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
          <DialogTitle>Create Stablecoin</DialogTitle>
          <DialogDescription>Create a new stablecoin backed by Stablebond tokens.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="USD Coin" {...field} />
                  </FormControl>
                  <FormDescription>The name of your stablecoin.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="symbol"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Symbol</FormLabel>
                  <FormControl>
                    <Input placeholder="USDC" maxLength={4} {...field} />
                  </FormControl>
                  <FormDescription>The symbol of your stablecoin (max 4 characters).</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="decimals"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Decimals</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={9}
                      {...field}
                      onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>The number of decimal places (usually 9 for Solana tokens).</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <FormControl>
                    <Input placeholder="USD" maxLength={5} {...field} />
                  </FormControl>
                  <FormDescription>The fiat currency this stablecoin tracks.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormDescription>The icon for your stablecoin.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>A short description of your stablecoin.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                Create
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

