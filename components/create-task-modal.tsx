'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useCreateTask } from '@/hooks/useBlockchain'
import { taskService } from '@/lib/services/taskService'
import { profileService } from '@/lib/services/profileService'
import { useWallet } from '@/providers/wallet-provider'
import { useTransactionFeedback } from '@/hooks/useTransactionFeedback'
import { Loader2 } from 'lucide-react'
import { ethers } from 'ethers'

interface CreateTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function CreateTaskModal({ isOpen, onClose, onSuccess }: CreateTaskModalProps) {
  const router = useRouter()
  const { address } = useWallet()
  const { createTask } = useCreateTask()
  const { showPendingToast, showSuccessToast, showErrorToast } = useTransactionFeedback()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    workerAddress: '',
    amountUSdc: '',
    deadlineDays: '7',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!address) {
      showErrorToast('Wallet not connected', new Error('Please connect your wallet first'))
      return
    }

    let finalWorkerAddress = formData.workerAddress.trim()
    if (finalWorkerAddress === '') {
      finalWorkerAddress = ethers.ZeroAddress
    } else if (!ethers.isAddress(finalWorkerAddress)) {
      showErrorToast('Invalid Address', new Error('Please enter a valid Ethereum wallet address for the worker.'))
      return
    }

    const amount = parseFloat(formData.amountUSdc)
    if (isNaN(amount) || amount <= 0) {
      showErrorToast('Invalid Amount', new Error('Please enter a valid USDC amount greater than 0.'))
      return
    }

    const deadline = parseInt(formData.deadlineDays)
    if (isNaN(deadline) || deadline <= 0) {
      showErrorToast('Invalid Deadline', new Error('Deadline must be at least 1 day.'))
      return
    }

    try {
      setIsSubmitting(true)
      const pendingToast = showPendingToast()

      // 1. Blockchain Transaction (Approve USDC + Create Task)
      const { receipt, taskId } = await createTask(
        finalWorkerAddress,
        formData.amountUSdc,
        parseInt(formData.deadlineDays)
      )

      if (taskId === -1) {
        throw new Error('Failed to parse Task ID from blockchain events')
      }

      // 2. Map wallet addresses to Supabase Profile UUIDs
      const creatorProfile = await profileService.ensureProfile(address)
      let workerProfileId = null
      if (finalWorkerAddress !== ethers.ZeroAddress) {
        const workerProfile = await profileService.ensureProfile(finalWorkerAddress)
        workerProfileId = workerProfile.id
      }

      // 3. Sync with Supabase
      const metadata = await taskService.createTask({
        task_id: taskId,
        chain_id: 5042002, // Arc Testnet
        title: formData.title,
        description: formData.description,
        category: 'General',
        creator_id: creatorProfile.id,
        worker_id: workerProfileId,
        escrow_amount: formData.amountUSdc,
        currency: 'USDC',
        proof_url: null,
        dispute_reason: null,
        deadline_date: new Date(Date.now() + parseInt(formData.deadlineDays) * 24 * 60 * 60 * 1000).toISOString(),
        status: 'open',
        tags: [],
      })

      // We actually need to assign the worker by wallet address. 
      // Supabase tasks_metadata requires creator_id and worker_id as UUIDs matching profiles.
      // We will handle profile matching in the backend/taskService in a more robust app.
      
      pendingToast.dismiss()
      showSuccessToast('Task Created Successfully!', receipt.hash)
      
      onSuccess?.()
      onClose()
      
      // Navigate to task details
      if (metadata?.id) {
        router.push(`/contracts/${metadata.id}`)
      } else {
        router.push('/contracts') // fallback
      }

    } catch (error: any) {
      console.error(error)
      showErrorToast('Failed to create task', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isSubmitting && onClose()}>
      <DialogContent className="sm:max-w-[500px] glass-card border-border/50">
        <DialogHeader>
          <DialogTitle>Create New Contract</DialogTitle>
          <DialogDescription>
            Fund an escrow contract on the Arc Testnet. Leave worker address blank for an "Open Escrow" anyone can join.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              required
              placeholder="e.g., Audit Smart Contract"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="bg-card/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Provide clear requirements..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-card/50 resize-none h-24"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="workerAddress">Worker Wallet Address</Label>
              <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase font-medium">Optional</span>
            </div>
            <Input
              id="workerAddress"
              placeholder="0x... (Leave blank for Open Marketplace)"
              value={formData.workerAddress}
              onChange={(e) => setFormData({ ...formData, workerAddress: e.target.value })}
              className="bg-card/50 font-mono text-sm"
            />
            <p className="text-[10px] text-muted-foreground mt-1 px-1">
              If empty, any worker can accept this task once published.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Reward Amount (USDC)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.1"
                required
                placeholder="100.00"
                value={formData.amountUSdc}
                onChange={(e) => setFormData({ ...formData, amountUSdc: e.target.value })}
                className="bg-card/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline (Days)</Label>
              <Input
                id="deadline"
                type="number"
                min="1"
                required
                placeholder="7"
                value={formData.deadlineDays}
                onChange={(e) => setFormData({ ...formData, deadlineDays: e.target.value })}
                className="bg-card/50"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
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
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Confirming
                </>
              ) : (
                'Create & Fund'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
