'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSubmitProof } from '@/hooks/useBlockchain'
import { useTransactionFeedback } from '@/hooks/useTransactionFeedback'
import { taskService } from '@/lib/services/taskService'
import { Loader2, FileText, Info } from 'lucide-react'

interface SubmitProofModalProps {
  isOpen: boolean
  onClose: () => void
  /** On-chain task ID (integer) */
  taskId: string | number
  onChainTaskId: number
  onSuccess?: () => void
}

export function SubmitProofModal({ isOpen, onClose, taskId, onChainTaskId, onSuccess }: SubmitProofModalProps) {
  const { submitProof } = useSubmitProof()
  const { showPendingToast, showSuccessToast, showErrorToast } = useTransactionFeedback()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [proofUrl, setProofUrl] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setIsSubmitting(true)
      const pendingToast = showPendingToast()

      // 1. Blockchain Tx — proof URL is stored permanently on-chain
      const receipt = await submitProof(onChainTaskId, proofUrl)

      // 2. Sync to Supabase
      if (taskId) {
        try {
          await taskService.updateProofUrl(String(taskId), proofUrl)
        } catch (err) {
          console.error("Failed to sync proof to Supabase:", err)
        }
      }

      pendingToast.dismiss()
      showSuccessToast('Proof Submitted On-Chain!', receipt.hash)
      
      onSuccess?.()
      onClose()
      setProofUrl('')

    } catch (error: any) {
      console.error(error)
      showErrorToast('Failed to submit proof', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isSubmitting && onClose()}>
      <DialogContent className="sm:max-w-[425px] glass-card border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="size-4 text-primary" />
            Submit Proof of Work
          </DialogTitle>
          <DialogDescription>
            Provide a link to your completed work (GitHub PR, Figma, Google Doc, etc).
            This URL is permanently recorded on the Arc Testnet in Task #{onChainTaskId}.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-start gap-2 rounded-lg border border-blue-500/20 bg-blue-500/5 px-3 py-2.5 text-xs text-blue-400 mt-2">
          <Info className="size-3.5 shrink-0 mt-0.5" />
          <span>Once submitted, the creator must approve your proof to release USDC payment.</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="proofUrl">Proof URL</Label>
            <Input
              id="proofUrl"
              type="url"
              required
              placeholder="https://github.com/your/pr"
              value={proofUrl}
              onChange={(e) => setProofUrl(e.target.value)}
              className="bg-card/50"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !proofUrl}
              className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Submitting
                </>
              ) : (
                'Submit On-Chain'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
