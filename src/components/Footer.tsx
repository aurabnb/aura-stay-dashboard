'use client'

import React from 'react'
import { ExternalLink, FileText, Twitter, MessageCircle, BarChart, Search, Coins } from 'lucide-react'

export function Footer() {
  const footerLinks = [
    {
      url: 'https://www.coingecko.com/en/coins/aurora-ventures',
      label: 'CoinGecko',
      icon: Coins
    },
    {
      url: 'https://believe.app/coin/3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe',
      label: 'Believe',
      icon: BarChart
    },
    {
      url: 'https://docs.google.com/document/d/1NV4ryYsIgFbis3cqP0XB2plp_mRegYr0eHGl3kUIBXM/edit?tab=t.0',
      label: 'PRD',
      icon: FileText
    },
    {
      url: 'https://solscan.io/token/3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe',
      label: 'Solscan',
      icon: Search
    },
    {
      url: 'https://x.com/aurabnb',
      label: 'Twitter',
      icon: Twitter
    },
    {
      url: 'https://dexscreener.com/solana/3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe',
      label: 'DEXScreener',
      icon: BarChart
    },
    {
      url: 'https://t.me/aurabnb',
      label: 'Telegram',
      icon: MessageCircle
    }
  ]

  return (
    <footer className="bg-white border-t border-gray-200 mt-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="flex items-center justify-center mb-8">
            <img 
              src="/lovable-uploads/99705421-813e-4d11-89a5-90bffaa2147a.png" 
              alt="AURA" 
              className="h-8 w-auto"
            />
          </div>
          
          <div className="flex flex-wrap justify-center gap-8 mb-8">
            {footerLinks.map((link, index) => {
              const Icon = link.icon
              return (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.label}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )
            })}
          </div>
          
          <div className="border-t border-gray-200 pt-8">
            <p className="text-gray-600 text-sm">
              © 2025 AURA. Building the world's first decentralized unique stay network.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
} 