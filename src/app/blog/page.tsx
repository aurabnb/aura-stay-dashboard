'use client'

import React from 'react'
import { Header } from '@/components/Header'

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AURA Blog
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Latest updates, insights, and stories from the AURA community
          </p>
        </div>
        
        <div className="mt-16">
          <div className="space-y-8">
            <div className="bg-gray-50 rounded-lg p-8">
              <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
              <p className="text-gray-600">Blog posts and community updates will be published here</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 