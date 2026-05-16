'use client'

/**
 * useActivity Hook
 * Fetch and manage activity log data
 */

import { useEffect, useState } from 'react'
import { ActivityWithProfile } from '@/types/domain'
import { activityService } from '@/lib/services/activityService'

interface UseActivityReturn {
  activities: ActivityWithProfile[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useRecentActivity(limit = 10): UseActivityReturn {
  const [activities, setActivities] = useState<ActivityWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchActivities = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await activityService.getRecentActivity(limit)
      setActivities(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch activities')
      setActivities([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActivities()
  }, [limit])

  return {
    activities,
    loading,
    error,
    refetch: fetchActivities,
  }
}

/**
 * useUserActivity Hook
 * Fetch activity for specific user
 */

export function useUserActivity(userId?: string, limit = 20): UseActivityReturn {
  const [activities, setActivities] = useState<ActivityWithProfile[]>([])
  const [loading, setLoading] = useState(!!userId)
  const [error, setError] = useState<string | null>(null)

  const fetchActivities = async () => {
    if (!userId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await activityService.getUserActivity(userId, limit)
      setActivities(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user activities')
      setActivities([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActivities()
  }, [userId, limit])

  return {
    activities,
    loading,
    error,
    refetch: fetchActivities,
  }
}
