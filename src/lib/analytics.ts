// ============================================================================
// ANALYTICS SYSTEM FOR AURA STAY DASHBOARD
// ============================================================================

interface AnalyticsEvent {
  name: string
  properties?: Record<string, any>
  timestamp?: number
  userId?: string
  sessionId?: string
  metadata?: Record<string, any>
}

interface UserProperties {
  userId?: string
  walletAddress?: string
  userType?: 'new' | 'returning' | 'premium'
  registrationDate?: string
  lastLoginDate?: string
  preferences?: Record<string, any>
}

interface PerformanceMetrics {
  pageLoadTime: number
  timeToInteractive: number
  largestContentfulPaint: number
  firstInputDelay: number
  cumulativeLayoutShift: number
  connectionType?: string
  deviceType?: string
}

interface BusinessMetrics {
  totalStaked: number
  totalRewards: number
  transactionVolume: number
  activeUsers: number
  conversionRate: number
  retention: {
    day1: number
    day7: number
    day30: number
  }
}

// ============================================================================
// ANALYTICS CLIENT
// ============================================================================

class AnalyticsClient {
  private isInitialized = false
  private userId?: string
  private sessionId: string
  private queue: AnalyticsEvent[] = []
  private batchSize = 10
  private flushInterval = 30000 // 30 seconds
  private isDebugMode = false

  constructor() {
    this.sessionId = this.generateSessionId()
    this.isDebugMode = process.env.NODE_ENV === 'development'
    
    if (typeof window !== 'undefined') {
      this.init()
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private init(): void {
    if (this.isInitialized) return

    // Set up automatic flushing
    setInterval(() => {
      this.flush()
    }, this.flushInterval)

    // Flush on page unload
    window.addEventListener('beforeunload', () => {
      this.flush(true)
    })

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      this.track('page_visibility_change', {
        visible: !document.hidden,
        timestamp: Date.now()
      })
    })

    this.isInitialized = true
    this.log('Analytics initialized')
  }

  private log(message: string, data?: any): void {
    if (this.isDebugMode) {
      console.log(`[Analytics] ${message}`, data)
    }
  }

  // ============================================================================
  // EVENT TRACKING
  // ============================================================================

  track(eventName: string, properties?: Record<string, any>): void {
    const event: AnalyticsEvent = {
      name: eventName,
      properties: {
        ...properties,
        url: window.location.href,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      timestamp: Date.now(),
      userId: this.userId,
      sessionId: this.sessionId,
      metadata: {
        platform: 'web',
        version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      }
    }

    this.queue.push(event)
    this.log('Event tracked', event)

    // Auto-flush if queue is full
    if (this.queue.length >= this.batchSize) {
      this.flush()
    }
  }

  identify(userId: string, properties?: UserProperties): void {
    this.userId = userId
    this.track('user_identified', {
      userId,
      ...properties
    })
    this.log('User identified', { userId, properties })
  }

  page(name?: string, properties?: Record<string, any>): void {
    this.track('page_view', {
      pageName: name || document.title,
      path: window.location.pathname,
      search: window.location.search,
      ...properties
    })
  }

  // ============================================================================
  // BUSINESS METRICS
  // ============================================================================

  // Wallet & Finance Tracking
  trackWalletConnection(walletType: string, success: boolean): void {
    this.track('wallet_connection', {
      walletType,
      success,
      timestamp: Date.now()
    })
  }

  trackTransaction(type: 'stake' | 'unstake' | 'swap' | 'claim', details: any): void {
    this.track('transaction', {
      type,
      amount: details.amount,
      token: details.token,
      success: details.success,
      txHash: details.txHash,
      fee: details.fee,
      timestamp: Date.now()
    })
  }

  trackStaking(action: 'stake' | 'unstake' | 'claim', amount: string, poolId?: string): void {
    this.track('staking_action', {
      action,
      amount: parseFloat(amount),
      poolId,
      timestamp: Date.now()
    })
  }

  trackSwap(fromToken: string, toToken: string, amount: string, success: boolean): void {
    this.track('swap', {
      fromToken,
      toToken,
      amount: parseFloat(amount),
      success,
      timestamp: Date.now()
    })
  }

  // User Engagement
  trackFeatureUsage(feature: string, duration?: number): void {
    this.track('feature_usage', {
      feature,
      duration,
      timestamp: Date.now()
    })
  }

  trackError(error: string, context?: string, severity?: 'low' | 'medium' | 'high'): void {
    this.track('error', {
      error,
      context,
      severity: severity || 'medium',
      timestamp: Date.now()
    })
  }

  trackConversion(funnel: string, step: string, success: boolean): void {
    this.track('conversion', {
      funnel,
      step,
      success,
      timestamp: Date.now()
    })
  }

  // ============================================================================
  // PERFORMANCE TRACKING
  // ============================================================================

  trackPerformance(metrics: Partial<PerformanceMetrics>): void {
    this.track('performance', {
      ...metrics,
      timestamp: Date.now()
    })
  }

  measurePageLoad(): void {
    if (typeof window === 'undefined') return

    window.addEventListener('load', () => {
      // Use Navigation Timing API
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      
      if (navigation) {
        const metrics = {
          pageLoadTime: navigation.loadEventEnd - navigation.fetchStart,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
          timeToFirstByte: navigation.responseStart - navigation.requestStart,
          domProcessing: navigation.domComplete - (navigation as any).domLoading,
          resourceLoadTime: navigation.loadEventEnd - navigation.domContentLoadedEventEnd
        }

        this.trackPerformance(metrics)
      }

      // Measure Web Vitals
      this.measureWebVitals()
    })
  }

  private measureWebVitals(): void {
    // Largest Contentful Paint
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      this.trackPerformance({
        largestContentfulPaint: lastEntry.startTime
      })
    }).observe({ entryTypes: ['largest-contentful-paint'] })

    // First Input Delay
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry: any) => {
        this.trackPerformance({
          firstInputDelay: entry.processingStart - entry.startTime
        })
      })
    }).observe({ entryTypes: ['first-input'] })

    // Cumulative Layout Shift
    let clsValue = 0
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value
        }
      }
      this.trackPerformance({
        cumulativeLayoutShift: clsValue
      })
    }).observe({ entryTypes: ['layout-shift'] })
  }

  // ============================================================================
  // A/B TESTING
  // ============================================================================

  trackExperiment(experimentId: string, variant: string, converted?: boolean): void {
    this.track('experiment', {
      experimentId,
      variant,
      converted: converted || false,
      timestamp: Date.now()
    })
  }

  getExperimentVariant(experimentId: string): string {
    // Simple hash-based assignment
    const hash = this.simpleHash(this.sessionId + experimentId)
    return hash % 2 === 0 ? 'A' : 'B'
  }

  private simpleHash(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    return Math.abs(hash)
  }

  // ============================================================================
  // HEATMAP & SESSION RECORDING
  // ============================================================================

  trackClick(element: string, position?: { x: number; y: number }): void {
    this.track('click', {
      element,
      position,
      timestamp: Date.now()
    })
  }

  trackScroll(depth: number): void {
    this.track('scroll', {
      depth,
      maxDepth: Math.max(depth, this.getScrollDepth()),
      timestamp: Date.now()
    })
  }

  private getScrollDepth(): number {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const docHeight = document.documentElement.scrollHeight - window.innerHeight
    return Math.round((scrollTop / docHeight) * 100)
  }

  startSessionRecording(): void {
    // Placeholder for session recording implementation
    this.track('session_recording_started', {
      timestamp: Date.now()
    })
  }

  // ============================================================================
  // DATA EXPORT & FLUSHING
  // ============================================================================

  async flush(immediate = false): Promise<void> {
    if (this.queue.length === 0) return

    const events = [...this.queue]
    this.queue = []

    try {
      if (immediate && navigator.sendBeacon) {
        // Use sendBeacon for reliable delivery on page unload
        navigator.sendBeacon('/api/analytics', JSON.stringify({ events }))
      } else {
        // Regular fetch for normal operations
        await fetch('/api/analytics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ events }),
        })
      }

      this.log(`Flushed ${events.length} events`)
    } catch (error) {
      console.error('Failed to send analytics:', error)
      // Re-queue events on failure
      this.queue.unshift(...events)
    }
  }

  getQueueSize(): number {
    return this.queue.length
  }

  clearQueue(): void {
    this.queue = []
    this.log('Queue cleared')
  }

  // ============================================================================
  // UTILITIES
  // ============================================================================

  setUserId(userId: string): void {
    this.userId = userId
  }

  getUserId(): string | undefined {
    return this.userId
  }

  getSessionId(): string {
    return this.sessionId
  }

  isEnabled(): boolean {
    return this.isInitialized && typeof window !== 'undefined'
  }
}

// ============================================================================
// GLOBAL ANALYTICS INSTANCE
// ============================================================================

export const analytics = new AnalyticsClient()

// ============================================================================
// REACT HOOKS FOR ANALYTICS
// ============================================================================

import React, { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Hook to track page views automatically
 */
export function usePageTracking(): void {
  const router = useRouter()

  useEffect(() => {
    analytics.measurePageLoad()
    analytics.page()

    // Track route changes (for SPA navigation)
    const handleRouteChange = () => {
      analytics.page()
    }

    // Note: Next.js 13+ app router doesn't have router events
    // You might need to implement this differently based on your routing setup
    
    return () => {
      analytics.flush()
    }
  }, [router])
}

/**
 * Hook to track feature usage
 */
export function useFeatureTracking(featureName: string): {
  trackUsage: (duration?: number) => void
  trackError: (error: string) => void
} {
  const trackUsage = useCallback((duration?: number) => {
    analytics.trackFeatureUsage(featureName, duration)
  }, [featureName])

  const trackError = useCallback((error: string) => {
    analytics.trackError(error, featureName)
  }, [featureName])

  return { trackUsage, trackError }
}

/**
 * Hook to track user interactions
 */
export function useInteractionTracking(): {
  trackClick: (element: string) => void
  trackInput: (field: string, value?: any) => void
  trackFormSubmit: (form: string, success: boolean) => void
} {
  const trackClick = useCallback((element: string) => {
    analytics.track('interaction', {
      type: 'click',
      element,
      timestamp: Date.now()
    })
  }, [])

  const trackInput = useCallback((field: string, value?: any) => {
    analytics.track('interaction', {
      type: 'input',
      field,
      hasValue: !!value,
      timestamp: Date.now()
    })
  }, [])

  const trackFormSubmit = useCallback((form: string, success: boolean) => {
    analytics.track('interaction', {
      type: 'form_submit',
      form,
      success,
      timestamp: Date.now()
    })
  }, [])

  return { trackClick, trackInput, trackFormSubmit }
}

// ============================================================================
// PERFORMANCE MONITORING
// ============================================================================

export function measureComponentRender<T extends Record<string, any>>(
  componentName: string,
  Component: React.ComponentType<T>
): React.ComponentType<T> {
  return function MeasuredComponent(props: T) {
    useEffect(() => {
      const startTime = performance.now()
      
      return () => {
        const endTime = performance.now()
        analytics.track('component_render', {
          component: componentName,
          renderTime: endTime - startTime,
          timestamp: Date.now()
        })
      }
    }, [])

    return React.createElement(Component, props)
  }
}

// ============================================================================
// BUSINESS INTELLIGENCE HELPERS
// ============================================================================

export const BusinessMetricsTracker = {
  trackRevenue(amount: number, currency: string = 'USD'): void {
    analytics.track('revenue', {
      amount,
      currency,
      timestamp: Date.now()
    })
  },

  trackUserRegistration(method: string, success: boolean): void {
    analytics.track('user_registration', {
      method,
      success,
      timestamp: Date.now()
    })
  },

  trackSubscription(plan: string, action: 'subscribe' | 'unsubscribe' | 'upgrade' | 'downgrade'): void {
    analytics.track('subscription', {
      plan,
      action,
      timestamp: Date.now()
    })
  },

  trackRetention(daysSinceFirstVisit: number): void {
    analytics.track('retention', {
      daysSinceFirstVisit,
      timestamp: Date.now()
    })
  }
}

// ============================================================================
// ANALYTICS CONFIGURATION
// ============================================================================

export interface AnalyticsConfig {
  enabled: boolean
  batchSize: number
  flushInterval: number
  enablePerformanceTracking: boolean
  enableErrorTracking: boolean
  enableHeatmaps: boolean
  samplingRate: number
}

export const defaultConfig: AnalyticsConfig = {
  enabled: process.env.NODE_ENV === 'production',
  batchSize: 10,
  flushInterval: 30000,
  enablePerformanceTracking: true,
  enableErrorTracking: true,
  enableHeatmaps: false,
  samplingRate: 1.0
}

export function configureAnalytics(config: Partial<AnalyticsConfig>): void {
  // Apply configuration to analytics instance
  Object.assign(defaultConfig, config)
}

// ============================================================================
// EXPORTS
// ============================================================================

export default analytics

export {
  AnalyticsClient,
  type AnalyticsEvent,
  type UserProperties,
  type PerformanceMetrics,
  type BusinessMetrics
} 