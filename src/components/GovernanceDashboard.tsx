import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Vote, Users, Calendar, TrendingUp, AlertTriangle, Shield } from 'lucide-react';
import { log } from '@/lib/logger';

interface Proposal {
  id: string;
  title: string;
  description: string;
  category: 'treasury' | 'charitable' | 'operational' | 'partnership';
  status: 'active' | 'passed' | 'failed' | 'pending';
  votesFor: number;
  votesAgainst: number;
  totalVotes: number;
  endDate: string;
  proposer: string;
}

const GovernanceDashboard = () => {
  const [userVotingPower] = useState(1250);
  const [userStakedAmount] = useState(800); // Amount of tokens staked by user
  const [hasVoted, setHasVoted] = useState<Record<string, boolean>>({});
  
  // Token supply and voting calculations
  const totalTokenSupply = 100000000; // 100M tokens
  const maxVotingPowerPerAccount = totalTokenSupply * 0.02; // 2% max
  
  // Only staked tokens count for voting power
  const effectiveVotingPower = Math.min(userStakedAmount, maxVotingPowerPerAccount);
  const votingPowerPercentage = (effectiveVotingPower / totalTokenSupply) * 100;
  const isEligibleToVote = userStakedAmount > 0;

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
    }
  ];

  const handleVote = (proposalId: string, vote: 'for' | 'against') => {
    setHasVoted(prev => ({ ...prev, [proposalId]: true }));
    log.dev(`Voted ${vote} on proposal ${proposalId}`, { proposalId, vote, effectiveVotingPower }, 'Governance');
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'treasury': return 'bg-blue-100 text-blue-800';
      case 'charitable': return 'bg-green-100 text-green-800';
      case 'operational': return 'bg-purple-100 text-purple-800';
      case 'partnership': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'passed': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      {/* Governance Stats */}
      <div className="grid md:grid-cols-4 gap-6">
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
        
        <TabsContent value="active" className="space-y-6">
          <div className="space-y-6">
            {proposals.filter(p => p.status === 'active').map((proposal) => (
              <Card key={proposal.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <CardTitle className="text-xl">{proposal.title}</CardTitle>
                      <div className="flex gap-2">
                        <Badge className={getCategoryColor(proposal.category)}>
                          {proposal.category.charAt(0).toUpperCase() + proposal.category.slice(1)}
                        </Badge>
                        <Badge className={getStatusColor(proposal.status)}>
                          {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-600">
                      <p>Ends: {new Date(proposal.endDate).toLocaleDateString()}</p>
                      <p>By: {proposal.proposer}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription className="text-base">
                    {proposal.description}
                  </CardDescription>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>For: {proposal.votesFor.toLocaleString()}</span>
                      <span>Against: {proposal.votesAgainst.toLocaleString()}</span>
                    </div>
                    <Progress 
                      value={(proposal.votesFor / proposal.totalVotes) * 100} 
                      className="h-2"
                    />
                    <p className="text-sm text-gray-600">
                      {proposal.totalVotes.toLocaleString()} total votes • 
                      {((proposal.votesFor / proposal.totalVotes) * 100).toFixed(1)}% in favor
                    </p>
                  </div>

                  {!hasVoted[proposal.id] && proposal.status === 'active' && (
                    <div className="space-y-3">
                      {isEligibleToVote ? (
                        <>
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <p className="text-sm text-blue-800">
                              <Shield className="h-4 w-4 inline mr-1" />
                              Your vote will count as {effectiveVotingPower.toLocaleString()} votes (from {userStakedAmount.toLocaleString()} staked tokens)
                            </p>
                          </div>
                          <div className="flex gap-3">
                            <Button 
                              onClick={() => handleVote(proposal.id, 'for')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Vote For ({effectiveVotingPower.toLocaleString()})
                            </Button>
                            <Button 
                              onClick={() => handleVote(proposal.id, 'against')}
                              variant="outline"
                              className="border-red-600 text-red-600 hover:bg-red-50"
                            >
                              Vote Against ({effectiveVotingPower.toLocaleString()})
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="bg-red-50 p-3 rounded-lg">
                          <p className="text-sm text-red-800">
                            <Shield className="h-4 w-4 inline mr-1" />
                            You must stake AURA tokens to vote on this proposal
                          </p>
                          <Button 
                            variant="outline"
                            className="mt-2 border-red-600 text-red-600"
                            onClick={() => window.open('/trading', '_blank')}
                          >
                            Go to Staking →
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {hasVoted[proposal.id] && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-800">✓ You have voted on this proposal with {effectiveVotingPower.toLocaleString()} voting power</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="passed" className="space-y-6">
          <div className="space-y-6">
            {proposals.filter(p => p.status === 'passed').map((proposal) => (
              <Card key={proposal.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{proposal.title}</CardTitle>
                    <Badge className={getStatusColor(proposal.status)}>
                      Passed
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    {proposal.description}
                  </CardDescription>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm text-green-800">
                      ✓ Passed with {((proposal.votesFor / proposal.totalVotes) * 100).toFixed(1)}% approval
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="failed" className="space-y-6">
          <div className="text-center py-8 text-gray-500">
            <p>No failed proposals to display</p>
          </div>
        </TabsContent>
        
        <TabsContent value="charter" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Governance Voting Rules</CardTitle>
              <CardDescription>
                The rules and guidelines that govern our decentralized decision-making process
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <Vote className="h-5 w-5 text-blue-600" />
                    Voting Power System
                  </h4>
                  <ul className="space-y-2 text-gray-700">
                    <li>• <strong>1 Token = 1 Vote:</strong> Each AURA token grants one vote</li>
                    <li>• <strong>2% Maximum Cap:</strong> No single account can have more than 2% of total supply voting power</li>
                    <li>• <strong>Current Max:</strong> {maxVotingPowerPerAccount.toLocaleString()} tokens ({(maxVotingPowerPerAccount / totalTokenSupply * 100).toFixed(1)}%)</li>
                    <li>• <strong>Your Power:</strong> {effectiveVotingPower.toLocaleString()} votes ({votingPowerPercentage.toFixed(3)}%)</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-lg mb-2">Proposal Categories</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li>• <strong>Treasury Acquisitions:</strong> Property purchases and major investments</li>
                    <li>• <strong>Charitable Initiatives:</strong> Community projects and sustainability efforts</li>
                    <li>• <strong>Operational Changes:</strong> Protocol updates and operational decisions</li>
                    <li>• <strong>Partnerships:</strong> Strategic alliances and vendor relationships</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-lg mb-2">Foundation Authority</h4>
                  <p className="text-gray-600">
                    The foundation retains control over critical decisions including construction, major financial moves, 
                    and emergency actions to prevent governance attacks.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-lg mb-2">Voting Timeline</h4>
                  <p className="text-gray-600">
                    All proposals have a 7-day voting period with a minimum participation threshold for validity.
                  </p>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-orange-600" />
                    Anti-Concentration Measures
                  </h4>
                  <p className="text-gray-700">
                    The 2% voting power cap prevents any single entity from controlling governance decisions, 
                    ensuring democratic participation and protecting against whale manipulation.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GovernanceDashboard;
