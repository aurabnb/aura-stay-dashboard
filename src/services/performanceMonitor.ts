// Performance monitoring service for AuraBNB
export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  url: string;
  userAgent: string;
  connection?: string;
}

export interface ApiMetric {
  endpoint: string;
  method: string;
  duration: number;
  status: number;
  timestamp: number;
  success: boolean;
}

export interface UserInteractionMetric {
  action: string;
  component: string;
  duration?: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private apiMetrics: ApiMetric[] = [];
  private userMetrics: UserInteractionMetric[] = [];
  private isEnabled: boolean;
  private sendInterval: number = 30000; // 30 seconds
  private maxMetrics: number = 100;

  constructor() {
    this.isEnabled = this.shouldEnableMonitoring();
    this.initializePerformanceObserver();
    this.setupAutoSend();
  }

  private shouldEnableMonitoring(): boolean {
    // Enable in production or when explicitly enabled
    return process.env.NODE_ENV === 'production' || 
           localStorage.getItem('aura_enable_monitoring') === 'true';
  }

  private initializePerformanceObserver() {
    if (!this.isEnabled || typeof window === 'undefined') return;

    try {
      // Monitor Core Web Vitals
      if ('PerformanceObserver' in window) {
        // Largest Contentful Paint (LCP)
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            this.recordMetric({
              name: 'LCP',
              value: entry.startTime,
              timestamp: Date.now(),
              url: window.location.href,
              userAgent: navigator.userAgent,
              connection: this.getConnectionType()
            });
          });
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay (FID)
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            this.recordMetric({
              name: 'FID',
              value: entry.processingStart - entry.startTime,
              timestamp: Date.now(),
              url: window.location.href,
              userAgent: navigator.userAgent,
              connection: this.getConnectionType()
            });
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // Cumulative Layout Shift (CLS)
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          
          if (clsValue > 0) {
            this.recordMetric({
              name: 'CLS',
              value: clsValue,
              timestamp: Date.now(),
              url: window.location.href,
              userAgent: navigator.userAgent,
              connection: this.getConnectionType()
            });
          }
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      }

      // Monitor page load performance
      window.addEventListener('load', () => {
        setTimeout(() => {
          const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          
          this.recordMetric({
            name: 'Page_Load_Time',
            value: perfData.loadEventEnd - perfData.navigationStart,
            timestamp: Date.now(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            connection: this.getConnectionType()
          });

          this.recordMetric({
            name: 'DNS_Lookup_Time',
            value: perfData.domainLookupEnd - perfData.domainLookupStart,
            timestamp: Date.now(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            connection: this.getConnectionType()
          });

          this.recordMetric({
            name: 'TCP_Connection_Time',
            value: perfData.connectEnd - perfData.connectStart,
            timestamp: Date.now(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            connection: this.getConnectionType()
          });
        }, 0);
      });

    } catch (error) {
      console.warn('Performance monitoring setup failed:', error);
    }
  }

  private getConnectionType(): string {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    return connection?.effectiveType || 'unknown';
  }

  private setupAutoSend() {
    if (!this.isEnabled) return;
    
    setInterval(() => {
      this.sendMetrics();
    }, this.sendInterval);

    // Send metrics before page unload
    window.addEventListener('beforeunload', () => {
      this.sendMetrics(true);
    });
  }

  // Record a performance metric
  public recordMetric(metric: PerformanceMetric) {
    if (!this.isEnabled) return;

    this.metrics.push(metric);
    
    // Keep metrics array size manageable
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  // Monitor API calls
  public trackApiCall(endpoint: string, method: string, duration: number, status: number) {
    if (!this.isEnabled) return;

    const metric: ApiMetric = {
      endpoint,
      method,
      duration,
      status,
      timestamp: Date.now(),
      success: status >= 200 && status < 300
    };

    this.apiMetrics.push(metric);

    // Keep metrics array size manageable
    if (this.apiMetrics.length > this.maxMetrics) {
      this.apiMetrics = this.apiMetrics.slice(-this.maxMetrics);
    }
  }

  // Track user interactions
  public trackUserInteraction(action: string, component: string, metadata?: Record<string, any>) {
    if (!this.isEnabled) return;

    const metric: UserInteractionMetric = {
      action,
      component,
      timestamp: Date.now(),
      metadata
    };

    this.userMetrics.push(metric);

    // Keep metrics array size manageable
    if (this.userMetrics.length > this.maxMetrics) {
      this.userMetrics = this.userMetrics.slice(-this.maxMetrics);
    }
  }

  // Send metrics to analytics service
  private async sendMetrics(isBeforeUnload = false) {
    if (!this.isEnabled || this.metrics.length === 0) return;

    const payload = {
      performance: [...this.metrics],
      api: [...this.apiMetrics],
      userInteractions: [...this.userMetrics],
      timestamp: Date.now(),
      sessionId: this.getSessionId(),
      userId: localStorage.getItem('aura_user_id') || 'anonymous'
    };

    try {
      if (isBeforeUnload && 'sendBeacon' in navigator) {
        // Use sendBeacon for more reliable sending during page unload
        navigator.sendBeacon('/api/analytics/performance', JSON.stringify(payload));
      } else {
        // Use fetch for regular sends
        await fetch('/api/analytics/performance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      }

      // Clear sent metrics
      this.metrics = [];
      this.apiMetrics = [];
      this.userMetrics = [];
    } catch (error) {
      console.warn('Failed to send performance metrics:', error);
    }
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('aura_session_id');
    if (!sessionId) {
      sessionId = Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('aura_session_id', sessionId);
    }
    return sessionId;
  }

  // Get current performance summary
  public getPerformanceSummary() {
    return {
      totalMetrics: this.metrics.length,
      totalApiCalls: this.apiMetrics.length,
      totalUserInteractions: this.userMetrics.length,
      averageApiResponseTime: this.apiMetrics.length > 0 
        ? this.apiMetrics.reduce((sum, metric) => sum + metric.duration, 0) / this.apiMetrics.length 
        : 0,
      apiSuccessRate: this.apiMetrics.length > 0
        ? (this.apiMetrics.filter(m => m.success).length / this.apiMetrics.length) * 100
        : 100
    };
  }

  // Enable/disable monitoring
  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    localStorage.setItem('aura_enable_monitoring', enabled.toString());
  }
}

// Create global instance
export const performanceMonitor = new PerformanceMonitor();

// Helper function to wrap API calls with performance tracking
export const trackApiCall = async <T>(
  endpoint: string,
  apiCall: () => Promise<T>,
  method: string = 'GET'
): Promise<T> => {
  const startTime = performance.now();
  let status = 200;
  
  try {
    const result = await apiCall();
    return result;
  } catch (error: any) {
    status = error.status || 500;
    throw error;
  } finally {
    const duration = performance.now() - startTime;
    performanceMonitor.trackApiCall(endpoint, method, duration, status);
  }
};

// Hook for React components to track user interactions
export const usePerformanceTracking = () => {
  const trackInteraction = (action: string, component: string, metadata?: Record<string, any>) => {
    performanceMonitor.trackUserInteraction(action, component, metadata);
  };

  const trackComponentMount = (componentName: string) => {
    trackInteraction('component_mount', componentName);
  };

  const trackButtonClick = (buttonName: string, component: string) => {
    trackInteraction('button_click', component, { buttonName });
  };

  const trackPageView = (pageName: string) => {
    trackInteraction('page_view', 'router', { pageName });
  };

  return {
    trackInteraction,
    trackComponentMount,
    trackButtonClick,
    trackPageView,
    getPerformanceSummary: () => performanceMonitor.getPerformanceSummary()
  };
};

// Export for global access
export default performanceMonitor; 