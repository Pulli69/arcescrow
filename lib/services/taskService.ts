/**
 * Task Service
 * Handles task/contract metadata operations
 * Note: Blockchain operations (escrow, payment) are handled by smart contracts
 */

import { supabase } from '@/lib/supabase'
import { TaskMetadata, TaskWithProfile, TaskStatus } from '@/types/domain'
import { profileService } from './profileService'

export const taskService = {
  /**
   * List all tasks with filters
   */
  async listTasks(filters?: {
    status?: TaskStatus
    creatorId?: string
    workerId?: string
    limit?: number
  }): Promise<TaskWithProfile[]> {
    try {
      let query = supabase.from('tasks_metadata').select('*')

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }
      if (filters?.creatorId) {
        query = query.eq('creator_id', filters.creatorId)
      }
      if (filters?.workerId) {
        query = query.eq('worker_id', filters.workerId)
      }

      const limit = filters?.limit || 50
      const { data, error } = await query.limit(limit).order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching tasks:', error)
        return []
      }

      // Fetch profiles for creators and workers
      const profileIds = new Set<string>()
      data?.forEach((task) => {
        profileIds.add(task.creator_id)
        if (task.worker_id) profileIds.add(task.worker_id)
      })

      const profiles = await profileService.getProfiles(Array.from(profileIds))
      const profileMap = new Map(profiles.map((p) => [p.id, p]))

      return (data || []).map((task) => ({
        ...(task as TaskMetadata),
        creator: profileMap.get(task.creator_id) || null,
        worker: task.worker_id ? profileMap.get(task.worker_id) || null : null,
      }))
    } catch (error) {
      console.error('Task list error:', error)
      return []
    }
  },

  /**
   * Get single task with profile details
   */
  async getTask(taskId: string): Promise<TaskWithProfile | null> {
    try {
      const { data, error } = await supabase
        .from('tasks_metadata')
        .select('*')
        .eq('id', taskId)
        .single()

      if (error) {
        console.error('Error fetching task:', error)
        return null
      }

      const task = data as TaskMetadata
      const creator = await profileService.getProfile(task.creator_id)
      const worker = task.worker_id ? await profileService.getProfile(task.worker_id) : null

      return {
        ...task,
        creator,
        worker,
      }
    } catch (error) {
      console.error('Task fetch error:', error)
      return null
    }
  },

  /**
   * Get task by on-chain taskId
   */
  async getTaskByOnChainId(onChainTaskId: number): Promise<TaskMetadata | null> {
    try {
      const { data, error } = await supabase
        .from('tasks_metadata')
        .select('*')
        .eq('task_id', onChainTaskId)
        .maybeSingle()

      if (error) {
        console.error('Error fetching task by on-chain ID:', error)
        return null
      }

      return data as TaskMetadata
    } catch (error) {
      return null
    }
  },

  /**
   * Create task metadata (called after blockchain escrow is created)
   */
  async createTask(taskData: Omit<TaskMetadata, 'id' | 'created_at' | 'updated_at'>): Promise<TaskMetadata | null> {
    try {
      const { data, error } = await supabase
        .from('tasks_metadata')
        .insert({
          ...taskData,
          tags: taskData.tags || [],
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating task:', error)
        return null
      }

      return data as TaskMetadata
    } catch (error) {
      console.error('Task creation error:', error)
      return null
    }
  },

  /**
   * Update task status
   */
  async updateTaskStatus(taskId: string, status: TaskStatus, disputeReason?: string): Promise<TaskMetadata | null> {
    try {
      const updates: any = {
        status,
        updated_at: new Date().toISOString(),
      }

      if (disputeReason) {
        updates.dispute_reason = disputeReason
      }

      const { data, error } = await supabase
        .from('tasks_metadata')
        .update(updates)
        .eq('id', taskId)
        .select()
        .single()

      if (error) {
        console.error('Error updating task status:', error)
        return null
      }

      return data as TaskMetadata
    } catch (error) {
      console.error('Task status update error:', error)
      return null
    }
  },

  /**
   * Update proof URL
   */
  async updateProofUrl(taskId: string, proofUrl: string): Promise<TaskMetadata | null> {
    try {
      const { data, error } = await supabase
        .from('tasks_metadata')
        .update({
          proof_url: proofUrl,
          status: 'proof_submitted',
          updated_at: new Date().toISOString(),
        })
        .eq('id', taskId)
        .select()
        .single()

      if (error) {
        console.error('Error updating proof URL:', error)
        return null
      }

      return data as TaskMetadata
    } catch (error) {
      console.error('Proof URL update error:', error)
      return null
    }
  },

  /**
   * Assign worker to task
   */
  async assignWorker(taskId: string, workerId: string): Promise<TaskMetadata | null> {
    try {
      const { data, error } = await supabase
        .from('tasks_metadata')
        .update({
          worker_id: workerId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', taskId)
        .select()
        .single()

      if (error) {
        console.error('Error assigning worker:', error)
        return null
      }

      return data as TaskMetadata
    } catch (error) {
      console.error('Worker assignment error:', error)
      return null
    }
  },

  /**
   * Get tasks by creator
   */
  async getTasksByCreator(creatorId: string, limit = 20): Promise<TaskWithProfile[]> {
    return this.listTasks({ creatorId, limit })
  },

  /**
   * Get tasks by worker
   */
  async getTasksByWorker(workerId: string, limit = 20): Promise<TaskWithProfile[]> {
    return this.listTasks({ workerId, limit })
  },

  /**
   * Get task statistics
   */
  async getTaskStats(userId: string) {
    try {
      const createdTasks = await supabase
        .from('tasks_metadata')
        .select('*', { count: 'exact', head: true })
        .eq('creator_id', userId)

      const completedTasks = await supabase
        .from('tasks_metadata')
        .select('*', { count: 'exact', head: true })
        .eq('creator_id', userId)
        .eq('status', 'paid')

      return {
        created: createdTasks.count || 0,
        completed: completedTasks.count || 0,
      }
    } catch (error) {
      console.error('Error getting task stats:', error)
      return { created: 0, completed: 0 }
    }
  },
}
