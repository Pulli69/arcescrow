/**
 * Supabase Database Types
 * Auto-generated from Supabase database schema
 */

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          wallet_address: string
          display_name: string | null
          avatar_url: string | null
          bio: string | null
          social_twitter: string | null
          social_github: string | null
          reputation_score: number
          total_completed_tasks: number
          success_rate: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wallet_address: string
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          social_twitter?: string | null
          social_github?: string | null
          reputation_score?: number
          total_completed_tasks?: number
          success_rate?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          wallet_address?: string
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          social_twitter?: string | null
          social_github?: string | null
          reputation_score?: number
          total_completed_tasks?: number
          success_rate?: number
          created_at?: string
          updated_at?: string
        }
      }
      tasks_metadata: {
        Row: {
          id: string
          task_id: number
          chain_id: number
          title: string
          description: string | null
          category: string | null
          creator_id: string
          worker_id: string | null
          escrow_amount: string
          currency: string
          proof_url: string | null
          deadline_date: string
          status: 'open' | 'accepted' | 'proof_submitted' | 'paid' | 'refunded' | 'cancelled' | 'disputed'
          dispute_reason: string | null
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          task_id: number
          chain_id: number
          title: string
          description?: string | null
          category?: string | null
          creator_id: string
          worker_id?: string | null
          escrow_amount: string
          currency: string
          proof_url?: string | null
          deadline_date: string
          status?: 'open' | 'accepted' | 'proof_submitted' | 'paid' | 'refunded' | 'cancelled' | 'disputed'
          dispute_reason?: string | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          task_id?: number
          chain_id?: number
          title?: string
          description?: string | null
          category?: string | null
          creator_id?: string
          worker_id?: string | null
          escrow_amount?: string
          currency?: string
          proof_url?: string | null
          deadline_date?: string
          status?: 'open' | 'accepted' | 'proof_submitted' | 'paid' | 'refunded' | 'cancelled' | 'disputed'
          dispute_reason?: string | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          reviewer_id: string
          reviewee_id: string
          task_id: string
          rating: number
          comment: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          reviewer_id: string
          reviewee_id: string
          task_id: string
          rating: number
          comment?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          reviewer_id?: string
          reviewee_id?: string
          task_id?: string
          rating?: number
          comment?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          task_id: string
          user_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          task_id: string
          user_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          user_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      activity_log: {
        Row: {
          id: string
          user_id: string
          action:
            | 'created_task'
            | 'submitted_proof'
            | 'approved_task'
            | 'refunded_task'
            | 'submitted_review'
            | 'disputed_task'
            | 'profile_updated'
          task_id: string | null
          metadata: Record<string, any> | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          action:
            | 'created_task'
            | 'submitted_proof'
            | 'approved_task'
            | 'refunded_task'
            | 'submitted_review'
            | 'disputed_task'
            | 'profile_updated'
          task_id?: string | null
          metadata?: Record<string, any> | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          action?:
            | 'created_task'
            | 'submitted_proof'
            | 'approved_task'
            | 'refunded_task'
            | 'submitted_review'
            | 'disputed_task'
            | 'profile_updated'
          task_id?: string | null
          metadata?: Record<string, any> | null
          created_at?: string
        }
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}
