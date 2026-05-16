'use client'

import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { ConnectWalletButton } from '@/components/connect-wallet-button'

export function TopNavbar() {
  return (
    <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center gap-2 border-b border-border/50 px-4 glass-subtle">
      <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground hover:bg-secondary/50" />

      <Separator orientation="vertical" className="h-4 bg-border/50" />

      {/* App title — visible on mobile when sidebar is collapsed */}
      <span className="text-sm font-semibold tracking-tight text-foreground/80 md:hidden">
        ArcEscrow
      </span>

      <div className="ml-auto flex items-center gap-3">
        <ConnectWalletButton />
      </div>
    </header>
  )
}
