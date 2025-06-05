'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, Home, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to monitoring service
    console.error('Global error caught:', error)
    
    // Report to analytics (if available)
    if (typeof window !== 'undefined' && (window as any).analytics) {
      (window as any).analytics.track('Error Occurred', {
        error: error.message,
        digest: error.digest,
        path: window.location.pathname,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      })
    }
  }, [error])

  const handleReportError = () => {
    // Open support channel or email
    const subject = encodeURIComponent(`Error Report: ${error.message}`)
    const body = encodeURIComponent(`
Error Details:
- Message: ${error.message}
- Digest: ${error.digest || 'N/A'}
- Path: ${window.location.pathname}
- Timestamp: ${new Date().toISOString()}
- User Agent: ${navigator.userAgent}

Please describe what you were doing when this error occurred:
[Your description here]
    `)
    window.open(`mailto:support@aurabnb.com?subject=${subject}&body=${body}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4"
            >
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </motion.div>
            
            <CardTitle className="text-2xl text-gray-900">
              Oops! Something went wrong
            </CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              We encountered an unexpected error. Don't worry, your data is safe and 
              we're here to help you get back on track.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Error details (collapsible) */}
            <details className="group">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 transition-colors">
                <span className="font-medium">Technical Details</span>
                <span className="ml-2 group-open:hidden">▶</span>
                <span className="ml-2 hidden group-open:inline">▼</span>
              </summary>
              <div className="mt-3 p-3 bg-gray-50 rounded-lg border text-sm font-mono text-gray-700 break-all">
                <div><strong>Error:</strong> {error.message}</div>
                {error.digest && (
                  <div className="mt-1"><strong>ID:</strong> {error.digest}</div>
                )}
              </div>
            </details>

            {/* Action buttons */}
            <div className="space-y-3">
              <Button 
                onClick={reset} 
                className="w-full" 
                size="lg"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/'}
                  className="flex items-center justify-center"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>

                <Button 
                  variant="outline"
                  onClick={handleReportError}
                  className="flex items-center justify-center"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Report
                </Button>
              </div>
            </div>

            {/* Help text */}
            <div className="text-center text-sm text-gray-500 border-t pt-4">
              <p>
                If this error persists, please try{' '}
                <button 
                  onClick={() => window.location.reload()}
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  refreshing the page
                </button>{' '}
                or contact our support team.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
} 