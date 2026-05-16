/**
 * Domain Types
 * Business logic types separate from database schema for flexibility
 */

// ==================== User/Profile ====================

export interface UserProfile {
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

// ==================== Task ====================

export type TaskStatus = 'open' | 'accepted' | 'proof_submitted' | 'paid' | 'refunded' | 'cancelled' | 'disputed'

export interface TaskMetadata {
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
  status: TaskStatus
  dispute_reason: string | null
  tags: string[]
  created_at: string
  updated_at: string
}

export interface TaskWithProfile extends TaskMetadata {
  creator: UserProfile | null
  worker: UserProfile | null
}

// ==================== Review ====================

export interface Review {
  id: string
  reviewer_id: string
  reviewee_id: string
  task_id: string
  rating: number
  comment: string | null
  created_at: string
  updated_at: string
}

export interface ReviewWithProfile extends Review {
  reviewer: UserProfile | null
}

// ==================== Comment ====================

export interface Comment {
  id: string
  task_id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
}

export interface CommentWithProfile extends Comment {
  user: UserProfile | null
}

// ==================== Activity ====================

export type ActivityAction = 
  | 'created_task'
  | 'submitted_proof'
  | 'approved_task'
  | 'refunded_task'
  | 'submitted_review'
  | 'disputed_task'
  | 'profile_updated'

export interface ActivityLog {
  id: string
  user_id: string
  action: ActivityAction
  task_id: string | null
  metadata: Record<string, any> | null
  created_at: string
}

export interface ActivityWithProfile extends ActivityLog {
  user: UserProfile | null
}

// ==================== Application ====================

export type ApplicationStatus = 'pending' | 'accepted' | 'rejected'

export interface TaskApplication {
  id: string
  task_id: string
  worker_id: string
  message: string | null
  status: ApplicationStatus
  created_at: string
  updated_at: string
}

export interface ApplicationWithProfile extends TaskApplication {
  worker: UserProfile | null
}

// ==================== Stats ====================

export interface TaskStats {
  activeCount: number
  completedCount: number
  pendingProofCount: number
  totalEscrowed: string
  successRate: number
}

export interface UserStats {
  created_tasks_count: number
  completed_tasks_count: number
  average_rating: number
  reputation_score: number
}

