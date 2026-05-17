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
  AlertCircle,
  Coins,
  Loader2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useWallet } from '@/providers/wallet-provider'
import { useOnChainTasks } from '@/hooks/useEscrowContract'
import { useToast } from '@/hooks/use-toast'

function shortAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

export function WalletStatusCard() {
  const { address, balance, tokenBalance, isConnected, isOnArcTestnet, walletType, mintMockUSDC } = useWallet()
  const { stats } = useOnChainTasks()
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)
  const [isMinting, setIsMinting] = useState(false)

  const handleCopy = () => {
    if (!address) return
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleMintUSDC = async () => {
    try {
      setIsMinting(true)
      await mintMockUSDC()
      toast({
        title: "Success!",
        description: "1,000 Mock USDC minted successfully to your wallet.",
      })
    } catch (err: any) {
      console.error(err)
      toast({
        title: "Failed to mint USDC",
        description: err.message || "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsMinting(false)
    }
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
          <div className="space-y-4">
            {/* ERC20 USDC Token Balance */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground font-medium">USDC Token Balance</p>
                <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20 py-0 px-1.5">
                  Escrow Token
                </Badge>
              </div>
              <div className="flex items-baseline justify-between">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-bold tracking-tight text-emerald-400">
                    {tokenBalance ?? '0.00'}
                  </span>
                  <span className="text-sm font-semibold text-emerald-500/80">USDC</span>
                </div>
                
                {isOnArcTestnet && (
                  <Button 
                    variant="outline" 
                    className="h-7 px-2.5 py-1 text-xs border-emerald-500/30 text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10 hover:text-emerald-300 transition-all"
                    onClick={handleMintUSDC}
                    disabled={isMinting}
                  >
                    {isMinting ? (
                      <Loader2 className="size-3 animate-spin mr-1" />
                    ) : (
                      <Coins className="size-3 mr-1" />
                    )}
                    Faucet
                  </Button>
                )}
              </div>
            </div>

            {/* Native Gas Balance */}
            <div className="space-y-1 pt-1 border-t border-border/20">
              <p className="text-xs text-muted-foreground font-medium">Gas Balance (Native)</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-medium text-foreground/80">
                  {balance ?? '—'}
                </span>
                <span className="text-xs text-muted-foreground">USDC (Gas)</span>
              </div>
              {isOnArcTestnet && (
                <p className="text-[10px] text-muted-foreground/60">Arc Testnet Native Token</p>
              )}
            </div>
            
            {/* Alert if token balance is 0 */}
            {isOnArcTestnet && (!tokenBalance || parseFloat(tokenBalance) === 0) && (
              <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-300 space-y-1.5">
                <p className="font-semibold flex items-center gap-1.5 text-amber-400">
                  <AlertCircle className="size-3.5 shrink-0" />
                  No Escrow USDC Tokens
                </p>
                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  Your wallet has native gas, but you need **ERC20 USDC tokens** to fund escrow contracts. Click the **Faucet** button above to get 1,000 test tokens!
                </p>
              </div>
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

