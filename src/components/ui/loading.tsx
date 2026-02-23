'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Loader2, Wallet, TrendingUp, BarChart3, Users } from 'lucide-react'

// Basic spinner component
export const Spinner = ({ 
  size = 'default', 
  className 
}: { 
  size?: 'sm' | 'default' | 'lg'
  className?: string 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    default: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  return (
    <Loader2 
      className={cn(
        'animate-spin',
        sizeClasses[size],
        className
      )} 
    />
  )
}

// Full page loading screen
export const PageLoader = ({ 
  message = 'Loading...', 
  progress,
  showProgress = false 
}: { 
  message?: string
  progress?: number
  showProgress?: boolean
}) => (
  <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
    <div className="text-center space-y-4">
      <div className="relative">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <Spinner size="lg" className="text-white" />
        </div>
        {showProgress && progress !== undefined && (
          <div className="absolute -bottom-2 left-0 right-0">
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div 
                className="bg-blue-500 h-1 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
      <div className="space-y-2">
        <p className="text-lg font-medium text-gray-900">{message}</p>
        {showProgress && progress !== undefined && (
          <p className="text-sm text-gray-600">{Math.round(progress)}% complete</p>
        )}
      </div>
    </div>
  </div>
)

// Skeleton components for different content types
export const SkeletonCard = ({ className }: { className?: string }) => (
  <div className={cn("animate-pulse", className)}>
    <div className="bg-gray-200 rounded-lg p-6 space-y-4">
      <div className="h-4 bg-gray-300 rounded w-3/4" />
      <div className="h-8 bg-gray-300 rounded w-1/2" />
      <div className="h-3 bg-gray-300 rounded w-2/3" />
    </div>
  </div>
)

export const SkeletonChart = ({ className }: { className?: string }) => (
  <div className={cn("animate-pulse bg-gray-200 rounded-lg", className)}>
    <div className="p-6 space-y-4">
      <div className="h-6 bg-gray-300 rounded w-1/3" />
      <div className="h-48 bg-gray-300 rounded" />
      <div className="flex space-x-4">
        <div className="h-4 bg-gray-300 rounded w-16" />
        <div className="h-4 bg-gray-300 rounded w-20" />
        <div className="h-4 bg-gray-300 rounded w-12" />
      </div>
    </div>
  </div>
)

export const SkeletonTable = ({ rows = 5, className }: { rows?: number, className?: string }) => (
  <div className={cn("animate-pulse space-y-3", className)}>
    {/* Header */}
    <div className="grid grid-cols-4 gap-4 p-4 border-b">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-4 bg-gray-300 rounded" />
      ))}
    </div>
    {/* Rows */}
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="grid grid-cols-4 gap-4 p-4">
        {[...Array(4)].map((_, j) => (
          <div key={j} className="h-4 bg-gray-200 rounded" />
        ))}
      </div>
    ))}
  </div>
)

export const SkeletonStats = ({ className }: { className?: string }) => (
  <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", className)}>
    {[
      { icon: Users, label: 'Community' },
      { icon: TrendingUp, label: 'Trading' },
      { icon: Wallet, label: 'Treasury' },
      { icon: BarChart3, label: 'Analytics' }
    ].map((item, i) => (
      <div key={i} className="animate-pulse">
        <div className="bg-gray-200 rounded-lg p-6 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-300 rounded-lg flex items-center justify-center">
              <item.icon className="w-6 h-6 text-gray-400" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-300 rounded w-2/3" />
              <div className="h-6 bg-gray-300 rounded w-1/2" />
            </div>
          </div>
          <div className="h-3 bg-gray-300 rounded w-1/3" />
        </div>
      </div>
    ))}
  </div>
)

// Loading states for specific components
export const WalletLoadingState = () => (
  <div className="animate-pulse flex items-center space-x-3 bg-gray-100 rounded-full px-4 py-2">
    <div className="w-3 h-3 bg-gray-300 rounded-full" />
    <div className="h-4 bg-gray-300 rounded w-24" />
  </div>
)

export const ButtonLoadingState = ({ 
  children, 
  loading, 
  className,
  ...props 
}: { 
  children: React.ReactNode
  loading: boolean
  className?: string
  [key: string]: any
}) => (
  <button 
    className={cn(
      "flex items-center justify-center space-x-2",
      loading && "opacity-75 cursor-not-allowed",
      className
    )}
    disabled={loading}
    {...props}
  >
    {loading && <Spinner size="sm" />}
    <span>{children}</span>
  </button>
)

// Progressive loading with phases
export const ProgressiveLoader = ({
  phases,
  currentPhase,
  className
}: {
  phases: string[]
  currentPhase: number
  className?: string
}) => (
  <div className={cn("space-y-4", className)}>
    <div className="flex items-center justify-center">
      <Spinner size="lg" className="text-blue-600" />
    </div>
    
    <div className="space-y-2">
      {phases.map((phase, index) => (
        <div key={index} className="flex items-center space-x-3">
          <div className={cn(
            "w-4 h-4 rounded-full flex items-center justify-center text-xs",
            index < currentPhase ? "bg-green-500 text-white" :
            index === currentPhase ? "bg-blue-500 text-white animate-pulse" :
            "bg-gray-200 text-gray-500"
          )}>
            {index < currentPhase ? '✓' : index + 1}
          </div>
          <span className={cn(
            "text-sm",
            index === currentPhase ? "text-blue-600 font-medium" :
            index < currentPhase ? "text-green-600" :
            "text-gray-500"
          )}>
            {phase}
          </span>
        </div>
      ))}
    </div>
  </div>
)

// Shimmer effect for images
export const ImageSkeleton = ({ 
  className,
  aspectRatio = 'aspect-video'
}: { 
  className?: string
  aspectRatio?: string
}) => (
  <div className={cn(
    "animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded-lg",
    aspectRatio,
    className
  )} />
)

// Pulse animation for text
export const TextSkeleton = ({ 
  lines = 1, 
  className 
}: { 
  lines?: number
  className?: string 
}) => (
  <div className={cn("animate-pulse space-y-2", className)}>
    {[...Array(lines)].map((_, i) => (
      <div 
        key={i} 
        className={cn(
          "h-4 bg-gray-200 rounded",
          i === lines - 1 ? "w-3/4" : "w-full"
        )} 
      />
    ))}
  </div>
)

// Loading overlay for existing content
export const LoadingOverlay = ({ 
  loading, 
  children, 
  message = 'Loading...',
  className
}: {
  loading: boolean
  children: React.ReactNode
  message?: string
  className?: string
}) => (
  <div className={cn("relative", className)}>
    {children}
    {loading && (
      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
        <div className="text-center space-y-2">
          <Spinner size="lg" className="text-blue-600" />
          <p className="text-sm text-gray-600">{message}</p>
        </div>
      </div>
    )}
  </div>
)

// Loading hook for managing loading states
export const useLoading = (initialState = false) => {
  const [loading, setLoading] = React.useState(initialState)
  const [message, setMessage] = React.useState<string>()
  const [progress, setProgress] = React.useState<number>()

  const startLoading = React.useCallback((msg?: string) => {
    setLoading(true)
    setMessage(msg)
    setProgress(undefined)
  }, [])

  const stopLoading = React.useCallback(() => {
    setLoading(false)
    setMessage(undefined)
    setProgress(undefined)
  }, [])

  const updateProgress = React.useCallback((value: number, msg?: string) => {
    setProgress(value)
    if (msg) setMessage(msg)
  }, [])

  return {
    loading,
    message,
    progress,
    startLoading,
    stopLoading,
    updateProgress,
    setLoading,
    setMessage,
    setProgress
  }
} 