'use client'

import { useState, useEffect, useCallback } from 'react'
import { Users, User, CheckCircle2, XCircle, Loader2, MessageSquare } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { applicationService } from '@/lib/services/applicationService'
import { ApplicationWithProfile } from '@/types/domain'
import { useAssignWorker } from '@/hooks/useBlockchain'
import { useTransactionFeedback } from '@/hooks/useTransactionFeedback'
import { taskService } from '@/lib/services/taskService'

interface TaskApplicantsProps {
  taskId: string
  onChainTaskId: number
  isCreator: boolean
  status: number
  onSuccess?: () => void
}

export function TaskApplicants({ taskId, onChainTaskId, isCreator, status, onSuccess }: TaskApplicantsProps) {
  const [applicants, setApplicants] = useState<ApplicationWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const { assignWorker, loading: isHiring } = useAssignWorker()
  const { showPendingToast, showSuccessToast, showErrorToast } = useTransactionFeedback()

  const fetchApplicants = useCallback(async () => {
    try {
      setLoading(true)
      const data = await applicationService.getTaskApplications(taskId)
      setApplicants(data.filter(app => app.status !== 'rejected'))
    } catch (err) {
      console.error('Failed to fetch applicants:', err)
    } finally {
      setLoading(false)
    }
  }, [taskId])

  useEffect(() => {
    fetchApplicants()
  }, [fetchApplicants])

  const handleHire = async (app: ApplicationWithProfile) => {
    if (!app.worker?.wallet_address) return

    try {
      const pendingToast = showPendingToast()
      const receipt = await assignWorker(onChainTaskId, app.worker.wallet_address)
      
      // Sync status to Supabase
      await taskService.updateTaskStatus(taskId, 'accepted')
      await taskService.assignWorker(taskId, app.worker.id)
      
      pendingToast.dismiss()
      showSuccessToast('Worker Hired Successfully!', receipt.hash)
      
      onSuccess?.()
      fetchApplicants()
    } catch (err: any) {
      showErrorToast('Failed to hire worker', err)
    }
  }

  const handleReject = async (appId: string) => {
    try {
      await applicationService.rejectApplication(appId)
      fetchApplicants()
    } catch (err) {
      console.error('Failed to reject applicant:', err)
    }
  }

  if (status !== 0 && applicants.length === 0) return null

  return (
    <Card className="glass-card border-border/50">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Users className="size-4 text-primary" />
          Task Applicants
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : applicants.length === 0 ? (
          <div className="text-center py-8">
            <User className="size-10 text-muted-foreground/20 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No applicants yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applicants.map((app) => (
              <div key={app.id} className="p-4 rounded-xl border border-border/30 bg-secondary/20 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {app.worker?.display_name?.[0] || 'W'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{app.worker?.display_name || 'Anonymous Worker'}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {app.worker?.wallet_address?.slice(0, 6)}...{app.worker?.wallet_address?.slice(-4)}
                      </p>
                    </div>
                  </div>
                  {isCreator && status === 0 && (
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleReject(app.id)}
                        disabled={isHiring}
                        className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                      >
                        Reject
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => handleHire(app)}
                        disabled={isHiring}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white"
                      >
                        {isHiring ? <Loader2 className="size-3 animate-spin mr-1.5" /> : <CheckCircle2 className="size-3 mr-1.5" />}
                        Hire Worker
                      </Button>
                    </div>
                  )}
                </div>
                
                {app.message && (
                  <div className="flex gap-2 p-2.5 rounded-lg bg-background/40 border border-border/20 text-xs text-muted-foreground italic">
                    <MessageSquare className="size-3 shrink-0 mt-0.5" />
                    <p>{app.message}</p>
                  </div>
                )}

                <div className="flex items-center gap-4 text-[10px] text-muted-foreground/60">
                  <span>Success Rate: {app.worker?.success_rate}%</span>
                  <span>Tasks: {app.worker?.total_completed_tasks}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
