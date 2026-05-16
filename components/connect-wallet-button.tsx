'use client'

import { useState } from 'react'
import {
    Wallet,
    ChevronDown,
    LogOut,
    AlertTriangle,
    Copy,
    ExternalLink,
    Check,
    Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { WalletModal } from '@/components/wallet-modal'
import { useWallet } from '@/providers/wallet-provider'

function shortAddress(addr: string) {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

function getAvatarSeed(addr: string) {
    return `https://api.dicebear.com/7.x/shapes/svg?seed=${addr}`
}

export function ConnectWalletButton() {
    const { address, balance, isConnected, isConnecting, isOnArcTestnet, walletType, disconnect, switchToArcTestnet } =
        useWallet()
    const [modalOpen, setModalOpen] = useState(false)
    const [copied, setCopied] = useState(false)
    const [switching, setSwitching] = useState(false)

    const handleCopy = () => {
        if (!address) return
        navigator.clipboard.writeText(address)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
    }

    const handleSwitchNetwork = async () => {
        setSwitching(true)
        try {
            await switchToArcTestnet()
        } catch {
            // ignore user rejection
        } finally {
            setSwitching(false)
        }
    }

    // Not connected yet
    if (!isConnected) {
        return (
            <>
                <Button
                    onClick={() => setModalOpen(true)}
                    disabled={isConnecting}
                    size="sm"
                    className="gap-2 bg-primary/90 hover:bg-primary text-primary-foreground font-medium shadow-lg shadow-primary/25 transition-all duration-200"
                >
                    {isConnecting ? (
                        <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                        <Wallet className="size-3.5" />
                    )}
                    <span className="hidden sm:inline">Connect Wallet</span>
                    <span className="sm:hidden">Connect</span>
                </Button>
                <WalletModal open={modalOpen} onClose={() => setModalOpen(false)} />
            </>
        )
    }

    // Wrong network banner
    if (!isOnArcTestnet) {
        return (
            <Button
                onClick={handleSwitchNetwork}
                disabled={switching}
                size="sm"
                variant="outline"
                className="gap-2 border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 hover:border-amber-400/60 font-medium transition-all duration-200"
            >
                {switching ? (
                    <Loader2 className="size-3.5 animate-spin" />
                ) : (
                    <AlertTriangle className="size-3.5" />
                )}
                <span className="hidden sm:inline">Switch to Arc Testnet</span>
                <span className="sm:hidden">Wrong Network</span>
            </Button>
        )
    }

    // Connected + correct network
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2 px-2 hover:bg-secondary/50 transition-all duration-200"
                >
                    <Avatar className="size-6 ring-2 ring-primary/30">
                        <AvatarFallback className="bg-primary/20 text-primary text-[10px] font-bold">
                            {walletType === 'metamask' ? '🦊' : '🐰'}
                        </AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:flex items-center gap-1.5">
                        <Badge
                            variant="outline"
                            className="h-4 px-1.5 text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-normal"
                        >
                            Arc
                        </Badge>
                        <span className="text-sm font-medium font-mono">{shortAddress(address!)}</span>
                    </div>
                    <ChevronDown className="size-3 text-muted-foreground hidden sm:block" />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56 glass border-glass-border">
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col gap-0.5">
                        <p className="text-xs text-muted-foreground">Connected via {walletType === 'metamask' ? 'MetaMask' : 'Rabby'}</p>
                        <p className="font-mono text-sm font-medium truncate">{shortAddress(address!)}</p>
                        {balance && (
                            <p className="text-xs text-muted-foreground mt-0.5">{balance} ARC</p>
                        )}
                    </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={handleCopy} className="gap-2 cursor-pointer">
                    {copied ? (
                        <Check className="size-3.5 text-emerald-400" />
                    ) : (
                        <Copy className="size-3.5" />
                    )}
                    {copied ? 'Copied!' : 'Copy Address'}
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                    <a
                        href={`https://testnet.arcscan.app/address/${address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 cursor-pointer"
                    >
                        <ExternalLink className="size-3.5" />
                        View on Explorer
                    </a>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                    onClick={disconnect}
                    className="gap-2 text-destructive focus:text-destructive cursor-pointer"
                >
                    <LogOut className="size-3.5" />
                    Disconnect
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
