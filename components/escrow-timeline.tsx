'use client'

import { CheckCircle2, Circle, Clock, DollarSign, FileText, XCircle } from 'lucide-react'
import { TaskWithProfile } from '@/types/domain'

interface EscrowTimelineProps {
  task: TaskWithProfile
}

export function EscrowTimeline({ task }: EscrowTimelineProps) {
  const steps = [
    {
      id: 'created',
      title: 'Task Created',
      description: 'Terms agreed and metadata saved',
      isCompleted: true, // always true if task exists
      icon: FileText,
      date: task.created_at,
    },
    {
      id: 'funded',
      title: 'Escrow Funded',
      description: `${task.escrow_amount} ${task.currency} locked in Arc Testnet contract`,
      isCompleted: true, // If task exists, it was funded (dual tx)
      icon: DollarSign,
      date: task.created_at, // Same as created for now
    },
    {
      id: 'accepted',
      title: 'Task Accepted',
      description: task.status === 'open' ? 'Waiting for worker to join' : 'Worker has claimed the task',
      isCompleted: task.status !== 'open' && task.status !== 'cancelled',
      icon: Circle,
      date: task.status !== 'open' ? task.updated_at : null,
    },
    {
      id: 'proof',
      title: 'Proof Submitted',
      description: (task.status === 'proof_submitted' || task.status === 'paid') ? 'Worker provided proof of work' : 'Working in progress',
      isCompleted: task.status === 'proof_submitted' || task.status === 'paid',
      icon: CheckCircle2,
      date: (task.status === 'proof_submitted' || task.status === 'paid') ? task.updated_at : null,
      isHidden: task.status === 'cancelled' || task.status === 'refunded'
    },
    {
      id: 'paid',
      title: task.status === 'refunded' ? 'Refunded' : task.status === 'cancelled' ? 'Cancelled' : 'Payment Released',
      description: task.status === 'paid' ? 'Funds transferred to worker' : 
                   task.status === 'refunded' ? 'Funds returned to creator after deadline' : 
                   task.status === 'cancelled' ? 'Escrow cancelled by creator' : 'Pending creator approval',
      isCompleted: task.status === 'paid' || task.status === 'refunded' || task.status === 'cancelled',
      icon: task.status === 'refunded' ? Clock : task.status === 'cancelled' ? XCircle : CheckCircle2,
      date: (task.status === 'paid' || task.status === 'refunded' || task.status === 'cancelled') ? task.updated_at : null,
    },
  ].filter(step => !step.isHidden)

  return (
    <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border/50 before:to-transparent">
      {steps.map((step, index) => {
        const Icon = step.icon
        return (
          <div key={step.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            
            {/* Icon */}
            <div className={`flex items-center justify-center size-10 rounded-full border-4 border-background bg-background shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ${
              step.isCompleted ? 'text-primary' : 'text-muted-foreground opacity-50'
            }`}>
              <Icon className="size-4" />
            </div>
            
            {/* Content */}
            <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-border/50 bg-card/50 glass-subtle shadow-sm ${
              !step.isCompleted ? 'opacity-50' : ''
            }`}>
              <div className="flex flex-col space-y-1">
                <h4 className="text-sm font-semibold">{step.title}</h4>
                <p className="text-xs text-muted-foreground">{step.description}</p>
                {step.date && step.isCompleted && (
                  <span className="text-[10px] text-muted-foreground/60 mt-2 block font-mono tracking-tight">
                    {new Date(step.date).toLocaleString(undefined, { 
                      month: 'short', 
                      day: 'numeric', 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
