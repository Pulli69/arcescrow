/**
 * Database Seed Script
 * Populate Supabase with sample test data
 * 
 * Run this via: node scripts/seed.js
 */

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function seed() {
  console.log('🌱 Seeding database...')

  try {
    // Create test profiles
    console.log('Creating profiles...')
    const profilesData = [
      {
        wallet_address: '0x1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a',
        display_name: 'Alice Developer',
        avatar_url: null,
        bio: 'Smart contract developer',
        social_twitter: '@alice_dev',
        social_github: 'alice-dev',
        reputation_score: 95,
        total_completed_tasks: 42,
        success_rate: 98.5,
      },
      {
        wallet_address: '0x2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b2b',
        display_name: 'Bob Designer',
        avatar_url: null,
        bio: 'UI/UX designer',
        social_twitter: '@bob_design',
        social_github: 'bob-designer',
        reputation_score: 88,
        total_completed_tasks: 28,
        success_rate: 96.0,
      },
      {
        wallet_address: '0x3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c',
        display_name: 'Charlie Tester',
        avatar_url: null,
        bio: 'QA engineer',
        social_twitter: null,
        social_github: 'charlie-qa',
        reputation_score: 75,
        total_completed_tasks: 15,
        success_rate: 93.3,
      },
    ]

    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .insert(profilesData)
      .select()

    if (profilesError) throw profilesError
    console.log(`✓ Created ${profiles.length} profiles`)

    // Create test tasks
    console.log('Creating tasks...')
    const tasksData = [
      {
        task_id: 1,
        chain_id: 5042002,
        title: 'Build NFT Marketplace Frontend',
        description: 'Create React components for browsing and buying NFTs',
        category: 'Development',
        creator_id: profiles[0].id,
        worker_id: profiles[1].id,
        escrow_amount: '5000000',
        currency: 'USDC',
        proof_url: 'https://github.com/alice-dev/nft-market',
        deadline_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'proof_submitted',
        tags: ['react', 'nft', 'web3'],
      },
      {
        task_id: 2,
        chain_id: 5042002,
        title: 'Smart Contract Security Audit',
        description: 'Audit PayAfterProof smart contracts',
        category: 'Auditing',
        creator_id: profiles[1].id,
        worker_id: null,
        escrow_amount: '10000000',
        currency: 'USDC',
        proof_url: null,
        deadline_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'open',
        tags: ['solidity', 'security', 'audit'],
      },
      {
        task_id: 3,
        chain_id: 5042002,
        title: 'UI Design System',
        description: 'Design complete design system with components',
        category: 'Design',
        creator_id: profiles[2].id,
        worker_id: profiles[0].id,
        escrow_amount: '3000000',
        currency: 'USDC',
        proof_url: 'https://figma.com/design-system-v1',
        deadline_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'paid',
        tags: ['design', 'ui', 'figma'],
      },
    ]

    const { data: tasks, error: tasksError } = await supabase
      .from('tasks_metadata')
      .insert(tasksData)
      .select()

    if (tasksError) throw tasksError
    console.log(`✓ Created ${tasks.length} tasks`)

    // Create test reviews
    console.log('Creating reviews...')
    const reviewsData = [
      {
        reviewer_id: profiles[0].id,
        reviewee_id: profiles[1].id,
        task_id: tasks[0].id,
        rating: 5,
        comment: 'Excellent work! Very detailed implementation.',
      },
      {
        reviewer_id: profiles[2].id,
        reviewee_id: profiles[0].id,
        task_id: tasks[2].id,
        rating: 4,
        comment: 'Great design system. Minor improvements needed.',
      },
    ]

    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .insert(reviewsData)
      .select()

    if (reviewsError) throw reviewsError
    console.log(`✓ Created ${reviews.length} reviews`)

    // Create test comments
    console.log('Creating comments...')
    const commentsData = [
      {
        task_id: tasks[0].id,
        user_id: profiles[1].id,
        content: 'Started working on the implementation. Should be ready by EOW.',
      },
      {
        task_id: tasks[0].id,
        user_id: profiles[0].id,
        content: 'Great! Looking forward to seeing it. Let me know if you need anything.',
      },
    ]

    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .insert(commentsData)
      .select()

    if (commentsError) throw commentsError
    console.log(`✓ Created ${comments.length} comments`)

    // Create test activity log
    console.log('Creating activity log...')
    const activitiesData = [
      {
        user_id: profiles[0].id,
        action: 'created_task',
        task_id: tasks[0].id,
        metadata: { title: tasks[0].title },
      },
      {
        user_id: profiles[1].id,
        action: 'submitted_proof',
        task_id: tasks[0].id,
        metadata: { proof_url: tasks[0].proof_url },
      },
      {
        user_id: profiles[2].id,
        action: 'submitted_review',
        task_id: tasks[2].id,
        metadata: { rating: 4 },
      },
    ]

    const { data: activities, error: activitiesError } = await supabase
      .from('activity_log')
      .insert(activitiesData)
      .select()

    if (activitiesError) throw activitiesError
    console.log(`✓ Created ${activities.length} activities`)

    console.log('\n✨ Database seeding complete!')
    console.log('\nTest wallet addresses:')
    profiles.forEach((p) => {
      console.log(`  - ${p.wallet_address}: ${p.display_name}`)
    })

    process.exit(0)
  } catch (error) {
    console.error('❌ Seeding error:', error.message)
    process.exit(1)
  }
}

seed()
