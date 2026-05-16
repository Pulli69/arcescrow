/**
 * Activity Service
 * Handles activity log operations
 */

import { supabase } from '@/lib/supabase'
import { ActivityLog, ActivityWithProfile, ActivityAction } from '@/types/domain'
import { profileService } from './profileService'

export const activityService = {
  /**
   * Log an activity
   */
  async logActivity(
    userId: string,
    action: ActivityAction,
    taskId?: string,
    metadata?: Record<string, any>,
  ): Promise<ActivityLog | null> {
    try {
      const { data, error } = await supabase
        .from('activity_log')
        .insert({
          user_id: userId,
          action,
          task_id: taskId || null,
          metadata: metadata || null,
        })
        .select()
        .single()

      if (error) {
        console.error('Error logging activity:', error)
        return null
      }

      return data as ActivityLog
    } catch (error) {
      console.error('Activity log error:', error)
      return null
    }
  },

  /**
   * Get recent activities
   */
  async getRecentActivity(limit = 10): Promise<ActivityWithProfile[]> {
    try {
      const { data, error } = await supabase
        .from('activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error fetching activities:', error)
        return []
      }

      // Fetch user profiles
      const userIds = [...new Set((data || []).map((a) => a.user_id))]
      const profiles = await profileService.getProfiles(userIds)
      const profileMap = new Map(profiles.map((p) => [p.id, p]))

      return (data || []).map((activity) => ({
        ...(activity as ActivityLog),
        user: profileMap.get(activity.user_id) || null,
      }))
    } catch (error) {
      console.error('Recent activity error:', error)
      return []
    }
  },

  /**
   * Get user activity
   */
  async getUserActivity(userId: string, limit = 20): Promise<ActivityWithProfile[]> {
    try {
      const { data, error } = await supabase
        .from('activity_log')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error fetching user activity:', error)
        return []
      }

      const user = await profileService.getProfile(userId)

      return (data || []).map((activity) => ({
        ...(activity as ActivityLog),
        user,
      }))
    } catch (error) {
      console.error('User activity error:', error)
      return []
    }
  },

  /**
   * Get activities by action type
   */
  async getActivitiesByAction(action: ActivityAction, limit = 20): Promise<ActivityWithProfile[]> {
    try {
      const { data, error } = await supabase
        .from('activity_log')
        .select('*')
        .eq('action', action)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error fetching activities by action:', error)
        return []
      }

      // Fetch user profiles
      const userIds = [...new Set((data || []).map((a) => a.user_id))]
      const profiles = await profileService.getProfiles(userIds)
      const profileMap = new Map(profiles.map((p) => [p.id, p]))

      return (data || []).map((activity) => ({
        ...(activity as ActivityLog),
        user: profileMap.get(activity.user_id) || null,
      }))
    } catch (error) {
      console.error('Activities by action error:', error)
      return []
    }
  },
}
