'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  ChevronLeft, 
  ChevronRight, 
  Wallet, 
  Coins, 
  Vote, 
  TrendingUp, 
  Home, 
  Gift,
  CheckCircle,
  PlayCircle,
  BookOpen,
  Users
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: React.ElementType
  content: React.ReactNode
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
  completable: boolean
}

interface OnboardingFlowProps {
  onComplete: () => void
  onClose: () => void
}

export function OnboardingFlow({ onComplete, onClose }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())
  const [isVisible, setIsVisible] = useState(true)
  const { toast } = useToast()

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to AuraBNB',
      description: 'The decentralized future of hospitality',
      icon: Home,
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Home className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">Welcome to the Future of Travel</h3>
            <p className="text-gray-600">
              AuraBNB is building a decentralized ecosystem where travelers become stakeholders 
              and every stay contributes to sustainable tourism.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <Coins className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium">2% Burn Mechanism</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Staking Rewards</p>
            </div>
          </div>
        </div>
      ),
      completable: true
    },
    {
      id: 'wallet',
      title: 'Connect Your Wallet',
      description: 'Start your journey by connecting a Solana wallet',
      icon: Wallet,
      content: (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <Wallet className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Connect Your Solana Wallet</h3>
            <p className="text-gray-600">
              Connect a Solana wallet to interact with AuraBNB's ecosystem, stake tokens, 
              and participate in governance.
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center p-3 border rounded-lg">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <Wallet className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Phantom Wallet</p>
                <p className="text-sm text-gray-600">Most popular Solana wallet</p>
              </div>
            </div>
            <div className="flex items-center p-3 border rounded-lg">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                <Wallet className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Solflare</p>
                <p className="text-sm text-gray-600">Feature-rich Solana wallet</p>
              </div>
            </div>
          </div>
        </div>
      ),
      action: {
        label: 'Connect Wallet',
        href: '/dashboard/wallet'
      },
      completable: false
    },
    {
      id: 'aura-token',
      title: 'Get AURA Tokens',
      description: 'Acquire AURA tokens to participate in the ecosystem',
      icon: Coins,
      content: (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <Coins className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Acquire AURA Tokens</h3>
            <p className="text-gray-600">
              AURA tokens are the foundation of our ecosystem. Use them for staking, 
              governance, and accessing exclusive benefits.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Trade on DEX</h4>
              <p className="text-sm text-gray-600 mb-3">Swap SOL for AURA on Jupiter</p>
              <Button size="sm" variant="outline" className="w-full">
                Trade
              </Button>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Join Community</h4>
              <p className="text-sm text-gray-600 mb-3">Learn more in our Discord</p>
              <Button size="sm" variant="outline" className="w-full">
                Join
              </Button>
            </div>
          </div>

          <div className="bg-amber-50 p-4 rounded-lg">
            <h4 className="font-medium text-amber-800 mb-2">Token Benefits</h4>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• Earn 2% from all ecosystem transactions</li>
              <li>• Vote on governance proposals</li>
              <li>• Access to exclusive property investments</li>
              <li>• Discounts on AuraBNB stays</li>
            </ul>
          </div>
        </div>
      ),
      action: {
        label: 'Get AURA Tokens',
        href: '/dashboard/trading'
      },
      completable: false
    },
    {
      id: 'staking',
      title: 'Stake to Earn',
      description: 'Stake your AURA tokens to earn passive rewards',
      icon: TrendingUp,
      content: (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <TrendingUp className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Stake Your AURA Tokens</h3>
            <p className="text-gray-600">
              Stake your AURA tokens to earn passive rewards from the 2% burn mechanism 
              and participate in governance decisions.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-green-600">12.5%</p>
              <p className="text-sm text-green-700">Current APY</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-blue-600">4x</p>
              <p className="text-sm text-blue-700">Daily Rewards</p>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">How It Works</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Stake AURA tokens with no lock-up period</li>
              <li>• Earn proportional rewards from 2% burns</li>
              <li>• Claim rewards 4 times daily</li>
              <li>• Unstake anytime without penalties</li>
            </ul>
          </div>
        </div>
      ),
      action: {
        label: 'Start Staking',
        href: '/user-dashboard#staking'
      },
      completable: false
    },
    {
      id: 'governance',
      title: 'Join Governance',
      description: 'Participate in community decision making',
      icon: Vote,
      content: (
        <div className="space-y-4">
          <div className="text-center mb-6">
            <Vote className="h-16 w-16 text-purple-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Shape the Future</h3>
            <p className="text-gray-600">
              As an AURA holder, you have voting power in our decentralized governance system. 
              Help decide on protocol upgrades, treasury allocation, and ecosystem development.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center p-3 bg-purple-50 rounded-lg">
              <Vote className="h-6 w-6 text-purple-600 mr-3" />
              <div>
                <p className="font-medium">Protocol Upgrades</p>
                <p className="text-sm text-gray-600">Vote on technical improvements</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-blue-50 rounded-lg">
              <Users className="h-6 w-6 text-blue-600 mr-3" />
              <div>
                <p className="font-medium">Treasury Decisions</p>
                <p className="text-sm text-gray-600">Allocate community funds</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-green-50 rounded-lg">
              <BookOpen className="h-6 w-6 text-green-600 mr-3" />
              <div>
                <p className="font-medium">Ecosystem Development</p>
                <p className="text-sm text-gray-600">Guide project roadmap</p>
              </div>
            </div>
          </div>
        </div>
      ),
      action: {
        label: 'View Proposals',
        href: '/dashboard/governance'
      },
      completable: false
    }
  ]

  const currentStepData = steps[currentStep]
  const progress = ((currentStep + 1) / steps.length) * 100

  const markStepComplete = (stepId: string) => {
    setCompletedSteps(prev => new Set([...prev, stepId]))
  }

  const nextStep = () => {
    if (currentStepData.completable) {
      markStepComplete(currentStepData.id)
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    toast({
      title: "Onboarding Complete!",
      description: "Welcome to the AuraBNB ecosystem"
    })
    onComplete()
  }

  const handleSkip = () => {
    toast({
      title: "Onboarding Skipped",
      description: "You can access the tutorial anytime from the help menu"
    })
    onClose()
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <currentStepData.icon className="h-6 w-6" />
                {currentStepData.title}
              </CardTitle>
              <CardDescription>{currentStepData.description}</CardDescription>
            </div>
            <Badge variant="outline">
              {currentStep + 1} of {steps.length}
            </Badge>
          </div>
          <Progress value={progress} className="mt-4" />
        </CardHeader>
        
        <CardContent className="space-y-6">
          {currentStepData.content}
          
          <div className="flex items-center justify-between pt-6 border-t">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button variant="ghost" onClick={handleSkip}>
                Skip Tutorial
              </Button>
            </div>
            
            <div className="flex gap-2">
              {currentStepData.action && (
                <Button
                  variant="outline"
                  onClick={() => {
                    if (currentStepData.action?.href) {
                      window.open(currentStepData.action.href, '_blank')
                    }
                    if (currentStepData.action?.onClick) {
                      currentStepData.action.onClick()
                    }
                  }}
                >
                  {currentStepData.action.label}
                </Button>
              )}
              <Button onClick={nextStep}>
                {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
                {currentStep < steps.length - 1 && <ChevronRight className="h-4 w-4 ml-1" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 