'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Menu, 
  X, 
  Home, 
  BarChart3, 
  Users, 
  Building2, 
  Coins, 
  Settings,
  ChevronDown,
  Globe,
  MessageSquare,
  LayoutDashboard,
  TrendingUp,
  Wallet,
  PieChart,
  Flame,
  Mountain,
  Receipt
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'

const navigationItems = [
  { 
    name: 'Home', 
    href: '/', 
    icon: Home,
    description: 'Main landing page'
  },
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: LayoutDashboard,
    description: 'Control center',
    badge: 'New'
  },
  { 
    name: 'Properties', 
    href: '/properties', 
    icon: Building2,
    description: 'Browse unique stays'
  },
  { 
    name: 'Community', 
    href: '/community', 
    icon: MessageSquare,
    description: 'Community board'
  }
]

const dashboardMenuItems = [
  { name: 'Main Dashboard', href: '/dashboard', description: 'Central control panel', icon: LayoutDashboard },
  { name: 'User Dashboard', href: '/user-dashboard', description: 'Personal portfolio & activity', icon: Wallet },
  { name: 'User Profile', href: '/user-profile', description: 'Manage profile & settings', icon: Users },
  { name: 'Analytics', href: '/analytics', description: 'Advanced metrics & insights', icon: BarChart3 },
  { name: 'Dashboard Analytics', href: '/dashboard/analytics', description: 'Detailed dashboard analytics', icon: BarChart3 },
  { name: 'Trading', href: '/dashboard/trading', description: 'DEX & market data', icon: TrendingUp },
  { name: 'Treasury', href: '/dashboard/treasury', description: 'Treasury monitoring', icon: PieChart },
      { name: 'Staking', href: '/user-dashboard#staking', description: 'Stake & earn rewards', icon: Coins },
  { name: 'Governance', href: '/dashboard/governance', description: 'DAO proposals & voting', icon: Users },
  { name: 'Community', href: '/dashboard/community', description: 'Community engagement', icon: MessageSquare },
  { name: 'Investment Hub', href: '/dashboard/investment', description: 'Investment opportunities', icon: TrendingUp },
  { name: 'Wallet Management', href: '/dashboard/wallet', description: 'Portfolio management', icon: Wallet },
  { name: 'Properties', href: '/dashboard/properties', description: 'Property management', icon: Building2 },
  { name: 'Burn Tracking', href: '/burn-tracking', description: 'Token burn & redistribution', icon: Flame },
  { name: 'Expense Tracker', href: '/expense-tracker', description: 'Treasury expense tracking', icon: Receipt },
]

const propertyMenuItems = [
  { name: 'Browse Properties', href: '/properties', description: 'All available properties', icon: Building2 },
  { name: 'Investment Hub', href: '/investment-hub', description: 'Property investments', icon: TrendingUp },
  { name: 'Volcano House', href: '/volcano-house', description: 'Costa Rica calculator', icon: Mountain },
]

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const { connected, publicKey } = useWallet()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isActiveRoute = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  return (
    <nav className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      scrolled 
        ? 'bg-white/95 backdrop-blur-lg border-b border-slate-200/50 shadow-lg' 
        : 'bg-transparent'
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AuraBNB
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = isActiveRoute(item.href)
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 group',
                    isActive 
                      ? 'text-blue-600 bg-blue-50' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="text-xs ml-1">
                      {item.badge}
                    </Badge>
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-blue-50 rounded-lg -z-10"
                      initial={false}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              )
            })}

            {/* Dashboard Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-1">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboards</span>
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                {dashboardMenuItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <DropdownMenuItem key={item.name} asChild>
                      <Link href={item.href} className="flex items-center space-x-3 p-3">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{item.name}</span>
                          <span className="text-xs text-muted-foreground">{item.description}</span>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Wallet Connection & Mobile Menu */}
          <div className="flex items-center space-x-3">
            {/* Wallet Button */}
            <div className="wallet-adapter-button-container">
              <WalletMultiButton className="!bg-gradient-to-r !from-blue-600 !to-purple-600 !rounded-lg !text-sm !font-medium !px-4 !py-2 hover:!from-blue-700 hover:!to-purple-700 !transition-all !duration-200" />
            </div>

            {/* Connection Status */}
            {connected && publicKey && (
              <div className="hidden sm:flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-slate-600">
                  {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
                </span>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden border-t border-slate-200/50 bg-white/95 backdrop-blur-lg"
            >
              <div className="px-4 py-4 space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  const isActive = isActiveRoute(item.href)
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                        isActive 
                          ? 'text-blue-600 bg-blue-50' 
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  )
                })}
                
                <div className="border-t border-slate-200/50 pt-2 mt-2">
                  <p className="text-xs text-slate-500 px-3 mb-2">Dashboards</p>
                  {dashboardMenuItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}