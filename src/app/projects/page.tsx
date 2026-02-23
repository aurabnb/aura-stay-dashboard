'use client'

import React from 'react'
import { Header } from '@/components/Header'

export default function ProjectsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AURA Projects
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore our portfolio of unique hospitality properties and upcoming developments
          </p>
        </div>
        
        <div className="mt-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Project cards would go here */}
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
              <p className="text-gray-600">Property listings and project details</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 