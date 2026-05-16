'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useOnChainTask } from '@/hooks/useEscrowContract'
import { useSubmitProof, useApproveTask, useRefundTask, useCancelTask, useAcceptTask } from '@/hooks/useBlockchain'
import { taskService } from '@/lib/services/taskService'
import { profileService } from '@/lib/services/profileService'
import { useWallet } from '@/providers/wallet-provider'
import { useTransactionFeedback } from '@/hooks/useTransactionFeedback'
import { ethers } from 'ethers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Loader2, ArrowLeft, ExternalLink, ShieldCheck, CheckCircle2,
  Clock, AlertCircle, DollarSign, User, RefreshCw, XCircle
} from 'lucide-react'
import Link from 'next/link'
import { SubmitProofModal } from '@/components/submit-proof-modal'
import { ApplyModal } from '@/components/apply-modal'
import { TaskApplicants } from '@/components/task-applicants'
import { TaskComments } from '@/components/task-comments'
import { applicationService } from '@/lib/services/applicationService'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

const CONTRACT_ADDR = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!

const statusConfig: Record<number, { label: string; icon: any; color: string; dot: string }> = {
  0: { label: 'Open',           icon: ShieldCheck,  color: 'text-blue-400 bg-blue-400/10 border-blue-400/20',    dot: 'bg-blue-400' },
  1: { label: 'Accepted',       icon: User,         color: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20', dot: 'bg-indigo-400' },
  2: { label: 'Proof Review',   icon: Clock,        color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20', dot: 'bg-yellow-400' },
  3: { label: 'Completed',      icon: CheckCircle2, color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', dot: 'bg-emerald-400' },
  4: { label: 'Refunded',       icon: AlertCircle,  color: 'text-orange-400 bg-orange-400/10 border-orange-400/20',  dot: 'bg-orange-400' },
  5: { label: 'Cancelled',      icon: XCircle,      color: 'text-red-400 bg-red-400/10 border-red-400/20',  dot: 'bg-red-400' },
}

function truncateAddr(addr: string) {
  return `${addr.slice(0, 10)}...${addr.slice(-6)}`
}

function TimelineStep({ done, active, title, sub }: {
  done: boolean; active: boolean; title: string; sub: string
}) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className={`flex size-7 items-center justify-center rounded-full border-2 shrink-0 ${
          done ? 'bg-primary border-primary' : active ? 'border-primary bg-primary/10' : 'border-border/50 bg-muted/30'
        }`}>
          {done ? <CheckCircle2 className="size-3.5 text-white" /> : (
            <span className={`size-2 rounded-full ${active ? 'bg-primary animate-pulse' : 'bg-muted-foreground/30'}`} />
          )}
        </div>
        <div className="w-px flex-1 bg-border/30 my-1" />
      </div>
      <div className="pb-4">
        <p className={`text-sm font-medium ${done ? 'text-foreground' : active ? 'text-primary' : 'text-muted-foreground'}`}>
          {title}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
      </div>
    </div>
  )
}

export default function TaskDetailsPage() {
  const params = useParams()
  const router = useRouter()
  // The [id] param is the on-chain task ID (integer)
  const onChainId = parseInt(params.id as string)

  const { address } = useWallet()
  const { showPendingToast, showSuccessToast, showErrorToast } = useTransactionFeedback()
  const { task, loading, error, refetch } = useOnChainTask(isNaN(onChainId) ? undefined : onChainId)

  const { submitProof } = useSubmitProof()
  const { approveTask } = useApproveTask()
  const { refundTask } = useRefundTask()
  const { cancelTask } = useCancelTask()
  const { acceptTask } = useAcceptTask()

  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false)
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)
  const [isAccepting, setIsAccepting] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const [isRefunding, setIsRefunding] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [supabaseTask, setSupabaseTask] = useState<any>(null)

  // Fetch Supabase metadata to get the UUID
  useEffect(() => {
    if (!isNaN(onChainId)) {
      taskService.getTaskByOnChainId(onChainId).then(setSupabaseTask)
    }
  }, [onChainId])

  // Check if current user has already applied
  useEffect(() => {
    if (address && supabaseTask) {
      profileService.ensureProfile(address).then(profile => {
        applicationService.getWorkerApplication(supabaseTask.id, profile.id)
          .then(app => setHasApplied(!!app))
      })
    }
  }, [address, supabaseTask])

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-6 w-32" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-48 rounded-xl" />
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    )
  }

  if (error || !task) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="size-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold">Contract Not Found</h2>
        <p className="text-sm text-muted-foreground mt-2">
          {error || `Task #${onChainId} not found on Arc Testnet`}
        </p>
        <Button variant="link" onClick={() => router.push('/contracts')} className="mt-4">
          Back to Contracts
        </Button>
      </div>
    )
  }

  const isCreator = !!address && !!task && address.toLowerCase() === task.creator.toLowerCase()
  const isWorker = !!address && !!task && task.worker !== ethers.ZeroAddress && address.toLowerCase() === task.worker.toLowerCase()
  
  // Logical flags for UI
  const isDisconnected = !address
  const canApply = task.status === 0 && !isCreator && !hasApplied
  const canSubmitProof = task.status === 1 && isWorker
  const canApprove = task.status === 2 && isCreator
  
  const isRefundEligible = task.status <= 2 && isCreator
  const hasDeadlinePassed = task.deadline ? (Date.now() > task.deadline * 1000) : false
  const canRefund = isRefundEligible && hasDeadlinePassed
  
  const canCancel = task.status === 0 && isCreator

  const cfg = statusConfig[task.status] ?? statusConfig[0]
  const StatusIcon = cfg.icon

  const handleApprove = async () => {
    try {
      setIsApproving(true)
      const pendingToast = showPendingToast()
      const receipt = await approveTask(task.taskId)
      // Sync Supabase if there's metadata
      try { await taskService.updateTaskStatus(String(task.taskId), 'paid') } catch {}
      pendingToast.dismiss()
      showSuccessToast('Payment Released!', receipt.hash)
      refetch()
    } catch (err: any) {
      showErrorToast('Approval Failed', err)
    } finally {
      setIsApproving(false)
    }
  }

  const handleAccept = async () => {
    try {
      setIsAccepting(true)
      const pendingToast = showPendingToast()
      const receipt = await acceptTask(task.taskId)
      
      // Update worker_id in Supabase
      try {
        const profile = await profileService.ensureProfile(address!)
        await taskService.assignWorker(String(task.taskId), profile.id)
        await taskService.updateTaskStatus(String(task.taskId), 'accepted')
      } catch (err) {
        console.error("Failed to sync accept state to Supabase:", err)
      }

      pendingToast.dismiss()
      showSuccessToast('Task Accepted!', receipt.hash)
      refetch()
    } catch (err: any) {
      showErrorToast('Acceptance Failed', err)
    } finally {
      setIsAccepting(false)
    }
  }

  const handleRefund = async () => {
    try {
      setIsRefunding(true)
      const pendingToast = showPendingToast()
      const receipt = await refundTask(task.taskId)
      try { await taskService.updateTaskStatus(String(task.taskId), 'refunded') } catch {}
      pendingToast.dismiss()
      showSuccessToast('Task Refunded', receipt.hash)
      refetch()
    } catch (err: any) {
      showErrorToast('Refund Failed', err)
    } finally {
      setIsRefunding(false)
    }
  }

  const handleCancel = async () => {
    try {
      setIsCancelling(true)
      const pendingToast = showPendingToast()
      const receipt = await cancelTask(task.taskId)
      try { await taskService.updateTaskStatus(String(task.taskId), 'cancelled') } catch {}
      pendingToast.dismiss()
      showSuccessToast('Task Cancelled', receipt.hash)
      refetch()
    } catch (err: any) {
      showErrorToast('Cancellation Failed', err)
    } finally {
      setIsCancelling(false)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <Link href="/contracts" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 size-4" /> Back to Contracts
        </Link>
        <Button variant="outline" size="icon" className="border-border/50 bg-card/50" onClick={() => refetch()}>
          <RefreshCw className="size-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Left Column */}
        <div className="md:col-span-2 space-y-6">
          <Card className="glass-card border-border/50">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs text-muted-foreground">Task #{task.taskId}</span>
                  <a
                    href={`https://testnet.arcscan.app/address/${CONTRACT_ADDR}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                  >
                    <ExternalLink className="size-3" /> ArcScan
                  </a>
                </div>
                <CardTitle className="text-xl">Escrow Contract #{task.taskId}</CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <ShieldCheck className="size-4 text-emerald-500" />
                  <span className="text-sm font-semibold text-emerald-400">${task.rewardAmount} USDC Locked</span>
                </div>
              </div>
              <Badge variant="outline" className={`text-xs font-medium border ${cfg.color}`}>
                <StatusIcon className="size-3 mr-1" />
                {cfg.label}
              </Badge>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Parties */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 p-3 rounded-lg bg-secondary/30 border border-border/30">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <User className="size-3" /> Creator
                  </p>
                  <p className="font-mono text-xs">{truncateAddr(task.creator)}</p>
                </div>
                <div className="space-y-1 p-3 rounded-lg bg-secondary/30 border border-border/30">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <User className="size-3" /> Worker
                  </p>
                  <p className="font-mono text-xs">
                    {task.worker === ethers.ZeroAddress ? (
                      <span className="text-primary italic">Open to Marketplace</span>
                    ) : truncateAddr(task.worker)}
                  </p>
                </div>
              </div>

              {/* Proof Link */}
              {task.proofLink && (
                <div className="p-4 rounded-lg bg-secondary/50 border border-border/50">
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-primary" />
                    Submitted Proof
                  </h4>
                  <a
                    href={task.proofLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-400 hover:underline inline-flex items-center gap-1 break-all"
                  >
                    {task.proofLink} <ExternalLink className="size-3 shrink-0" />
                  </a>
                </div>
              )}

              {/* Deadline */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="size-4" />
                Deadline:{' '}
                {task.deadline
                  ? formatDistanceToNow(new Date(task.deadline * 1000), { addSuffix: true })
                  : 'No deadline'}
                {task.deadline && new Date(task.deadline * 1000) < new Date() && (
                  <span className="text-red-400 text-xs">(Expired)</span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-border/10">
                {!address && (
                  <p className="text-sm text-muted-foreground">Connect your wallet to take action.</p>
                )}
                {isDisconnected && task.status === 0 && (
                  <Button 
                    className="bg-indigo-500 hover:bg-indigo-600 text-white"
                    onClick={() => {
                      // Trigger wallet connection modal if available, 
                      // or just show a message. For now, we'll suggest connecting.
                      toast.info("Please connect your wallet to apply")
                    }}
                  >
                    <User className="size-4 mr-2" />
                    Connect Wallet to Apply
                  </Button>
                )}

                {canApply && !isDisconnected && (
                  <Button 
                    onClick={() => setIsApplyModalOpen(true)} 
                    className="bg-indigo-500 hover:bg-indigo-600 text-white"
                    disabled={!supabaseTask}
                  >
                    {!supabaseTask ? <Loader2 className="size-4 animate-spin mr-2" /> : <User className="size-4 mr-2" />}
                    Apply for Task
                  </Button>
                )}
                {hasApplied && task.status === 0 && (
                  <Button disabled variant="outline" className="border-indigo-500/50 text-indigo-400">
                    <CheckCircle2 className="size-4 mr-2" />
                    Application Sent
                  </Button>
                )}
                {canSubmitProof && (
                  <Button onClick={() => setIsSubmitModalOpen(true)} className="bg-primary hover:bg-primary/90">
                    Submit Proof of Work
                  </Button>
                )}
                {canApprove && (
                  <Button
                    onClick={handleApprove}
                    disabled={isApproving || isRefunding}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white"
                  >
                    {isApproving ? <Loader2 className="size-4 animate-spin mr-2" /> : <CheckCircle2 className="size-4 mr-2" />}
                    Approve & Release Funds
                  </Button>
                )}
                {canRefund && (
                  <Button
                    onClick={handleRefund}
                    disabled={isApproving || isRefunding}
                    variant="destructive"
                  >
                    {isRefunding ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
                    Refund Task
                  </Button>
                )}
                {isRefundEligible && !canRefund && !canCancel && (
                  <Button
                    disabled
                    variant="outline"
                    className="opacity-50 cursor-not-allowed border-dashed"
                    title="You can refund this task only after the deadline has expired."
                  >
                    Refund available after deadline
                  </Button>
                )}
                {canCancel && (
                  <Button
                    onClick={handleCancel}
                    disabled={isCancelling}
                    variant="outline"
                    className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                    title="You can cancel the escrow before it is accepted by a worker."
                  >
                    {isCancelling ? <Loader2 className="size-4 animate-spin mr-2" /> : <XCircle className="size-4 mr-2" />}
                    Cancel Escrow
                  </Button>
                )}
                {address && !canApply && !hasApplied && !canSubmitProof && !canApprove && !isRefundEligible && task.status < 3 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    You are not a party to this contract, or the contract is in a final state.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Applicants (if creator and metadata exists) */}
          {supabaseTask && (
            <TaskApplicants 
              taskId={supabaseTask.id} 
              onChainTaskId={task.taskId} 
              isCreator={isCreator} 
              status={task.status}
              onSuccess={() => refetch()}
            />
          )}

          {/* Comments (Supabase) */}
          {supabaseTask && <TaskComments taskId={supabaseTask.id} />}
        </div>

        {/* Right Column — Timeline */}
        <div>
          <Card className="glass-card border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Escrow Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <TimelineStep
                done={true}
                active={false}
                title="Escrow Created"
                sub={`Task #${task.taskId} created on Arc Testnet`}
              />
              <TimelineStep
                done={true}
                active={false}
                title="USDC Locked"
                sub={`$${task.rewardAmount} USDC in escrow`}
              />
              <TimelineStep
                done={task.status >= 1}
                active={task.status === 0}
                title="Task Accepted"
                sub={task.worker !== ethers.ZeroAddress ? 'Worker joined the task' : 'Waiting for worker'}
              />
              <TimelineStep
                done={task.status >= 2}
                active={task.status === 1}
                title="Proof Submitted"
                sub={task.status >= 2 ? 'Worker submitted proof' : 'Working in progress'}
              />
              <TimelineStep
                done={task.status === 3}
                active={task.status === 2}
                title="Payment Released"
                sub={task.status === 3 ? `$${task.rewardAmount} USDC sent to worker` : 'Pending creator approval'}
              />
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`flex size-7 items-center justify-center rounded-full border-2 shrink-0 ${
                    task.status === 4 ? 'bg-orange-400 border-orange-400' : 
                    task.status === 5 ? 'bg-red-400 border-red-400' : 'border-border/50 bg-muted/30'
                  }`}>
                    {task.status === 4 ? <AlertCircle className="size-3.5 text-white" /> :
                     task.status === 5 ? <XCircle className="size-3.5 text-white" /> :
                     <span className="size-2 rounded-full bg-muted-foreground/30" />
                    }
                  </div>
                </div>
                <div>
                  <p className={`text-sm font-medium ${
                    task.status === 4 ? 'text-orange-400' : 
                    task.status === 5 ? 'text-red-400' : 'text-muted-foreground'
                  }`}>
                    {task.status === 5 ? 'Cancelled' : 'Refunded'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {task.status === 5 ? 'Cancelled by creator' :
                     task.status === 4 ? `$${task.rewardAmount} USDC returned to creator` : 'Only if task fails'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <SubmitProofModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        taskId={supabaseTask?.id || ''}
        onChainTaskId={task.taskId}
        onSuccess={() => refetch()}
      />

      {address && supabaseTask && (
        <ApplyModal
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
          taskId={supabaseTask.id}
          workerId={address} // Note: Modal handles ensureProfile internally or via props
          onSuccess={() => setHasApplied(true)}
        />
      )}
    </div>
  )
}
