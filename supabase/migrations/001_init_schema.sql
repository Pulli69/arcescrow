-- Initialize PayAfterProof Database Schema
-- Run this in Supabase SQL Editor

-- ============================================================
-- PROFILES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text UNIQUE NOT NULL,
  display_name text,
  avatar_url text,
  bio text,
  social_twitter text,
  social_github text,
  reputation_score integer DEFAULT 0,
  total_completed_tasks integer DEFAULT 0,
  success_rate decimal(5,2) DEFAULT 100,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_wallet ON profiles(wallet_address);

-- ============================================================
-- TASKS METADATA TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS tasks_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id integer NOT NULL,
  chain_id integer NOT NULL,
  title text NOT NULL,
  description text,
  category text,
  creator_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  worker_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  escrow_amount text NOT NULL,
  currency text DEFAULT 'USDC',
  proof_url text,
  deadline_date timestamp with time zone,
  status text DEFAULT 'open' CHECK (status IN ('open', 'proof_submitted', 'paid', 'refunded', 'disputed')),
  dispute_reason text,
  tags text[] DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT unique_task_per_chain UNIQUE(task_id, chain_id)
);

CREATE INDEX IF NOT EXISTS idx_tasks_creator ON tasks_metadata(creator_id);
CREATE INDEX IF NOT EXISTS idx_tasks_worker ON tasks_metadata(worker_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks_metadata(status);
CREATE INDEX IF NOT EXISTS idx_tasks_created ON tasks_metadata(created_at DESC);

-- ============================================================
-- REVIEWS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviewee_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  task_id uuid NOT NULL REFERENCES tasks_metadata(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reviews_reviewee ON reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_task ON reviews(task_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created ON reviews(created_at DESC);

-- ============================================================
-- COMMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES tasks_metadata(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comments_task ON comments(task_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created ON comments(created_at ASC);

-- ============================================================
-- ACTIVITY LOG TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN ('created_task', 'submitted_proof', 'approved_task', 'refunded_task', 'submitted_review', 'disputed_task', 'profile_updated')),
  task_id uuid REFERENCES tasks_metadata(id) ON DELETE SET NULL,
  metadata jsonb,
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_action ON activity_log(action);
CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_log(created_at DESC);
