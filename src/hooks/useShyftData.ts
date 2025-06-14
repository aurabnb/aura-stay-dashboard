
import { useState, useEffect } from 'react'
import { ShyftService, ShyftWalletData } from '@/lib/services/shyftService'
import { useToast } from '@/hooks/use-toast'

export function useShyftData() {
  const [data, setData] = useState<{ wallets: ShyftWalletData[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)
  const { toast } = useToast()

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await ShyftService.getMonitoredWallets()
      
      if (result.error) {
        setError(result.error)
        toast({
          title: "Error Loading Wallet Data",
          description: result.error,
          variant: "destructive"
        })
      } else {
        setData({ wallets: result.wallets })
      }

      // Get last sync time
      const syncTime = await ShyftService.getLastSyncTime()
      setLastSyncTime(syncTime)
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      toast({
        title: "Error Loading Wallet Data",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const syncWallets = async () => {
    try {
      setSyncing(true)
      
      const result = await ShyftService.syncWallets()
      
      if (result.success) {
        toast({
          title: "Wallets Synced",
          description: "Wallet data has been updated from Shyft API",
        })
        // Refresh data after sync
        await fetchData()
      } else {
        toast({
          title: "Sync Failed",
          description: result.error || "Failed to sync wallets",
          variant: "destructive"
        })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      toast({
        title: "Sync Failed",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setSyncing(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return {
    data,
    loading,
    error,
    syncing,
    lastSyncTime,
    refetch: fetchData,
    syncWallets,
  }
}
