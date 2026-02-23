'use client'

import React from 'react'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Mail, MessageCircle, Twitter, Globe } from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white font-urbanist">
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8 pt-28">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Contact AURA
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get in touch with our team for partnerships, inquiries, or to learn more about joining the AURA community
          </p>
        </div>
        
        <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-50 rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
            <MessageCircle className="h-8 w-8 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Telegram</h3>
            <p className="text-gray-600 mb-4">Join our community</p>
            <a 
              href="https://t.me/aurabnb" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              @aurabnb
            </a>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
            <Twitter className="h-8 w-8 text-blue-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Twitter</h3>
            <p className="text-gray-600 mb-4">Follow for updates</p>
            <a 
              href="https://twitter.com/aurabnb" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-500 font-medium"
            >
              @aurabnb
            </a>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
            <Mail className="h-8 w-8 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Email</h3>
            <p className="text-gray-600 mb-4">Business inquiries</p>
            <a 
              href="mailto:hello@aura.eco" 
              className="text-green-600 hover:text-green-700 font-medium"
            >
              hello@aura.eco
            </a>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
            <Globe className="h-8 w-8 text-purple-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Notion</h3>
            <p className="text-gray-600 mb-4">Documentation</p>
            <a 
              href="https://aurabnb.notion.site" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              View Docs
            </a>
          </div>
        </div>
        
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Ready to Build the Future of Hospitality?
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://t.me/aurabnb"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-black hover:bg-gray-800 text-white px-8 py-3 rounded-full font-semibold transition-colors"
            >
              Join Community
            </a>
            <a
              href="mailto:hello@aura.eco"
              className="border border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-3 rounded-full font-semibold transition-colors"
            >
              Partner With Us
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
} 