
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Lock, Coins, TrendingUp, Clock, AlertCircle } from 'lucide-react';

const StakingSection: React.FC = () => {
  const [stakeAmount, setStakeAmount] = useState('');
  const [userBalance] = useState(1000); // Mock user balance

  return (
    <div className="space-y-6">
      {/* Coming Soon Overlay */}
      <div className="relative">
        {/* Blur overlay */}
        <div className="absolute inset-0 bg-gray-100/80 backdrop-blur-sm z-10 rounded-xl flex items-center justify-center">
          <div className="text-center p-6">
            <AlertCircle className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-700 mb-2 font-urbanist">Coming Soon</h3>
            <p className="text-gray-600 font-urbanist">AURA staking will be available soon with proportional payouts from contract splits</p>
          </div>
        </div>

        {/* Actual content (blurred) */}
        <div className="filter blur-sm pointer-events-none">
          <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold text-purple-900 font-urbanist flex items-center gap-2">
                    <Lock className="h-6 w-6" />
                    AURA Staking
                  </CardTitle>
                  <CardDescription className="text-purple-700 font-urbanist mt-2">
                    Stake AURA tokens to earn proportional payouts from contract revenue splits
                  </CardDescription>
                </div>
                <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                  APY: ~12-18%
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Staking Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/70 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Coins className="h-5 w-5 text-purple-600" />
                    <span className="text-sm font-medium text-purple-700">Total Staked</span>
                  </div>
                  <p className="text-xl font-bold text-purple-900">2.4M AURA</p>
                </div>
                <div className="bg-white/70 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-purple-700">Your Rewards</span>
                  </div>
                  <p className="text-xl font-bold text-purple-900">0.00 AURA</p>
                </div>
                <div className="bg-white/70 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-purple-700">Lock Period</span>
                  </div>
                  <p className="text-xl font-bold text-purple-900">Flexible</p>
                </div>
              </div>

              {/* Staking Form */}
              <div className="bg-white/50 p-6 rounded-xl border border-purple-200">
                <h4 className="font-semibold text-purple-900 mb-4 font-urbanist">Stake AURA Tokens</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-purple-700 mb-2">
                      Available Balance: {userBalance.toLocaleString()} AURA
                    </label>
                    <Input
                      type="number"
                      placeholder="Enter amount to stake"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      className="border-purple-300 focus:border-purple-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="border-purple-300 text-purple-700">25%</Button>
                    <Button variant="outline" size="sm" className="border-purple-300 text-purple-700">50%</Button>
                    <Button variant="outline" size="sm" className="border-purple-300 text-purple-700">75%</Button>
                    <Button variant="outline" size="sm" className="border-purple-300 text-purple-700">Max</Button>
                  </div>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-urbanist">
                    Stake AURA
                  </Button>
                </div>
              </div>

              {/* Revenue Split Info */}
              <div className="bg-gradient-to-r from-purple-100 to-blue-100 p-4 rounded-xl border border-purple-200">
                <h4 className="font-semibold text-purple-900 mb-2 font-urbanist">How Payouts Work</h4>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>• Revenue from property contracts is split proportionally among stakers</li>
                  <li>• Payouts are distributed weekly based on your staking percentage</li>
                  <li>• No lock-up period - unstake anytime without penalties</li>
                  <li>• Compound your rewards by restaking automatically</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StakingSection;
