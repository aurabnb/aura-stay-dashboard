'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { Fragment } from 'react'
import { cn } from '@/lib/utils'

interface BreadcrumbItem {
  label: string
  href: string
  icon?: React.ComponentType<any>
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[]
  className?: string
  separator?: React.ReactNode
  showHome?: boolean
}

// Route name mappings for better UX
const routeNames: Record<string, string> = {
  'dashboard': 'Dashboard',
  'user-dashboard': 'User Dashboard',
  'analytics': 'Analytics',
  'trading': 'Trading',
  'treasury': 'Treasury',
  'staking': 'Staking',
  'governance': 'Governance',
  'community': 'Community',
  'investment': 'Investment Hub',
  'properties': 'Properties',
  'wallet': 'Wallet',
  'burn-tracking': 'Burn Tracking',
  'expense-tracker': 'Expense Tracker',
  'admin': 'Admin',
  'blog': 'Blog',
  'contact': 'Contact',
  'projects': 'Projects',
  'roadmap': 'Roadmap',
  'volcano-house': 'Volcano House',
  'buy-fiat': 'Buy with Fiat',
  'validation': 'Validation',
  'notion': 'Notion',
  'investment-hub': 'Investment Hub'
}

export function Breadcrumbs({ 
  items, 
  className, 
  separator = <ChevronRight className="w-4 h-4 text-gray-400" />,
  showHome = true 
}: BreadcrumbsProps) {
  const pathname = usePathname()

  // Generate breadcrumbs from current path if no items provided
  const breadcrumbItems = items || generateBreadcrumbsFromPath(pathname)

  if (breadcrumbItems.length === 0) {
    return null
  }

  return (
    <nav 
      aria-label="Breadcrumb" 
      className={cn("flex items-center space-x-2 text-sm", className)}
    >
      {showHome && (
        <>
          <Link
            href="/"
            className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span className="sr-only">Home</span>
          </Link>
          {breadcrumbItems.length > 0 && (
            <span className="text-gray-400">{separator}</span>
          )}
        </>
      )}

      {breadcrumbItems.map((item, index) => {
        const isLast = index === breadcrumbItems.length - 1
        const Icon = item.icon

        return (
          <Fragment key={item.href}>
            {isLast ? (
              <span className="flex items-center text-gray-900 font-medium">
                {Icon && <Icon className="w-4 h-4 mr-2" />}
                {item.label}
              </span>
            ) : (
              <>
                <Link
                  href={item.href}
                  className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {Icon && <Icon className="w-4 h-4 mr-2" />}
                  {item.label}
                </Link>
                <span className="text-gray-400">{separator}</span>
              </>
            )}
          </Fragment>
        )
      })}
    </nav>
  )
}

function generateBreadcrumbsFromPath(pathname: string): BreadcrumbItem[] {
  // Don't show breadcrumbs for home page
  if (pathname === '/') {
    return []
  }

  const segments = pathname.split('/').filter(Boolean)
  const breadcrumbs: BreadcrumbItem[] = []

  let currentPath = ''
  for (const segment of segments) {
    currentPath += `/${segment}`
    
    // Get display name for segment
    const label = routeNames[segment] || segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')

    breadcrumbs.push({
      label,
      href: currentPath
    })
  }

  return breadcrumbs
}

// Pre-built breadcrumb configurations for common routes
export const breadcrumbConfigs = {
  userDashboard: [
    { label: 'User Dashboard', href: '/user-dashboard' }
  ],
  dashboardAnalytics: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Analytics', href: '/dashboard/analytics' }
  ],
  dashboardTrading: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Trading', href: '/dashboard/trading' }
  ],
  dashboardTreasury: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Treasury', href: '/dashboard/treasury' }
  ],
  dashboardStaking: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Staking', href: '/dashboard/staking' }
  ],
  dashboardGovernance: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Governance', href: '/dashboard/governance' }
  ],
  dashboardCommunity: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Community', href: '/dashboard/community' }
  ],
  dashboardInvestment: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Investment Hub', href: '/dashboard/investment' }
  ],
  dashboardWallet: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Wallet', href: '/dashboard/wallet' }
  ],
  dashboardProperties: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Properties', href: '/dashboard/properties' }
  ]
}

// Hook for using breadcrumbs with route-specific configurations
export function useBreadcrumbs(configKey?: keyof typeof breadcrumbConfigs) {
  const pathname = usePathname()
  
  if (configKey && breadcrumbConfigs[configKey]) {
    return breadcrumbConfigs[configKey]
  }
  
  return generateBreadcrumbsFromPath(pathname)
} 