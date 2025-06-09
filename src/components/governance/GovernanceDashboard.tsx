'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Vote, Users, Calendar, TrendingUp, AlertTriangle, Shield, CheckCircle, Clock } from 'lucide-react'

interface Proposal {
  id: string
  title: string
  description: string
  category: 'treasury' | 'charitable' | 'operational' | 'partnership'
  status: 'active' | 'passed' | 'failed' | 'pending'
  votesFor: number
  votesAgainst: number
  totalVotes: number
  endDate: string
  proposer: string
}

export function GovernanceDashboard() {
  const [userVotingPower] = useState(1250)
  const [userStakedAmount] = useState(800) // Amount of tokens staked by user
  const [hasVoted, setHasVoted] = useState<Record<string, boolean>>({})
  
  // Token supply and voting calculations
  const totalTokenSupply = 100000000 // 100M tokens
  const maxVotingPowerPerAccount = totalTokenSupply * 0.02 // 2% max
  
  // Only staked tokens count for voting power
  const effectiveVotingPower = Math.min(userStakedAmount, maxVotingPowerPerAccount)
  const votingPowerPercentage = (effectiveVotingPower / totalTokenSupply) * 100
  const isEligibleToVote = userStakedAmount > 0

  const proposals: Proposal[] = [
    {
      id: '1',
      title: 'Acquire Beachfront Property in Costa Rica',
      description: 'Proposal to acquire a 5-acre beachfront property in Guanacaste Province for the next Aura resort development.',
      category: 'treasury',
      status: 'active',
      votesFor: 45000,
      votesAgainst: 12000,
      totalVotes: 57000,
      endDate: '2025-06-01',
      proposer: 'Aura Foundation'
    },
    {
      id: '2',
      title: 'Solar School Construction in Bali',
      description: 'Fund the construction of a solar-powered school in rural Bali, supporting local education and sustainable development.',
      category: 'charitable',
      status: 'active',
      votesFor: 38000,
      votesAgainst: 5000,
      totalVotes: 43000,
      endDate: '2025-06-05',
      proposer: 'Community Member'
    },
    {
      id: '3',
      title: 'Partnership with Local Organic Farm Network',
      description: 'Establish partnerships with organic farms near our properties to ensure locally-sourced food supplies.',
      category: 'partnership',
      status: 'passed',
      votesFor: 52000,
      votesAgainst: 8000,
      totalVotes: 60000,
      endDate: '2025-05-20',
      proposer: 'Operations Team'
    },
    {
      id: '4',
      title: 'Implement Community Reward Program',
      description: 'Create a comprehensive rewards program for community members who contribute to ecosystem growth.',
      category: 'operational',
      status: 'pending',
      votesFor: 0,
      votesAgainst: 0,
      totalVotes: 0,
      endDate: '2025-06-15',
      proposer: 'Community Team'
    }
  ]

  const handleVote = (proposalId: string, vote: 'for' | 'against') => {
    setHasVoted(prev => ({ ...prev, [proposalId]: true }))
    console.log(`Voted ${vote} on proposal ${proposalId}`, { proposalId, vote, effectiveVotingPower })
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'treasury': return 'bg-blue-100 text-blue-800'
      case 'charitable': return 'bg-green-100 text-green-800'
      case 'operational': return 'bg-purple-100 text-purple-800'
      case 'partnership': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'passed': return 'bg-blue-100 text-blue-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Vote className="h-4 w-4" />
      case 'passed': return <CheckCircle className="h-4 w-4" />
      case 'failed': return <AlertTriangle className="h-4 w-4" />
      case 'pending': return <Clock className="h-4 w-4" />
      default: return <Vote className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Governance Dashboard</h1>
        <p className="text-muted-foreground">Participate in DAO governance and community decisions</p>
      </div>

      {/* Governance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Vote className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Your Voting Power</p>
                <p className="text-2xl font-bold">{effectiveVotingPower.toLocaleString()}</p>
                <p className="text-xs text-gray-500">
                  {votingPowerPercentage.toFixed(3)}% • {userStakedAmount.toLocaleString()} staked
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Active Proposals</p>
                <p className="text-2xl font-bold">{proposals.filter(p => p.status === 'active').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Proposals Passed</p>
                <p className="text-2xl font-bold">{proposals.filter(p => p.status === 'passed').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Participation Rate</p>
                <p className="text-2xl font-bold">78%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Voting Power Notice */}
      {userVotingPower > maxVotingPowerPerAccount && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-orange-800">
                  Voting Power Capped: You hold {userVotingPower.toLocaleString()} tokens, but voting power is limited to 2% of total supply ({maxVotingPowerPerAccount.toLocaleString()} tokens) to prevent governance concentration.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Staking Requirement Notice */}
      {!isEligibleToVote && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium text-red-800">
                  Staking Required: You must stake AURA tokens to participate in governance voting. 
                  Only staked tokens count toward your voting power.
                </p>
                <p className="text-xs text-red-700 mt-1">
                  Visit the Trading Hub → Staking section to stake your tokens and unlock voting privileges.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="active">Active Proposals</TabsTrigger>
          <TabsTrigger value="passed">Passed</TabsTrigger>
          <TabsTrigger value="failed">Failed</TabsTrigger>
          <TabsTrigger value="charter">Voting Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className="space-y-4">
            {proposals.filter(p => p.status === 'active').map((proposal) => (
              <Card key={proposal.id} className="border-l-4 border-l-green-500">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{proposal.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={getCategoryColor(proposal.category)}>
                          {proposal.category}
                        </Badge>
                        <Badge className={getStatusColor(proposal.status)}>
                          {getStatusIcon(proposal.status)}
                          <span className="ml-1">{proposal.status}</span>
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <p>Ends: {new Date(proposal.endDate).toLocaleDateString()}</p>
                      <p>By: {proposal.proposer}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">{proposal.description}</p>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>For: {proposal.votesFor.toLocaleString()} votes</span>
                      <span>Against: {proposal.votesAgainst.toLocaleString()} votes</span>
                    </div>
                    
                    <Progress 
                      value={proposal.totalVotes > 0 ? (proposal.votesFor / proposal.totalVotes) * 100 : 0} 
                      className="h-2"
                    />
                    
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{((proposal.votesFor / proposal.totalVotes) * 100).toFixed(1)}% support</span>
                      <span>{proposal.totalVotes.toLocaleString()} total votes</span>
                    </div>
                  </div>

                  {isEligibleToVote && !hasVoted[proposal.id] && (
                    <div className="flex gap-2 mt-4">
                      <Button 
                        onClick={() => handleVote(proposal.id, 'for')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Vote For
                      </Button>
                      <Button 
                        onClick={() => handleVote(proposal.id, 'against')}
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        Vote Against
                      </Button>
                    </div>
                  )}

                  {hasVoted[proposal.id] && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-800">✓ You have voted on this proposal</p>
                    </div>
                  )}

                  {!isEligibleToVote && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Stake AURA tokens to vote on this proposal</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="passed" className="space-y-4">
          <div className="space-y-4">
            {proposals.filter(p => p.status === 'passed').map((proposal) => (
              <Card key={proposal.id} className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{proposal.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={getCategoryColor(proposal.category)}>
                          {proposal.category}
                        </Badge>
                        <Badge className={getStatusColor(proposal.status)}>
                          {getStatusIcon(proposal.status)}
                          <span className="ml-1">{proposal.status}</span>
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <p>Ended: {new Date(proposal.endDate).toLocaleDateString()}</p>
                      <p>By: {proposal.proposer}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">{proposal.description}</p>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>For: {proposal.votesFor.toLocaleString()} votes</span>
                      <span>Against: {proposal.votesAgainst.toLocaleString()} votes</span>
                    </div>
                    
                    <Progress 
                      value={(proposal.votesFor / proposal.totalVotes) * 100} 
                      className="h-2"
                    />
                    
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{((proposal.votesFor / proposal.totalVotes) * 100).toFixed(1)}% support</span>
                      <span>{proposal.totalVotes.toLocaleString()} total votes</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="failed" className="space-y-4">
          <div className="text-center py-8 text-gray-500">
            No failed proposals yet
          </div>
        </TabsContent>

        <TabsContent value="charter" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AuraBNB DAO Governance Charter</CardTitle>
              <CardDescription>Rules and guidelines for community governance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">Voting Eligibility</h4>
                <p className="text-sm text-gray-600">
                  Only users who have staked AURA tokens are eligible to vote. Your voting power is equal to your staked token amount, 
                  capped at 2% of total supply to prevent governance concentration.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Proposal Categories</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-3 bg-blue-50 rounded">
                    <Badge className="bg-blue-100 text-blue-800 mb-2">Treasury</Badge>
                    <p className="text-gray-600">Decisions about treasury allocation and major financial decisions</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded">
                    <Badge className="bg-green-100 text-green-800 mb-2">Charitable</Badge>
                    <p className="text-gray-600">Community-driven charitable initiatives and social impact projects</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded">
                    <Badge className="bg-purple-100 text-purple-800 mb-2">Operational</Badge>
                    <p className="text-gray-600">Day-to-day operations, policies, and procedural changes</p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded">
                    <Badge className="bg-orange-100 text-orange-800 mb-2">Partnership</Badge>
                    <p className="text-gray-600">Strategic partnerships and collaboration agreements</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Voting Periods</h4>
                <p className="text-sm text-gray-600">
                  Standard voting period is 7 days. Emergency proposals may have shorter periods. 
                  All times are in UTC and voting ends at 23:59 UTC on the specified date.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Proposal Requirements</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Minimum 100 AURA staked to submit proposals</li>
                  <li>• Clear description of the proposal and its impact</li>
                  <li>• Budget breakdown for treasury proposals</li>
                  <li>• Timeline and implementation plan</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 