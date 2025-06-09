'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { apiOptimizer, slowDataOptimizer, fastDataOptimizer } from '@/lib/services/apiOptimizer'

interface UseOptimizedApiOptions {
  enabled?: boolean
  refetchInterval?: number
  staleTime?: number
  cacheKey?: string
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
  retry?: boolean
  background?: boolean
  preload?: boolean
  optimizer?: 'fast' | 'slow' | 'default'
}

interface UseOptimizedApiReturn<T> {
  data: T | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
  clearCache: () => void
  isStale: boolean
  lastFetch: Date | null
}

export function useOptimizedApi<T>(
  url: string | null,
  options: UseOptimizedApiOptions = {}
): UseOptimizedApiReturn<T> {
  const {
    enabled = true,
    refetchInterval,
    staleTime = 5 * 60 * 1000, // 5 minutes default
    cacheKey,
    onSuccess,
    onError,
    retry = true,
    background = false,
    preload = false,
    optimizer = 'default'
  } = options

  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<Error | null>(null)
  const [lastFetch, setLastFetch] = useState<Date | null>(null)
  const [isStale, setIsStale] = useState<boolean>(false)

  const abortControllerRef = useRef<AbortController | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const onSuccessRef = useRef(onSuccess)
  const onErrorRef = useRef(onError)

  // Update refs when callbacks change
  useEffect(() => {
    onSuccessRef.current = onSuccess
  }, [onSuccess])
  
  useEffect(() => {
    onErrorRef.current = onError
  }, [onError])

  // Select appropriate optimizer
  const getOptimizer = useCallback(() => {
    switch (optimizer) {
      case 'fast': return fastDataOptimizer
      case 'slow': return slowDataOptimizer
      default: return apiOptimizer
    }
  }, [optimizer])

  // Check if data is stale
  const checkStaleStatus = useCallback(() => {
    if (lastFetch && staleTime) {
      const isCurrentlyStale = Date.now() - lastFetch.getTime() > staleTime
      setIsStale(isCurrentlyStale)
    }
  }, [lastFetch, staleTime])

  // Main fetch function
  const fetchData = useCallback(async (isBackground = false) => {
    if (!url || !enabled) return

    // Cancel previous request with complete error suppression
    if (abortControllerRef.current && !abortControllerRef.current.signal.aborted) {
      try {
        abortControllerRef.current.abort()
      } catch (error) {
        // Completely suppress all abort-related errors
      }
    }

    const abortController = new AbortController()
    abortControllerRef.current = abortController

    try {
      if (!isBackground) {
        setLoading(true)
      }
      setError(null)

      const optimizer = getOptimizer()
      const requestOptions = {
        signal: abortController.signal,
        cacheTTL: staleTime,
        skipCache: isBackground // Skip cache for background refreshes
      }

      const result = await optimizer.fetch<T>(url, requestOptions)

      // Only update state if request wasn't aborted
      if (!abortController.signal.aborted) {
        setData(result)
        setLastFetch(new Date())
        setIsStale(false)
        onSuccessRef.current?.(result)
      }
    } catch (err: any) {
      // Handle ALL abort-related scenarios silently
      if (abortController.signal.aborted || 
          (err && (err.name === 'AbortError' || 
                   String(err).includes('aborted') || 
                   String(err).includes('abort')))) {
        // Request was cancelled - this is normal, don't treat as error
        return
      }
      
      // Only handle actual errors, not cancellations
      const error = err instanceof Error ? err : new Error('Fetch failed')
      setError(error)
      onErrorRef.current?.(error)
    } finally {
      if (!abortController.signal.aborted && !isBackground) {
        setLoading(false)
      }
    }
  }, [url, enabled, staleTime, getOptimizer])

  // Background fetch for keeping data fresh
  const backgroundFetch = useCallback(async () => {
    if (background && url) {
      try {
        const optimizer = getOptimizer()
        await optimizer.backgroundRefresh(url, { cacheTTL: staleTime })
      } catch (error: any) {
        // Suppress ALL abort-related errors in background requests
        if (!String(error).includes('abort') && error?.name !== 'AbortError') {
          console.warn('Background fetch failed:', error)
        }
      }
    }
  }, [background, url, getOptimizer, staleTime])

  // Preload data
  const preloadData = useCallback(async () => {
    if (preload && url) {
      try {
        const optimizer = getOptimizer()
        await optimizer.preload(url, { cacheTTL: staleTime })
      } catch (error: any) {
        // Suppress ALL abort-related errors in preload requests
        if (!String(error).includes('abort') && error?.name !== 'AbortError') {
          console.warn('Preload failed:', error)
        }
      }
    }
  }, [preload, url, getOptimizer, staleTime])

  // Manual refetch function
  const refetch = useCallback(async () => {
    await fetchData(false)
  }, [fetchData])

  // Clear cache function
  const clearCache = useCallback(() => {
    const optimizer = getOptimizer()
    if (cacheKey) {
      optimizer.clearCache(cacheKey)
    } else if (url) {
      optimizer.clearCache(url)
    }
  }, [getOptimizer, cacheKey, url])

  // Initial fetch and preload
  useEffect(() => {
    if (preload) {
      preloadData()
    }
    fetchData()
  }, [url, enabled]) // Only depend on essential values, not functions

  // Set up refetch interval
  useEffect(() => {
    if (refetchInterval && enabled) {
      intervalRef.current = setInterval(() => {
        if (background) {
          backgroundFetch()
        } else {
          fetchData()
        }
      }, refetchInterval)

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
    }
  }, [refetchInterval, enabled, background]) // Remove function dependencies

  // Check stale status periodically
  useEffect(() => {
    const staleCheckInterval = setInterval(checkStaleStatus, 30000) // Check every 30 seconds
    return () => clearInterval(staleCheckInterval)
  }, [checkStaleStatus])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current && !abortControllerRef.current.signal.aborted) {
        try {
          abortControllerRef.current.abort()
        } catch (error) {
          // Completely suppress cleanup abort errors
        }
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return {
    data,
    loading,
    error,
    refetch,
    clearCache,
    isStale,
    lastFetch
  }
}

// Specialized hooks for different data types
export function useTreasuryData<T>(url: string | null, options?: UseOptimizedApiOptions) {
  return useOptimizedApi<T>(url, {
    optimizer: 'slow',
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    background: true,
    ...options
  })
}

export function usePriceData<T>(url: string | null, options?: UseOptimizedApiOptions) {
  return useOptimizedApi<T>(url, {
    optimizer: 'fast',
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // 30 seconds
    background: true,
    ...options
  })
}

export function useSocialMetrics<T>(url: string | null, options?: UseOptimizedApiOptions) {
  return useOptimizedApi<T>(url, {
    optimizer: 'slow',
    staleTime: 15 * 60 * 1000, // 15 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
    background: true,
    ...options
  })
}

export function useAnalyticsData<T>(url: string | null, options?: UseOptimizedApiOptions) {
  return useOptimizedApi<T>(url, {
    optimizer: 'default',
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 3 * 60 * 1000, // 3 minutes
    background: true,
    ...options
  })
} 