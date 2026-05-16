import { useToast } from '@/components/ui/use-toast'
import { ExternalLink, Loader2, CheckCircle2, XCircle } from 'lucide-react'

export function useTransactionFeedback() {
  const { toast } = useToast()

  const showPendingToast = (hash?: string) => {
    return toast({
      title: 'Transaction Pending',
      description: (
        <div className="flex flex-col gap-2 mt-2">
          <div className="flex items-center gap-2">
            <Loader2 className="size-4 animate-spin text-blue-500" />
            <span className="text-sm">Confirming on Arc Testnet...</span>
          </div>
          {hash && (
            <a
              href={`https://testnet.arcscan.app/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-500 hover:text-blue-400 hover:underline"
            >
              View on Explorer <ExternalLink className="size-3" />
            </a>
          )}
        </div>
      ),
      duration: 30000, // keep it open while pending
    })
  }

  const showSuccessToast = (title: string, hash?: string) => {
    toast({
      title,
      description: (
        <div className="flex flex-col gap-2 mt-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-emerald-500" />
            <span className="text-sm">Confirmed on Arc Testnet!</span>
          </div>
          {hash && (
            <a
              href={`https://testnet.arcscan.app/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-500 hover:text-blue-400 hover:underline"
            >
              View Receipt <ExternalLink className="size-3" />
            </a>
          )}
        </div>
      ),
      duration: 8000,
    })
  }

  const showErrorToast = (title: string, error: any) => {
    toast({
      variant: 'destructive',
      title,
      description: (
        <div className="flex items-center gap-2 mt-2">
          <XCircle className="size-4" />
          <span className="text-sm">{error?.message || error?.reason || 'Transaction failed.'}</span>
        </div>
      ),
    })
  }

  return { showPendingToast, showSuccessToast, showErrorToast }
}
