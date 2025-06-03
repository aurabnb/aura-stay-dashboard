'use client'

import { ReactNode } from 'react'
import { AppProviders } from './AppProviders'
import { Toaster } from '@/components/ui/toaster'

interface ClientProvidersProps {
  children: ReactNode
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <AppProviders>
      {children}
      <Toaster />
    </AppProviders>
  )
} 