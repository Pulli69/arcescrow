# Supabase Setup Guide

## Quick Start

### 1. Create Tables

1. Go to your Supabase project: https://supabase.com/dashboard/projects
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the SQL from `supabase/migrations/001_init_schema.sql`
5. Click **Run** to create all tables

OR run this command in your terminal:

```bash
# Copy the SQL and run it in Supabase SQL Editor
cat supabase/migrations/001_init_schema.sql
```

### 2. Environment Variables

Your `.env` file should already have:
```
NEXT_PUBLIC_SUPABASE_URL=https://rvinrpepfxmjvjflzuxh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_z9ot30c33n3ApBd3uLNbxg_OyAiALCr
```

### 3. Test the Connection

Start the dev server:
```bash
pnpm dev
```

The app will now use real Supabase data instead of mock data.

## Database Schema

### Tables Created

- **profiles** - User profiles with reputation data
- **tasks_metadata** - Task/contract metadata (blockchain refs)
- **reviews** - User reviews and ratings
- **comments** - Task comments
- **activity_log** - Activity audit trail

## Services & Hooks

### Available Services (in `lib/services/`)
- `profileService.ts` - Profile operations
- `taskService.ts` - Task operations
- `reviewService.ts` - Review operations
- `commentService.ts` - Comment operations
- `activityService.ts` - Activity operations

### Available Hooks (in `hooks/`)
- `useProfile()` - Fetch user profile
- `useTasks()` - Fetch tasks with filters
- `useTaskDetail()` - Fetch single task
- `useRecentActivity()` - Fetch recent activity
- `useTaskReviews()` - Fetch task reviews
- `useUserReviews()` - Fetch user reviews
- `useTaskComments()` - Fetch task comments

## Sample Data

To populate test data, run:
```bash
pnpm run seed
```

Or manually insert test data in Supabase dashboard.

## Troubleshooting

### "Missing Supabase environment variables"
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env`
- Restart the dev server after updating `.env`

### Tables not found
- Run the SQL migration in Supabase SQL Editor
- Verify tables are listed in **Tables** section of Supabase dashboard

### Data not appearing in UI
- Check browser console for errors
- Verify service layer is being called from hooks
- Check Supabase **Logs** for query errors

## Next Steps

1. ✓ Create tables
2. ✓ Update `.env`
3. Add row-level security policies (optional)
4. Seed sample data
5. Connect smart contracts to tasks
