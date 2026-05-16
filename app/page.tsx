import { WalletStatusCard } from '@/components/wallet-status-card'
import { StatsCards } from '@/components/stats-cards'
import { RecentActivity } from '@/components/recent-activity'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Manage your escrow contracts and track proof submissions
        </p>
      </div>

      {/* Stats Overview */}
      <StatsCards />

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Wallet Card */}
        <div className="lg:col-span-1">
          <WalletStatusCard />
        </div>
        
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
      </div>
    </div>
  )
}
