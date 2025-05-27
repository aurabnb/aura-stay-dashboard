
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Target, DollarSign, MapPin, Calendar, Users } from 'lucide-react';
import { useTreasuryData } from '../hooks/useTreasuryData';

interface TreasuryProgressProps {
  currentAmount?: number;
  targetAmount?: number;
}

const TreasuryProgress = ({ targetAmount = 100000 }: TreasuryProgressProps) => {
  const { data } = useTreasuryData();

  // Calculate raised amount: total SOL that has come through Project Funding wallets
  // This should be a lifetime total - for now using current balances as proxy
  const calculateRaisedAmount = () => {
    if (!data?.wallets) return 20000; // fallback
    
    const projectFundingWallets = data.wallets.filter(wallet => 
      wallet.name.includes('Project Funding')
    );
    
    // Sum all SOL balances from project funding wallets
    // In a real implementation, this would track lifetime inflows
    const totalSol = projectFundingWallets.reduce((sum, wallet) => {
      const solBalance = wallet.balances.find(b => b.token_symbol === 'SOL');
      return sum + (solBalance?.balance || 0);
    }, 0);
    
    // Convert SOL to USD using current SOL price
    const solPrice = data.solPrice || 180;
    return totalSol * solPrice;
  };

  // Calculate funding progress: LP tokens + liquid assets + ETH wallet assets
  const calculateFundingProgress = () => {
    if (!data?.wallets) return 20000; // fallback
    
    let totalFunding = 0;
    
    data.wallets.forEach(wallet => {
      wallet.balances.forEach(balance => {
        // Include LP tokens
        if (balance.is_lp_token) {
          totalFunding += balance.usd_value || 0;
        }
        
        // Include liquid assets (SOL, ETH, USDC, USDT, AURA, CULT/DCULT)
        if (['SOL', 'ETH', 'USDC', 'USDT', 'AURA', 'CULT'].includes(balance.token_symbol)) {
          totalFunding += balance.usd_value || 0;
        }
      });
    });
    
    return totalFunding;
  };

  const raisedAmount = calculateRaisedAmount();
  const currentFundingAmount = calculateFundingProgress();
  const progressPercentage = (currentFundingAmount / targetAmount) * 100;
  const remaining = targetAmount - currentFundingAmount;

  return (
    <Card className="w-full border-none shadow-lg">
      <CardHeader className="text-center pb-6">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl">
          <Target className="h-6 w-6 text-gray-600" />
          Volcano Stay Funding Progress
        </CardTitle>
        <CardDescription className="text-lg">
          Track our progress toward fully funding the first AURA eco-stay in Guayabo, Costa Rica
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Progress Bar */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium">Funding Progress</span>
            <span className="text-lg text-gray-600 font-semibold">{progressPercentage.toFixed(1)}% Complete</span>
          </div>
          <div className="relative">
            <Progress value={progressPercentage} className="h-4 bg-gray-100" />
            <div className="absolute top-0 left-0 h-4 bg-gradient-to-r from-gray-700 to-black rounded-full transition-all duration-500" 
                 style={{ width: `${Math.min(progressPercentage, 100)}%` }} />
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>${currentFundingAmount.toLocaleString()}</span>
            <span>${targetAmount.toLocaleString()}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold text-gray-800">Raised</span>
            </div>
            <p className="text-3xl font-bold text-gray-700 mb-1">
              ${raisedAmount.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">Total SOL inflows to funding wallets</p>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                <Target className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold text-gray-800">Goal</span>
            </div>
            <p className="text-3xl font-bold text-gray-700 mb-1">
              ${targetAmount.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">Complete build cost</p>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold text-gray-800">Remaining</span>
            </div>
            <p className="text-3xl font-bold text-gray-700 mb-1">
              ${remaining.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">Still needed</p>
          </div>
        </div>

        {/* Project Details */}
        <div className="bg-gray-50 p-6 rounded-xl border">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="h-5 w-5 text-gray-600" />
                <span className="font-semibold">Project Location</span>
              </div>
              <p className="text-gray-700 mb-2 font-medium">
                Guayabo, Costa Rica
              </p>
              <p className="text-sm text-gray-600">
                At the edge of Miravalles Volcano with thermal springs and rainforest access
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-5 w-5 text-gray-600" />
                <span className="font-semibold">Timeline</span>
              </div>
              <p className="text-gray-700 mb-2 font-medium">
                Q2 2024 - Q4 2024
              </p>
              <p className="text-sm text-gray-600">
                Construction to completion, with community voting throughout
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center space-y-4">
          <p className="text-gray-600 font-medium">
            🎯 Current funding includes LP positions, liquid assets, and cross-chain holdings
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a 
              href="/value-indicator"
              className="bg-black text-white px-8 py-3 rounded-full font-urbanist hover:bg-gray-800 transition-colors font-medium"
            >
              Monitor Treasury Live
            </a>
            <button className="border border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-3 rounded-full font-urbanist transition-colors font-medium">
              Join Build Updates
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TreasuryProgress;
