"use client"

import { Button } from "@/components/ui/button"
import { useWallet } from "@solana/wallet-adapter-react"
import { motion } from "framer-motion"
import { ArrowRight, Coins, Shield, Zap } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import Navbar from "@/components/navbar"

export default function Home() {
  const { connected } = useWallet()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1">
        <section className="py-20 md:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none gradient-text">
                  Create Your Own Stablecoin on Solana
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl mt-4">
                  Launch, mint, and manage your custom stablecoins with ease. Backed by real assets and powered by
                  Solana.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-4 mt-8"
              >
                <Link href={connected ? "/create" : "#"}>
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    disabled={!connected}
                  >
                    {connected ? "Create Stablecoin" : "Connect Wallet to Start"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                {connected && (
                  <Link href="/dashboard">
                    <Button size="lg" variant="outline">
                      View Dashboard
                    </Button>
                  </Link>
                )}
              </motion.div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-24 bg-secondary/20">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="flex flex-col items-center space-y-4 rounded-lg border p-6 bg-card card-hover"
              >
                <div className="p-3 rounded-full bg-primary/10">
                  <Coins className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Create Custom Stablecoins</h3>
                <p className="text-center text-muted-foreground">
                  Design your own stablecoin with custom name, symbol, and backing currency.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="flex flex-col items-center space-y-4 rounded-lg border p-6 bg-card card-hover"
              >
                <div className="p-3 rounded-full bg-primary/10">
                  <Shield className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Fully Collateralized</h3>
                <p className="text-center text-muted-foreground">
                  Every stablecoin is backed by real assets, ensuring stability and trust.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="flex flex-col items-center space-y-4 rounded-lg border p-6 bg-card card-hover"
              >
                <div className="p-3 rounded-full bg-primary/10">
                  <Zap className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Lightning Fast</h3>
                <p className="text-center text-muted-foreground">
                  Powered by Solana's high-speed blockchain for instant transactions.
                </p>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

