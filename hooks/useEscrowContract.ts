'use client'

/**
 * useEscrowContract — Live on-chain hook
 * Reads all tasks directly from the deployed ArcEscrow contract on Arc Testnet.
 * Uses a public read-only RPC provider so data loads even without a connected wallet.
 */

import { useEffect, useState, useCallback } from 'react'
import { ethers } from 'ethers'
import { ARC_ESCROW_ABI } from '@/lib/contracts'

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!
const RPC_URL = 'https://rpc.testnet.arc.network'

// Status numeric → string map matching the smart contract enum
const STATUS_MAP: Record<number, string> = {
  0: 'open',
  1: 'accepted',
  2: 'proof_submitted',
  3: 'paid',
  4: 'refunded',
  5: 'cancelled',
}

export interface OnChainTask {
  taskId: number
  creator: string
  worker: string
  rewardAmount: string        // human-readable USDC (6 decimals)
  rewardAmountRaw: bigint
  proofLink: string
  status: number
  statusLabel: string
  deadline: number            // unix timestamp
  createdAt: number           // unix timestamp
  txHash?: string
}

export interface EscrowStats {
  totalTasks: number
  activeTasks: number         // open
  inProgressTasks: number     // accepted
  proofPendingTasks: number   // proof_submitted
  paidTasks: number
  refundedTasks: number
  cancelledTasks: number
  totalLockedUsdc: string     // human-readable
  totalPaidUsdc: string       // human-readable
}

// Singleton read-only provider — shared across all hook instances
let _readProvider: ethers.JsonRpcProvider | null = null
function getReadProvider() {
  if (!_readProvider) {
    _readProvider = new ethers.JsonRpcProvider(RPC_URL)
  }
  return _readProvider
}

function getReadContract() {
  return new ethers.Contract(CONTRACT_ADDRESS, ARC_ESCROW_ABI, getReadProvider())
}

// ─────────────────────────────────────────────────────────────
// Hook: fetch all on-chain tasks
// ─────────────────────────────────────────────────────────────
export function useOnChainTasks() {
  const [tasks, setTasks] = useState<OnChainTask[]>([])
  const [stats, setStats] = useState<EscrowStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const contract = getReadContract()
      const totalBig: bigint = await contract.getTotalTasks()
      const total = Number(totalBig)

      if (total === 0) {
        setTasks([])
        setStats({
          totalTasks: 0,
          activeTasks: 0,
          inProgressTasks: 0,
          proofPendingTasks: 0,
          paidTasks: 0,
          refundedTasks: 0,
          cancelledTasks: 0,
          totalLockedUsdc: '0',
          totalPaidUsdc: '0',
        })
        return
      }

      // Fetch all tasks in parallel (task IDs are 0-indexed on the contract)
      const fetches = Array.from({ length: total }, (_, i) =>
        contract.getTask(i).catch(() => null)
      )
      const rawTasks = await Promise.all(fetches)

      let lockedUsdc = BigInt(0)
      let paidUsdc = BigInt(0)
      const parsed: OnChainTask[] = []

      rawTasks.forEach((raw, i) => {
        if (!raw) return
        const taskId = i
        const status = Number(raw.status)
        const reward: bigint = raw.rewardAmount
        
        // 0: open, 1: accepted, 2: proof_submitted
        if (status <= 2) lockedUsdc += reward
        if (status === 3) paidUsdc += reward                    // paid

        parsed.push({
          taskId,
          creator: raw.creator,
          worker: raw.worker,
          rewardAmount: formatUsdc(reward),
          rewardAmountRaw: reward,
          proofLink: raw.proofLink,
          status,
          statusLabel: STATUS_MAP[status] ?? 'unknown',
          deadline: Number(raw.deadline),
          createdAt: Number(raw.createdAt),
        })
      })

      // Sort newest first
      parsed.sort((a, b) => b.createdAt - a.createdAt)

      const activeTasks = parsed.filter(t => t.status === 0).length
      const inProgressTasks = parsed.filter(t => t.status === 1).length
      const proofPendingTasks = parsed.filter(t => t.status === 2).length
      const paidTasks = parsed.filter(t => t.status === 3).length
      const refundedTasks = parsed.filter(t => t.status === 4).length
      const cancelledTasks = parsed.filter(t => t.status === 5).length

      setTasks(parsed)
      setStats({
        totalTasks: total,
        activeTasks,
        inProgressTasks,
        proofPendingTasks,
        paidTasks,
        refundedTasks,
        cancelledTasks,
        totalLockedUsdc: formatUsdc(lockedUsdc),
        totalPaidUsdc: formatUsdc(paidUsdc),
      })
    } catch (err: any) {
      console.error('Failed to fetch on-chain tasks:', err)
      setError(err?.message || 'Failed to read from Arc Testnet')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
    // Poll every 15 seconds for live updates
    const interval = setInterval(fetchAll, 15_000)
    return () => clearInterval(interval)
  }, [fetchAll])

  return { tasks, stats, loading, error, refetch: fetchAll }
}

// ─────────────────────────────────────────────────────────────
// Hook: fetch single on-chain task by on-chain taskId
// ─────────────────────────────────────────────────────────────
export function useOnChainTask(taskId?: number) {
  const [task, setTask] = useState<OnChainTask | null>(null)
  const [loading, setLoading] = useState(taskId !== undefined)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    if (taskId === undefined) return
    try {
      setLoading(true)
      const contract = getReadContract()
      const raw = await contract.getTask(taskId)
      setTask({
        taskId,
        creator: raw.creator,
        worker: raw.worker,
        rewardAmount: formatUsdc(raw.rewardAmount),
        rewardAmountRaw: raw.rewardAmount,
        proofLink: raw.proofLink,
        status: Number(raw.status),
        statusLabel: STATUS_MAP[Number(raw.status)] ?? 'unknown',
        deadline: Number(raw.deadline),
        createdAt: Number(raw.createdAt),
      })
    } catch (err: any) {
      setError(err?.message || 'Failed to read task')
    } finally {
      setLoading(false)
    }
  }, [taskId])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { task, loading, error, refetch: fetch }
}

// ─────────────────────────────────────────────────────────────
// Utility
// ─────────────────────────────────────────────────────────────
function formatUsdc(raw: bigint): string {
  // USDC has 6 decimals
  const n = Number(raw) / 1_000_000
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export { formatUsdc }
