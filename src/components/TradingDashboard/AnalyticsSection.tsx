
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';

const AnalyticsSection: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Trading Volume and Price Chart */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              AURA Trading Volume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Volume Chart (Coming Soon)</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AURA Price Chart</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Price Chart (Coming Soon)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Value Equation */}
      <Card>
        <CardHeader>
          <CardTitle>AURA Value Equation</CardTitle>
          <CardDescription>Understanding token value components</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="text-center text-lg font-mono bg-gray-50 p-6 rounded-lg">
              <p className="mb-4">
                <span className="font-bold text-blue-600">Total Market Cap</span> = 
                <span className="font-bold text-green-600 ml-2">Volatile Assets</span> + 
                <span className="font-bold text-purple-600 ml-2">Hard Assets</span> + 
                <span className="font-bold text-orange-600 ml-2">Speculative Interest</span>
              </p>
              
              <div className="text-sm text-gray-600 space-y-2">
                <p>$115,655 = $3,946 + $608 + $111,101</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <h4 className="font-semibold text-green-700 mb-2">Volatile Assets</h4>
                <p className="text-2xl font-bold text-green-600">$3,946</p>
                <p className="text-green-600 mt-1">Crypto holdings & liquid investments</p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <h4 className="font-semibold text-purple-700 mb-2">Hard Assets</h4>
                <p className="text-2xl font-bold text-purple-600">$608</p>
                <p className="text-purple-600 mt-1">Real estate & physical assets</p>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg text-center">
                <h4 className="font-semibold text-orange-700 mb-2">Speculative Interest</h4>
                <p className="text-2xl font-bold text-orange-600">$111,101</p>
                <p className="text-orange-600 mt-1">Market premium & future expectations</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Market Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>AURA Market Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Total DEX Volume</p>
              <p className="text-2xl font-bold text-blue-600">$590K</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Liquidity</p>
              <p className="text-2xl font-bold text-green-600">$3.0M</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600">Active LPs</p>
              <p className="text-2xl font-bold text-purple-600">156</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-gray-600">Fees Generated</p>
              <p className="text-2xl font-bold text-yellow-600">$1,770</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsSection;
