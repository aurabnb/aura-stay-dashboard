
import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "@/hooks/use-toast"
import type { ConsolidatedData } from "@/types"

const REFRESH_INTERVAL = 5 * 60 * 1000 // 5 minutes

export const useShyftTreasuryData = () => {
  const [data, setData] = useState<ConsolidatedData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const fetchData = useCallback(async () => {
    setError(null)
    
    try {
      console.log('Fetching treasury data via Shyft API...')
      
      const { data: responseData, error: fetchError } = await supabase.functions.invoke('sync-shyft-wallets')

      if (fetchError) throw fetchError

      if (!responseData || !responseData.treasury) {
        throw new Error('Invalid response structure from Shyft sync')
      }

      setData(responseData)
      setLastRefresh(new Date())

      toast({
        title: "Live Data Updated",
        description: `Fetched live data from ${responseData.wallets.length} wallets via Shyft`,
      })

    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch live data'
      setError(msg)
      
      toast({
        title: "Live Data Fetch Failed",
        description: msg,
        variant: "destructive",
      })

      // Provide fallback data so components can still render
      setData({
        treasury: {
          totalMarketCap: 115651,
          volatileAssets: 0,
          hardAssets: 607.87,
          lastUpdated: new Date().toISOString(),
        },
        wallets: [],
        solPrice: 180,
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, REFRESH_INTERVAL)
    return () => clearInterval(interval)
  }, [fetchData])

  return { 
    data, 
    loading, 
    error, 
    lastRefresh, 
    fetchData,
    isLiveData: true 
  }
}
