'use client'

import { motion } from 'framer-motion'
import { Shield, Coins, Users, Globe, BarChart3, Zap, Lock, CheckCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const features = [
  {
    icon: Shield,
    title: 'Multi-Sig Security',
    description: 'Treasury protected by advanced multi-signature wallets with community oversight',
    color: 'from-blue-500 to-blue-600'
  },
  {
    icon: Coins,
    title: 'Automated Staking',
    description: 'Earn passive rewards through our burn-redistribution mechanism',
    color: 'from-purple-500 to-purple-600'
  },
  {
    icon: Users,
    title: 'DAO Governance',
    description: 'Community-driven decisions on property selection and development',
    color: 'from-green-500 to-green-600'
  },
  {
    icon: Globe,
    title: 'Global Properties',
    description: 'Unique stays across 8+ countries with more locations being added',
    color: 'from-orange-500 to-orange-600'
  },
  {
    icon: BarChart3,
    title: 'Transparent Analytics',
    description: 'Real-time treasury tracking and performance metrics',
    color: 'from-red-500 to-red-600'
  },
  {
    icon: Zap,
    title: 'Instant Rewards',
    description: 'Immediate staking rewards with no lock-up periods',
    color: 'from-yellow-500 to-yellow-600'
  },
  {
    icon: Lock,
    title: 'Burn Mechanism',
    description: 'Deflationary tokenomics with 2% automatic burn on transactions',
    color: 'from-indigo-500 to-indigo-600'
  },
  {
    icon: CheckCircle,
    title: 'Proven Results',
    description: '3 properties funded, $2.8M treasury, 12,500+ community members',
    color: 'from-emerald-500 to-emerald-600'
  }
]

export function FeaturesGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {features.map((feature, index) => {
        const Icon = feature.icon
        
        return (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
          >
            <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="space-y-4">
                  <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
} 