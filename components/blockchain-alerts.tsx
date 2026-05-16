import { AlertCircle, Wallet } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

interface WalletAlertProps {
  message?: string
  onConnect?: () => void
}

/**
 * Component to display when wallet is not connected
 * Shows clear message and prompts user to connect
 */
export function WalletDisconnectedAlert({ 
  message = 'Connect your wallet to create contracts and submit proofs',
  onConnect 
}: WalletAlertProps) {
  return (
    <Alert className="border-amber-500/30 bg-amber-500/5">
      <div className="flex items-start gap-3">
        <Wallet className="size-4 text-amber-500 mt-0.5 shrink-0" />
        <div className="flex-1">
          <AlertDescription className="text-sm">
            <p className="font-medium text-amber-600 dark:text-amber-400 mb-2">
              Wallet Not Connected
            </p>
            <p className="text-amber-600/80 dark:text-amber-400/80">
              {message}
            </p>
            {onConnect && (
              <Button 
                size="sm" 
                onClick={onConnect}
                className="mt-3 bg-amber-600 hover:bg-amber-700"
              >
                Connect Wallet
              </Button>
            )}
          </AlertDescription>
        </div>
      </div>
    </Alert>
  )
}

/**
 * Component to display when a feature requires blockchain but is not ready
 */
export function BlockchainComingSoonAlert({ 
  feature = 'Smart contract integration'
}: { feature?: string }) {
  return (
    <Alert className="border-blue-500/30 bg-blue-500/5">
      <div className="flex items-start gap-3">
        <AlertCircle className="size-4 text-blue-500 mt-0.5 shrink-0" />
        <div>
          <AlertDescription className="text-sm">
            <p className="font-medium text-blue-600 dark:text-blue-400">
              {feature} Coming Soon
            </p>
            <p className="text-blue-600/80 dark:text-blue-400/80 text-xs mt-1">
              This feature will be available after blockchain integration is complete.
            </p>
          </AlertDescription>
        </div>
      </div>
    </Alert>
  )
}

/**
 * Component to display blockchain errors
 */
export function BlockchainErrorAlert({ 
  error,
  onDismiss
}: { 
  error: { message: string; details?: string }
  onDismiss?: () => void 
}) {
  return (
    <Alert className="border-red-500/30 bg-red-500/5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <AlertCircle className="size-4 text-red-500 mt-0.5 shrink-0" />
          <div>
            <AlertDescription className="text-sm">
              <p className="font-medium text-red-600 dark:text-red-400">
                {error.message}
              </p>
              {error.details && (
                <p className="text-red-600/80 dark:text-red-400/80 text-xs mt-1">
                  {error.details}
                </p>
              )}
            </AlertDescription>
          </div>
        </div>
        {onDismiss && (
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={onDismiss}
            className="h-6 w-6 p-0"
          >
            ✕
          </Button>
        )}
      </div>
    </Alert>
  )
}
