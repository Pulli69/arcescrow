'use client'

/**
 * useComments Hook
 * Fetch and manage comment data
 */

import { useEffect, useState } from 'react'
import { Comment, CommentWithProfile } from '@/types/domain'
import { commentService } from '@/lib/services/commentService'

interface UseTaskCommentsReturn {
  comments: CommentWithProfile[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useTaskComments(taskId?: string): UseTaskCommentsReturn {
  const [comments, setComments] = useState<CommentWithProfile[]>([])
  const [loading, setLoading] = useState(!!taskId)
  const [error, setError] = useState<string | null>(null)

  const fetchComments = async () => {
    if (!taskId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await commentService.getTaskComments(taskId)
      setComments(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch comments')
      setComments([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchComments()
  }, [taskId])

  return {
    comments,
    loading,
    error,
    refetch: fetchComments,
  }
}

/**
 * useAddComment Hook
 * Handle comment submission
 */

interface UseAddCommentReturn {
  adding: boolean
  error: string | null
  addComment: (taskId: string, userId: string, content: string) => Promise<Comment | null>
}

export function useAddComment(): UseAddCommentReturn {
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addComment = async (taskId: string, userId: string, content: string): Promise<Comment | null> => {
    try {
      setAdding(true)
      setError(null)
      const result = await commentService.addComment(taskId, userId, content)
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add comment'
      setError(message)
      return null
    } finally {
      setAdding(false)
    }
  }

  return {
    adding,
    error,
    addComment,
  }
}
