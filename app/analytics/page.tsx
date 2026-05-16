'use client'

import { BarChart3, TrendingUp, Users, Activity, DollarSign, ShieldCheck, CheckCircle2, Clock, AlertCircle, ExternalLink, RefreshCw, User, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useOnChainTasks, OnChainTask } from '@/hooks/useEscrowContract'
import { formatDistanceToNow } from 'date-fns'

const CONTRACT_ADDR = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!

function StatCard({ label, value, sub, icon: Icon, color }: {
  label: string
  value: string | number
  sub?: string
  icon: any
  color: string
}) {
  return (
    <Card className="glass-card border-border/50 hover:border-primary/30 transition-colors">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-muted-foreground">{label}</p>
          <div className={`flex size-8 items-center justify-center rounded-lg bg-opacity-10 ${color.replace('text-', 'bg-').replace('400', '400/10')}`}>
            <Icon className={`size-4 ${color}`} />
          </div>
        </div>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  )
}

function SimpleBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="w-full bg-muted/30 rounded-full h-2 overflow-hidden">
      <div
        className={`h-full rounded-full ${color} transition-all duration-500`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export default function AnalyticsPage() {
  const { tasks, stats, loading, error, refetch } = useOnChainTasks()

  const successRate = stats && stats.totalTasks > 0
    ? Math.round((stats.paidTasks / stats.totalTasks) * 100)
    : 0

  const avgAmount = stats && stats.totalTasks > 0 && tasks.length > 0
    ? tasks.reduce((sum, t) => sum + Number(t.rewardAmountRaw), 0) / tasks.length
    : 0

  function formatUsdc(raw: bigint) {
    return (Number(raw) / 1_000_000).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Real on-chain insights from Arc Testnet
            {!loading && stats && (
              <span className="ml-2 inline-flex items-center gap-1 text-emerald-400 text-xs">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            )}
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          className="border-border/50 bg-card/50"
          onClick={() => refetch()}
          title="Refresh from chain"
        >
          <RefreshCw className="size-4" />
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-400">
          <AlertCircle className="size-4 shrink-0" />
          {error} — <button onClick={refetch} className="underline ml-1">Retry</button>
        </div>
      )}

      {/* Key Metrics */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="glass-card border-border/50">
              <CardContent className="p-5">
                <Skeleton className="h-4 w-24 mb-3" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Contracts"  value={stats.totalTasks}         sub="On Arc Testnet"          icon={BarChart3}    color="text-primary" />
          <StatCard label="Total Volume"     value={`$${stats.totalPaidUsdc}`} sub="USDC paid to workers"   icon={DollarSign}   color="text-emerald-400" />
          <StatCard label="Escrow Locked"    value={`$${stats.totalLockedUsdc}`} sub="USDC in active escrows" icon={ShieldCheck} color="text-blue-400" />
          <StatCard label="Success Rate"     value={`${successRate}%`}         sub="Contracts completed"    icon={TrendingUp}   color="text-violet-400" />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Status Breakdown */}
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="size-4 text-primary" />
              Contract Status Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
              </div>
            ) : stats ? (
              <>
                {[
                  { label: 'Open (Marketplace)',      count: stats.activeTasks,       color: 'bg-blue-400',    text: 'text-blue-400' },
                  { label: 'Accepted (In Progress)', count: stats.inProgressTasks,   color: 'bg-indigo-400',  text: 'text-indigo-400' },
                  { label: 'Proof Under Review',     count: stats.proofPendingTasks, color: 'bg-yellow-400',  text: 'text-yellow-400' },
                  { label: 'Completed & Paid',       count: stats.paidTasks,         color: 'bg-emerald-400', text: 'text-emerald-400' },
                  { label: 'Refunded',               count: stats.refundedTasks,     color: 'bg-orange-400',  text: 'text-orange-400' },
                  { label: 'Cancelled',              count: stats.cancelledTasks,    color: 'bg-red-400',     text: 'text-red-400' },
                ].map(row => (
                  <div key={row.label}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-muted-foreground">{row.label}</span>
                      <span className={`font-semibold ${row.text}`}>{row.count}</span>
                    </div>
                    <SimpleBar value={row.count} max={stats.totalTasks} color={row.color} />
                  </div>
                ))}
                {stats.totalTasks === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No contracts yet. Create one from the Contracts page.
                  </p>
                )}
              </>
            ) : null}
          </CardContent>
        </Card>

        {/* Recent Activity Feed */}
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="size-4 text-primary" />
              Recent On-Chain Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="size-8 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-24 mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            )}
            {!loading && tasks.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <BarChart3 className="size-10 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No activity yet</p>
              </div>
            )}
            {!loading && tasks.length > 0 && (
              <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                {tasks.slice(0, 8).map((task: OnChainTask) => {
                  const iconMap: Record<string, any> = {
                    open: ShieldCheck, 
                    accepted: User,
                    proof_submitted: Clock, 
                    paid: CheckCircle2, 
                    refunded: AlertCircle,
                    cancelled: XCircle
                  }
                  const colorMap: Record<string, string> = {
                    open: 'text-blue-400 bg-blue-400/10', 
                    accepted: 'text-indigo-400 bg-indigo-400/10',
                    proof_submitted: 'text-yellow-400 bg-yellow-400/10',
                    paid: 'text-emerald-400 bg-emerald-400/10', 
                    refunded: 'text-orange-400 bg-orange-400/10',
                    cancelled: 'text-red-400 bg-red-400/10'
                  }
                  const Icon = iconMap[task.statusLabel] ?? ShieldCheck
                  const clr = colorMap[task.statusLabel] ?? colorMap.open

                  return (
                    <div key={task.taskId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/30 transition-colors">
                      <div className={`flex size-8 shrink-0 items-center justify-center rounded-full ${clr}`}>
                        <Icon className="size-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          Task #{task.taskId} — <span className="font-mono text-xs">{task.creator.slice(0, 6)}...</span>
                        </p>
                        <p className="text-xs text-muted-foreground">${task.rewardAmount} USDC</p>
                      </div>
                      <p className="text-xs text-muted-foreground shrink-0">
                        {task.createdAt ? formatDistanceToNow(new Date(task.createdAt * 1000), { addSuffix: true }) : '—'}
                      </p>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Contract Info Footer */}
      <Card className="glass-card border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">ArcEscrow Smart Contract</p>
              <p className="font-mono text-xs text-blue-400">{CONTRACT_ADDR}</p>
            </div>
            <a
              href={`https://testnet.arcscan.app/address/${CONTRACT_ADDR}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors border border-blue-400/20 bg-blue-400/5 rounded-lg px-3 py-1.5"
            >
              View Full History on ArcScan <ExternalLink className="size-3" />
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
