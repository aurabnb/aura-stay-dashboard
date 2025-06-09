'use client'

import React from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function TreasuryProgressSkeleton() {
  return (
    <Card className="bg-white border border-gray-200 shadow-lg">
      <CardHeader>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-48"></div>
          <div className="h-4 bg-gray-200 rounded w-72"></div>
        </div>
      </CardHeader>
      
      <CardContent className="animate-pulse space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="text-center space-y-2">
              <div className="h-4 bg-gray-200 rounded w-24 mx-auto"></div>
              <div className="h-8 bg-gray-200 rounded w-32 mx-auto"></div>
              <div className="h-3 bg-gray-200 rounded w-16 mx-auto"></div>
            </div>
          ))}
        </div>
        
        {/* Progress Bar */}
        <div className="space-y-3">
          <div className="flex justify-between">
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div className="bg-gray-300 h-4 rounded-full w-1/3"></div>
          </div>
          <div className="h-3 bg-gray-200 rounded w-48 mx-auto"></div>
        </div>
        
        {/* Wallets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-24"></div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 