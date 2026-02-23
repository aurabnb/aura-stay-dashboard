'use client'

import { motion } from 'framer-motion'
import { CheckCircle, Circle, Clock, Rocket } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const roadmapItems = [
  {
    phase: 'Phase 1',
    title: 'Foundation & First Property',
    status: 'completed',
    quarter: 'Q2 2024',
    items: [
      'Token launch and community building',
      'Multi-sig treasury setup',
      'Costa Rica Volcano Stay acquisition',
      'Basic governance framework'
    ]
  },
  {
    phase: 'Phase 2',
    title: 'Ecosystem Expansion',
    status: 'completed',
    quarter: 'Q3 2024',
    items: [
      'Automated burn mechanism implementation',
      'Staking rewards system',
      'Bali Eco-Resort development',
      'Mobile app beta release'
    ]
  },
  {
    phase: 'Phase 3',
    title: 'Platform Maturation',
    status: 'in-progress',
    quarter: 'Q4 2024',
    items: [
      'Advanced DAO governance features',
      'Property tokenization system',
      'Revenue sharing protocol',
      '10+ global properties'
    ]
  },
  {
    phase: 'Phase 4',
    title: 'Global Network',
    status: 'upcoming',
    quarter: 'Q1 2025',
    items: [
      'Cross-chain integration',
      'Franchise system launch',
      'AI-powered property optimization',
      '50+ properties worldwide'
    ]
  }
]

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="w-6 h-6 text-green-500" />
    case 'in-progress':
      return <Clock className="w-6 h-6 text-blue-500" />
    case 'upcoming':
      return <Circle className="w-6 h-6 text-gray-400" />
    default:
      return <Circle className="w-6 h-6 text-gray-400" />
  }
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'completed':
      return <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">Completed</Badge>
    case 'in-progress':
      return <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">In Progress</Badge>
    case 'upcoming':
      return <Badge variant="outline" className="text-gray-600">Upcoming</Badge>
    default:
      return <Badge variant="outline">Planned</Badge>
  }
}

export function RoadmapSection() {
  return (
    <div className="relative">
      {/* Timeline Line */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-gray-300"></div>
      
      <div className="space-y-8">
        {roadmapItems.map((item, index) => (
          <motion.div
            key={item.phase}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.2, duration: 0.5 }}
            className="relative"
          >
            {/* Timeline Node */}
            <div className="absolute left-6 top-6 z-10 bg-white rounded-full p-1 shadow-lg">
              {getStatusIcon(item.status)}
            </div>
            
            {/* Content Card */}
            <div className="ml-20">
              <Card className={`transition-all duration-300 hover:shadow-lg ${
                item.status === 'in-progress' ? 'ring-2 ring-blue-200 bg-blue-50/30' : 'bg-white'
              }`}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-mono text-gray-500">{item.phase}</span>
                          {getStatusBadge(item.status)}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">{item.title}</h3>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-600">{item.quarter}</p>
                        {item.status === 'in-progress' && (
                          <div className="flex items-center space-x-1 mt-1">
                            <Rocket className="w-4 h-4 text-blue-500" />
                            <span className="text-xs text-blue-600 font-medium">Active</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Items List */}
                    <ul className="space-y-2">
                      {item.items.map((listItem, itemIndex) => (
                        <li key={itemIndex} className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${
                            item.status === 'completed' ? 'bg-green-500' :
                            item.status === 'in-progress' ? 'bg-blue-500' :
                            'bg-gray-300'
                          }`}></div>
                          <span className={`text-sm ${
                            item.status === 'completed' ? 'text-gray-700' :
                            item.status === 'in-progress' ? 'text-gray-800 font-medium' :
                            'text-gray-600'
                          }`}>
                            {listItem}
                          </span>
                        </li>
                      ))}
                    </ul>
                    
                    {/* Progress Bar for In-Progress Items */}
                    {item.status === 'in-progress' && (
                      <div className="space-y-2 pt-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium text-blue-600">68%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full w-[68%]"></div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Future Vision */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="mt-16 text-center"
      >
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            By 2025, AuraBNB will be the world's largest decentralized hospitality network, 
            offering 100+ unique properties across 25+ countries, all owned and governed by 
            our community of token holders.
          </p>
          <div className="grid grid-cols-3 gap-8 mt-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">100+</div>
              <div className="text-sm text-gray-600">Properties</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">25+</div>
              <div className="text-sm text-gray-600">Countries</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">$50M+</div>
              <div className="text-sm text-gray-600">Treasury Value</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
} 