"use client"

import { useEffect, useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { motion } from "framer-motion"
import { Loader2, Plus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Navbar from "@/components/navbar"
import { useAnchorProgram } from "@/hooks/use-anchor-program"
import { fetchStablecoins } from "@/lib/api"
import { StablecoinCard } from "@/components/stablecoin-card"
import { MintRedeemModal } from "@/components/mint-redeem-modal"
import { TransactionHistory } from "@/components/transaction-history"
import type { Stablecoin } from "@/lib/types"

export default function DashboardPage() {
  const { connected, publicKey } = useWallet()
  const [stablecoins, setStablecoins] = useState<Stablecoin[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCoin, setSelectedCoin] = useState<Stablecoin | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"mint" | "redeem">("mint")
  const { program } = useAnchorProgram()

  useEffect(() => {
    async function loadStablecoins() {
      if (connected && publicKey && program) {
        setLoading(true)
        try {
          const coins = await fetchStablecoins(publicKey.toString())
          setStablecoins(coins)
        } catch (error) {
          console.error("Error loading stablecoins:", error)
        } finally {
          setLoading(false)
        }
      }
    }

    loadStablecoins()
  }, [connected, publicKey, program])

  const handleMint = (coin: Stablecoin) => {
    setSelectedCoin(coin)
    setModalMode("mint")
    setModalOpen(true)
  }

  const handleRedeem = (coin: Stablecoin) => {
    setSelectedCoin(coin)
    setModalMode("redeem")
    setModalOpen(true)
  }

  if (!connected) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-[400px]">
            <CardHeader>
              <CardTitle>Wallet Not Connected</CardTitle>
              <CardDescription>Please connect your wallet to view your dashboard.</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button className="w-full">Connect Wallet</Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="container py-8">
        <div className="flex justify-between items-center mb-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-3xl font-bold gradient-text">Your Dashboard</h1>
            <p className="text-muted-foreground">Manage your stablecoins and transactions</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <Link href="/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create New
              </Button>
            </Link>
          </motion.div>
        </div>

        <Tabs defaultValue="stablecoins" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="stablecoins">Your Stablecoins</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>
          <TabsContent value="stablecoins" className="mt-6">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : stablecoins.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stablecoins.map((coin) => (
                  <StablecoinCard
                    key={coin.mint}
                    coin={coin}
                    onMint={() => handleMint(coin)}
                    onRedeem={() => handleRedeem(coin)}
                  />
                ))}
              </div>
            ) : (
              <Card className="bg-secondary/20">
                <CardHeader>
                  <CardTitle>No Stablecoins Found</CardTitle>
                  <CardDescription>You haven't created any stablecoins yet.</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Link href="/create">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Stablecoin
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            )}
          </TabsContent>
          <TabsContent value="transactions" className="mt-6">
            <Card className="bg-secondary/20">
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Your recent stablecoin transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <TransactionHistory />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {selectedCoin && (
        <MintRedeemModal open={modalOpen} onOpenChange={setModalOpen} mode={modalMode} coin={selectedCoin} />
      )}
    </div>
  )
}

