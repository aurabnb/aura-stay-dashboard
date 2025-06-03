'use client'

import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown, ChevronUp, Menu, X } from 'lucide-react'

// Mobile-optimized Card component with touch interactions
interface MobileCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  pressable?: boolean
  onPress?: () => void
}

export function MobileCard({ 
  children, 
  className, 
  pressable = false, 
  onPress,
  ...props 
}: MobileCardProps) {
  const [isPressed, setIsPressed] = useState(false)

  return (
    <div
      className={cn(
        'bg-white rounded-lg border border-gray-200 shadow-sm',
        'transition-all duration-150 ease-out',
        pressable && 'cursor-pointer active:scale-[0.98] hover:shadow-md',
        isPressed && 'scale-[0.98] shadow-lg',
        className
      )}
      onTouchStart={() => pressable && setIsPressed(true)}
      onTouchEnd={() => {
        setIsPressed(false)
        onPress?.()
      }}
      onMouseDown={() => pressable && setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onClick={onPress}
      {...props}
    >
      {children}
    </div>
  )
}

// Mobile-optimized collapsible component
interface MobileCollapsibleProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  className?: string
}

export function MobileCollapsible({ 
  title, 
  children, 
  defaultOpen = false, 
  className 
}: MobileCollapsibleProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const contentRef = useRef<HTMLDivElement>(null)

  return (
    <div className={cn('border border-gray-200 rounded-lg overflow-hidden', className)}>
      <button
        className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 active:bg-gray-200 
                   flex items-center justify-between text-left font-medium transition-colors
                   touch-manipulation"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{title}</span>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-500" />
        )}
      </button>
      
      <div
        ref={contentRef}
        className={cn(
          'overflow-hidden transition-all duration-300 ease-in-out',
          isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  )
}

// Mobile-optimized navigation drawer
interface MobileDrawerProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
}

export function MobileDrawer({ isOpen, onClose, children, title }: MobileDrawerProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={cn(
        'fixed left-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-xl',
        'transform transition-transform duration-300 ease-out',
        'flex flex-col',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {title && <h2 className="text-lg font-semibold">{title}</h2>}
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  )
}

// Mobile-optimized tabs component
interface MobileTabsProps {
  tabs: Array<{ id: string; label: string; content: React.ReactNode }>
  defaultTab?: string
  className?: string
}

export function MobileTabs({ tabs, defaultTab, className }: MobileTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id)

  return (
    <div className={cn('w-full', className)}>
      {/* Tab buttons - horizontal scroll on mobile */}
      <div className="border-b border-gray-200 overflow-x-auto">
        <div className="flex space-x-1 min-w-max px-4 lg:px-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors',
                'border-b-2 -mb-px touch-manipulation',
                activeTab === tab.id
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Tab content */}
      <div className="mt-4">
        {tabs.find(tab => tab.id === activeTab)?.content}
      </div>
    </div>
  )
}

// Mobile-optimized grid component
interface MobileGridProps {
  children: React.ReactNode
  cols?: {
    default?: number
    sm?: number
    md?: number
    lg?: number
  }
  gap?: number
  className?: string
}

export function MobileGrid({ 
  children, 
  cols = { default: 1, sm: 2, md: 3, lg: 4 }, 
  gap = 4, 
  className 
}: MobileGridProps) {
  const gridClasses = cn(
    'grid w-full',
    `gap-${gap}`,
    cols.default && `grid-cols-${cols.default}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    className
  )

  return (
    <div className={gridClasses}>
      {children}
    </div>
  )
}

// Mobile-optimized loading skeleton
interface MobileSkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  animation?: 'pulse' | 'wave'
}

export function MobileSkeleton({ 
  className, 
  variant = 'rectangular', 
  animation = 'pulse' 
}: MobileSkeletonProps) {
  return (
    <div
      className={cn(
        'bg-gray-200',
        animation === 'pulse' && 'animate-pulse',
        animation === 'wave' && 'animate-pulse', // Can add wave animation later
        variant === 'text' && 'h-4 rounded',
        variant === 'circular' && 'rounded-full',
        variant === 'rectangular' && 'rounded',
        className
      )}
    />
  )
}

// Mobile-optimized button with touch feedback
interface MobileButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: React.ReactNode
}

export function MobileButton({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  className,
  disabled,
  ...props
}: MobileButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-150 ease-out touch-manipulation active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100'
  
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-sm',
    secondary: 'bg-gray-600 hover:bg-gray-700 active:bg-gray-800 text-white shadow-sm',
    outline: 'border border-gray-300 hover:bg-gray-50 active:bg-gray-100 text-gray-700',
    ghost: 'hover:bg-gray-100 active:bg-gray-200 text-gray-700'
  }
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm rounded-md min-h-[36px]',
    md: 'px-4 py-2.5 text-sm rounded-lg min-h-[44px]',
    lg: 'px-6 py-3 text-base rounded-lg min-h-[48px]'
  }

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : null}
      {children}
    </button>
  )
}

// Mobile-optimized input component
interface MobileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

export function MobileInput({ 
  label, 
  error, 
  icon, 
  className, 
  ...props 
}: MobileInputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        
        <input
          className={cn(
            'w-full px-4 py-3 border border-gray-300 rounded-lg',
            'focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
            'text-base', // Prevents zoom on iOS
            'transition-colors duration-150',
            icon && 'pl-10',
            error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
            className
          )}
          {...props}
        />
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}

// Mobile-optimized bottom sheet
interface MobileBottomSheetProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  height?: 'auto' | 'half' | 'full'
}

export function MobileBottomSheet({ 
  isOpen, 
  onClose, 
  children, 
  title, 
  height = 'auto' 
}: MobileBottomSheetProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragY, setDragY] = useState(0)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const heightClasses = {
    auto: 'max-h-[90vh]',
    half: 'h-1/2',
    full: 'h-full'
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Bottom sheet */}
      <div className={cn(
        'fixed bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-xl',
        'transform transition-transform duration-300 ease-out',
        'flex flex-col',
        heightClasses[height],
        isOpen ? 'translate-y-0' : 'translate-y-full'
      )}>
        {/* Drag handle */}
        <div className="flex justify-center py-3">
          <div className="w-8 h-1 bg-gray-300 rounded-full" />
        </div>
        
        {/* Header */}
        {title && (
          <div className="px-4 pb-3 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-center">{title}</h2>
          </div>
        )}
        
        {/* Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  )
} 