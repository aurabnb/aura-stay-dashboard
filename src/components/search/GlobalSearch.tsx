'use client'

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  X, 
  Clock, 
  TrendingUp, 
  Building, 
  Vote, 
  Wallet, 
  FileText, 
  Users, 
  Settings,
  ArrowRight,
  Hash,
  ExternalLink
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { useDebounce } from '@/hooks/useDebounce'

// Search result types
export interface SearchResult {
  id: string
  title: string
  description: string
  category: SearchCategory
  url: string
  icon?: React.ReactNode
  metadata?: Record<string, any>
  relevanceScore?: number
}

export type SearchCategory = 
  | 'properties' 
  | 'transactions' 
  | 'governance' 
  | 'users' 
  | 'documentation' 
  | 'settings'
  | 'analytics'
  | 'treasury'

interface GlobalSearchProps {
  isOpen: boolean
  onClose: () => void
  placeholder?: string
  maxResults?: number
}

// Mock data for demonstration - in real app, this would come from APIs
const mockSearchData: SearchResult[] = [
  // Properties
  {
    id: 'prop-1',
    title: 'Luxury Villa in Miami',
    description: 'Beachfront property with 5 bedrooms, pool, and ocean view',
    category: 'properties',
    url: '/properties/luxury-villa-miami',
    icon: <Building className="w-4 h-4" />,
    metadata: { price: '$2.5M', location: 'Miami, FL', bedrooms: 5 }
  },
  {
    id: 'prop-2',
    title: 'Modern Apartment NYC',
    description: 'Downtown Manhattan apartment with city views',
    category: 'properties',
    url: '/properties/modern-apartment-nyc',
    icon: <Building className="w-4 h-4" />,
    metadata: { price: '$1.8M', location: 'New York, NY', bedrooms: 3 }
  },
  
  // Governance
  {
    id: 'gov-1',
    title: 'Increase Staking Rewards',
    description: 'Proposal to increase AURA staking rewards from 8% to 12% APY',
    category: 'governance',
    url: '/dashboard/governance/proposals/increase-staking-rewards',
    icon: <Vote className="w-4 h-4" />,
    metadata: { status: 'Active', votes: 1250, endDate: '2024-02-15' }
  },
  {
    id: 'gov-2',
    title: 'Treasury Allocation',
    description: 'Proposal for Q2 treasury fund allocation strategy',
    category: 'governance',
    url: '/dashboard/governance/proposals/treasury-allocation',
    icon: <Vote className="w-4 h-4" />,
    metadata: { status: 'Pending', votes: 890, endDate: '2024-02-20' }
  },

  // Transactions
  {
    id: 'tx-1',
    title: 'AURA Purchase',
    description: 'Bought 1,000 AURA tokens',
    category: 'transactions',
    url: '/dashboard/wallet/transactions/aura-purchase-1000',
    icon: <TrendingUp className="w-4 h-4" />,
    metadata: { amount: '1,000 AURA', date: '2024-01-15', status: 'Completed' }
  },

  // Documentation
  {
    id: 'doc-1',
    title: 'Getting Started Guide',
    description: 'Complete guide to using AURA Stay platform',
    category: 'documentation',
    url: '/docs/getting-started',
    icon: <FileText className="w-4 h-4" />,
    metadata: { category: 'Tutorial', readTime: '5 min' }
  },
  {
    id: 'doc-2',
    title: 'Staking Tutorial',
    description: 'How to stake AURA tokens and earn rewards',
    category: 'documentation',
    url: '/docs/staking-tutorial',
    icon: <FileText className="w-4 h-4" />,
    metadata: { category: 'Tutorial', readTime: '8 min' }
  },

  // Settings
  {
    id: 'set-1',
    title: 'Notification Settings',
    description: 'Manage your notification preferences',
    category: 'settings',
    url: '/settings/notifications',
    icon: <Settings className="w-4 h-4" />
  },
  {
    id: 'set-2',
    title: 'Wallet Settings',
    description: 'Configure wallet connection and security',
    category: 'settings',
    url: '/settings/wallet',
    icon: <Wallet className="w-4 h-4" />
  }
]

const categoryConfig = {
  properties: { 
    label: 'Properties', 
    icon: Building, 
    color: 'bg-green-100 text-green-800 border-green-200' 
  },
  transactions: { 
    label: 'Transactions', 
    icon: TrendingUp, 
    color: 'bg-blue-100 text-blue-800 border-blue-200' 
  },
  governance: { 
    label: 'Governance', 
    icon: Vote, 
    color: 'bg-purple-100 text-purple-800 border-purple-200' 
  },
  users: { 
    label: 'Users', 
    icon: Users, 
    color: 'bg-orange-100 text-orange-800 border-orange-200' 
  },
  documentation: { 
    label: 'Docs', 
    icon: FileText, 
    color: 'bg-gray-100 text-gray-800 border-gray-200' 
  },
  settings: { 
    label: 'Settings', 
    icon: Settings, 
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200' 
  },
  analytics: { 
    label: 'Analytics', 
    icon: TrendingUp, 
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200' 
  },
  treasury: { 
    label: 'Treasury', 
    icon: Wallet, 
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200' 
  }
}

export function GlobalSearch({ isOpen, onClose, placeholder = "Search everything...", maxResults = 20 }: GlobalSearchProps) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  
  // Debounce search query
  const debouncedQuery = useDebounce(query, 300)

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('aura_recent_searches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  // Search results with fuzzy matching and relevance scoring
  const searchResults = useMemo(() => {
    if (!debouncedQuery.trim()) return []

    const queryLower = debouncedQuery.toLowerCase()
    const results = mockSearchData
      .map(item => {
        let score = 0
        
        // Title exact match gets highest score
        if (item.title.toLowerCase().includes(queryLower)) {
          score += item.title.toLowerCase() === queryLower ? 100 : 50
        }
        
        // Description match
        if (item.description.toLowerCase().includes(queryLower)) {
          score += 25
        }
        
        // Category match
        if (item.category.toLowerCase().includes(queryLower)) {
          score += 15
        }
        
        // Metadata match
        if (item.metadata) {
          Object.values(item.metadata).forEach(value => {
            if (String(value).toLowerCase().includes(queryLower)) {
              score += 10
            }
          })
        }

        return { ...item, relevanceScore: score }
      })
      .filter(item => item.relevanceScore! > 0)
      .sort((a, b) => b.relevanceScore! - a.relevanceScore!)
      .slice(0, maxResults)

    return results
  }, [debouncedQuery, maxResults])

  // Group results by category
  const groupedResults = useMemo(() => {
    const groups: Record<SearchCategory, SearchResult[]> = {} as any
    
    searchResults.forEach(result => {
      if (!groups[result.category]) {
        groups[result.category] = []
      }
      groups[result.category].push(result)
    })
    
    return groups
  }, [searchResults])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => 
            prev < searchResults.length - 1 ? prev + 1 : 0
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : searchResults.length - 1
          )
          break
        case 'Enter':
          e.preventDefault()
          if (searchResults[selectedIndex]) {
            handleResultClick(searchResults[selectedIndex])
          }
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, searchResults, selectedIndex, onClose])

  const handleResultClick = useCallback((result: SearchResult) => {
    // Save to recent searches
    const newRecentSearches = [
      query,
      ...recentSearches.filter(s => s !== query)
    ].slice(0, 5)
    
    setRecentSearches(newRecentSearches)
    localStorage.setItem('aura_recent_searches', JSON.stringify(newRecentSearches))
    
    // Navigate to result
    router.push(result.url)
    onClose()
  }, [query, recentSearches, router, onClose])

  const handleRecentSearchClick = (searchTerm: string) => {
    setQuery(searchTerm)
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem('aura_recent_searches')
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="flex items-start justify-center min-h-screen pt-[10vh] px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Input */}
          <div className="flex items-center px-4 py-3 border-b border-gray-200">
            <Search className="w-5 h-5 text-gray-400 mr-3" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="flex-1 border-0 focus:ring-0 text-lg placeholder:text-gray-400"
            />
            {query && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setQuery('')}
                className="p-1 h-auto"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-1 h-auto ml-2"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Search Results */}
          <div ref={resultsRef} className="max-h-96 overflow-y-auto">
            {query.trim() === '' ? (
              // Recent searches and suggestions
              <div className="p-4">
                {recentSearches.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-gray-900 flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        Recent Searches
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearRecentSearches}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        Clear
                      </Button>
                    </div>
                    <div className="space-y-1">
                      {recentSearches.map((search, index) => (
                        <button
                          key={index}
                          onClick={() => handleRecentSearchClick(search)}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700 transition-colors"
                        >
                          {search}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => router.push('/properties')}
                      className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <Building className="w-5 h-5 text-green-600 mr-3" />
                      <span className="text-sm font-medium">Browse Properties</span>
                    </button>
                    <button
                      onClick={() => router.push('/dashboard/governance')}
                      className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <Vote className="w-5 h-5 text-purple-600 mr-3" />
                      <span className="text-sm font-medium">Governance</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : searchResults.length > 0 ? (
              // Search results grouped by category
              <div className="p-2">
                {Object.entries(groupedResults).map(([category, results]) => {
                  const config = categoryConfig[category as SearchCategory]
                  const CategoryIcon = config.icon
                  
                  return (
                    <div key={category} className="mb-4">
                      <div className="flex items-center px-2 py-1 mb-2">
                        <CategoryIcon className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          {config.label}
                        </span>
                        <span className="ml-2 text-xs text-gray-400">
                          ({results.length})
                        </span>
                      </div>
                      
                      {results.map((result, index) => {
                        const globalIndex = searchResults.findIndex(r => r.id === result.id)
                        const isSelected = globalIndex === selectedIndex
                        
                        return (
                          <button
                            key={result.id}
                            onClick={() => handleResultClick(result)}
                            className={cn(
                              "w-full text-left p-3 rounded-lg transition-colors mb-1",
                              isSelected 
                                ? "bg-blue-50 border border-blue-200" 
                                : "hover:bg-gray-50"
                            )}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center mb-1">
                                  {result.icon}
                                  <span className="ml-2 font-medium text-gray-900 truncate">
                                    {result.title}
                                  </span>
                                  <Badge 
                                    variant="outline" 
                                    className={cn("ml-2 text-xs", config.color)}
                                  >
                                    {config.label}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 line-clamp-2">
                                  {result.description}
                                </p>
                                
                                {/* Metadata */}
                                {result.metadata && (
                                  <div className="flex items-center mt-2 space-x-3 text-xs text-gray-500">
                                    {Object.entries(result.metadata).slice(0, 3).map(([key, value]) => (
                                      <span key={key}>
                                        {key}: {String(value)}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              
                              <ArrowRight className="w-4 h-4 text-gray-400 ml-3 flex-shrink-0" />
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            ) : query.trim() !== '' ? (
              // No results
              <div className="p-8 text-center">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No results found
                </h3>
                <p className="text-gray-600 mb-4">
                  Try searching for properties, transactions, or governance proposals
                </p>
                <Button
                  variant="outline"
                  onClick={() => setQuery('')}
                  className="text-sm"
                >
                  Clear search
                </Button>
              </div>
            ) : null}
          </div>

          {/* Footer */}
          {query.trim() !== '' && searchResults.length > 0 && (
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>
                  {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
                </span>
                <div className="flex items-center space-x-4">
                  <span>↑↓ Navigate</span>
                  <span>↵ Select</span>
                  <span>Esc Close</span>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
} 