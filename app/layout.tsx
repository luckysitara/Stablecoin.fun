import type React from "react"
import { Inter } from "next/font/google"
import { Providers } from "@/components/providers"
import { SiteHeader } from "@/components/site-header"
import { TailwindIndicator } from "@/components/tailwind-indicator"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import "@/styles/globals.css"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark">
          <Providers>
            <div className="relative flex min-h-screen flex-col">
              <SiteHeader />
              <main className="flex-1">{children}</main>
            </div>
            <TailwindIndicator />
            <Toaster />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}

