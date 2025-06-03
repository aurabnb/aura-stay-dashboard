'use client'

import React from 'react'
import { Header } from '@/components/Header'

export default function RoadmapPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AURA Roadmap
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our journey to revolutionize the hospitality industry through decentralized ownership
          </p>
        </div>
        
        <div className="mt-16">
          <div className="space-y-8">
            <div className="bg-gray-50 rounded-lg p-8">
              <h3 className="text-lg font-semibold mb-2">Q1 2025</h3>
              <p className="text-gray-600">Platform launch and initial property acquisitions</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-8">
              <h3 className="text-lg font-semibold mb-2">Q2 2025</h3>
              <p className="text-gray-600">Community governance implementation</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-8">
              <h3 className="text-lg font-semibold mb-2">Q3 2025</h3>
              <p className="text-gray-600">Global expansion and partnership network</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 