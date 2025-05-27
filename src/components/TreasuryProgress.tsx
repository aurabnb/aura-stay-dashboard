
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Target, DollarSign, MapPin, Calendar, Users } from 'lucide-react';

interface TreasuryProgressProps {
  currentAmount: number;
  targetAmount: number;
}

const TreasuryProgress = ({ currentAmount = 20000, targetAmount = 100000 }: TreasuryProgressProps) => {
  const progressPercentage = (currentAmount / targetAmount) * 100;
  const remaining = targetAmount - currentAmount;

  return (
    <Card className="w-full border-none shadow-lg">
      <CardHeader className="text-center pb-6">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl">
          <Target className="h-6 w-6 text-green-600" />
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
            <div className="absolute top-0 left-0 h-4 bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500" 
                 style={{ width: `${progressPercentage}%` }} />
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>${currentAmount.toLocaleString()}</span>
            <span>${targetAmount.toLocaleString()}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold text-green-800">Raised</span>
            </div>
            <p className="text-3xl font-bold text-green-700 mb-1">
              ${currentAmount.toLocaleString()}
            </p>
            <p className="text-sm text-green-600">From LP rewards & community</p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Target className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold text-blue-800">Goal</span>
            </div>
            <p className="text-3xl font-bold text-blue-700 mb-1">
              ${targetAmount.toLocaleString()}
            </p>
            <p className="text-sm text-blue-600">Complete build cost</p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold text-orange-800">Remaining</span>
            </div>
            <p className="text-3xl font-bold text-orange-700 mb-1">
              ${remaining.toLocaleString()}
            </p>
            <p className="text-sm text-orange-600">Still needed</p>
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
            🎯 Already 1/5th funded through LP rewards
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a 
              href="/value-indicator"
              className="bg-green-600 text-white px-8 py-3 rounded-full font-urbanist hover:bg-green-700 transition-colors font-medium"
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
