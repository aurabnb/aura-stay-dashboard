'use client'

import React, { useState, useEffect } from 'react'
import { Search, Command } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GlobalSearch } from './GlobalSearch'
import { cn } from '@/lib/utils'

interface SearchButtonProps {
  variant?: 'default' | 'compact' | 'icon-only'
  className?: string
  placeholder?: string
}

export function SearchButton({ 
  variant = 'default', 
  className,
  placeholder = "Search everything..." 
}: SearchButtonProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  // Handle keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsSearchOpen(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const renderButton = () => {
    switch (variant) {
      case 'icon-only':
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSearchOpen(true)}
            className={cn("p-2", className)}
            title="Search (⌘K)"
          >
            <Search className="w-5 h-5" />
          </Button>
        )

      case 'compact':
        return (
          <Button
            variant="outline"
            onClick={() => setIsSearchOpen(true)}
            className={cn(
              "flex items-center space-x-2 text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 border-gray-200",
              className
            )}
          >
            <Search className="w-4 h-4" />
            <span className="text-sm">Search</span>
            <div className="hidden sm:flex items-center space-x-1 ml-auto">
              <kbd className="px-1.5 py-0.5 text-xs font-mono bg-white border border-gray-300 rounded">
                ⌘
              </kbd>
              <kbd className="px-1.5 py-0.5 text-xs font-mono bg-white border border-gray-300 rounded">
                K
              </kbd>
            </div>
          </Button>
        )

      default:
        return (
          <Button
            variant="outline"
            onClick={() => setIsSearchOpen(true)}
            className={cn(
              "flex items-center justify-between w-full max-w-sm text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 border-gray-200",
              className
            )}
          >
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4" />
              <span className="text-sm">{placeholder}</span>
            </div>
            <div className="hidden sm:flex items-center space-x-1">
              <kbd className="px-1.5 py-0.5 text-xs font-mono bg-white border border-gray-300 rounded">
                ⌘
              </kbd>
              <kbd className="px-1.5 py-0.5 text-xs font-mono bg-white border border-gray-300 rounded">
                K
              </kbd>
            </div>
          </Button>
        )
    }
  }

  return (
    <>
      {renderButton()}
      <GlobalSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        placeholder={placeholder}
      />
    </>
  )
} 