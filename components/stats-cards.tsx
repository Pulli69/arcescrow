'use client'

import { FileText, Shield, CheckCircle2, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useOnChainTasks } from '@/hooks/useEscrowContract'

export function StatsCards() {
  const { stats, loading } = useOnChainTasks()

  const cards = stats ? [
    {
      title: 'Open Tasks',
      value: stats.activeTasks.toString(),
      change: 'Available in Marketplace',
      icon: Shield,
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-400',
    },
    {
      title: 'In Progress',
      value: stats.inProgressTasks.toString(),
      change: 'Being worked on',
      icon: FileText,
      iconBg: 'bg-indigo-500/10',
      iconColor: 'text-indigo-400',
    },
    {
      title: 'Proof Review',
      value: stats.proofPendingTasks.toString(),
      change: 'Awaiting approval',
      icon: Clock,
      iconBg: 'bg-amber-500/10',
      iconColor: 'text-amber-400',
    },
    {
      title: 'Total Locked',
      value: `$${stats.totalLockedUsdc}`,
      change: `${stats.totalTasks} total contracts`,
      icon: CheckCircle2,
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
    },
  ] : []

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="glass border-glass-border">
            <CardContent className="p-4 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((stat) => (
        <Card
          key={stat.title}
          className="glass border-glass-border hover:border-primary/20 transition-all duration-300"
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium">{stat.title}</p>
                <p className="text-2xl font-semibold tracking-tight">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.change}</p>
              </div>
              <div className={`flex size-9 items-center justify-center rounded-lg ${stat.iconBg}`}>
                <stat.icon className={`size-4 ${stat.iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
