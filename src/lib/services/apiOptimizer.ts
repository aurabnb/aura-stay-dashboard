import { trackApiCall, trackError } from '@/lib/performance'

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresIn: number
}

interface RequestQueue {
  [key: string]: Promise<any>
}

interface ApiOptimizerConfig {
  defaultCacheTTL: number
  maxRetries: number
  retryDelay: number
  enableCompression: boolean
  enableRequestDeduplication: boolean
  enablePerformanceTracking: boolean
}

class ApiOptimizer {
  private cache = new Map<string, CacheEntry<any>>()
  private requestQueue: RequestQueue = {}
  private config: ApiOptimizerConfig = {
    defaultCacheTTL: 5 * 60 * 1000, // 5 minutes
    maxRetries: 3,
    retryDelay: 1000,
    enableCompression: true,
    enableRequestDeduplication: true,
    enablePerformanceTracking: true
  }

  constructor(config?: Partial<ApiOptimizerConfig>) {
    if (config) {
      this.config = { ...this.config, ...config }
    }
  }

  // Generate cache key from URL and options
  private getCacheKey(url: string, options?: RequestInit): string {
    const key = `${url}_${JSON.stringify(options?.method || 'GET')}`
    return btoa(key).replace(/[^a-zA-Z0-9]/g, '')
  }

  // Check if cached data is still valid
  private isCacheValid<T>(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp < entry.expiresIn
  }

  // Get data from cache if valid
  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (entry && this.isCacheValid(entry)) {
      return entry.data
    }
    if (entry) {
      this.cache.delete(key) // Remove expired entry
    }
    return null
  }

  // Store data in cache
  private setCache<T>(key: string, data: T, ttl?: number): void {
    const expiresIn = ttl || this.config.defaultCacheTTL
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresIn
    })
  }

  // Retry logic with exponential backoff
  private async retry<T>(
    fn: () => Promise<T>,
    retries: number = this.config.maxRetries
  ): Promise<T> {
    try {
      return await fn()
    } catch (error) {
      if (retries > 0) {
        await new Promise(resolve => 
          setTimeout(resolve, this.config.retryDelay * (this.config.maxRetries - retries + 1))
        )
        return this.retry(fn, retries - 1)
      }
      throw error
    }
  }

  // Optimized fetch with caching, deduplication, and retry
  async fetch<T>(
    url: string, 
    options?: RequestInit & { 
      cacheTTL?: number
      skipCache?: boolean
      skipDeduplication?: boolean
    }
  ): Promise<T> {
    const startTime = Date.now()
    const cacheKey = this.getCacheKey(url, options)
    let cacheHit = false
    
    // Check cache first (unless explicitly skipped)
    if (!options?.skipCache) {
      const cached = this.getFromCache<T>(cacheKey)
      if (cached) {
        cacheHit = true
        
        // Track performance
        if (this.config.enablePerformanceTracking) {
          trackApiCall(url, startTime, true, true)
        }
        
        return cached
      }
    }

    // Request deduplication
    if (this.config.enableRequestDeduplication && !options?.skipDeduplication) {
      if (this.requestQueue[cacheKey]) {
        const result = await this.requestQueue[cacheKey]
        
        // Track performance for deduped request
        if (this.config.enablePerformanceTracking) {
          trackApiCall(url, startTime, true, false)
        }
        
        return result
      }
    }

    // Create optimized request
    const requestPromise = this.retry(async () => {
      const requestOptions: RequestInit = {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.enableCompression && { 'Accept-Encoding': 'gzip, deflate, br' }),
          ...options?.headers
        }
      }

      const response = await fetch(url, requestOptions)
      
      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`)
        
        // Track API error
        if (this.config.enablePerformanceTracking) {
          trackError(error, url)
          trackApiCall(url, startTime, false, cacheHit)
        }
        
        throw error
      }

      const data = await response.json()
      
      // Cache successful responses
      if (!options?.skipCache) {
        this.setCache(cacheKey, data, options?.cacheTTL)
      }
      
      // Track successful API call
      if (this.config.enablePerformanceTracking) {
        trackApiCall(url, startTime, true, cacheHit)
      }
      
      return data
    })

    // Store in request queue for deduplication
    if (this.config.enableRequestDeduplication && !options?.skipDeduplication) {
      this.requestQueue[cacheKey] = requestPromise
      
      // Clean up after request completes
      requestPromise.finally(() => {
        delete this.requestQueue[cacheKey]
      }).catch(error => {
        // Track errors from failed requests
        if (this.config.enablePerformanceTracking) {
          trackError(error instanceof Error ? error : new Error(String(error)), url)
          trackApiCall(url, startTime, false, cacheHit)
        }
      })
    }

    return requestPromise
  }

  // Parallel fetch for multiple requests
  async fetchParallel<T>(requests: Array<{
    url: string
    options?: RequestInit & { cacheTTL?: number; skipCache?: boolean }
  }>): Promise<T[]> {
    const promises = requests.map(req => this.fetch<T>(req.url, req.options))
    return Promise.all(promises)
  }

  // Batch fetch with automatic chunking for rate limiting
  async fetchBatch<T>(
    requests: Array<{ url: string; options?: RequestInit }>,
    chunkSize: number = 5,
    delay: number = 100
  ): Promise<T[]> {
    const results: T[] = []
    
    for (let i = 0; i < requests.length; i += chunkSize) {
      const chunk = requests.slice(i, i + chunkSize)
      const chunkResults = await this.fetchParallel<T>(chunk)
      results.push(...chunkResults)
      
      // Add delay between chunks to avoid rate limiting
      if (i + chunkSize < requests.length) {
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    
    return results
  }

  // Clear cache (useful for forced refresh)
  clearCache(pattern?: string): void {
    if (pattern) {
      for (const [key] of this.cache) {
        if (key.includes(pattern)) {
          this.cache.delete(key)
        }
      }
    } else {
      this.cache.clear()
    }
  }

  // Get cache statistics
  getCacheStats() {
    const entries = Array.from(this.cache.values())
    const validEntries = entries.filter(entry => this.isCacheValid(entry))
    
    return {
      totalEntries: this.cache.size,
      validEntries: validEntries.length,
      expiredEntries: this.cache.size - validEntries.length,
      cacheHitRate: validEntries.length / Math.max(1, this.cache.size),
      memoryUsage: this.estimateMemoryUsage()
    }
  }

  // Estimate memory usage of cache
  private estimateMemoryUsage(): number {
    let size = 0
    for (const [key, value] of this.cache) {
      size += key.length * 2 // UTF-16 characters
      size += JSON.stringify(value).length * 2
    }
    return size
  }

  // Preload data for better perceived performance
  async preload<T>(
    url: string,
    options?: RequestInit & { cacheTTL?: number }
  ): Promise<void> {
    try {
      await this.fetch<T>(url, { ...options, skipDeduplication: true })
    } catch (error) {
      // Silently fail preloads to avoid affecting main app flow
      console.warn('Preload failed:', url, error)
      
      if (this.config.enablePerformanceTracking && error instanceof Error) {
        trackError(error, url)
      }
    }
  }

  // Background refresh for critical data
  async backgroundRefresh<T>(
    url: string,
    options?: RequestInit & { cacheTTL?: number }
  ): Promise<void> {
    try {
      await this.fetch<T>(url, { 
        ...options, 
        skipCache: true, 
        skipDeduplication: true 
      })
    } catch (error) {
      console.warn('Background refresh failed:', url, error)
      
      if (this.config.enablePerformanceTracking && error instanceof Error) {
        trackError(error, url)
      }
    }
  }

  // Update configuration
  updateConfig(config: Partial<ApiOptimizerConfig>): void {
    this.config = { ...this.config, ...config }
  }

  // Get current configuration
  getConfig(): ApiOptimizerConfig {
    return { ...this.config }
  }
}

// Singleton instance with optimized defaults
export const apiOptimizer = new ApiOptimizer({
  defaultCacheTTL: 3 * 60 * 1000, // 3 minutes for fast-changing data
  maxRetries: 2,
  retryDelay: 500,
  enableCompression: true,
  enableRequestDeduplication: true,
  enablePerformanceTracking: true
})

// Specialized optimizers for different data types
export const slowDataOptimizer = new ApiOptimizer({
  defaultCacheTTL: 15 * 60 * 1000, // 15 minutes for slow-changing data
  maxRetries: 3,
  retryDelay: 1000,
  enablePerformanceTracking: true
})

export const fastDataOptimizer = new ApiOptimizer({
  defaultCacheTTL: 30 * 1000, // 30 seconds for fast-changing data
  maxRetries: 1,
  retryDelay: 200,
  enablePerformanceTracking: true
})

export { ApiOptimizer } 