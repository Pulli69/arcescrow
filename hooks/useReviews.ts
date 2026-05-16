'use client'

/**
 * useReviews Hook
 * Fetch and manage review data
 */

import { useEffect, useState } from 'react'
import { Review, ReviewWithProfile } from '@/types/domain'
import { reviewService } from '@/lib/services/reviewService'

interface UseTaskReviewsReturn {
  reviews: ReviewWithProfile[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useTaskReviews(taskId?: string): UseTaskReviewsReturn {
  const [reviews, setReviews] = useState<ReviewWithProfile[]>([])
  const [loading, setLoading] = useState(!!taskId)
  const [error, setError] = useState<string | null>(null)

  const fetchReviews = async () => {
    if (!taskId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await reviewService.getTaskReviews(taskId)
      setReviews(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reviews')
      setReviews([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [taskId])

  return {
    reviews,
    loading,
    error,
    refetch: fetchReviews,
  }
}

/**
 * useUserReviews Hook
 * Fetch reviews for a user
 */

interface UseUserReviewsReturn {
  reviews: ReviewWithProfile[]
  loading: boolean
  error: string | null
  averageRating: number
  refetch: () => Promise<void>
}

export function useUserReviews(userId?: string): UseUserReviewsReturn {
  const [reviews, setReviews] = useState<ReviewWithProfile[]>([])
  const [averageRating, setAverageRating] = useState(0)
  const [loading, setLoading] = useState(!!userId)
  const [error, setError] = useState<string | null>(null)

  const fetchReviews = async () => {
    if (!userId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const reviewsData = await reviewService.getUserReviews(userId)
      const rating = await reviewService.getUserAverageRating(userId)
      setReviews(reviewsData)
      setAverageRating(rating)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user reviews')
      setReviews([])
      setAverageRating(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [userId])

  return {
    reviews,
    loading,
    error,
    averageRating,
    refetch: fetchReviews,
  }
}

/**
 * useSubmitReview Hook
 * Handle review submission
 */

interface UseSubmitReviewReturn {
  submitting: boolean
  error: string | null
  submitReview: (taskId: string, reviewerId: string, revieweeId: string, rating: number, comment?: string) => Promise<Review | null>
}

export function useSubmitReview(): UseSubmitReviewReturn {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submitReview = async (
    taskId: string,
    reviewerId: string,
    revieweeId: string,
    rating: number,
    comment?: string,
  ): Promise<Review | null> => {
    try {
      setSubmitting(true)
      setError(null)
      const result = await reviewService.submitReview(taskId, reviewerId, revieweeId, rating, comment)
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit review'
      setError(message)
      return null
    } finally {
      setSubmitting(false)
    }
  }

  return {
    submitting,
    error,
    submitReview,
  }
}
