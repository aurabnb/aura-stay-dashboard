'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  X, 
  Bell,
  Volume2,
  VolumeX
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// Notification types
export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  duration?: number
  persistent?: boolean
  actions?: NotificationAction[]
  timestamp: Date
  sound?: boolean
}

export interface NotificationAction {
  label: string
  action: () => void
  variant?: 'default' | 'destructive' | 'outline'
}

interface NotificationContextType {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => string
  removeNotification: (id: string) => void
  clearAll: () => void
  updatePreferences: (preferences: NotificationPreferences) => void
  preferences: NotificationPreferences
}

export interface NotificationPreferences {
  enabled: boolean
  soundEnabled: boolean
  showOnWalletEvents: boolean
  showOnTransactions: boolean
  showOnErrors: boolean
  showOnGovernance: boolean
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  maxNotifications: number
}

const defaultPreferences: NotificationPreferences = {
  enabled: true,
  soundEnabled: true,
  showOnWalletEvents: true,
  showOnTransactions: true,
  showOnErrors: true,
  showOnGovernance: true,
  position: 'top-right',
  maxNotifications: 5
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

// Notification Provider Component
export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [preferences, setPreferences] = useState<NotificationPreferences>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aura_notification_preferences')
      return saved ? { ...defaultPreferences, ...JSON.parse(saved) } : defaultPreferences
    }
    return defaultPreferences
  })

  // Save preferences to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('aura_notification_preferences', JSON.stringify(preferences))
    }
  }, [preferences])

  // Auto-remove notifications after duration
  useEffect(() => {
    const timers: NodeJS.Timeout[] = []

    notifications.forEach((notification) => {
      if (!notification.persistent && notification.duration !== 0) {
        const duration = notification.duration || 5000
        const timer = setTimeout(() => {
          removeNotification(notification.id)
        }, duration)
        timers.push(timer)
      }
    })

    return () => timers.forEach(timer => clearTimeout(timer))
  }, [notifications])

  const addNotification = (notificationData: Omit<Notification, 'id' | 'timestamp'>): string => {
    if (!preferences.enabled) return ''

    const id = Math.random().toString(36).substr(2, 9)
    const notification: Notification = {
      ...notificationData,
      id,
      timestamp: new Date(),
      sound: notificationData.sound ?? preferences.soundEnabled
    }

    // Play notification sound
    if (notification.sound && preferences.soundEnabled) {
      playNotificationSound(notification.type)
    }

    setNotifications(prev => {
      const newNotifications = [notification, ...prev]
      // Limit number of notifications
      return newNotifications.slice(0, preferences.maxNotifications)
    })

    return id
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }

  const clearAll = () => {
    setNotifications([])
  }

  const updatePreferences = (newPreferences: NotificationPreferences) => {
    setPreferences(newPreferences)
  }

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      clearAll,
      updatePreferences,
      preferences
    }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  )
}

// Notification Container Component
function NotificationContainer() {
  const { notifications, preferences } = useNotifications()

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  }

  return (
    <div className={cn(
      'fixed z-50 flex flex-col space-y-2 w-full max-w-sm',
      positionClasses[preferences.position]
    )}>
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <NotificationToast
            key={notification.id}
            notification={notification}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

// Individual Notification Toast Component
function NotificationToast({ notification }: { notification: Notification }) {
  const { removeNotification } = useNotifications()

  const iconMap = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info
  }

  const colorMap = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  }

  const iconColorMap = {
    success: 'text-green-600',
    error: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600'
  }

  const Icon = iconMap[notification.type]

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        'bg-white border rounded-lg shadow-lg p-4 backdrop-blur-sm',
        colorMap[notification.type]
      )}
    >
      <div className="flex items-start space-x-3">
        <Icon className={cn('w-5 h-5 mt-0.5 flex-shrink-0', iconColorMap[notification.type])} />
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{notification.title}</p>
          <p className="text-sm opacity-90 mt-1">{notification.message}</p>
          
          {/* Actions */}
          {notification.actions && notification.actions.length > 0 && (
            <div className="flex space-x-2 mt-3">
              {notification.actions.map((action, index) => (
                <Button
                  key={index}
                  size="sm"
                  variant={action.variant || 'default'}
                  onClick={() => {
                    action.action()
                    removeNotification(notification.id)
                  }}
                  className="text-xs"
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Close button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => removeNotification(notification.id)}
          className="flex-shrink-0 h-6 w-6 p-0 opacity-70 hover:opacity-100"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Progress bar for non-persistent notifications */}
      {!notification.persistent && notification.duration !== 0 && (
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-current opacity-30 rounded-b-lg"
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: (notification.duration || 5000) / 1000, ease: "linear" }}
        />
      )}
    </motion.div>
  )
}

// Custom hook for using notifications
export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

// Notification sound utility
function playNotificationSound(type: NotificationType) {
  if (typeof window === 'undefined') return

  try {
    // Create audio context for better browser support
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    
    // Different frequencies for different notification types
    const frequencies = {
      success: [523.25, 659.25, 783.99], // C5, E5, G5 (major chord)
      error: [523.25, 466.16], // C5, Bb4 (dissonant)
      warning: [523.25, 523.25], // C5, C5 (repeated)
      info: [523.25] // C5 (single tone)
    }

    const freq = frequencies[type]
    
    freq.forEach((frequency, index) => {
      setTimeout(() => {
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)
        oscillator.type = 'sine'

        gainNode.gain.setValueAtTime(0, audioContext.currentTime)
        gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01)
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2)

        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.2)
      }, index * 100)
    })
  } catch (error) {
    // Fallback for browsers without Web Audio API
    console.warn('Could not play notification sound:', error)
  }
}

// Preset notification functions
export const notificationPresets = {
  walletConnected: (walletName: string) => ({
    type: 'success' as const,
    title: 'Wallet Connected',
    message: `Successfully connected to ${walletName}`,
    duration: 3000
  }),

  walletDisconnected: () => ({
    type: 'info' as const,
    title: 'Wallet Disconnected',
    message: 'Your wallet has been disconnected',
    duration: 3000
  }),

  transactionSuccess: (txHash: string) => ({
    type: 'success' as const,
    title: 'Transaction Successful',
    message: 'Your transaction has been confirmed',
    actions: [
      {
        label: 'View on Explorer',
        action: () => window.open(`https://solscan.io/tx/${txHash}`, '_blank')
      }
    ]
  }),

  transactionError: (error: string) => ({
    type: 'error' as const,
    title: 'Transaction Failed',
    message: error,
    duration: 8000
  }),

  stakingReward: (amount: string) => ({
    type: 'success' as const,
    title: 'Staking Rewards Earned',
    message: `You've earned ${amount} AURA tokens`,
    duration: 5000
  }),

  governanceVote: (proposalTitle: string) => ({
    type: 'success' as const,
    title: 'Vote Submitted',
    message: `Your vote on "${proposalTitle}" has been recorded`,
    duration: 4000
  }),

  errorOccurred: (message: string) => ({
    type: 'error' as const,
    title: 'Error',
    message: message,
    duration: 6000
  }),

  featureUnavailable: (feature: string) => ({
    type: 'warning' as const,
    title: 'Feature Coming Soon',
    message: `${feature} will be available in a future update`,
    duration: 4000
  })
} 