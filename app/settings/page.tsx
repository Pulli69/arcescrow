'use client'

import { useState, useEffect } from 'react'
import { Settings, User, Bell, Shield, Key, AlertCircle, Loader2, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useWallet } from '@/providers/wallet-provider'
import { useProfile, useUpdateProfile } from '@/hooks/useProfile'
import { useToast } from '@/components/ui/use-toast'

export default function SettingsPage() {
  const { address } = useWallet()
  const { profile, loading: loadingProfile, refetch } = useProfile(address || undefined)
  const { updateProfile, updating } = useUpdateProfile()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    display_name: '',
    bio: '',
  })

  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || '',
        bio: profile.bio || '',
      })
    }
  }, [profile])

  const handleSave = async () => {
    if (!profile?.id) return
    const updated = await updateProfile(profile.id, formData)
    if (updated) {
      toast({ title: 'Success', description: 'Profile updated successfully.' })
      refetch()
    } else {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update profile.' })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account and preferences</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <nav className="space-y-1 lg:col-span-1">
          {[
            { icon: User, label: 'Profile', active: true },
            { icon: Bell, label: 'Notifications', disabled: true },
            { icon: Shield, label: 'Security', disabled: true },
            { icon: Key, label: 'API Keys', disabled: true },
          ].map((item) => (
            <button
              key={item.label}
              disabled={item.disabled}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                item.active
                  ? 'bg-primary/10 text-primary'
                  : item.disabled
                  ? 'text-muted-foreground/50 cursor-not-allowed'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              }`}
            >
              <item.icon className="size-4" />
              <div className="flex items-center gap-2">
                {item.label}
                {item.disabled && <span className="text-xs text-muted-foreground/70">(Coming)</span>}
              </div>
            </button>
          ))}
        </nav>

        <div className="lg:col-span-3 space-y-6">
          {/* Profile Section */}
          <Card className="glass border-glass-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <User className="size-5" />
                </div>
                <div>
                  <h2 className="font-semibold">Profile Information</h2>
                  <p className="text-sm text-muted-foreground">These fields are managed by blockchain wallet</p>
                </div>
              </div>

              <Alert className="mb-6 border-amber-500/20 bg-amber-500/10">
                <AlertCircle className="size-4 text-amber-500" />
                <AlertDescription className="text-amber-500/90 text-sm">
                  Profile data is synced from your wallet connection and stored in Supabase. Display name and bio can be edited below.
                </AlertDescription>
              </Alert>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Wallet Address</label>
                  <Input
                    disabled
                    value={address || 'Connect wallet to see address'}
                    className="bg-card/50 border-border/50 text-muted-foreground font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Reputation Score</label>
                  <Input
                    disabled
                    value={profile ? profile.reputation_score : 'No reputation yet'}
                    className="bg-card/50 border-border/50 text-muted-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Display Name</label>
                  <Input
                    placeholder="Enter display name"
                    value={formData.display_name}
                    onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                    className="bg-card/50 border-border/50 focus:border-primary/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Bio</label>
                  <Input
                    placeholder="Tell us about yourself"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="bg-card/50 border-border/50 focus:border-primary/50"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={() => refetch()} disabled={updating}>
                  Reset
                </Button>
                <Button onClick={handleSave} disabled={updating || !profile} className="bg-primary hover:bg-primary/90">
                  {updating ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Wallet Section */}
          <Card className="glass border-glass-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex size-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Wallet className="size-5" />
                </div>
                <div>
                  <h2 className="font-semibold">Connected Wallets</h2>
                  <p className="text-sm text-muted-foreground">Connect your crypto wallet to use ArcEscrow</p>
                </div>
              </div>

              <Alert className="border-blue-500/20 bg-blue-500/10">
                <Shield className="size-4 text-blue-400" />
                <AlertDescription className="text-blue-400/90 text-sm">
                  Smart contract integration is live. Connect your wallet to manage your reputation and contracts on Arc Testnet.
                </AlertDescription>
              </Alert>

              <div className="mt-6 pt-6 border-t border-border/30">
                <p className="text-sm text-muted-foreground mb-4">Supported Networks:</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border/30">
                    <div className="size-2 rounded-full bg-emerald-400" />
                    <div>
                      <p className="text-sm font-medium">Arc Testnet</p>
                      <p className="text-xs text-muted-foreground">Chain ID: 5042002</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Coming Soon Features */}
          <Card className="glass border-glass-border">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="mt-1 size-2 rounded-full bg-muted-foreground/30" />
                  <div>
                    <h3 className="font-medium text-sm">Notifications</h3>
                    <p className="text-xs text-muted-foreground">Email alerts for contract updates</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 size-2 rounded-full bg-muted-foreground/30" />
                  <div>
                    <h3 className="font-medium text-sm">Security Settings</h3>
                    <p className="text-xs text-muted-foreground">Two-factor authentication and recovery</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 size-2 rounded-full bg-muted-foreground/30" />
                  <div>
                    <h3 className="font-medium text-sm">API Keys</h3>
                    <p className="text-xs text-muted-foreground">For programmatic access to your account</p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4">These features will be available soon.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
