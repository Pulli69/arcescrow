'use client'

import { Shield, ShieldCheck, Clock, CheckCircle2, AlertCircle, ExternalLink, RefreshCw, DollarSign, Activity, TrendingUp, User, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useOnChainTasks, OnChainTask } from '@/hooks/useEscrowContract'
import { formatDistanceToNow } from 'date-fns'

const CONTRACT_ADDR = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!

const statusConfig: Record<string, { label: string; icon: any; color: string; dot: string }> = {
  open:            { label: 'Open',           icon: ShieldCheck,  color: 'text-blue-400',    dot: 'bg-blue-400' },
  accepted:        { label: 'Accepted',       icon: User,         color: 'text-indigo-400',  dot: 'bg-indigo-400' },
  proof_submitted: { label: 'Proof Review',   icon: Clock,        color: 'text-yellow-400',  dot: 'bg-yellow-400' },
  paid:            { label: 'Completed',      icon: CheckCircle2, color: 'text-emerald-400', dot: 'bg-emerald-400' },
  refunded:        { label: 'Refunded',       icon: AlertCircle,  color: 'text-orange-400',  dot: 'bg-orange-400' },
  cancelled:       { label: 'Cancelled',      icon: XCircle,      color: 'text-red-400',     dot: 'bg-red-400' },
}

function truncateAddr(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

export default function EscrowPage() {
  const { tasks, stats, loading, error, refetch } = useOnChainTasks()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Escrow Overview</h1>
          <p className="text-sm text-muted-foreground">
            Live smart contract state · Arc Testnet
            {!loading && stats && (
              <span className="ml-2 inline-flex items-center gap-1 text-emerald-400 text-xs">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Contract live
              </span>
            )}
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          className="border-border/50 bg-card/50"
          onClick={() => refetch()}
          title="Refresh on-chain data"
        >
          <RefreshCw className="size-4" />
        </Button>
      </div>

      {/* Metric Cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="glass-card border-border/50">
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-3" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="glass-card border-border/50 hover:border-primary/30 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-muted-foreground">Active Escrows</p>
                <div className="flex size-9 items-center justify-center rounded-lg bg-blue-500/10">
                  <ShieldCheck className="size-4 text-blue-400" />
                </div>
              </div>
              <p className="text-3xl font-bold text-blue-400">{stats.activeTasks}</p>
              <p className="text-xs text-muted-foreground mt-1">Funds locked on-chain</p>
            </CardContent>
          </Card>

          <Card className="glass-card border-border/50 hover:border-primary/30 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-muted-foreground">Pending Review</p>
                <div className="flex size-9 items-center justify-center rounded-lg bg-yellow-500/10">
                  <Clock className="size-4 text-yellow-400" />
                </div>
              </div>
              <p className="text-3xl font-bold text-yellow-400">{stats.proofPendingTasks}</p>
              <p className="text-xs text-muted-foreground mt-1">Proof awaiting approval</p>
            </CardContent>
          </Card>

          <Card className="glass-card border-border/50 hover:border-primary/30 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-muted-foreground">Total Locked</p>
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                  <Shield className="size-4 text-primary" />
                </div>
              </div>
              <p className="text-2xl font-bold text-primary">${stats.totalLockedUsdc}</p>
              <p className="text-xs text-muted-foreground mt-1">USDC in escrow</p>
            </CardContent>
          </Card>

          <Card className="glass-card border-border/50 hover:border-primary/30 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-muted-foreground">Total Paid Out</p>
                <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10">
                  <CheckCircle2 className="size-4 text-emerald-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-emerald-400">${stats.totalPaidUsdc}</p>
              <p className="text-xs text-muted-foreground mt-1">USDC released to workers</p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-400">
          <AlertCircle className="size-4 shrink-0" />
          {error} — <button onClick={refetch} className="underline hover:no-underline ml-1">Retry</button>
        </div>
      )}

      {/* Live Escrow Activity Feed */}
      <Card className="glass-card border-border/50">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="size-4 text-primary" />
            Live Escrow Activity
          </CardTitle>
          <a
            href={`https://testnet.arcscan.app/address/${CONTRACT_ADDR}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            View on ArcScan <ExternalLink className="size-3" />
          </a>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="size-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && tasks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Shield className="size-12 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No escrows on-chain yet.</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Create a contract to fund the first escrow on Arc Testnet.
              </p>
            </div>
          )}

          {!loading && tasks.length > 0 && (
            <div className="space-y-2">
              {tasks.slice(0, 10).map((task: OnChainTask) => {
                const cfg = statusConfig[task.statusLabel] ?? statusConfig.open
                const StatusIcon = cfg.icon
                return (
                  <div
                    key={task.taskId}
                    className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30 border border-border/30 hover:border-primary/20 transition-colors"
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <DollarSign className="size-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold font-mono">Task #{task.taskId}</span>
                        <span className={`inline-flex items-center gap-1 text-xs ${cfg.color}`}>
                          <span className={`size-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {truncateAddr(task.creator)} → {task.worker === '0x0000000000000000000000000000000000000000' ? 'Open Marketplace' : truncateAddr(task.worker)} · ${task.rewardAmount} USDC
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-muted-foreground">
                        {task.createdAt
                          ? formatDistanceToNow(new Date(task.createdAt * 1000), { addSuffix: true })
                          : '—'}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contract Info */}
      {!loading && stats && (
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="size-4 text-primary" />
              Contract Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-sm">
              <div>
                <p className="text-muted-foreground text-xs mb-1">Total Contracts</p>
                <p className="font-bold text-xl">{stats.totalTasks}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-1">Completed</p>
                <p className="font-bold text-xl text-emerald-400">{stats.paidTasks}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-1">Refunded</p>
                <p className="font-bold text-xl text-orange-400">{stats.refundedTasks}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-1">Success Rate</p>
                <p className="font-bold text-xl text-primary">
                  {stats.totalTasks > 0
                    ? `${Math.round((stats.paidTasks / stats.totalTasks) * 100)}%`
                    : '—'}
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border/30">
              <p className="text-xs text-muted-foreground">
                Contract address:{' '}
                <a
                  href={`https://testnet.arcscan.app/address/${CONTRACT_ADDR}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-blue-400 hover:underline"
                >
                  {CONTRACT_ADDR}
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
