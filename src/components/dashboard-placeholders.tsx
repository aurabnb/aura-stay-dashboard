'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Coins, 
  ArrowUpDown, 
  Gift, 
  Vote, 
  BarChart3, 
  Activity, 
  Settings,
  TrendingUp,
  Users,
  Calendar,
  Target
} from 'lucide-react'

// Placeholder for StakingSection
export function StakingSection() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Coins className="w-6 h-6" />
            <span>Staking</span>
          </CardTitle>
          <CardDescription>
            Stake your AURA tokens to earn rewards and participate in governance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Available to Stake</p>
              <p className="text-2xl font-bold">8,750 AURA</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Currently Staked</p>
              <p className="text-2xl font-bold">5,000 AURA</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Pending Rewards</p>
              <p className="text-2xl font-bold">234.56 AURA</p>
            </div>
          </div>
          
          <div className="flex space-x-4">
            <Button className="flex-1">
              <Coins className="w-4 h-4 mr-2" />
              Stake AURA
            </Button>
            <Button variant="outline" className="flex-1">
              <Gift className="w-4 h-4 mr-2" />
              Claim Rewards
            </Button>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              💡 <strong>Tax Redistribution:</strong> All staking taxes are redistributed back to stakers as bonus rewards!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Placeholder for TradingSection
export function TradingSection() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ArrowUpDown className="w-6 h-6" />
            <span>Trading & Swaps</span>
          </CardTitle>
          <CardDescription>
            Trade tokens and access DEX functionality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-medium">Quick Swap</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-center text-gray-600">Swap interface coming soon</p>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-medium">Trading Pairs</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span>AURA/SOL</span>
                  <Badge>Active</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span>AURA/USDC</span>
                  <Badge>Active</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Placeholder for GovernanceSection
export function GovernanceSection() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Vote className="w-6 h-6" />
            <span>Governance</span>
          </CardTitle>
          <CardDescription>
            Participate in DAO governance and vote on proposals
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Your Voting Power</p>
                <p className="text-2xl font-bold">8,750 VP</p>
              </div>
              <Badge className="bg-green-500">Active</Badge>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Active Proposals</h3>
            <Card>
              <CardContent className="pt-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">Proposal #001: Increase Staking Rewards</h4>
                  <Badge variant="outline">Active</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Proposal to increase base staking rewards from 8% to 10% APY
                </p>
                <div className="flex space-x-2">
                  <Button size="sm" className="flex-1">Vote Yes</Button>
                  <Button size="sm" variant="outline" className="flex-1">Vote No</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Placeholder for RewardsSection
export function RewardsSection() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Gift className="w-6 h-6" />
            <span>Rewards</span>
          </CardTitle>
          <CardDescription>
            Track and claim your staking and participation rewards
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="font-medium mb-2">Staking Rewards</h3>
              <p className="text-2xl font-bold text-green-600 mb-1">234.56 AURA</p>
              <p className="text-sm text-gray-600">~$332.87 USD</p>
              <Button className="w-full mt-4">Claim Rewards</Button>
            </div>
            <div className="bg-purple-50 rounded-lg p-6">
              <h3 className="font-medium mb-2">Governance Rewards</h3>
              <p className="text-2xl font-bold text-purple-600 mb-1">45.23 AURA</p>
              <p className="text-sm text-gray-600">~$64.12 USD</p>
              <Button variant="outline" className="w-full mt-4">Claim Rewards</Button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Reward History</h3>
            <div className="space-y-2">
              {[
                { date: '2024-01-15', amount: '12.34 AURA', type: 'Staking' },
                { date: '2024-01-14', amount: '8.76 AURA', type: 'Governance' },
                { date: '2024-01-13', amount: '15.67 AURA', type: 'Staking' },
              ].map((reward, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{reward.amount}</p>
                    <p className="text-sm text-gray-600">{reward.type}</p>
                  </div>
                  <p className="text-sm text-gray-600">{reward.date}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Placeholder for TransactionHistory
export function TransactionHistory() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-6 h-6" />
            <span>Transaction History</span>
          </CardTitle>
          <CardDescription>
            View all your transaction history and activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { type: 'Stake', amount: '500 AURA', date: '2024-01-15 14:30', status: 'Confirmed' },
              { type: 'Reward', amount: '+12.34 AURA', date: '2024-01-15 12:00', status: 'Confirmed' },
              { type: 'Swap', amount: '100 SOL → AURA', date: '2024-01-14 09:15', status: 'Confirmed' },
              { type: 'Vote', amount: 'Proposal #001', date: '2024-01-13 16:45', status: 'Confirmed' },
            ].map((tx, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    tx.type === 'Stake' ? 'bg-blue-100' :
                    tx.type === 'Reward' ? 'bg-green-100' :
                    tx.type === 'Swap' ? 'bg-purple-100' : 'bg-orange-100'
                  }`}>
                    {tx.type === 'Stake' ? <Coins className="w-4 h-4" /> :
                     tx.type === 'Reward' ? <Gift className="w-4 h-4" /> :
                     tx.type === 'Swap' ? <ArrowUpDown className="w-4 h-4" /> :
                     <Vote className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="font-medium">{tx.type}</p>
                    <p className="text-sm text-gray-600">{tx.amount}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">{tx.date}</p>
                  <Badge className="bg-green-500">{tx.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Placeholder for UserAnalytics
export function UserAnalytics() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-6 h-6" />
            <span>Your Analytics</span>
          </CardTitle>
          <CardDescription>
            Personal insights and performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-gray-600">Portfolio Growth</span>
              </div>
              <p className="text-2xl font-bold">+18.23%</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Coins className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-600">Staking ROI</span>
              </div>
              <p className="text-2xl font-bold">+14.5%</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                <span className="text-sm text-gray-600">Days Active</span>
              </div>
              <p className="text-2xl font-bold">28</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="w-5 h-5 text-orange-600" />
                <span className="text-sm text-gray-600">Participation</span>
              </div>
              <p className="text-2xl font-bold">85%</p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium mb-2">🎯 Insights</h4>
            <p className="text-sm text-blue-800">
              Your portfolio has outperformed the market by 5.2% this month. 
              Consider diversifying your holdings to reduce risk.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Placeholder for UserSettings
export function UserSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-6 h-6" />
            <span>Settings</span>
          </CardTitle>
          <CardDescription>
            Manage your account preferences and security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Theme</p>
                <p className="text-sm text-gray-600">Choose your preferred theme</p>
              </div>
              <Button variant="outline" size="sm">Light</Button>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Notifications</p>
                <p className="text-sm text-gray-600">Email and push notifications</p>
              </div>
              <Button variant="outline" size="sm">Enabled</Button>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Privacy</p>
                <p className="text-sm text-gray-600">Control data sharing preferences</p>
              </div>
              <Button variant="outline" size="sm">Configure</Button>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Security</p>
                <p className="text-sm text-gray-600">Two-factor authentication and more</p>
              </div>
              <Button variant="outline" size="sm">Manage</Button>
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button variant="destructive" className="w-full">
              Disconnect Wallet
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 