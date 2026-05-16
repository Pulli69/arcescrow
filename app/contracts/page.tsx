'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FileText, Plus, Search, ExternalLink, CheckCircle2, Clock, AlertCircle, ShieldCheck, RefreshCw, User, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { CreateTaskModal } from '@/components/create-task-modal'
import { useOnChainTasks, OnChainTask } from '@/hooks/useEscrowContract'
import { formatDistanceToNow } from 'date-fns'

const CONTRACT_ADDR = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!

const statusConfig: Record<string, { label: string; icon: any; color: string }> = {
  open:             { label: 'Open',           icon: ShieldCheck,  color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  accepted:         { label: 'Accepted',       icon: User,         color: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20' },
  proof_submitted:  { label: 'Proof Review',  icon: Clock,       color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' },
  paid:             { label: 'Completed',     icon: CheckCircle2,color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
  refunded:         { label: 'Refunded',      icon: AlertCircle, color: 'text-orange-400 bg-orange-400/10 border-orange-400/20' },
  cancelled:        { label: 'Cancelled',     icon: XCircle,      color: 'text-red-400 bg-red-400/10 border-red-400/20' },
}

function truncateAddr(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

function DeadlineLabel({ ts }: { ts: number }) {
  if (!ts) return <span className="text-xs text-muted-foreground">—</span>
  const d = new Date(ts * 1000)
  return (
    <span className={`text-xs ${d < new Date() ? 'text-red-400' : 'text-muted-foreground'}`}>
      {formatDistanceToNow(d, { addSuffix: true })}
    </span>
  )
}

export default function ContractsPage() {
  const { tasks, stats, loading, error, refetch } = useOnChainTasks()
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const filtered = tasks.filter(t =>
    t.creator.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.worker.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(t.taskId).includes(searchTerm)
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Escrow Contracts</h1>
          <p className="text-sm text-muted-foreground">
            Live on-chain data from Arc Testnet
            {stats && (
              <span className="ml-2 inline-flex items-center gap-1 text-emerald-400">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {stats.totalTasks} contract{stats.totalTasks !== 1 ? 's' : ''} on-chain
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="border-border/50 bg-card/50"
            onClick={() => refetch()}
            title="Refresh from chain"
          >
            <RefreshCw className="size-4" />
          </Button>
          <Button
            className="gap-2 bg-primary hover:bg-primary/90"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="size-4" />
            New Contract
          </Button>
        </div>
      </div>

      {/* Stats Strip */}
      {stats && !loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Active Escrows',    value: stats.activeTasks,       color: 'text-blue-400' },
            { label: 'Pending Proof',     value: stats.proofPendingTasks, color: 'text-yellow-400' },
            { label: 'Total Locked',      value: `$${stats.totalLockedUsdc}`, color: 'text-primary' },
            { label: 'Total Paid Out',    value: `$${stats.totalPaidUsdc}`,   color: 'text-emerald-400' },
          ].map(s => (
            <div key={s.label} className="glass-card rounded-xl border border-border/50 p-4">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by address or task ID..."
          className="pl-9 bg-card/50 border-border/50 focus:border-primary/50"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-400">
          <AlertCircle className="size-4 shrink-0" />
          {error} — <button onClick={refetch} className="underline hover:no-underline">Retry</button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="glass-card rounded-xl border border-border/50 overflow-hidden">
          <div className="p-8 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="size-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-60" />
                </div>
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filtered.length === 0 && (
        <Card className="glass border-glass-border">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-muted/20 mb-4">
              <FileText className="size-8 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              {searchTerm ? 'No contracts match your search' : 'No escrow contracts on-chain yet'}
            </p>
            <p className="text-xs text-muted-foreground mt-1 mb-6 text-center max-w-xs">
              {searchTerm
                ? 'Try a different address or task ID'
                : 'Click "New Contract" to create the first escrow on Arc Testnet.'}
            </p>
            {!searchTerm && (
              <Button onClick={() => setIsModalOpen(true)} className="bg-primary hover:bg-primary/90">
                <Plus className="mr-2 size-4" /> Create First Contract
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Contracts Table */}
      {!loading && filtered.length > 0 && (
        <div className="glass-card rounded-xl border border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                  {['ID', 'Creator', 'Worker', 'Amount (USDC)', 'Status', 'Deadline', 'Explorer'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {filtered.map((task: OnChainTask) => {
                  const cfg = statusConfig[task.statusLabel] ?? statusConfig.open
                  const StatusIcon = cfg.icon
                  return (
                    <tr
                      key={task.taskId}
                      className="hover:bg-muted/20 transition-colors group cursor-pointer"
                      onClick={() => window.location.href = `/contracts/${task.taskId}`}
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <FileText className="size-4" />
                          </div>
                          <div>
                            <span className="font-mono text-sm font-semibold">#{task.taskId}</span>
                            <p className="text-xs text-muted-foreground">View details →</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors">
                          {truncateAddr(task.creator)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors">
                          {task.worker === '0x0000000000000000000000000000000000000000' 
                            ? <span className="text-primary/70 italic">Open Marketplace</span> 
                            : truncateAddr(task.worker)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-semibold text-sm">${task.rewardAmount}</span>
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant="outline" className={`text-xs font-medium border ${cfg.color}`}>
                          <StatusIcon className="size-3 mr-1" />
                          {cfg.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <DeadlineLabel ts={task.deadline} />
                      </td>
                      <td className="px-4 py-4">
                        <a
                          href={`https://testnet.arcscan.app/address/${CONTRACT_ADDR}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          ArcScan <ExternalLink className="size-3" />
                        </a>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Footer */}
      <p className="text-center text-xs text-muted-foreground/50 pt-2">
        Live data from Arc Testnet · Contract: {CONTRACT_ADDR?.slice(0, 10)}...
      </p>

      <CreateTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => refetch()}
      />
    </div>
  )
}
