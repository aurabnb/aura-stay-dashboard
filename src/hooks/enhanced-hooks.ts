'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { 
  ApiResponse, 
  PaginatedResponse, 
  LoadingState, 
  NetworkStatus,
  User,
  StakingPosition,
  TreasuryData,
  AnalyticsData,
  WalletConnection
} from '@/types/enhanced'

// ============================================================================
// CORE UTILITY HOOKS
// ============================================================================

/**
 * Enhanced local storage hook with serialization and error handling
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options?: {
    serializer?: {
      read: (value: string) => T
      write: (value: T) => string
    }
    onError?: (error: Error) => void
  }
) {
  const { serializer = JSON, onError } = options || {}
  
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (typeof window === 'undefined') return initialValue
      const item = window.localStorage.getItem(key)
      return item ? serializer.read(item) : initialValue
    } catch (error) {
      onError?.(error as Error)
      return initialValue
    }
  })

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, serializer.write(valueToStore))
      }
    } catch (error) {
      onError?.(error as Error)
    }
  }, [key, storedValue, serializer, onError])

  const removeValue = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key)
      }
      setStoredValue(initialValue)
    } catch (error) {
      onError?.(error as Error)
    }
  }, [key, initialValue, onError])

  return [storedValue, setValue, removeValue] as const
}

/**
 * Debounced value hook for search and input optimization
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Previous value hook for comparison
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>()
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}

/**
 * Network status detection hook
 */
export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>('online')
  const [connectionSpeed, setConnectionSpeed] = useState<number>(0)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const updateNetworkStatus = () => {
      const connection = (navigator as any).connection
      
      if (!navigator.onLine) {
        setStatus('offline')
        return
      }

      if (connection) {
        const speed = connection.downlink
        setConnectionSpeed(speed)
        setStatus(speed < 1 ? 'slow' : 'online')
      } else {
        setStatus('online')
      }
    }

    updateNetworkStatus()

    window.addEventListener('online', updateNetworkStatus)
    window.addEventListener('offline', updateNetworkStatus)

    return () => {
      window.removeEventListener('online', updateNetworkStatus)
      window.removeEventListener('offline', updateNetworkStatus)
    }
  }, [])

  return status
}

/**
 * Intersection observer hook for lazy loading
 */
export function useIntersectionObserver(
  options?: IntersectionObserverInit
): [React.RefObject<HTMLDivElement>, boolean] {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
      },
      options
    )

    observer.observe(ref.current)

    return () => {
      observer.disconnect()
    }
  }, [options])

  return [ref, isIntersecting]
}

/**
 * Clipboard hook for copy/paste functionality
 */
export function useClipboard(timeout = 2000) {
  const [isCopied, setIsCopied] = useState(false)

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), timeout)
      return true
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      return false
    }
  }, [timeout])

  return { isCopied, copy }
}

// ============================================================================
// DATA FETCHING HOOKS
// ============================================================================

/**
 * Enhanced API hook with caching and error handling
 */
export function useApi<T>(
  endpoint: string,
  options?: {
    enabled?: boolean
    refetchInterval?: number
    staleTime?: number
    cacheTime?: number
    onSuccess?: (data: T) => void
    onError?: (error: Error) => void
  }
) {
  const {
    enabled = true,
    refetchInterval,
    staleTime = 5 * 60 * 1000, // 5 minutes
    cacheTime = 10 * 60 * 1000, // 10 minutes
    onSuccess,
    onError
  } = options || {}

  return useQuery({
    queryKey: [endpoint],
    queryFn: async (): Promise<T> => {
      const response = await fetch(`/api${endpoint}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data: ApiResponse<T> = await response.json()
      if (!data.success) {
        throw new Error(data.error || 'API request failed')
      }
      return data.data!
    },
    enabled,
    refetchInterval,
    staleTime,
    cacheTime,
    onSuccess,
    onError,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

/**
 * Paginated data hook
 */
export function usePaginatedData<T>(
  endpoint: string,
  initialPage = 1,
  pageSize = 20
) {
  const [currentPage, setCurrentPage] = useState(initialPage)
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: [endpoint, currentPage, pageSize],
    queryFn: async (): Promise<PaginatedResponse<T>> => {
      const response = await fetch(
        `/api${endpoint}?page=${currentPage}&limit=${pageSize}`
      )
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return response.json()
    },
    keepPreviousData: true,
  })

  // Prefetch next page
  useEffect(() => {
    if (query.data?.pagination.hasNext) {
      queryClient.prefetchQuery({
        queryKey: [endpoint, currentPage + 1, pageSize],
        queryFn: async () => {
          const response = await fetch(
            `/api${endpoint}?page=${currentPage + 1}&limit=${pageSize}`
          )
          return response.json()
        },
      })
    }
  }, [query.data, currentPage, pageSize, endpoint, queryClient])

  const goToPage = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  const nextPage = useCallback(() => {
    if (query.data?.pagination.hasNext) {
      setCurrentPage(p => p + 1)
    }
  }, [query.data?.pagination.hasNext])

  const prevPage = useCallback(() => {
    if (query.data?.pagination.hasPrev) {
      setCurrentPage(p => p - 1)
    }
  }, [query.data?.pagination.hasPrev])

  return {
    ...query,
    currentPage,
    goToPage,
    nextPage,
    prevPage,
    pagination: query.data?.pagination,
  }
}

/**
 * Mutation hook with optimistic updates
 */
export function useApiMutation<TData, TVariables>(
  endpoint: string,
  options?: {
    method?: 'POST' | 'PUT' | 'DELETE' | 'PATCH'
    onSuccess?: (data: TData, variables: TVariables) => void
    onError?: (error: Error, variables: TVariables) => void
    invalidateQueries?: string[]
    optimisticUpdate?: (variables: TVariables) => any
  }
) {
  const queryClient = useQueryClient()
  const { 
    method = 'POST', 
    invalidateQueries = [], 
    optimisticUpdate,
    ...restOptions 
  } = options || {}

  return useMutation({
    mutationFn: async (variables: TVariables): Promise<TData> => {
      const response = await fetch(`/api${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(variables),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: ApiResponse<TData> = await response.json()
      if (!data.success) {
        throw new Error(data.error || 'Mutation failed')
      }

      return data.data!
    },
    onMutate: optimisticUpdate ? async (variables: TVariables) => {
      // Cancel outgoing refetches
      await Promise.all(
        invalidateQueries.map(query => 
          queryClient.cancelQueries({ queryKey: [query] })
        )
      )

      // Snapshot previous values
      const previousData = invalidateQueries.reduce((acc, query) => {
        acc[query] = queryClient.getQueryData([query])
        return acc
      }, {} as Record<string, any>)

      // Optimistically update
      const optimisticData = optimisticUpdate(variables)
      invalidateQueries.forEach(query => {
        queryClient.setQueryData([query], optimisticData)
      })

      return { previousData }
    } : undefined,
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        Object.entries(context.previousData).forEach(([query, data]) => {
          queryClient.setQueryData([query], data)
        })
      }
      restOptions.onError?.(err as Error, variables)
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch
      invalidateQueries.forEach(query => {
        queryClient.invalidateQueries({ queryKey: [query] })
      })
      restOptions.onSuccess?.(data, variables)
    },
  })
}

// ============================================================================
// DOMAIN-SPECIFIC HOOKS
// ============================================================================

/**
 * User data and authentication hook
 */
export function useAuth() {
  const [user, setUser] = useLocalStorage<User | null>('aura_user', null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const login = useApiMutation('/auth/login', {
    onSuccess: (data: { user: User; token: string }) => {
      setUser(data.user)
      setIsAuthenticated(true)
      localStorage.setItem('aura_token', data.token)
    },
  })

  const logout = useCallback(() => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('aura_token')
    localStorage.removeItem('aura_user')
  }, [setUser])

  const updateProfile = useApiMutation('/auth/profile', {
    method: 'PUT',
    onSuccess: (updatedUser: User) => {
      setUser(updatedUser)
    },
  })

  return {
    user,
    isAuthenticated,
    login,
    logout,
    updateProfile,
    isLoading: login.isPending || updateProfile.isPending,
  }
}

/**
 * Wallet connection and balance hook
 */
export function useWallet() {
  const [connection, setConnection] = useState<WalletConnection | null>(null)
  const [autoConnect, setAutoConnect] = useLocalStorage('aura_auto_connect', false)

  const connect = useCallback(async (walletType: string) => {
    try {
      // Wallet connection logic here
      const newConnection: WalletConnection = {
        address: 'placeholder',
        isConnected: true,
        walletType: walletType as any,
        network: 'mainnet-beta',
      }
      setConnection(newConnection)
      if (autoConnect) {
        setAutoConnect(true)
      }
    } catch (error) {
      console.error('Wallet connection failed:', error)
    }
  }, [autoConnect, setAutoConnect])

  const disconnect = useCallback(() => {
    setConnection(null)
    setAutoConnect(false)
  }, [setAutoConnect])

  const balanceQuery = useApi<TokenBalance[]>(
    `/wallet/${connection?.address}/balance`,
    { enabled: !!connection?.address }
  )

  return {
    connection,
    balance: balanceQuery.data,
    connect,
    disconnect,
    isConnecting: false,
    isLoadingBalance: balanceQuery.isLoading,
  }
}

/**
 * Staking positions and rewards hook
 */
export function useStaking() {
  const { connection } = useWallet()

  const positionsQuery = useApi<StakingPosition[]>(
    `/staking/positions/${connection?.address}`,
    { enabled: !!connection?.address }
  )

  const stake = useApiMutation<any, { amount: string; poolId: string }>('/staking/stake', {
    invalidateQueries: ['/staking/positions', '/wallet/balance'],
  })

  const unstake = useApiMutation<any, { positionId: string }>('/staking/unstake', {
    invalidateQueries: ['/staking/positions', '/wallet/balance'],
  })

  const claimRewards = useApiMutation<any, { positionId: string }>('/staking/claim', {
    invalidateQueries: ['/staking/positions', '/wallet/balance'],
  })

  const totalStaked = useMemo(() => {
    return positionsQuery.data?.reduce((sum, pos) => 
      sum + parseFloat(pos.stakedAmount), 0
    ) || 0
  }, [positionsQuery.data])

  const totalRewards = useMemo(() => {
    return positionsQuery.data?.reduce((sum, pos) => 
      sum + parseFloat(pos.earnedRewards), 0
    ) || 0
  }, [positionsQuery.data])

  return {
    positions: positionsQuery.data || [],
    totalStaked,
    totalRewards,
    stake,
    unstake,
    claimRewards,
    isLoading: positionsQuery.isLoading,
    isStaking: stake.isPending,
    isUnstaking: unstake.isPending,
    isClaiming: claimRewards.isPending,
  }
}

/**
 * Treasury data hook with real-time updates
 */
export function useTreasury() {
  return useApi<TreasuryData>('/treasury', {
    refetchInterval: 30000, // 30 seconds
    staleTime: 15000, // 15 seconds
  })
}

/**
 * Analytics data hook with period selection
 */
export function useAnalytics(period: '24h' | '7d' | '30d' | '90d' = '7d') {
  return useApi<AnalyticsData>(`/analytics?period=${period}`, {
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Real-time price feed hook
 */
export function usePriceFeed(symbols: string[]) {
  const [prices, setPrices] = useState<Record<string, number>>({})

  useEffect(() => {
    if (symbols.length === 0) return

    // WebSocket connection for real-time prices
    const ws = new WebSocket(`wss://price-feed/ws?symbols=${symbols.join(',')}`)
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        setPrices(prev => ({ ...prev, ...data }))
      } catch (error) {
        console.error('Price feed error:', error)
      }
    }

    return () => {
      ws.close()
    }
  }, [symbols])

  return prices
}

/**
 * Form state management hook
 */
export function useFormState<T extends Record<string, any>>(
  initialState: T,
  validation?: (values: T) => Record<keyof T, string | undefined>
) {
  const [values, setValues] = useState<T>(initialState)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({})

  const setValue = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }))
    if (touched[field] && validation) {
      const fieldErrors = validation({ ...values, [field]: value })
      setErrors(prev => ({ ...prev, [field]: fieldErrors[field] }))
    }
  }, [values, touched, validation])

  const setTouched = useCallback((field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }))
    if (validation) {
      const fieldErrors = validation(values)
      setErrors(prev => ({ ...prev, [field]: fieldErrors[field] }))
    }
  }, [values, validation])

  const validate = useCallback(() => {
    if (!validation) return true
    const allErrors = validation(values)
    setErrors(allErrors)
    return Object.values(allErrors).every(error => !error)
  }, [values, validation])

  const reset = useCallback(() => {
    setValues(initialState)
    setErrors({})
    setTouched({})
  }, [initialState])

  return {
    values,
    errors,
    touched,
    setValue,
    setTouched,
    validate,
    reset,
    isValid: Object.values(errors).every(error => !error),
  }
}

// ============================================================================
// PERFORMANCE HOOKS
// ============================================================================

/**
 * Performance monitoring hook
 */
export function usePerformanceMonitor(name: string) {
  const startTime = useRef<number>()

  const start = useCallback(() => {
    startTime.current = performance.now()
  }, [])

  const end = useCallback(() => {
    if (startTime.current) {
      const duration = performance.now() - startTime.current
      console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`)
      
      // Send to analytics in production
      if (process.env.NODE_ENV === 'production') {
        // analytics.track('performance', { name, duration })
      }
      
      return duration
    }
    return 0
  }, [name])

  return { start, end }
}

/**
 * Memory usage monitoring hook
 */
export function useMemoryMonitor() {
  const [memoryInfo, setMemoryInfo] = useState<any>(null)

  useEffect(() => {
    const updateMemoryInfo = () => {
      if ('memory' in performance) {
        setMemoryInfo((performance as any).memory)
      }
    }

    updateMemoryInfo()
    const interval = setInterval(updateMemoryInfo, 5000)

    return () => clearInterval(interval)
  }, [])

  return memoryInfo
}

export default {
  useLocalStorage,
  useDebounce,
  usePrevious,
  useNetworkStatus,
  useIntersectionObserver,
  useClipboard,
  useApi,
  usePaginatedData,
  useApiMutation,
  useAuth,
  useWallet,
  useStaking,
  useTreasury,
  useAnalytics,
  usePriceFeed,
  useFormState,
  usePerformanceMonitor,
  useMemoryMonitor,
} 