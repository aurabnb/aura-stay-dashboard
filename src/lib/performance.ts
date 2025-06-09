'use client'

interface PerformanceMetrics {
  apiCalls: {
    url: string
    duration: number
    timestamp: number
    success: boolean
    cacheHit?: boolean
  }[]
  pageLoads: {
    page: string
    loadTime: number
    timestamp: number
  }[]
  errors: {
    message: string
    stack?: string
    timestamp: number
    url?: string
  }[]
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    apiCalls: [],
    pageLoads: [],
    errors: []
  }
  
  private observers: {
    intersectionObserver?: IntersectionObserver
    performanceObserver?: PerformanceObserver
  } = {}

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeObservers()
      this.trackPageLoad()
    }
  }

  // Track API call performance
  trackApiCall(url: string, startTime: number, success: boolean, cacheHit?: boolean) {
    const duration = Date.now() - startTime
    
    this.metrics.apiCalls.push({
      url,
      duration,
      timestamp: Date.now(),
      success,
      cacheHit
    })

    // Keep only last 50 API calls
    if (this.metrics.apiCalls.length > 50) {
      this.metrics.apiCalls = this.metrics.apiCalls.slice(-50)
    }

    // Log slow API calls
    if (duration > 3000) {
      console.warn(`Slow API call detected: ${url} took ${duration}ms`)
    }
  }

  // Track page load performance
  trackPageLoad() {
    if (typeof window === 'undefined') return

    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      const loadTime = navigation.loadEventEnd - navigation.loadEventStart

      this.metrics.pageLoads.push({
        page: window.location.pathname,
        loadTime,
        timestamp: Date.now()
      })

      // Keep only last 20 page loads
      if (this.metrics.pageLoads.length > 20) {
        this.metrics.pageLoads = this.metrics.pageLoads.slice(-20)
      }
    })
  }

  // Track errors
  trackError(error: Error, url?: string) {
    this.metrics.errors.push({
      message: error.message,
      stack: error.stack,
      timestamp: Date.now(),
      url
    })

    // Keep only last 30 errors
    if (this.metrics.errors.length > 30) {
      this.metrics.errors = this.metrics.errors.slice(-30)
    }
  }

  // Initialize performance observers
  private initializeObservers() {
    if (typeof window === 'undefined') return

    // Performance Observer for resource timing
    if ('PerformanceObserver' in window) {
      try {
        this.observers.performanceObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          
          entries.forEach((entry) => {
            // Track slow resources
            if (entry.duration > 1000) {
              console.warn(`Slow resource: ${entry.name} took ${entry.duration}ms`)
            }
          })
        })

        this.observers.performanceObserver.observe({ 
          entryTypes: ['resource', 'navigation', 'measure'] 
        })
      } catch (error) {
        console.warn('PerformanceObserver not supported:', error)
      }
    }

    // Intersection Observer for lazy loading optimization
    if ('IntersectionObserver' in window) {
      this.observers.intersectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // Element is visible, good for lazy loading tracking
              const element = entry.target as HTMLElement
              if (element.dataset.lazyLoad) {
                console.log('Lazy loaded element became visible:', element.dataset.lazyLoad)
              }
            }
          })
        },
        { threshold: 0.1 }
      )
    }
  }

  // Get performance summary
  getPerformanceSummary() {
    const now = Date.now()
    const last5Minutes = now - 5 * 60 * 1000

    // API calls in last 5 minutes
    const recentApiCalls = this.metrics.apiCalls.filter(call => call.timestamp > last5Minutes)
    const averageApiTime = recentApiCalls.length > 0
      ? recentApiCalls.reduce((sum, call) => sum + call.duration, 0) / recentApiCalls.length
      : 0

    // Cache hit rate
    const cacheHits = recentApiCalls.filter(call => call.cacheHit).length
    const cacheHitRate = recentApiCalls.length > 0 ? (cacheHits / recentApiCalls.length) * 100 : 0

    // Error rate
    const recentErrors = this.metrics.errors.filter(error => error.timestamp > last5Minutes)
    const errorRate = recentApiCalls.length > 0 
      ? (recentErrors.length / recentApiCalls.length) * 100 
      : 0

    return {
      apiCalls: {
        total: recentApiCalls.length,
        averageTime: Math.round(averageApiTime),
        cacheHitRate: Math.round(cacheHitRate),
        errorRate: Math.round(errorRate)
      },
      pageLoads: this.metrics.pageLoads.slice(-5),
      errors: recentErrors.length,
      timestamp: now
    }
  }

  // Get mobile-specific metrics
  getMobileMetrics() {
    if (typeof window === 'undefined') return null

    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection

    return {
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio
      },
      network: connection ? {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData
      } : null,
      memory: (performance as any).memory ? {
        usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
        totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
        jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit
      } : null,
      timing: performance.timing ? {
        pageLoadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
        domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
        firstPaint: performance.getEntriesByType('paint').find((entry: any) => entry.name === 'first-paint')?.startTime
      } : null
    }
  }

  // Check if device is likely mobile
  isMobileDevice() {
    if (typeof window === 'undefined') return false
    
    return window.innerWidth <= 768 || 
           /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  }

  // Optimize for mobile network conditions
  shouldReduceQuality() {
    if (typeof navigator === 'undefined') return false

    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection
    
    if (!connection) return false

    // Reduce quality on slow connections
    return connection.effectiveType === 'slow-2g' || 
           connection.effectiveType === '2g' ||
           connection.saveData === true
  }

  // Performance recommendations
  getRecommendations() {
    const summary = this.getPerformanceSummary()
    const mobileMetrics = getMobileMetrics()
    const recommendations: string[] = []

    // API performance recommendations
    if (summary.apiCalls.averageTime > 2000) {
      recommendations.push('API calls are slow. Consider optimizing endpoints or adding more caching.')
    }

    if (summary.apiCalls.cacheHitRate < 50) {
      recommendations.push('Low cache hit rate. Review caching strategy.')
    }

    if (summary.apiCalls.errorRate > 10) {
      recommendations.push('High API error rate. Check network stability and error handling.')
    }

    // Mobile-specific recommendations
    if (this.isMobileDevice()) {
      if (mobileMetrics?.viewport.width && mobileMetrics.viewport.width < 375) {
        recommendations.push('Very small screen detected. Ensure UI components are touch-friendly.')
      }

      if (this.shouldReduceQuality()) {
        recommendations.push('Slow network detected. Consider reducing image quality and data usage.')
      }

      if (mobileMetrics?.memory && mobileMetrics.memory.usedJSHeapSize > 50 * 1024 * 1024) {
        recommendations.push('High memory usage detected. Consider code splitting and lazy loading.')
      }
    }

    return recommendations
  }

  // Clean up observers
  cleanup() {
    if (this.observers.performanceObserver) {
      this.observers.performanceObserver.disconnect()
    }
    if (this.observers.intersectionObserver) {
      this.observers.intersectionObserver.disconnect()
    }
  }

  // Export metrics for debugging
  exportMetrics() {
    return {
      ...this.metrics,
      summary: this.getPerformanceSummary(),
      mobileMetrics: this.getMobileMetrics(),
      recommendations: this.getRecommendations()
    }
  }
}

// Global performance monitor instance
let performanceMonitor: PerformanceMonitor | null = null

export function getPerformanceMonitor(): PerformanceMonitor {
  if (!performanceMonitor) {
    performanceMonitor = new PerformanceMonitor()
  }
  return performanceMonitor
}

// Convenience functions
export function trackApiCall(url: string, startTime: number, success: boolean, cacheHit?: boolean) {
  getPerformanceMonitor().trackApiCall(url, startTime, success, cacheHit)
}

export function trackError(error: Error, url?: string) {
  getPerformanceMonitor().trackError(error, url)
}

export function getPerformanceSummary() {
  return getPerformanceMonitor().getPerformanceSummary()
}

export function getMobileMetrics() {
  return getPerformanceMonitor().getMobileMetrics()
}

export function isMobileDevice() {
  return getPerformanceMonitor().isMobileDevice()
}

export function shouldReduceQuality() {
  return getPerformanceMonitor().shouldReduceQuality()
}

// React hook for performance monitoring
export function usePerformanceMonitor() {
  const monitor = getPerformanceMonitor()
  
  return {
    trackApiCall: monitor.trackApiCall.bind(monitor),
    trackError: monitor.trackError.bind(monitor),
    getPerformanceSummary: monitor.getPerformanceSummary.bind(monitor),
    getMobileMetrics: monitor.getMobileMetrics.bind(monitor),
    isMobileDevice: monitor.isMobileDevice.bind(monitor),
    shouldReduceQuality: monitor.shouldReduceQuality.bind(monitor),
    getRecommendations: monitor.getRecommendations.bind(monitor)
  }
} 