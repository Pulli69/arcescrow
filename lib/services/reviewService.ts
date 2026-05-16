/**
 * Review Service
 * Handles review and rating operations
 */

import { supabase } from '@/lib/supabase'
import { Review, ReviewWithProfile } from '@/types/domain'
import { profileService } from './profileService'

export const reviewService = {
  /**
   * Submit a review
   */
  async submitReview(
    taskId: string,
    reviewerId: string,
    revieweeId: string,
    rating: number,
    comment?: string,
  ): Promise<Review | null> {
    try {
      // Validate rating
      if (rating < 1 || rating > 5) {
        throw new Error('Rating must be between 1 and 5')
      }

      const { data, error } = await supabase
        .from('reviews')
        .insert({
          task_id: taskId,
          reviewer_id: reviewerId,
          reviewee_id: revieweeId,
          rating,
          comment: comment || null,
        })
        .select()
        .single()

      if (error) {
        console.error('Error submitting review:', error)
        return null
      }

      return data as Review
    } catch (error) {
      console.error('Review submission error:', error)
      return null
    }
  },

  /**
   * Get reviews for a task
   */
  async getTaskReviews(taskId: string): Promise<ReviewWithProfile[]> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching task reviews:', error)
        return []
      }

      // Fetch reviewer profiles
      const reviewerIds = [...new Set((data || []).map((r) => r.reviewer_id))]
      const profiles = await profileService.getProfiles(reviewerIds)
      const profileMap = new Map(profiles.map((p) => [p.id, p]))

      return (data || []).map((review) => ({
        ...(review as Review),
        reviewer: profileMap.get(review.reviewer_id) || null,
      }))
    } catch (error) {
      console.error('Task reviews error:', error)
      return []
    }
  },

  /**
   * Get reviews for a user (as reviewee)
   */
  async getUserReviews(userId: string): Promise<ReviewWithProfile[]> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('reviewee_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching user reviews:', error)
        return []
      }

      // Fetch reviewer profiles
      const reviewerIds = [...new Set((data || []).map((r) => r.reviewer_id))]
      const profiles = await profileService.getProfiles(reviewerIds)
      const profileMap = new Map(profiles.map((p) => [p.id, p]))

      return (data || []).map((review) => ({
        ...(review as Review),
        reviewer: profileMap.get(review.reviewer_id) || null,
      }))
    } catch (error) {
      console.error('User reviews error:', error)
      return []
    }
  },

  /**
   * Get average rating for a user
   */
  async getUserAverageRating(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('rating')
        .eq('reviewee_id', userId)

      if (error) {
        console.error('Error fetching user rating:', error)
        return 0
      }

      if (!data || data.length === 0) return 0

      const sum = data.reduce((acc, r) => acc + r.rating, 0)
      return Math.round((sum / data.length) * 10) / 10
    } catch (error) {
      console.error('User rating error:', error)
      return 0
    }
  },
}
