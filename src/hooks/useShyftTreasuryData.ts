
import { useState, useEffect, useCallback } from 'react'
import { ShyftTreasuryService, ShyftTreasuryData } from '@/lib/api/shyftTreasuryService'
import { useToast } from '@/hooks/use-toast'
import type { ConsolidatedData } from '@/types/treasury'

export function useShyftTreasuryData() {
  const [data, setData] = useState<ConsolidatedData | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const { toast } = useToast()

  // Fetch cached data (fast)
  const fetchCachedData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await ShyftTreasuryService.getCachedTreasuryData()
      
      if (result.success && result.data) {
        setData(result.data)
        setLastRefresh(new Date())
      } else {
        setError(result.error || 'Failed to fetch cached data')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  // Sync live data from Shyft API (slower)
  const syncLiveData = useCallback(async () => {
    try {
      setSyncing(true)
      
      const result = await ShyftTreasuryService.syncAndGetLiveData()
      
      if (result.success) {
        toast({
          title: "Data Synced",
          description: "Treasury data has been updated from Shyft API",
        })
        // Refresh cached data after sync
        await fetchCachedData()
      } else {
        toast({
          title: "Sync Failed",
          description: result.error || "Failed to sync live data",
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
  }, [fetchCachedData, toast])

  // Initial load
  useEffect(() => {
    fetchCachedData()
  }, [fetchCachedData])

  return {
    data,
    loading,
    syncing,
    error,
    lastRefresh,
    refetch: fetchCachedData,
    syncLiveData,
  }
}
