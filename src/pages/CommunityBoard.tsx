
import React from 'react';
import Header from '../components/Header';
import GovernanceDashboard from '../components/GovernanceDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Coins, ArrowUpRight, LucideLineChart } from 'lucide-react';

const CommunityBoardPage = () => {
  // Staking data
  const stakedAmount = 4500;
  const stakingAPY = 12.5;
  const estimatedYearlyReward = stakedAmount * (stakingAPY / 100);
  const nextRewardDate = new Date();
  nextRewardDate.setDate(nextRewardDate.getDate() + 7);
  
  // User's tokens
  const availableTokens = 5500;
  const totalTokens = availableTokens + stakedAmount;
  const stakedPercentage = (stakedAmount / totalTokens) * 100;

  return (
    <div className="min-h-screen bg-white font-urbanist">
      <Header />
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="space-y-12">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-6 font-urbanist leading-tight">
              Governance & Staking
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-urbanist">
              Stake your tokens, vote on proposals, and actively shape the future of the Aura network
            </p>
          </div>
          
          <Tabs defaultValue="governance" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="governance">Governance</TabsTrigger>
              <TabsTrigger value="staking">Staking</TabsTrigger>
            </TabsList>
            
            <TabsContent value="governance" className="space-y-6">
              <GovernanceDashboard />
            </TabsContent>
            
            <TabsContent value="staking" className="space-y-8">
              {/* Staking Summary */}
              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <Coins className="h-8 w-8 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Total Staked</p>
                        <p className="text-2xl font-bold">{stakedAmount.toLocaleString()} AURA</p>
                        <p className="text-xs text-gray-500">{stakedPercentage.toFixed(1)}% of your tokens</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-8 w-8 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-600">Current APY</p>
                        <p className="text-2xl font-bold">{stakingAPY}%</p>
                        <p className="text-xs text-green-600">+1.2% from last month</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <LucideLineChart className="h-8 w-8 text-purple-600" />
                      <div>
                        <p className="text-sm text-gray-600">Est. Annual Rewards</p>
                        <p className="text-2xl font-bold">{estimatedYearlyReward.toLocaleString()} AURA</p>
                        <p className="text-xs text-gray-500">Next reward: {nextRewardDate.toLocaleDateString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Main Staking Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Manage Your Stake</CardTitle>
                  <CardDescription>
                    Stake your AURA tokens to earn rewards and increase your voting power
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Current Stake */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Current Stake</h4>
                    <div className="flex justify-between items-center text-sm">
                      <span>Available: {availableTokens.toLocaleString()} AURA</span>
                      <span>Staked: {stakedAmount.toLocaleString()} AURA</span>
                    </div>
                    <Progress value={stakedPercentage} className="h-2" />
                    <p className="text-xs text-gray-600">
                      {stakedPercentage.toFixed(1)}% of your tokens are staked
                    </p>
                  </div>
                  
                  {/* Stake More */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4 border p-4 rounded-lg">
                      <h4 className="font-medium">Stake More</h4>
                      <div className="flex items-center gap-2">
                        <input 
                          type="number" 
                          className="border rounded w-full p-2"
                          placeholder="Amount to stake"
                          min="1"
                          max={availableTokens}
                        />
                        <Button className="whitespace-nowrap bg-blue-600 hover:bg-blue-700">
                          Stake Tokens
                        </Button>
                      </div>
                      <p className="text-xs text-gray-600">
                        Max: {availableTokens.toLocaleString()} AURA available in your wallet
                      </p>
                    </div>
                    
                    {/* Unstake */}
                    <div className="space-y-4 border p-4 rounded-lg">
                      <h4 className="font-medium">Unstake</h4>
                      <div className="flex items-center gap-2">
                        <input 
                          type="number" 
                          className="border rounded w-full p-2"
                          placeholder="Amount to unstake"
                          min="1"
                          max={stakedAmount}
                        />
                        <Button variant="outline" className="whitespace-nowrap border-red-500 text-red-500 hover:bg-red-50">
                          Unstake
                        </Button>
                      </div>
                      <p className="text-xs text-gray-600">
                        Max: {stakedAmount.toLocaleString()} AURA currently staked
                      </p>
                    </div>
                  </div>
                  
                  {/* Rewards Section */}
                  <div className="border-t pt-4 mt-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">Unclaimed Rewards</h4>
                        <p className="text-sm text-gray-600">Rewards are distributed weekly</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-lg">125.32 AURA</p>
                        <p className="text-xs text-gray-500">≈ $12.53 USD</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Button className="w-full bg-green-600 hover:bg-green-700">
                        Claim Rewards
                      </Button>
                    </div>
                  </div>
                  
                  {/* Info Box */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <ArrowUpRight className="h-4 w-4" /> Staking Benefits
                    </h4>
                    <ul className="space-y-1 text-gray-600">
                      <li>• Earn {stakingAPY}% APY on your staked AURA tokens</li>
                      <li>• Increase your voting power in governance proposals</li>
                      <li>• Support network security and decentralization</li>
                      <li>• Automatically participate in protocol fee distribution</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default CommunityBoardPage;
