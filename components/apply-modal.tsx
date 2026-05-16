'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { applicationService } from '@/lib/services/applicationService'
import { profileService } from '@/lib/services/profileService'
import { Loader2, Send, Info } from 'lucide-react'
import { toast } from 'sonner'

interface ApplyModalProps {
  isOpen: boolean
  onClose: () => void
  taskId: string
  workerId: string
  onSuccess?: () => void
}

export function ApplyModal({ isOpen, onClose, taskId, workerId, onSuccess }: ApplyModalProps) {
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!workerId) return

    try {
      setIsSubmitting(true)
      
      // Resolve wallet address to Profile ID
      const profile = await profileService.ensureProfile(workerId)
      if (!profile) throw new Error('Could not resolve user profile')

      await applicationService.apply(taskId, profile.id, message)
      
      toast.success('Application submitted!')
      onSuccess?.()
      onClose()
      setMessage('')
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit application')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isSubmitting && onClose()}>
      <DialogContent className="sm:max-w-[425px] glass-card border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="size-4 text-primary" />
            Apply for Task
          </DialogTitle>
          <DialogDescription>
            Tell the creator why you're the best fit for this task.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5 text-xs text-primary mt-2">
          <Info className="size-3.5 shrink-0 mt-0.5" />
          <span>Your application is off-chain. If hired, the creator will assign you on-chain.</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="message">Message to Creator</Label>
            <Textarea
              id="message"
              required
              placeholder="Explain your experience and how you'll handle this task..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="bg-card/50 min-h-[120px]"
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
              disabled={isSubmitting || !message}
              className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Sending
                </>
              ) : (
                'Submit Application'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
