/**
 * Profile Service
 * Handles user profile operations
 */

import { supabase } from '@/lib/supabase'
import { UserProfile } from '@/types/domain'

export const profileService = {
  /**
   * Get user profile by wallet address
   */
  async getProfile(walletAddress: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        return null
      }

      return data as UserProfile
    } catch (error) {
      console.error('Profile fetch error:', error)
      return null
    }
  },

  /**
   * Create or get profile
   */
  async ensureProfile(walletAddress: string): Promise<UserProfile> {
    const existing = await this.getProfile(walletAddress)
    if (existing) return existing

    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          wallet_address: walletAddress,
          display_name: null,
          reputation_score: 0,
          total_completed_tasks: 0,
          success_rate: 100,
        })
        .select()
        .single()

      if (error) throw error
      return data as UserProfile
    } catch (error) {
      console.error('Profile creation error:', error)
      throw error
    }
  },

  /**
   * Update user profile
   */
  async updateProfile(
    id: string,
    updates: Partial<Omit<UserProfile, 'id' | 'created_at'>>,
  ): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating profile:', error)
        return null
      }

      return data as UserProfile
    } catch (error) {
      console.error('Profile update error:', error)
      return null
    }
  },

  /**
   * Get multiple profiles
   */
  async getProfiles(ids: string[]): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('id', ids)

      if (error) {
        console.error('Error fetching profiles:', error)
        return []
      }

      return (data || []) as UserProfile[]
    } catch (error) {
      console.error('Profiles fetch error:', error)
      return []
    }
  },
}
