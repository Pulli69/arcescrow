/**
 * Application Service
 * Handles worker applications for open tasks
 */

import { supabase } from '@/lib/supabase'
import { TaskApplication, ApplicationWithProfile } from '@/types/domain'
import { profileService } from './profileService'

export const applicationService = {
  /**
   * Submit an application for a task
   */
  async apply(taskId: string, workerId: string, message?: string): Promise<TaskApplication | null> {
    try {
      // Check if already applied
      const { data: existing } = await supabase
        .from('task_applications')
        .select('id')
        .eq('task_id', taskId)
        .eq('worker_id', workerId)
        .maybeSingle()

      if (existing) {
        throw new Error('You have already applied for this task')
      }

      const { data, error } = await supabase
        .from('task_applications')
        .insert({
          task_id: taskId,
          worker_id: workerId,
          message: message || '',
          status: 'pending'
        })
        .select()
        .single()

      if (error) {
        console.error('Error applying for task:', error)
        return null
      }

      return data as TaskApplication
    } catch (error: any) {
      console.error('Application error:', error)
      throw error
    }
  },

  /**
   * List all applications for a specific task
   */
  async getTaskApplications(taskId: string): Promise<ApplicationWithProfile[]> {
    try {
      const { data, error } = await supabase
        .from('task_applications')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching task applications:', error)
        return []
      }

      if (!data || data.length === 0) return []

      // Fetch profiles for workers
      const workerIds = data.map(app => app.worker_id)
      const profiles = await profileService.getProfiles(workerIds)
      const profileMap = new Map(profiles.map(p => [p.id, p]))

      return data.map(app => ({
        ...(app as TaskApplication),
        worker: profileMap.get(app.worker_id) || null
      }))
    } catch (error) {
      console.error('Fetch applications error:', error)
      return []
    }
  },

  /**
   * Get an application for a specific worker and task
   */
  async getWorkerApplication(taskId: string, workerId: string): Promise<TaskApplication | null> {
    try {
      const { data, error } = await supabase
        .from('task_applications')
        .select('*')
        .eq('task_id', taskId)
        .eq('worker_id', workerId)
        .maybeSingle()

      if (error) return null
      return data as TaskApplication
    } catch (error) {
      return null
    }
  },

  /**
   * Reject an application
   */
  async rejectApplication(applicationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('task_applications')
        .update({ status: 'rejected', updated_at: new Date().toISOString() })
        .eq('id', applicationId)

      return !error
    } catch (error) {
      console.error('Reject application error:', error)
      return false
    }
  }
}
