'use client'

import { useEffect, useState, ReactNode } from 'react'

interface ClientSideWrapperProps {
  children: ReactNode
  fallback?: ReactNode
}

export function ClientSideWrapper({ children, fallback = null }: ClientSideWrapperProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return <>{fallback}</>
  }

  return <>{children}</>
} 