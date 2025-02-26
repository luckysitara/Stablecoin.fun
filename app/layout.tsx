import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { WalletContextProvider } from "@/components/providers/wallet-provider"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { AnchorProvider } from "@/components/providers/anchor-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Stablecoin.fun",
  description: "Create and manage your own stablecoins on Solana",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <WalletContextProvider>
            <AnchorProvider>
              <main className="min-h-screen bg-gradient-to-b from-background to-background/90">{children}</main>
              <Toaster />
            </AnchorProvider>
          </WalletContextProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

