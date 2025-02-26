"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Coins } from "lucide-react"
import { motion } from "framer-motion"
import type { Stablecoin } from "@/lib/types"

interface StablecoinCardProps {
  coin: Stablecoin
  onMint: () => void
  onRedeem: () => void
}

export function StablecoinCard({ coin, onMint, onRedeem }: StablecoinCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
      className="card-hover"
    >
      <Card className="overflow-hidden border-2 border-secondary">
        <CardHeader className="bg-gradient-to-r from-blue-900/20 to-indigo-900/20 pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{coin.name}</CardTitle>
              <CardDescription>{coin.symbol}</CardDescription>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              {coin.imageUrl ? (
                <img
                  src={coin.imageUrl || "/placeholder.svg"}
                  alt={coin.symbol}
                  className="h-8 w-8 rounded-full"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg?height=32&width=32"
                  }}
                />
              ) : (
                <Coins className="h-6 w-6 text-primary" />
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Balance</span>
              <span className="font-medium">
                {coin.balance} {coin.symbol}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Price</span>
              <span className="font-medium">
                ${coin.price} {coin.currency}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Value</span>
              <span className="font-medium">
                ${(Number.parseFloat(coin.balance) * Number.parseFloat(coin.price)).toFixed(2)} {coin.currency}
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex gap-2 pt-2">
          <Button
            variant="outline"
            className="flex-1 bg-green-500/10 hover:bg-green-500/20 border-green-500/30"
            onClick={onMint}
          >
            Mint
          </Button>
          <Button
            variant="outline"
            className="flex-1 bg-red-500/10 hover:bg-red-500/20 border-red-500/30"
            onClick={onRedeem}
          >
            Redeem
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

