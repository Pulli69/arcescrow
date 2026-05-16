'use client'

/**
 * useProfile Hook
 * Fetch and manage user profile data
 */

import { useEffect, useState } from 'react'
import { UserProfile } from '@/types/domain'
import { profileService } from '@/lib/services/profileService'

interface UseProfileReturn {
  profile: UserProfile | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useProfile(walletAddress?: string): UseProfileReturn {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = async () => {
    if (!walletAddress) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await profileService.getProfile(walletAddress)
      setProfile(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile')
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [walletAddress])

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
  }
}

/**
 * useUpdateProfile Hook
 * Handle profile updates
 */

interface UseUpdateProfileReturn {
  updating: boolean
  error: string | null
  updateProfile: (id: string, updates: Partial<Omit<UserProfile, 'id' | 'created_at'>>) => Promise<UserProfile | null>
}

export function useUpdateProfile(): UseUpdateProfileReturn {
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateProfile = async (
    id: string,
    updates: Partial<Omit<UserProfile, 'id' | 'created_at'>>,
  ): Promise<UserProfile | null> => {
    try {
      setUpdating(true)
      setError(null)
      const result = await profileService.updateProfile(id, updates)
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update profile'
      setError(message)
      return null
    } finally {
      setUpdating(false)
    }
  }

  return {
    updating,
    error,
    updateProfile,
  }
}
