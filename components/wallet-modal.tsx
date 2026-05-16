'use client'

import { useState } from 'react'
import { Loader2, X, ShieldCheck, Zap } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useWallet, WalletType } from '@/providers/wallet-provider'

interface WalletModalProps {
    open: boolean
    onClose: () => void
}

const WALLETS: {
    id: WalletType
    name: string
    description: string
    icon: string
    color: string
}[] = [
        {
            id: 'metamask',
            name: 'MetaMask',
            description: 'The most popular Web3 wallet',
            icon: '🦊',
            color: 'from-orange-500/20 to-amber-500/10 border-orange-500/30 hover:border-orange-400/60',
        },
        {
            id: 'rabby',
            name: 'Rabby Wallet',
            description: 'Security-first wallet for DeFi',
            icon: '🐰',
            color: 'from-purple-500/20 to-violet-500/10 border-purple-500/30 hover:border-purple-400/60',
        },
    ]

export function WalletModal({ open, onClose }: WalletModalProps) {
    const { connect, isConnecting } = useWallet()
    const [connectingId, setConnectingId] = useState<WalletType | null>(null)
    const [error, setError] = useState<string | null>(null)

    const handleConnect = async (type: WalletType) => {
        setError(null)
        setConnectingId(type)
        try {
            await connect(type)
            onClose()
        } catch (err: any) {
            setError(err?.message ?? 'Failed to connect wallet')
        } finally {
            setConnectingId(null)
        }
    }

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-md glass border-glass-border">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg">
                        <ShieldCheck className="size-5 text-primary" />
                        Connect Wallet
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground text-sm">
                        Choose a wallet to connect to Arc Testnet
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-3 py-2">
                    {WALLETS.map((wallet) => (
                        <button
                            key={wallet.id}
                            disabled={isConnecting}
                            onClick={() => handleConnect(wallet.id)}
                            className={`
                flex items-center gap-4 w-full rounded-xl p-4 border
                bg-gradient-to-r ${wallet.color}
                transition-all duration-200 cursor-pointer
                disabled:opacity-50 disabled:cursor-not-allowed
                group
              `}
                        >
                            <span className="text-3xl select-none">{wallet.icon}</span>
                            <div className="flex-1 text-left">
                                <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                    {wallet.name}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">{wallet.description}</p>
                            </div>
                            {connectingId === wallet.id ? (
                                <Loader2 className="size-4 text-primary animate-spin shrink-0" />
                            ) : (
                                <Zap className="size-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                            )}
                        </button>
                    ))}
                </div>

                {error && (
                    <div className="flex items-start gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2.5 text-sm text-destructive">
                        <X className="size-4 mt-0.5 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <p className="text-center text-xs text-muted-foreground pt-1">
                    By connecting, you agree to the Terms of Service
                </p>
            </DialogContent>
        </Dialog>
    )
}
