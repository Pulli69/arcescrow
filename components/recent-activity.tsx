'use client'

import { ShieldCheck, CheckCircle2, Clock, AlertCircle, ExternalLink, User, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useOnChainTasks, OnChainTask } from '@/hooks/useEscrowContract'
import { formatDistanceToNow } from 'date-fns'

const CONTRACT_ADDR = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!

const statusMap: Record<string, { icon: any; color: string; bg: string; label: string }> = {
  open:            { icon: ShieldCheck,  color: 'text-blue-400',    bg: 'bg-blue-400/10',    label: 'Escrow Created' },
  accepted:        { icon: User,         color: 'text-indigo-400',  bg: 'bg-indigo-400/10',  label: 'Task Accepted' },
  proof_submitted: { icon: Clock,        color: 'text-yellow-400',  bg: 'bg-yellow-400/10',  label: 'Proof Submitted' },
  paid:            { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-400/10', label: 'Payment Released' },
  refunded:        { icon: AlertCircle,  color: 'text-orange-400',  bg: 'bg-orange-400/10',  label: 'Refunded' },
  cancelled:       { icon: XCircle,      color: 'text-red-400',     bg: 'bg-red-400/10',     label: 'Cancelled' },
}

function truncateAddr(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

export function RecentActivity() {
  const { tasks, loading } = useOnChainTasks()

  if (loading) {
    return (
      <Card className="glass border-glass-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">Recent On-Chain Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="size-9 rounded-lg" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (tasks.length === 0) {
    return (
      <Card className="glass border-glass-border">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">Recent On-Chain Activity</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <ShieldCheck className="size-10 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No on-chain activity yet</p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Create a contract to see live escrow events here.
          </p>
        </CardContent>
      </Card>
    )
  }

  const recent = tasks.slice(0, 8)

  return (
    <Card className="glass border-glass-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Recent On-Chain Activity</CardTitle>
          <div className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <Badge variant="outline" className="text-xs bg-secondary/30 border-border/50">
              Live
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        {recent.map((task: OnChainTask) => {
          const cfg = statusMap[task.statusLabel] ?? statusMap.open
          const Icon = cfg.icon

          return (
            <div
              key={task.taskId}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/30 transition-colors duration-200 -mx-2"
            >
              <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${cfg.bg}`}>
                <Icon className={`size-4 ${cfg.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">
                  {cfg.label}{' '}
                  <span className="font-mono text-xs text-muted-foreground">#{task.taskId}</span>
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {truncateAddr(task.creator)} → {task.worker === '0x0000000000000000000000000000000000000000' ? 'Open' : truncateAddr(task.worker)} · ${task.rewardAmount} USDC
                </p>
              </div>
              <div className="text-right shrink-0 flex flex-col items-end gap-1">
                <p className="text-xs text-muted-foreground">
                  {task.createdAt
                    ? formatDistanceToNow(new Date(task.createdAt * 1000), { addSuffix: true })
                    : '—'}
                </p>
                <a
                  href={`https://testnet.arcscan.app/address/${CONTRACT_ADDR}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-0.5"
                >
                  ArcScan <ExternalLink className="size-2.5" />
                </a>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
