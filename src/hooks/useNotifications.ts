import { useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useNotifications, notificationPresets } from '@/components/notifications/NotificationSystem'

/**
 * Enhanced notifications hook with automatic wallet event integration
 */
export function useNotificationsWithWallet() {
  const { addNotification, preferences } = useNotifications()
  const { connected, wallet, connecting, disconnecting } = useWallet()

  // Track wallet connection events
  useEffect(() => {
    if (connected && wallet && preferences.showOnWalletEvents) {
      addNotification(notificationPresets.walletConnected(wallet.adapter.name))
    }
  }, [connected, wallet, addNotification, preferences.showOnWalletEvents])

  // Track wallet disconnection events
  useEffect(() => {
    if (!connected && !connecting && !disconnecting && preferences.showOnWalletEvents) {
      // Only show disconnection if we were previously connected
      const wasConnected = localStorage.getItem('aura_wallet_was_connected')
      if (wasConnected === 'true') {
        addNotification(notificationPresets.walletDisconnected())
        localStorage.removeItem('aura_wallet_was_connected')
      }
    }
    
    // Track connection state
    if (connected) {
      localStorage.setItem('aura_wallet_was_connected', 'true')
    }
  }, [connected, connecting, disconnecting, addNotification, preferences.showOnWalletEvents])

  return {
    // Wallet-specific notifications
    notifyWalletConnected: (walletName: string) => {
      if (preferences.showOnWalletEvents) {
        addNotification(notificationPresets.walletConnected(walletName))
      }
    },

    notifyWalletDisconnected: () => {
      if (preferences.showOnWalletEvents) {
        addNotification(notificationPresets.walletDisconnected())
      }
    },

    // Transaction notifications
    notifyTransactionSuccess: (txHash: string) => {
      if (preferences.showOnTransactions) {
        addNotification(notificationPresets.transactionSuccess(txHash))
      }
    },

    notifyTransactionError: (error: string) => {
      if (preferences.showOnTransactions) {
        addNotification(notificationPresets.transactionError(error))
      }
    },

    notifyTransactionPending: (message: string = 'Transaction submitted and pending confirmation') => {
      if (preferences.showOnTransactions) {
        addNotification({
          type: 'info',
          title: 'Transaction Pending',
          message,
          persistent: true, // Keep until confirmed or failed
          sound: false
        })
      }
    },

    // Staking notifications
    notifyStakingReward: (amount: string) => {
      addNotification(notificationPresets.stakingReward(amount))
    },

    notifyStakingStarted: (amount: string) => {
      addNotification({
        type: 'success',
        title: 'Staking Started',
        message: `Successfully staked ${amount} AURA tokens`,
        duration: 4000
      })
    },

    notifyUnstakingStarted: (amount: string) => {
      addNotification({
        type: 'info',
        title: 'Unstaking Started',
        message: `${amount} AURA tokens are being unstaked`,
        duration: 4000
      })
    },

    // Governance notifications
    notifyGovernanceVote: (proposalTitle: string) => {
      if (preferences.showOnGovernance) {
        addNotification(notificationPresets.governanceVote(proposalTitle))
      }
    },

    notifyNewProposal: (proposalTitle: string) => {
      if (preferences.showOnGovernance) {
        addNotification({
          type: 'info',
          title: 'New Proposal',
          message: `"${proposalTitle}" is now open for voting`,
          actions: [
            {
              label: 'Vote Now',
              action: () => window.location.href = '/dashboard/governance'
            }
          ],
          duration: 8000
        })
      }
    },

    // Error notifications
    notifyError: (message: string, persistent = false) => {
      if (preferences.showOnErrors) {
        addNotification(notificationPresets.errorOccurred(message))
      }
    },

    notifyNetworkError: () => {
      if (preferences.showOnErrors) {
        addNotification({
          type: 'error',
          title: 'Network Error',
          message: 'Unable to connect to Solana network. Please check your connection.',
          actions: [
            {
              label: 'Retry',
              action: () => window.location.reload()
            }
          ],
          duration: 10000
        })
      }
    },

    // Success notifications
    notifySuccess: (title: string, message: string, duration = 4000) => {
      addNotification({
        type: 'success',
        title,
        message,
        duration
      })
    },

    // Info notifications
    notifyInfo: (title: string, message: string, duration = 4000) => {
      addNotification({
        type: 'info',
        title,
        message,
        duration
      })
    },

    // Warning notifications
    notifyWarning: (title: string, message: string, duration = 5000) => {
      addNotification({
        type: 'warning',
        title,
        message,
        duration
      })
    },

    // Feature notifications
    notifyFeatureUnavailable: (feature: string) => {
      addNotification(notificationPresets.featureUnavailable(feature))
    },

    notifyComingSoon: (feature: string, expectedDate?: string) => {
      addNotification({
        type: 'info',
        title: 'Coming Soon',
        message: expectedDate 
          ? `${feature} will be available ${expectedDate}`
          : `${feature} is coming soon! Stay tuned for updates.`,
        duration: 5000
      })
    },

    // Custom notification with full control
    addNotification
  }
}

/**
 * Quick notification utilities for common use cases
 */
export const quickNotify = {
  success: (message: string, title = 'Success') => {
    // This requires the hook to be used within a component
    // For external use, we'll create a separate utility
  },
  
  error: (message: string, title = 'Error') => {
    // Same as above
  },
  
  info: (message: string, title = 'Info') => {
    // Same as above
  },
  
  warning: (message: string, title = 'Warning') => {
    // Same as above
  }
}

/**
 * Notification manager for use outside of React components
 */
class NotificationManager {
  private static instance: NotificationManager
  private addNotificationFn?: (notification: any) => void

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager()
    }
    return NotificationManager.instance
  }

  setAddNotification(fn: (notification: any) => void) {
    this.addNotificationFn = fn
  }

  success(title: string, message: string, duration = 4000) {
    if (this.addNotificationFn) {
      this.addNotificationFn({
        type: 'success',
        title,
        message,
        duration
      })
    }
  }

  error(title: string, message: string, duration = 6000) {
    if (this.addNotificationFn) {
      this.addNotificationFn({
        type: 'error',
        title,
        message,
        duration
      })
    }
  }

  info(title: string, message: string, duration = 4000) {
    if (this.addNotificationFn) {
      this.addNotificationFn({
        type: 'info',
        title,
        message,
        duration
      })
    }
  }

  warning(title: string, message: string, duration = 5000) {
    if (this.addNotificationFn) {
      this.addNotificationFn({
        type: 'warning',
        title,
        message,
        duration
      })
    }
  }
}

export const notificationManager = NotificationManager.getInstance()

/**
 * Demo function to test all notification types
 */
export function showNotificationDemo() {
  const { addNotification } = useNotifications()

  const demos = [
    notificationPresets.walletConnected('Phantom'),
    notificationPresets.transactionSuccess('abc123...'),
    notificationPresets.stakingReward('125.5'),
    notificationPresets.governanceVote('Increase Staking Rewards'),
    notificationPresets.errorOccurred('Network connection failed'),
    notificationPresets.featureUnavailable('Advanced Trading'),
    {
      type: 'info' as const,
      title: 'Demo Notification',
      message: 'This is a demo of the notification system with actions',
      actions: [
        {
          label: 'Action 1',
          action: () => alert('Action 1 clicked!')
        },
        {
          label: 'Action 2',
          action: () => alert('Action 2 clicked!'),
          variant: 'outline' as const
        }
      ]
    }
  ]

  demos.forEach((demo, index) => {
    setTimeout(() => {
      addNotification(demo)
    }, index * 1000)
  })
} 