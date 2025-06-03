
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Wallet, Clock, Gift, Star } from 'lucide-react';
import { log } from '@/lib/logger';

const StakeToEarnDashboard = () => {
  const [stakeAmount, setStakeAmount] = useState('');
  const [stakedBalance] = useState(1250);
  const [availableBalance] = useState(500);
  const [earnedRewards] = useState(62.5);
  const [stakingDuration] = useState(45); // days

  const rewardTokens = [
    { symbol: 'AURA', apy: '12%', earned: 45.2, icon: '🌟' },
    { symbol: 'SOL', apy: '8%', earned: 0.15, icon: '◎' },
    { symbol: 'USDC', apy: '5%', earned: 17.1, icon: '💵' }
  ];

  const handleStake = () => {
    log.dev('Staking tokens', { stakeAmount }, 'StakeToEarn');
    // Implementation for staking
  };

  const handleUnstake = () => {
    log.dev('Unstaking tokens', {}, 'StakeToEarn');
    // Implementation for unstaking
  };

  const handleClaimRewards = () => {
    log.dev('Claiming rewards', {}, 'StakeToEarn');
    // Implementation for claiming rewards
  };

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Wallet className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Staked Balance</p>
                <p className="text-2xl font-bold">{stakedBalance.toLocaleString()} AURA</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Rewards</p>
                <p className="text-2xl font-bold">${earnedRewards.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Staking Duration</p>
                <p className="text-2xl font-bold">{stakingDuration} days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Star className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">APY Average</p>
                <p className="text-2xl font-bold">8.3%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="stake" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="stake">Stake & Unstake</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="governance">Governance Power</TabsTrigger>
        </TabsList>
        
        <TabsContent value="stake" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Stake AURA Tokens</CardTitle>
                <CardDescription>
                  Stake your AURA tokens to earn rewards. No lockup period required.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Available Balance: {availableBalance} AURA</label>
                  <Input
                    type="number"
                    placeholder="Enter amount to stake"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => setStakeAmount((availableBalance * 0.25).toString())}
                    variant="outline"
                    size="sm"
                  >
                    25%
                  </Button>
                  <Button 
                    onClick={() => setStakeAmount((availableBalance * 0.5).toString())}
                    variant="outline"
                    size="sm"
                  >
                    50%
                  </Button>
                  <Button 
                    onClick={() => setStakeAmount((availableBalance * 0.75).toString())}
                    variant="outline"
                    size="sm"
                  >
                    75%
                  </Button>
                  <Button 
                    onClick={() => setStakeAmount(availableBalance.toString())}
                    variant="outline"
                    size="sm"
                  >
                    Max
                  </Button>
                </div>
                <Button onClick={handleStake} className="w-full">
                  Stake AURA
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Unstake Tokens</CardTitle>
                <CardDescription>
                  Unstake your tokens anytime. No penalties or waiting periods.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Currently Staked</p>
                  <p className="text-xl font-semibold">{stakedBalance.toLocaleString()} AURA</p>
                </div>
                <Button onClick={handleUnstake} variant="outline" className="w-full">
                  Unstake All
                </Button>
                <p className="text-xs text-gray-500">
                  Note: Unstaking will stop reward accumulation for unstaked tokens
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="rewards" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5" />
                  Reward Tokens
                </CardTitle>
                <CardDescription>
                  Earn 1% of your staked amount per week across various reward tokens
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rewardTokens.map((token, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{token.icon}</span>
                        <div>
                          <p className="font-semibold">{token.symbol}</p>
                          <p className="text-sm text-gray-600">APY: {token.apy}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{token.earned.toFixed(4)} {token.symbol}</p>
                        <p className="text-sm text-gray-600">Earned</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button onClick={handleClaimRewards} className="w-full mt-6">
                  Claim All Rewards
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Reward Calculator</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Weekly Rewards</p>
                      <p className="text-lg font-semibold">{(stakedBalance * 0.01).toFixed(2)} AURA</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Annual Projection</p>
                      <p className="text-lg font-semibold">{(stakedBalance * 0.52).toFixed(2)} AURA</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="governance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Governance Voting Power</CardTitle>
              <CardDescription>
                Your staked tokens provide voting power for treasury acquisitions and governance proposals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Voting Power</p>
                    <p className="text-2xl font-semibold">{stakedBalance.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">1 AURA = 1 Vote</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Time Weight Multiplier</p>
                    <p className="text-2xl font-semibold">1.45x</p>
                    <p className="text-xs text-gray-500">Based on {stakingDuration} days staked</p>
                  </div>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Active Proposals</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm">Treasury Acquisition: New Property in Bali</span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Active</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm">Increase Marketing Budget by 15%</span>
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Voting</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View All Proposals
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StakeToEarnDashboard;
