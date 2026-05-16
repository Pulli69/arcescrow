'use client'

import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react'
import { BrowserProvider, formatEther } from 'ethers'

// Arc Testnet chain configuration
export const ARC_TESTNET = {
    chainId: '0x4CEF52', // 5042002 in hex
    chainName: 'Arc Testnet',
    nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
    rpcUrls: ['https://rpc.testnet.arc.network'],
    blockExplorerUrls: ['https://testnet.arcscan.app'],
}

export type WalletType = 'metamask' | 'rabby'

export interface WalletContextValue {
    address: string | null
    balance: string | null
    chainId: number | null
    isConnected: boolean
    isConnecting: boolean
    walletType: WalletType | null
    isOnArcTestnet: boolean
    connect: (type: WalletType) => Promise<void>
    disconnect: () => void
    switchToArcTestnet: () => Promise<void>
    refreshBalance: () => Promise<void>
}

const WalletContext = createContext<WalletContextValue | null>(null)

function getProvider(): any {
    if (typeof window === 'undefined') return null
    // Rabby injects window.rabby, but also overrides window.ethereum.
    // We rely on window.ethereum for both, since Rabby is compatible.
    return (window as any).ethereum ?? null
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
    const [address, setAddress] = useState<string | null>(null)
    const [balance, setBalance] = useState<string | null>(null)
    const [chainId, setChainId] = useState<number | null>(null)
    const [isConnecting, setIsConnecting] = useState(false)
    const [walletType, setWalletType] = useState<WalletType | null>(null)

    const isConnected = !!address
    const isOnArcTestnet = chainId === 5042002

    const fetchBalance = useCallback(async (addr: string) => {
        try {
            const provider = getProvider()
            if (!provider) return
            const ethersProvider = new BrowserProvider(provider)
            const raw = await ethersProvider.getBalance(addr)
            setBalance(parseFloat(formatEther(raw)).toFixed(4))
        } catch {
            setBalance('0.0000')
        }
    }, [])

    const refreshBalance = useCallback(async () => {
        if (address) await fetchBalance(address)
    }, [address, fetchBalance])

    const connect = useCallback(async (type: WalletType) => {
        const provider = getProvider()
        if (!provider) {
            throw new Error(
                type === 'metamask'
                    ? 'MetaMask is not installed. Please install it from metamask.io'
                    : 'Rabby Wallet is not installed. Please install it from rabby.io'
            )
        }

        setIsConnecting(true)
        try {
            const accounts: string[] = await provider.request({
                method: 'eth_requestAccounts',
            })
            if (!accounts.length) throw new Error('No accounts returned')

            const addr = accounts[0]
            const chainHex: string = await provider.request({ method: 'eth_chainId' })
            const chain = parseInt(chainHex, 16)

            setAddress(addr)
            setChainId(chain)
            setWalletType(type)

            // Persist session
            localStorage.setItem('wallet_connected', type)
            localStorage.setItem('wallet_address', addr)

            await fetchBalance(addr)
        } finally {
            setIsConnecting(false)
        }
    }, [fetchBalance])

    const disconnect = useCallback(() => {
        setAddress(null)
        setBalance(null)
        setChainId(null)
        setWalletType(null)
        localStorage.removeItem('wallet_connected')
        localStorage.removeItem('wallet_address')
    }, [])

    const switchToArcTestnet = useCallback(async () => {
        const provider = getProvider()
        if (!provider) return
        try {
            await provider.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: ARC_TESTNET.chainId }],
            })
        } catch (err: any) {
            // 4902 = chain not added yet
            if (err.code === 4902) {
                await provider.request({
                    method: 'wallet_addEthereumChain',
                    params: [ARC_TESTNET],
                })
            } else {
                throw err
            }
        }
    }, [])

    // Listen to chain and account changes
    useEffect(() => {
        const provider = getProvider()
        if (!provider) return

        const onAccountsChanged = async (accounts: string[]) => {
            if (!accounts.length) {
                disconnect()
            } else {
                setAddress(accounts[0])
                localStorage.setItem('wallet_address', accounts[0])
                await fetchBalance(accounts[0])
            }
        }

        const onChainChanged = (chainHex: string) => {
            setChainId(parseInt(chainHex, 16))
            // Refresh balance after chain switch
            if (address) fetchBalance(address)
        }

        provider.on('accountsChanged', onAccountsChanged)
        provider.on('chainChanged', onChainChanged)

        return () => {
            provider.removeListener('accountsChanged', onAccountsChanged)
            provider.removeListener('chainChanged', onChainChanged)
        }
    }, [address, disconnect, fetchBalance])

    // Restore session on mount
    useEffect(() => {
        const savedType = localStorage.getItem('wallet_connected') as WalletType | null
        if (!savedType) return

        const provider = getProvider()
        if (!provider) return

        provider.request({ method: 'eth_accounts' }).then(async (accounts: string[]) => {
            if (accounts.length) {
                const addr = accounts[0]
                const chainHex: string = await provider.request({ method: 'eth_chainId' })
                setAddress(addr)
                setChainId(parseInt(chainHex, 16))
                setWalletType(savedType)
                await fetchBalance(addr)
            } else {
                // Clear stale session
                localStorage.removeItem('wallet_connected')
                localStorage.removeItem('wallet_address')
            }
        })
    }, [fetchBalance])

    return (
        <WalletContext.Provider
            value={{
                address,
                balance,
                chainId,
                isConnected,
                isConnecting,
                walletType,
                isOnArcTestnet,
                connect,
                disconnect,
                switchToArcTestnet,
                refreshBalance,
            }}
        >
            {children}
        </WalletContext.Provider>
    )
}

export function useWallet(): WalletContextValue {
    const ctx = useContext(WalletContext)
    if (!ctx) throw new Error('useWallet must be used inside <WalletProvider>')
    return ctx
}
