# Supabase Integration Guide

## Architecture Overview

```
Data Flow:
Supabase DB ← Services (lib/services/) ← Hooks (hooks/) ← Components (components/)
```

### Component Stack

1. **Services** (`lib/services/`) - Direct Supabase database queries
   - profileService.ts
   - taskService.ts
   - reviewService.ts
   - commentService.ts
   - activityService.ts

2. **Hooks** (`hooks/`) - React data fetching with state management
   - useProfile() / useUpdateProfile()
   - useTasks() / useTaskDetail() / useTaskStats()
   - useRecentActivity() / useUserActivity()
   - useTaskReviews() / useUserReviews() / useSubmitReview()
   - useTaskComments() / useAddComment()

3. **Components** (`components/`) - UI components
   - stats-cards.tsx (uses useTasks)
   - recent-activity.tsx (uses useRecentActivity)
   - wallet-status-card.tsx (uses wallet context)
   - Other shadcn/ui components

## Component Updates

### Updated Components

1. **StatsCards** - Now uses `useTasks()` to fetch real task data
   - Active contracts count
   - Total escrow amount
   - Completion rate
   - Pending proofs

2. **RecentActivity** - Now uses `useRecentActivity()` for activity feed
   - Shows last 10 activities
   - Includes user profiles
   - Proper timestamps with date-fns

3. **ContractsPage** - Now uses `useTasks()` with search/filtering
   - Searchable task list
   - Real data from Supabase
   - Empty state handling
   - Loading skeletons

## Setup Steps

### Step 1: Initialize Database (Required)

Go to **Supabase Dashboard** → **SQL Editor**:

1. Create a new query
2. Copy the SQL from `supabase/migrations/001_init_schema.sql`
3. Click **Run**

This creates all 5 tables with proper indexes and constraints.

### Step 2: Add Sample Data (Optional)

In your terminal:
```bash
# Make sure .env has Supabase credentials
pnpm seed
```

This creates 3 test profiles and sample tasks, reviews, comments, and activities.

### Step 3: Start Development Server

```bash
pnpm dev
```

Navigate to `http://localhost:3000` and you'll see real data from Supabase!

## Usage Examples

### Fetch Tasks
```typescript
'use client'

import { useTasks } from '@/hooks/useTasks'

export function TaskList() {
  // Fetch all open tasks
  const { tasks, loading, error, refetch } = useTasks({
    status: 'open',
    limit: 20
  })

  if (loading) return <Skeleton />
  if (error) return <div>Error: {error}</div>
  if (tasks.length === 0) return <div>No tasks</div>

  return (
    <ul>
      {tasks.map(task => (
        <li key={task.id}>
          <h3>{task.title}</h3>
          <p>{task.creator?.display_name}</p>
          <p>${task.escrow_amount}</p>
        </li>
      ))}
    </ul>
  )
}
```

### Fetch User Profile
```typescript
import { useProfile, useUpdateProfile } from '@/hooks/useProfile'

export function ProfileCard() {
  const { profile, loading } = useProfile('0xabcd....')
  const { updating, updateProfile } = useUpdateProfile()

  if (loading) return <div>Loading...</div>

  const handleUpdateName = async (newName: string) => {
    const updated = await updateProfile(profile!.id, {
      display_name: newName
    })
    if (updated) console.log('Profile updated!')
  }

  return (
    <div>
      <h2>{profile?.display_name}</h2>
      <button onClick={() => handleUpdateName('New Name')}>
        {updating ? 'Updating...' : 'Update'}
      </button>
    </div>
  )
}
```

### Submit Review
```typescript
import { useSubmitReview, useTaskReviews } from '@/hooks/useReviews'

export function ReviewSection({ taskId, revieweeId }) {
  const { reviews, loading } = useTaskReviews(taskId)
  const { submitReview, submitting } = useSubmitReview()

  const handleSubmit = async (rating: number, comment: string) => {
    const result = await submitReview(
      taskId,
      'current-user-id',
      revieweeId,
      rating,
      comment
    )
    if (result) console.log('Review submitted!')
  }

  return (
    <div>
      <div className="reviews">
        {reviews.map(review => (
          <div key={review.id}>
            <p>{review.reviewer?.display_name}</p>
            <p>Rating: {review.rating}/5</p>
            <p>{review.comment}</p>
          </div>
        ))}
      </div>
      <form onSubmit={(e) => {
        e.preventDefault()
        const rating = parseInt((e.target as any).rating.value)
        const comment = (e.target as any).comment.value
        handleSubmit(rating, comment)
      }}>
        <input type="number" name="rating" min="1" max="5" required />
        <textarea name="comment"></textarea>
        <button disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  )
}
```

### Add Comment
```typescript
import { useTaskComments, useAddComment } from '@/hooks/useComments'

export function Comments({ taskId }) {
  const { comments, loading, refetch } = useTaskComments(taskId)
  const { addComment, adding } = useAddComment()

  const handleAddComment = async (content: string) => {
    const result = await addComment(taskId, 'user-id', content)
    if (result) {
      await refetch()
    }
  }

  return (
    <div>
      {comments.map(comment => (
        <div key={comment.id}>
          <p>{comment.user?.display_name}</p>
          <p>{comment.content}</p>
        </div>
      ))}
      <form onSubmit={(e) => {
        e.preventDefault()
        const content = (e.target as any).comment.value
        handleAddComment(content)
        ;(e.target as any).reset()
      }}>
        <textarea name="comment" required></textarea>
        <button disabled={adding}>
          {adding ? 'Adding...' : 'Add Comment'}
        </button>
      </form>
    </div>
  )
}
```

## Service Layer

All services are in `lib/services/` and provide direct database access.

### profileService
```typescript
// Get profile by wallet address
const profile = await profileService.getProfile('0xabcd...')

// Create or get profile
const profile = await profileService.ensureProfile('0xabcd...')

// Update profile
await profileService.updateProfile(id, { display_name: 'New Name' })

// Get multiple profiles
const profiles = await profileService.getProfiles([id1, id2, id3])
```

### taskService
```typescript
// List tasks with filters
const tasks = await taskService.listTasks({ status: 'open', limit: 50 })

// Get single task with profiles
const task = await taskService.getTask(taskId)

// Create task (called after blockchain escrow created)
await taskService.createTask({ task_id: 1, chain_id: 5042002, ... })

// Update task status
await taskService.updateTaskStatus(taskId, 'proof_submitted')

// Update proof URL
await taskService.updateProofUrl(taskId, 'https://proof-url')

// Assign worker
await taskService.assignWorker(taskId, workerId)

// Get tasks by creator/worker
const tasks = await taskService.getTasksByCreator(creatorId)
const tasks = await taskService.getTasksByWorker(workerId)
```

### reviewService
```typescript
// Submit review
await reviewService.submitReview(taskId, reviewerId, revieweeId, 5, 'Comment')

// Get reviews for task
const reviews = await reviewService.getTaskReviews(taskId)

// Get reviews for user
const reviews = await reviewService.getUserReviews(userId)

// Get average rating
const avgRating = await reviewService.getUserAverageRating(userId)
```

### activityService
```typescript
// Log activity
await activityService.logActivity(userId, 'created_task', taskId, metadata)

// Get recent activities
const activities = await activityService.getRecentActivity(limit)

// Get user activities
const activities = await activityService.getUserActivity(userId, limit)

// Get activities by action type
const activities = await activityService.getActivitiesByAction('created_task', limit)
```

### commentService
```typescript
// Add comment
await commentService.addComment(taskId, userId, 'Comment text')

// Get comments for task
const comments = await commentService.getTaskComments(taskId)

// Update comment
await commentService.updateComment(commentId, 'Updated text')

// Delete comment
await commentService.deleteComment(commentId)
```

## Database Tables

### profiles
User account information
- id: uuid
- wallet_address: text (unique)
- display_name: text
- avatar_url: text
- bio: text
- social_twitter: text
- social_github: text
- reputation_score: integer
- total_completed_tasks: integer
- success_rate: decimal

### tasks_metadata
Task metadata (blockchain refs stored separately)
- id: uuid
- task_id: integer (blockchain ID)
- chain_id: integer (5042002 for Arc testnet)
- title: text
- description: text
- category: text
- creator_id: uuid (FK to profiles)
- worker_id: uuid (FK to profiles)
- escrow_amount: text
- currency: text
- proof_url: text
- deadline_date: timestamp
- status: text (open|proof_submitted|paid|refunded|disputed)
- tags: text[]

### reviews
User reviews and ratings
- id: uuid
- reviewer_id: uuid (FK to profiles)
- reviewee_id: uuid (FK to profiles)
- task_id: uuid (FK to tasks_metadata)
- rating: integer (1-5)
- comment: text

### comments
Task comments/discussions
- id: uuid
- task_id: uuid (FK to tasks_metadata)
- user_id: uuid (FK to profiles)
- content: text

### activity_log
Audit trail of user actions
- id: uuid
- user_id: uuid (FK to profiles)
- action: text (created_task|submitted_proof|etc)
- task_id: uuid (FK to tasks_metadata)
- metadata: jsonb
- created_at: timestamp

## Best Practices

1. **Always use hooks in components**, not direct service calls
2. **Always mark components with 'use client'** if using hooks
3. **Handle loading states** - use Skeleton components
4. **Handle empty states** - show helpful messages
5. **Handle error states** - display error messages to users
6. **Use TypeScript** - all services return typed domain models
7. **Don't call services directly in components** - use hooks for proper state management
8. **Refetch data after mutations** - call the refetch function after updates

## Error Handling

All hooks follow this pattern:
```typescript
const {
  data,        // The fetched data (null if error)
  loading,     // true while fetching
  error,       // null if successful, error message if failed
  refetch      // Function to manually refresh
} = useHook()

if (error) {
  return <ErrorBoundary error={error} />
}
```

## Real-time Subscriptions

To add real-time updates (coming soon):
```typescript
// Listen for changes to tasks
const unsubscribe = supabase
  .from('tasks_metadata')
  .on('*', payload => {
    console.log('Task changed:', payload)
    refetch() // Refresh your data
  })
  .subscribe()

// Clean up subscription on unmount
useEffect(() => {
  return () => unsubscribe()
}, [])
```

## Testing

Test with sample data:
```bash
# 1. Initialize tables
# Go to Supabase SQL Editor and run 001_init_schema.sql

# 2. Seed sample data
pnpm seed

# 3. Start dev server
pnpm dev

# 4. Visit http://localhost:3000 to see real data!
```

## Troubleshooting

**No data appears**
- Verify tables exist in Supabase dashboard
- Run seed script: `pnpm seed`
- Check browser console for errors
- Check Supabase Logs

**Components don't update**
- Ensure component has `'use client'` directive
- Check hook dependencies in useEffect
- Verify refetch is called after mutations

**Slow performance**
- Add database indexes
- Reduce limit parameter
- Implement pagination

## Next Steps

1. ✓ Supabase setup complete
2. ✓ Components using real data
3. Next: Connect smart contracts
   - Create hooks/useBlockchain.ts
   - Call taskService after escrow creation
   - Update task status after proof submission
4. Next: Implement missing pages (Analytics, Escrow, Settings)
5. Next: Add real-time subscriptions
