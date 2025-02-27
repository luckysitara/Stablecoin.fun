import { DashboardShell } from "@/components/shell"
import { StablecoinList } from "@/components/stablecoin/stablecoin-list"
import { CreateStablecoinButton } from "@/components/stablecoin/create-button"

export default function HomePage() {
  return (
    <DashboardShell>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Stablecoins</h1>
          <p className="text-sm text-muted-foreground">
            Create and manage your stablecoins backed by Stablebond tokens.
          </p>
        </div>
        <CreateStablecoinButton />
      </div>
      <StablecoinList />
    </DashboardShell>
  )
}

