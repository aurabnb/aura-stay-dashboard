'use client'

import { motion } from 'framer-motion'
import { Loader2, Globe } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
      <div className="text-center space-y-8">
        {/* Logo with pulse animation */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex items-center justify-center space-x-3"
        >
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 3, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
            className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center"
          >
            <Globe className="w-8 h-8 text-white" />
          </motion.div>
          
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AuraBNB
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Decentralized Hospitality Network
            </p>
          </div>
        </motion.div>

        {/* Loading spinner and text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-center space-x-3">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            <span className="text-lg text-slate-700 font-medium">
              Loading your dashboard...
            </span>
          </div>
          
          {/* Progress dots */}
          <div className="flex justify-center space-x-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
                className="w-2 h-2 bg-blue-600 rounded-full"
              />
            ))}
          </div>
        </motion.div>

        {/* Loading tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="max-w-md mx-auto"
        >
          <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-slate-200">
            <p className="text-sm text-slate-600">
              💡 <strong>Tip:</strong> Connect your Solana wallet to access staking, 
              governance, and portfolio features.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 