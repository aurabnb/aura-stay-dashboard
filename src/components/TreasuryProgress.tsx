
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Target, DollarSign, MapPin } from 'lucide-react';

interface TreasuryProgressProps {
  currentAmount: number;
  targetAmount: number;
}

const TreasuryProgress = ({ currentAmount = 20000, targetAmount = 100000 }: TreasuryProgressProps) => {
  const progressPercentage = (currentAmount / targetAmount) * 100;
  const remaining = targetAmount - currentAmount;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-green-600" />
          Volcano Stay Funding Progress
        </CardTitle>
        <CardDescription>
          Track our progress toward fully funding the first AURA eco-stay in Guayabo, Costa Rica
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Funding Progress</span>
            <span className="text-sm text-gray-600">{progressPercentage.toFixed(1)}% Complete</span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-800">Raised</span>
            </div>
            <p className="text-2xl font-bold text-green-700">
              ${currentAmount.toLocaleString()}
            </p>
            <p className="text-sm text-green-600">From LP rewards</p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-800">Goal</span>
            </div>
            <p className="text-2xl font-bold text-blue-700">
              ${targetAmount.toLocaleString()}
            </p>
            <p className="text-sm text-blue-600">Total needed</p>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-orange-600" />
              <span className="font-medium text-orange-800">Remaining</span>
            </div>
            <p className="text-2xl font-bold text-orange-700">
              ${remaining.toLocaleString()}
            </p>
            <p className="text-sm text-orange-600">Still needed</p>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="h-4 w-4 text-gray-600" />
            <span className="font-medium">Volcano Stay Location</span>
          </div>
          <p className="text-sm text-gray-700 mb-2">
            Guayabo, Costa Rica - At the edge of Miravalles Volcano
          </p>
          <p className="text-xs text-gray-600">
            Our first decentralized eco-stay with volcano views, rainforest access, and thermal springs
          </p>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">
            Already 1/5th funded through LP rewards
          </p>
          <a 
            href="/value-indicator"
            className="inline-block bg-green-600 text-white px-6 py-2 rounded-full font-urbanist hover:bg-green-700 transition-colors"
          >
            Monitor Treasury Live
          </a>
        </div>
      </CardContent>
    </Card>
  );
};

export default TreasuryProgress;
