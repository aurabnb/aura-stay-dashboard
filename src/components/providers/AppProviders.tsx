'use client'

import { useMemo, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ThemeProvider } from 'next-themes'
import { TooltipProvider } from '@/components/ui/tooltip'
import { NotificationProvider } from '@/components/notifications/NotificationSystem'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false
        }
        return failureCount < 3
      },
    },
  },
})

// Dynamic import for wallet providers to prevent SSR issues
const SolanaWalletProvider = dynamic(
  () => import('./SolanaWalletProvider').then(mod => mod.SolanaWalletProvider),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center p-4">
        <div className="animate-pulse text-sm text-gray-500">Loading wallet provider...</div>
      </div>
    )
  }
)

interface AppProvidersProps {
  children: React.ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  const [mounted, setMounted] = useState(false)
  
  // Ensure this only runs on client to prevent hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent hydration mismatch by not rendering theme provider until mounted
  if (!mounted) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div suppressHydrationWarning>
            {children}
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    )
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        <SolanaWalletProvider>
          <NotificationProvider>
            <TooltipProvider>
              {children}
              {/* React Query Devtools - only in development */}
              {process.env.NODE_ENV === 'development' && (
                <ReactQueryDevtools initialIsOpen={false} />
              )}
            </TooltipProvider>
          </NotificationProvider>
        </SolanaWalletProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
} 