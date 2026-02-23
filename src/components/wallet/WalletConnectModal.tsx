'use client'

import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Wallet, Shield, Zap, Star } from 'lucide-react'

interface WalletOption {
  id: string
  name: string
  icon: string
  description: string
  features: string[]
  isPopular?: boolean
  isRecommended?: boolean
}

const walletOptions: WalletOption[] = [
  {
    id: 'phantom',
    name: 'Phantom',
    icon: '👻',
    description: 'The most popular Solana wallet with great UX',
    features: ['Easy to use', 'Browser extension', 'Mobile app'],
    isPopular: true,
    isRecommended: true
  },
  {
    id: 'solflare',
    name: 'Solflare',
    icon: '🔥',
    description: 'Advanced wallet with DeFi features',
    features: ['Advanced features', 'Staking support', 'Web & mobile'],
    isRecommended: true
  },
  {
    id: 'backpack',
    name: 'Backpack',
    icon: '🎒',
    description: 'Modern wallet with social features',
    features: ['Social features', 'Modern UI', 'Multi-chain'],
  },
  {
    id: 'coin98',
    name: 'Coin98',
    icon: '💰',
    description: 'Multi-chain wallet with trading features',
    features: ['Multi-chain', 'Trading', 'Cross-chain swaps'],
  }
]

interface WalletConnectModalProps {
  isOpen: boolean
  onClose: () => void
  onConnect: (walletType: string) => Promise<void>
  isConnecting: boolean
}

export function WalletConnectModal({
  isOpen,
  onClose,
  onConnect,
  isConnecting
}: WalletConnectModalProps) {
  const [selectedWallet, setSelectedWallet] = React.useState<string | null>(null)

  const handleConnect = async (walletId: string) => {
    setSelectedWallet(walletId)
    try {
      await onConnect(walletId)
    } catch (error) {
      setSelectedWallet(null)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Wallet className="w-6 h-6" />
            <span>Connect Your Wallet</span>
          </DialogTitle>
          <DialogDescription>
            Choose a wallet to connect to AURA Dashboard. Your wallet will be used to sign transactions and interact with the platform.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {walletOptions.map((wallet) => (
            <Card 
              key={wallet.id}
              className={`cursor-pointer transition-all hover:shadow-lg border-2 ${
                selectedWallet === wallet.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleConnect(wallet.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{wallet.icon}</div>
                    <div>
                      <h3 className="font-semibold text-lg">{wallet.name}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        {wallet.isRecommended && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            <Star className="w-3 h-3 mr-1" />
                            Recommended
                          </Badge>
                        )}
                        {wallet.isPopular && (
                          <Badge variant="outline" className="border-blue-200 text-blue-800">
                            Popular
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {selectedWallet === wallet.id && isConnecting && (
                    <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                  )}
                </div>

                <p className="text-sm text-gray-600 mb-4">
                  {wallet.description}
                </p>

                <div className="space-y-2">
                  {wallet.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm text-gray-500">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  className="w-full mt-4"
                  disabled={isConnecting}
                  variant={selectedWallet === wallet.id ? "default" : "outline"}
                >
                  {selectedWallet === wallet.id && isConnecting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    `Connect ${wallet.name}`
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Security Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 mb-1">Security Notice</p>
              <p className="text-blue-700">
                AURA Dashboard will never ask for your seed phrase or private keys. 
                Only connect wallets you trust and always verify the connection request in your wallet.
              </p>
            </div>
          </div>
        </div>

        {/* Features Preview */}
        <div className="border-t pt-6 mt-6">
          <h4 className="font-medium mb-4">What you can do after connecting:</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-blue-600" />
              <span>Stake AURA tokens</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-green-600" />
              <span>Earn rewards</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-purple-600" />
              <span>Vote on proposals</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-orange-600" />
              <span>Trade tokens</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 