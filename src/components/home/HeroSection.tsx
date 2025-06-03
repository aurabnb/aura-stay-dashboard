'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { ArrowRight, Play, TrendingUp, Users, Shield, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function HeroSection() {
  const { connected } = useWallet()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  }

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  if (!mounted) {
    return <div className="h-screen" />
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent" />
      
      {/* Animated Background Orbs */}
      <motion.div
        className="absolute top-20 left-20 w-32 h-32 bg-blue-200/30 rounded-full blur-xl"
        animate={{ 
          x: [0, 50, 0],
          y: [0, -30, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          duration: 8, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-48 h-48 bg-purple-200/30 rounded-full blur-xl"
        animate={{ 
          x: [0, -30, 0],
          y: [0, 40, 0],
          scale: [1, 0.9, 1]
        }}
        transition={{ 
          duration: 10, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          variants={staggerChildren}
          initial="initial"
          animate="animate"
          className="space-y-8"
        >
          {/* Badge */}
          <motion.div variants={fadeInUp}>
            <Badge variant="outline" className="px-4 py-2 text-sm font-medium bg-white/80 backdrop-blur-sm border-blue-200">
              <Sparkles className="w-4 h-4 mr-2 text-blue-500" />
              Decentralized Hospitality Revolution
            </Badge>
          </motion.div>

          {/* Main Heading */}
          <motion.div variants={fadeInUp} className="space-y-6">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight">
              <span className="block text-gray-900">Own the Future of</span>
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent bg-size-200 animate-gradient">
                Hospitality
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Join the world's first community-owned hospitality network. 
              Stake tokens, vote on properties, earn from every stay.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div variants={fadeInUp}>
            <div className="flex flex-wrap justify-center gap-8 text-sm font-medium text-gray-600">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                <span>$2.8M Treasury</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-500" />
                <span>12,500+ Holders</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-purple-500" />
                <span>100% Decentralized</span>
              </div>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div variants={fadeInUp}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {connected ? (
                <Button size="lg" asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all">
                  <Link href="/staking">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Start Staking
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              ) : (
                <div className="wallet-adapter-button-container">
                  <WalletMultiButton className="!bg-gradient-to-r !from-blue-600 !to-purple-600 !rounded-lg !text-lg !font-semibold !px-8 !py-4 hover:!from-blue-700 hover:!to-purple-700 !transition-all !duration-200 !shadow-lg hover:!shadow-xl" />
                </div>
              )}
              
              <Button size="lg" variant="outline" asChild className="border-2 border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-4 text-lg font-semibold backdrop-blur-sm bg-white/80">
                <Link href="/properties">
                  <Play className="w-5 h-5 mr-2" />
                  Explore Properties
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Demo Video/Preview */}
          <motion.div variants={fadeInUp} className="pt-16">
            <div className="relative max-w-4xl mx-auto">
              <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl shadow-2xl overflow-hidden border border-white/20">
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto backdrop-blur-sm">
                      <Play className="w-8 h-8 text-white ml-1" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-white">
                        See AuraBNB in Action
                      </h3>
                      <p className="text-gray-300">
                        Watch how community governance builds unique stays
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <motion.div
                className="absolute -top-6 -right-6 w-12 h-12 bg-blue-500 rounded-full shadow-lg"
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
              <motion.div
                className="absolute -bottom-4 -left-4 w-8 h-8 bg-purple-500 rounded-full shadow-lg"
                animate={{ 
                  rotate: -360,
                  scale: [1, 0.9, 1]
                }}
                transition={{ 
                  duration: 6, 
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.6 }}
      >
        <div className="flex flex-col items-center space-y-2">
          <span className="text-sm text-gray-500 font-medium">Scroll to explore</span>
          <motion.div
            className="w-6 h-10 border-2 border-gray-300 rounded-full flex justify-center"
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <motion.div
              className="w-1 h-2 bg-gray-400 rounded-full mt-2"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
} 