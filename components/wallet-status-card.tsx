'use client'

import { useState } from 'react'
import {
  Wallet,
  Copy,
  ExternalLink,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownLeft,
  Check,
  WifiOff,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useWallet } from '@/providers/wallet-provider'
import { useOnChainTasks } from '@/hooks/useEscrowContract'

function shortAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

export function WalletStatusCard() {
  const { address, balance, isConnected, isOnArcTestnet, walletType } = useWallet()
  const { stats } = useOnChainTasks()
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (!address) return
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  if (!isConnected) {
    return (
      <Card className="glass border-glass-border overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-muted/10 via-transparent to-transparent pointer-events-none" />
        <CardHeader className="pb-4 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-muted/20 text-muted-foreground">
                <Wallet className="size-5" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">Wallet</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Not connected</p>
              </div>
            </div>
            <Badge variant="outline" className="gap-1.5 bg-muted/10 text-muted-foreground border-muted/20">
              <WifiOff className="size-3" />
              Offline
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="relative">
          <p className="text-sm text-muted-foreground text-center py-4">
            Connect your wallet to view your balance and transaction activity.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glass border-glass-border overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />

      <CardHeader className="pb-4 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary glow-sm text-lg select-none">
              {walletType === 'metamask' ? '🦊' : '🐰'}
            </div>
            <div>
              <CardTitle className="text-base font-semibold">Wallet</CardTitle>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-muted-foreground font-mono">
                  {shortAddress(address!)}
                </span>
                <Button variant="ghost" size="icon" className="size-5 hover:bg-secondary/50" onClick={handleCopy}>
                  {copied ? (
                    <Check className="size-3 text-emerald-400" />
                  ) : (
                    <Copy className="size-3 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
          </div>
          <Badge
            variant="outline"
            className={`gap-1.5 ${isOnArcTestnet
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}
          >
            <CheckCircle2 className="size-3" />
            {isOnArcTestnet ? 'Connected' : 'Wrong Network'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 relative">
        <div className="grid gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Balance</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold tracking-tight">
                {balance ?? '—'}
              </span>
              <span className="text-sm text-muted-foreground">ARC</span>
            </div>
            {isOnArcTestnet && (
              <p className="text-xs text-muted-foreground">Arc Testnet</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="glass-subtle rounded-lg p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <ArrowDownLeft className="size-3 text-emerald-400" />
                <span className="text-xs">Locked USDC</span>
              </div>
              <p className="text-sm font-medium text-emerald-400">
                {stats ? `$${stats.totalLockedUsdc}` : '—'}
              </p>
            </div>
            <div className="glass-subtle rounded-lg p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <ArrowUpRight className="size-3 text-primary" />
                <span className="text-xs">Contracts</span>
              </div>
              <p className="text-sm font-medium">{stats ? stats.totalTasks : '—'}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button size="sm" className="flex-1 gap-2 bg-primary hover:bg-primary/90">
            <ArrowUpRight className="size-3.5" />
            Send
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 gap-2 border-border/50 bg-secondary/30 hover:bg-secondary/50"
            asChild
          >
            <a
              href={`https://testnet.arcscan.app/address/${address}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="size-3.5" />
              View
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
