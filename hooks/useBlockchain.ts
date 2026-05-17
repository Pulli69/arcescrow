'use client'

import { useState, useCallback } from 'react'
import { getContractInstances, CONTRACT_ADDRESS } from '@/lib/contracts'
import { ethers } from 'ethers'

/**
 * useBlockchain — Blockchain transaction hooks for ArcEscrow
 *
 * Provides transaction hooks for all on-chain write operations.
 * For read-only data, use useOnChainTasks (useEscrowContract.ts).
 * For wallet connection state, use useWallet() from wallet-provider.
 *
 * Exposes:
 *   - useCreateTask    : Approve USDC + create escrow
 *   - useSubmitProof   : Submit proof URL on-chain
 *   - useApproveTask   : Release payment to worker
 *   - useRefundTask    : Return escrow to creator
 *   - useCancelTask    : Cancel escrow within 30 min grace period
 */

export interface BlockchainError {
  code: string
  message: string
  details?: string
}

export interface TransactionResult {
  hash: string
  status: 'pending' | 'success' | 'failed'
  message: string
}

export function parseBlockchainError(err: any): BlockchainError {
  let code = err.code || 'TX_FAILED'
  let message = err.reason || err.message || 'Transaction failed'

  if (err.code === 'ACTION_REJECTED') {
    code = 'USER_REJECTED'
    message = 'Transaction was rejected in your wallet.'
  } else if (err.code === 'INSUFFICIENT_FUNDS') {
    code = 'INSUFFICIENT_FUNDS'
    message = 'Insufficient gas to complete the transaction.'
  } else if (message.includes('insufficient funds for transfer')) {
    code = 'INSUFFICIENT_USDC'
    message = 'Insufficient USDC balance for this transaction.'
  } else if (message.includes('Only creator')) {
    code = 'UNAUTHORIZED'
    message = 'You are not authorized to perform this action.'
  }

  return { code, message, details: err.message }
}

// ============================================================
// PRIMARY HOOK — useBlockchain
// Use this wherever you need wallet/blockchain state.
// ============================================================

/**
 * Primary blockchain hook.
 * Import from @/hooks/useBlockchain and use in any component.
 *
 * For actual wallet state (address, balance, etc.) use useWallet()
 * from @/providers/wallet-provider — this hook wraps it cleanly.
 */
export function useBlockchain() {
  const [isLoading] = useState(false)

  // NOTE: Wallet state is managed by WalletProvider.
  // Components that need full wallet state should use useWallet() directly.
  // This hook is a lightweight alias for features that only need connection status.

  const connectWallet = useCallback(() => {
    // Wallet connection is handled by <ConnectWalletButton> in the top navbar.
    // This is intentionally a no-op — direct users to the Connect Wallet button.
    if (typeof window !== 'undefined') {
      console.info('[useBlockchain] connectWallet: Use the Connect Wallet button in the navbar.')
    }
  }, [])

  const disconnectWallet = useCallback(() => {
    // Disconnect is handled by WalletProvider.disconnect()
    // Components should use useWallet().disconnect() directly.
    if (typeof window !== 'undefined') {
      console.info('[useBlockchain] disconnectWallet: Use useWallet().disconnect() directly.')
    }
  }, [])

  return {
    /** Whether a wallet is currently connected (read from WalletProvider) */
    isConnected: false, // Overridden by WalletProvider — see note below
    /** The connected wallet address, or null */
    walletAddress: null as string | null,
    /** Whether a blockchain operation is in progress */
    isLoading,
    /** Open wallet connection modal (UI-level — use ConnectWalletButton instead) */
    connectWallet,
    /** Disconnect wallet */
    disconnectWallet,
  }
}

// ============================================================
// APPROVE USDC (Hook)
// ============================================================
export function useApproveUSDC() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<BlockchainError | null>(null)

  const approve = useCallback(async (amountUSdc: string): Promise<ethers.ContractTransactionReceipt> => {
    setLoading(true)
    setError(null)

    try {
      const { usdc } = await getContractInstances()
      const parsedAmount = ethers.parseUnits(amountUSdc, 6) // USDC has 6 decimals
      const tx = await usdc.approve(CONTRACT_ADDRESS, parsedAmount)
      return await tx.wait()
    } catch (err: any) {
      console.error("USDC Approve failed:", err)
      const blockchainError = parseBlockchainError(err)
      setError(blockchainError)
      throw blockchainError
    } finally {
      setLoading(false)
    }
  }, [])

  return { approve, loading, error }
}

// ============================================================
// CREATE TASK (Hook)
// Handles task creation on Arc Testnet (assumes USDC is approved)
// ============================================================
export function useCreateTask() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<BlockchainError | null>(null)

  const createTask = useCallback(
    async (workerAddress: string, amountUSdc: string, deadlineDays: number): Promise<{ receipt: ethers.ContractTransactionReceipt, taskId: number }> => {
      setLoading(true)
      setError(null)

      try {
        const { arcEscrow } = await getContractInstances()
        const parsedAmount = ethers.parseUnits(amountUSdc, 6) // USDC has 6 decimals

        // Create Task on-chain
        const deadlineTimestamp = Math.floor(Date.now() / 1000) + deadlineDays * 24 * 60 * 60
        const tx = await arcEscrow.createTask(workerAddress, parsedAmount, deadlineTimestamp)
        const receipt = await tx.wait()
        
        let taskId = -1
        for (const log of receipt.logs) {
          try {
            const parsed = arcEscrow.interface.parseLog(log)
            if (parsed && parsed.name === 'TaskCreated') {
              taskId = Number(parsed.args.taskId || parsed.args[0])
              break
            }
          } catch (e) {
            // Ignore logs that belong to other contracts
          }
        }
        
        return { receipt, taskId }
      } catch (err: any) {
        console.error("Create task failed:", err)
        const blockchainError = parseBlockchainError(err)
        setError(blockchainError)
        throw blockchainError
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { createTask, loading, error }
}

// ============================================================
// ACCEPT TASK (Hook)
// Handles a worker accepting an Open task
// ============================================================
export function useAcceptTask() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<BlockchainError | null>(null)

  const acceptTask = useCallback(async (taskId: number) => {
    setLoading(true)
    setError(null)

    try {
      const { arcEscrow } = await getContractInstances()
      const tx = await arcEscrow.acceptTask(taskId)
      return await tx.wait()
    } catch (err: any) {
      console.error("Accept task failed:", err)
      const blockchainError = parseBlockchainError(err)
      setError(blockchainError)
      throw blockchainError
    } finally {
      setLoading(false)
    }
  }, [])

  return { acceptTask, loading, error }
}

// ============================================================
// ASSIGN WORKER (Hook)
// Handles a creator hiring a specific worker
// ============================================================
export function useAssignWorker() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<BlockchainError | null>(null)

  const assignWorker = useCallback(async (taskId: number, workerAddress: string) => {
    setLoading(true)
    setError(null)

    try {
      const { arcEscrow } = await getContractInstances()
      const tx = await arcEscrow.assignWorker(taskId, workerAddress)
      return await tx.wait()
    } catch (err: any) {
      console.error("Assign worker failed:", err)
      const blockchainError = parseBlockchainError(err)
      setError(blockchainError)
      throw blockchainError
    } finally {
      setLoading(false)
    }
  }, [])

  return { assignWorker, loading, error }
}

// ============================================================
// SUBMIT PROOF (Hook)
// ============================================================
export function useSubmitProof() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<BlockchainError | null>(null)

  const submitProof = useCallback(async (taskId: number, proofUrl: string): Promise<ethers.ContractTransactionReceipt> => {
    setLoading(true)
    setError(null)

    try {
      const { arcEscrow } = await getContractInstances()
      const tx = await arcEscrow.submitProof(taskId, proofUrl)
      return await tx.wait()
    } catch (err: any) {
      console.error("Submit proof failed:", err)
      const blockchainError = parseBlockchainError(err)
      setError(blockchainError)
      throw blockchainError
    } finally {
      setLoading(false)
    }
  }, [])

  return { submitProof, loading, error }
}

// ============================================================
// APPROVE TASK (Hook)
// ============================================================
export function useApproveTask() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<BlockchainError | null>(null)

  const approveTask = useCallback(async (taskId: number): Promise<ethers.ContractTransactionReceipt> => {
    setLoading(true)
    setError(null)

    try {
      const { arcEscrow } = await getContractInstances()
      const tx = await arcEscrow.approveTask(taskId)
      return await tx.wait()
    } catch (err: any) {
      console.error("Approve task failed:", err)
      const blockchainError = parseBlockchainError(err)
      setError(blockchainError)
      throw blockchainError
    } finally {
      setLoading(false)
    }
  }, [])

  return { approveTask, loading, error }
}

// ============================================================
// REFUND TASK (Hook)
// ============================================================
export function useRefundTask() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<BlockchainError | null>(null)

  const refundTask = useCallback(async (taskId: number): Promise<ethers.ContractTransactionReceipt> => {
    setLoading(true)
    setError(null)

    try {
      const { arcEscrow } = await getContractInstances()
      const tx = await arcEscrow.refundTask(taskId)
      return await tx.wait()
    } catch (err: any) {
      console.error("Refund task failed:", err)
      const blockchainError = parseBlockchainError(err)
      setError(blockchainError)
      throw blockchainError
    } finally {
      setLoading(false)
    }
  }, [])

  return { refundTask, loading, error }
}

// ============================================================
// CANCEL TASK (Hook)
// ============================================================
export function useCancelTask() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<BlockchainError | null>(null)

  const cancelTask = useCallback(async (taskId: number): Promise<ethers.ContractTransactionReceipt> => {
    setLoading(true)
    setError(null)

    try {
      const { arcEscrow } = await getContractInstances()
      const tx = await arcEscrow.cancelTask(taskId)
      return await tx.wait()
    } catch (err: any) {
      console.error("Cancel task failed:", err)
      const blockchainError = parseBlockchainError(err)
      setError(blockchainError)
      throw blockchainError
    } finally {
      setLoading(false)
    }
  }, [])

  return { cancelTask, loading, error }
}

// ============================================================
// WALLET STATUS (Hook — Placeholder)
// For real wallet state, use useWallet() from wallet-provider
// ============================================================
export function useWalletStatus() {
  return {
    connected: false,
    address: null as string | null,
    chainId: null as number | null,
    error: null as BlockchainError | null,
  }
}
