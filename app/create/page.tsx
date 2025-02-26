"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useWallet } from "@solana/wallet-adapter-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Navbar from "@/components/navbar"
import { useAnchorProgram } from "@/hooks/use-anchor-program"
import { PublicKey } from "@solana/web3.js"
import { findProgramAddressSync } from "@project-serum/anchor/dist/cjs/utils/pubkey"
import { PROGRAM_ID } from "@/lib/constants"

const formSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Name must be at least 2 characters.",
    })
    .max(50, {
      message: "Name must be less than 50 characters.",
    }),
  symbol: z
    .string()
    .min(1, {
      message: "Symbol is required.",
    })
    .max(4, {
      message: "Symbol must be 4 characters or less.",
    })
    .refine((val) => /^[A-Za-z0-9]+$/.test(val), {
      message: "Symbol must be alphanumeric.",
    }),
  currency: z.string({
    required_error: "Please select a currency.",
  }),
  description: z
    .string()
    .min(10, {
      message: "Description must be at least 10 characters.",
    })
    .max(500, {
      message: "Description must be less than 500 characters.",
    }),
  imageUrl: z.string().url({
    message: "Please enter a valid URL.",
  }),
})

export default function CreateStablecoinPage() {
  const { toast } = useToast()
  const { publicKey, connected } = useWallet()
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const { program } = useAnchorProgram()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      symbol: "",
      currency: "USD",
      description: "",
      imageUrl: "https://example.com/token-image.png",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!connected || !publicKey || !program) {
      toast({
        variant: "destructive",
        title: "Wallet not connected",
        description: "Please connect your wallet to create a stablecoin.",
      })
      return
    }

    setIsCreating(true)

    try {
      // Calculate the PDA for the mint
      const [mintPDA] = findProgramAddressSync(
        [Buffer.from("COIN_MINT"), publicKey.toBuffer(), Buffer.from(values.symbol)],
        new PublicKey(PROGRAM_ID),
      )

      // Calculate the metadata PDA
      const [metadataAddress] = findProgramAddressSync(
        [
          Buffer.from("metadata"),
          new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s").toBuffer(),
          mintPDA.toBuffer(),
        ],
        new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"),
      )

      // Calculate the coin account PDA
      const [coinAccount] = findProgramAddressSync(
        [Buffer.from("COIN_ACCOUNT"), mintPDA.toBuffer()],
        new PublicKey(PROGRAM_ID),
      )

      // Create the token
      const tx = await program.methods
        .createToken(
          {
            name: values.name,
            symbol: values.symbol,
            uri: "https://arweave.net/token-metadata",
            decimals: 9,
          },
          values.currency,
          values.imageUrl,
          values.description,
          "stablecoin",
        )
        .accounts({
          metadata: metadataAddress,
          mint: mintPDA,
          payer: publicKey,
          coinAccount: coinAccount,
        })
        .rpc()

      toast({
        title: "Stablecoin created!",
        description: "Your stablecoin has been successfully created.",
      })

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (error) {
      console.error("Error creating stablecoin:", error)
      toast({
        variant: "destructive",
        title: "Failed to create stablecoin",
        description: error instanceof Error ? error.message : "Unknown error occurred",
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1 container max-w-3xl py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div>
            <h1 className="text-3xl font-bold gradient-text">Create Your Stablecoin</h1>
            <p className="text-muted-foreground mt-2">Design and deploy your own custom stablecoin on Solana.</p>
          </div>

          <div className="p-6 border rounded-lg bg-card">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="US Dollar Coin" {...field} />
                      </FormControl>
                      <FormDescription>The full name of your stablecoin.</FormDescription>
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
                        <Input placeholder="USDC" {...field} maxLength={4} />
                      </FormControl>
                      <FormDescription>A short ticker symbol (max 4 characters).</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pegged Currency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="USD">US Dollar (USD)</SelectItem>
                          <SelectItem value="EUR">Euro (EUR)</SelectItem>
                          <SelectItem value="GBP">British Pound (GBP)</SelectItem>
                          <SelectItem value="JPY">Japanese Yen (JPY)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>The fiat currency your stablecoin will be pegged to.</FormDescription>
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
                        <Input placeholder="A stablecoin pegged to the US Dollar" {...field} />
                      </FormControl>
                      <FormDescription>A brief description of your stablecoin.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/token-image.png" {...field} />
                      </FormControl>
                      <FormDescription>A URL to the image for your stablecoin.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  disabled={isCreating || !connected}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Stablecoin"
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

