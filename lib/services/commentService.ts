/**
 * Comment Service
 * Handles task comment operations
 */

import { supabase } from '@/lib/supabase'
import { Comment, CommentWithProfile } from '@/types/domain'
import { profileService } from './profileService'

export const commentService = {
  /**
   * Add a comment to a task
   */
  async addComment(taskId: string, userId: string, content: string): Promise<Comment | null> {
    try {
      if (!content.trim()) {
        throw new Error('Comment cannot be empty')
      }

      const { data, error } = await supabase
        .from('comments')
        .insert({
          task_id: taskId,
          user_id: userId,
          content,
        })
        .select()
        .single()

      if (error) {
        console.error('Error adding comment:', error)
        return null
      }

      return data as Comment
    } catch (error) {
      console.error('Comment addition error:', error)
      return null
    }
  },

  /**
   * Get comments for a task
   */
  async getTaskComments(taskId: string): Promise<CommentWithProfile[]> {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching task comments:', error)
        return []
      }

      // Fetch user profiles
      const userIds = [...new Set((data || []).map((c) => c.user_id))]
      const profiles = await profileService.getProfiles(userIds)
      const profileMap = new Map(profiles.map((p) => [p.id, p]))

      return (data || []).map((comment) => ({
        ...(comment as Comment),
        user: profileMap.get(comment.user_id) || null,
      }))
    } catch (error) {
      console.error('Task comments error:', error)
      return []
    }
  },

  /**
   * Delete a comment
   */
  async deleteComment(commentId: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('comments').delete().eq('id', commentId)

      if (error) {
        console.error('Error deleting comment:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Comment deletion error:', error)
      return false
    }
  },

  /**
   * Update a comment
   */
  async updateComment(commentId: string, content: string): Promise<Comment | null> {
    try {
      if (!content.trim()) {
        throw new Error('Comment cannot be empty')
      }

      const { data, error } = await supabase
        .from('comments')
        .update({
          content,
          updated_at: new Date().toISOString(),
        })
        .eq('id', commentId)
        .select()
        .single()

      if (error) {
        console.error('Error updating comment:', error)
        return null
      }

      return data as Comment
    } catch (error) {
      console.error('Comment update error:', error)
      return null
    }
  },
}
