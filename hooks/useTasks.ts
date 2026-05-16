'use client'

/**
 * useTasks Hook
 * Fetch and manage task data
 */

import { useEffect, useState } from 'react'
import { TaskWithProfile, TaskStatus } from '@/types/domain'
import { taskService } from '@/lib/services/taskService'

interface TaskFilters {
  status?: TaskStatus
  creatorId?: string
  workerId?: string
  limit?: number
}

interface UseTasksReturn {
  tasks: TaskWithProfile[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useTasks(filters?: TaskFilters): UseTasksReturn {
  const [tasks, setTasks] = useState<TaskWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await taskService.listTasks(filters)
      setTasks(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks')
      setTasks([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [filters?.status, filters?.creatorId, filters?.workerId, filters?.limit])

  return {
    tasks,
    loading,
    error,
    refetch: fetchTasks,
  }
}

/**
 * useTaskDetail Hook
 * Fetch single task details
 */

interface UseTaskDetailReturn {
  task: TaskWithProfile | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useTaskDetail(taskId?: string): UseTaskDetailReturn {
  const [task, setTask] = useState<TaskWithProfile | null>(null)
  const [loading, setLoading] = useState(!!taskId)
  const [error, setError] = useState<string | null>(null)

  const fetchTask = async () => {
    if (!taskId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await taskService.getTask(taskId)
      setTask(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch task')
      setTask(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTask()
  }, [taskId])

  return {
    task,
    loading,
    error,
    refetch: fetchTask,
  }
}

/**
 * useTaskStats Hook
 * Get task statistics for a user
 */

interface TaskStats {
  created: number
  completed: number
}

interface UseTaskStatsReturn {
  stats: TaskStats | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useTaskStats(userId?: string): UseTaskStatsReturn {
  const [stats, setStats] = useState<TaskStats | null>(null)
  const [loading, setLoading] = useState(!!userId)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    if (!userId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await taskService.getTaskStats(userId)
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch task stats')
      setStats(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [userId])

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  }
}
