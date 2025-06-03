import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "@/hooks/use-toast"
import type { ApiStatus, ConsolidatedData } from "@/types"

/** How often to refresh (ms) */
const REFRESH_INTERVAL = 5 * 60 * 1_000 // 5 min

export const useTreasuryData = () => {
  const [data, setData] = useState<ConsolidatedData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [apiStatus, setApiStatus] = useState<ApiStatus>({
    solPrice: "loading",
    wallets: "loading",
    auraMarketCap: "loading",
  })

  /* ------------------------------------------------------------------ */
  /*                               fetcher                              */
  /* ------------------------------------------------------------------ */
  const fetchData = useCallback(async () => {
    setError(null)
    setApiStatus({
      solPrice: "loading",
      wallets: "loading",
      auraMarketCap: "loading",
    })

    try {
      const { data: responseData, error: fetchError } =
        await supabase.functions.invoke("fetch-wallet-balances")

      if (fetchError) throw fetchError

      if (!responseData || !Array.isArray(responseData.wallets)) {
        throw new Error("Invalid response structure from server")
      }

      setData(responseData)
      setLastRefresh(new Date())

      setApiStatus({
        solPrice: responseData.solPrice > 0 ? "success" : "error",
        wallets: responseData.wallets.length > 0 ? "success" : "error",
        auraMarketCap:
          responseData.treasury.totalMarketCap > 0 ? "success" : "error",
      })

      toast({
        title: "Data Updated",
        description: `Fetched ${responseData.wallets.length} wallets`,
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to fetch data"
      setError(msg)
      setApiStatus({
        solPrice: "error",
        wallets: "error",
        auraMarketCap: "error",
      })

      toast({
        title: "Data Fetch Failed",
        description: msg,
        variant: "destructive",
      })

      // provide safe fallback so components can still render
      setData({
        treasury: {
          totalMarketCap: 0,
          volatileAssets: 0,
          hardAssets: 0,
          lastUpdated: new Date().toISOString(),
        },
        wallets: [],
        solPrice: 0,
      })
    } finally {
      setLoading(false)
    }
  }, [])

  /* ------------------------------------------------------------------ */
  /*                         initial + interval                         */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    fetchData() // initial load
    const id = setInterval(fetchData, REFRESH_INTERVAL)
    return () => clearInterval(id)
  }, [fetchData])

  return { data, loading, error, lastRefresh, apiStatus, fetchData }
}

/** Public alias so other files can import the hook’s return type */
export type UseTreasuryDataReturn = ReturnType<typeof useTreasuryData>
