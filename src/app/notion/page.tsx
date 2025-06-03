'use client'

import React, { useEffect } from 'react'
import { Header } from '@/components/Header'

export default function NotionPage() {
  useEffect(() => {
    // Redirect to external Notion page
    window.location.href = 'https://aurabnb.notion.site'
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Redirecting to Notion...
          </h1>
          <p className="text-xl text-gray-600">
            You will be redirected to our Notion documentation
          </p>
        </div>
      </main>
    </div>
  )
} 