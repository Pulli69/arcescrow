'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useCreateTask, useApproveUSDC } from '@/hooks/useBlockchain'
import { taskService } from '@/lib/services/taskService'
import { profileService } from '@/lib/services/profileService'
import { useWallet } from '@/providers/wallet-provider'
import { useTransactionFeedback } from '@/hooks/useTransactionFeedback'
import { Loader2, AlertCircle } from 'lucide-react'
import { ethers } from 'ethers'
import { getContractInstances, CONTRACT_ADDRESS } from '@/lib/contracts'

interface CreateTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function CreateTaskModal({ isOpen, onClose, onSuccess }: CreateTaskModalProps) {
  const router = useRouter()
  const { address } = useWallet()
  const { createTask } = useCreateTask()
  const { approve } = useApproveUSDC()
  const { showPendingToast, showSuccessToast, showErrorToast } = useTransactionFeedback()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [allowance, setAllowance] = useState<string>('0')
  const [checkingAllowance, setCheckingAllowance] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    workerAddress: '',
    amountUSdc: '',
    deadlineDays: '7',
  })

  const fetchAllowance = useCallback(async () => {
    if (!address || !isOpen) return
    try {
      setCheckingAllowance(true)
      const { usdc } = await getContractInstances()
      const rawAllowance = await usdc.allowance(address, CONTRACT_ADDRESS)
      const decimals = await usdc.decimals()
      const formatted = ethers.formatUnits(rawAllowance, decimals)
      setAllowance(formatted)
    } catch (err) {
      console.error("Error fetching allowance:", err)
    } finally {
      setCheckingAllowance(false)
    }
  }, [address, isOpen])

  useEffect(() => {
    if (isOpen && address) {
      fetchAllowance()
    }
  }, [isOpen, address, fetchAllowance])

  const needsApproval = parseFloat(formData.amountUSdc || '0') > parseFloat(allowance)

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

    // Step 1: Approve USDC if needed
    if (needsApproval) {
      try {
        setIsSubmitting(true)
        const pendingToast = showPendingToast()
        
        await approve(formData.amountUSdc)
        
        pendingToast.dismiss()
        showSuccessToast('USDC Approved Successfully!', '')
        await fetchAllowance()
      } catch (error: any) {
        console.error(error)
        showErrorToast('Failed to approve USDC', error)
      } finally {
        setIsSubmitting(false)
      }
      return
    }

    // Step 2: Create Task on-chain & Sync
    try {
      setIsSubmitting(true)
      const pendingToast = showPendingToast()

      // Blockchain Transaction (Create Task)
      const { receipt, taskId } = await createTask(
        finalWorkerAddress,
        formData.amountUSdc,
        parseInt(formData.deadlineDays)
      )

      if (taskId === -1) {
        throw new Error('Failed to parse Task ID from blockchain events')
      }

      // Map wallet addresses to Supabase Profile UUIDs
      const creatorProfile = await profileService.ensureProfile(address)
      let workerProfileId = null
      if (finalWorkerAddress !== ethers.ZeroAddress) {
        const workerProfile = await profileService.ensureProfile(finalWorkerAddress)
        workerProfileId = workerProfile.id
      }

      // Sync with Supabase
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

          {/* Status step explanation for multi-step approval on mobile */}
          {needsApproval && formData.amountUSdc && parseFloat(formData.amountUSdc) > 0 && (
            <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3 text-xs text-blue-300 space-y-1">
              <p className="font-semibold flex items-center gap-1.5 text-blue-400">
                <AlertCircle className="size-3.5 shrink-0" />
                Step 1: Approve USDC Token Allowance
              </p>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Before creating the escrow, you must authorize the smart contract to interact with your USDC. Please click **Approve USDC** first, then click **Create & Fund** once the allowance updates.
              </p>
            </div>
          )}

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
              disabled={isSubmitting || checkingAllowance}
              className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Confirming
                </>
              ) : needsApproval ? (
                'Approve USDC'
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
