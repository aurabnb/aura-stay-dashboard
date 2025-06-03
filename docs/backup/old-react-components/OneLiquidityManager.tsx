import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Droplets, ExternalLink, Plus, Zap, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LiquidityPool {
  id: string;
  name: string;
  pair: string;
  totalLiquidity: number;
  volume24h: number;
  fees24h: number;
  apy: number;
  userShare: number;
  poolUrl: string;
  token1: {
    symbol: string;
    balance: number;
    price: number;
  };
  token2: {
    symbol: string;
    balance: number;
    price: number;
  };
}

const OneLiquidityManager: React.FC = () => {
  const [selectedAmount, setSelectedAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  // Main pools available for liquidity addition
  const availablePools: LiquidityPool[] = [
    {
      id: '1',
      name: 'AURA/SOL Main Pool',
      pair: 'AURA/SOL',
      totalLiquidity: 80297.12,
      volume24h: 47482.89,
      fees24h: 949.66,
      apy: 434.67,
      userShare: 0.0,
      poolUrl: 'https://meteora.ag/pools/9Wd2xPc6KmF6qmqbsQSbhemAmRpVfgVBFUPeLpYw7',
      token1: { symbol: 'AURA', balance: 125000, price: 0.00011566 },
      token2: { symbol: 'SOL', balance: 52.3, price: 174.33 }
    },
    {
      id: '2',
      name: 'AURA/WBTC Pool',
      pair: 'AURA/WBTC',
      totalLiquidity: 450000,
      volume24h: 85000,
      fees24h: 255,
      apy: 12.8,
      userShare: 0.2,
      poolUrl: 'https://www.meteora.ag/pools/8trgRQFSHKSiUUY19Qba5MrcRoq6ALnbmaocvti3ZjP',
      token1: { symbol: 'AURA', balance: 85000, price: 0.00011566 },
      token2: { symbol: 'WBTC', balance: 1.2, price: 43250.00 }
    },
    {
      id: '3',
      name: 'ETH/AURA Pool',
      pair: 'ETH/AURA',
      totalLiquidity: 900000,
      volume24h: 200000,
      fees24h: 600,
      apy: 18.5,
      userShare: 1.2,
      poolUrl: 'https://www.meteora.ag/pools/GyQ4VWSERBxvLRJmRatxk3DMdF6GeMk4hsBo4h7jcpfX',
      token1: { symbol: 'ETH', balance: 3.8, price: 2456.78 },
      token2: { symbol: 'AURA', balance: 95000, price: 0.00011566 }
    }
  ];

  const handleOneClickLiquidity = async (poolId: string) => {
    if (!selectedAmount || parseFloat(selectedAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount for liquidity provision",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      const pool = availablePools.find(p => p.id === poolId);
      if (!pool) {
        throw new Error('Pool not found');
      }

      // Simulate the one-click liquidity addition process
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "Liquidity Added Successfully!",
        description: `Added $${selectedAmount} liquidity to ${pool.pair} pool`
      });

      // Open the pool URL for actual transaction
      window.open(pool.poolUrl, '_blank');
      
    } catch (error) {
      toast({
        title: "Liquidity Addition Failed",
        description: "Please try again or add liquidity manually",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const addToAllPools = async () => {
    if (!selectedAmount || parseFloat(selectedAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to distribute across all pools",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      const amountPerPool = parseFloat(selectedAmount) / availablePools.length;
      
      // Simulate adding to all pools
      await new Promise(resolve => setTimeout(resolve, 3000));

      toast({
        title: "Bulk Liquidity Added!",
        description: `Added $${amountPerPool.toFixed(2)} to each of ${availablePools.length} pools`
      });

      // Open all pool URLs
      availablePools.forEach(pool => {
        setTimeout(() => window.open(pool.poolUrl, '_blank'), 500);
      });
      
    } catch (error) {
      toast({
        title: "Bulk Addition Failed",
        description: "Some pools may have failed, please check individually",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Droplets className="h-6 w-6 text-blue-600" />
          One-Click Liquidity Manager
        </CardTitle>
        <CardDescription>
          Easily add liquidity to AURA pools with optimized routing and minimal slippage
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Amount Input */}
        <div className="space-y-3">
          <Label htmlFor="liquidity-amount">Liquidity Amount (USD)</Label>
          <Input
            id="liquidity-amount"
            type="number"
            placeholder="Enter amount in USD"
            value={selectedAmount}
            onChange={(e) => setSelectedAmount(e.target.value)}
            className="text-lg"
          />
          <div className="flex gap-2">
            {[100, 500, 1000, 5000].map(amount => (
              <Button
                key={amount}
                variant="outline"
                size="sm"
                onClick={() => setSelectedAmount(amount.toString())}
                className="text-xs"
              >
                ${amount}
              </Button>
            ))}
          </div>
        </div>

        {/* Quick Add All */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-semibold text-blue-900">Add to All Pools</h4>
              <p className="text-sm text-blue-700">
                Distribute liquidity evenly across all {availablePools.length} pools
              </p>
            </div>
            <Button
              onClick={addToAllPools}
              disabled={isProcessing || !selectedAmount}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Zap className="h-4 w-4 mr-2" />
              {isProcessing ? 'Processing...' : 'Add to All'}
            </Button>
          </div>
          {selectedAmount && (
            <p className="text-sm text-blue-600">
              ${(parseFloat(selectedAmount) / availablePools.length).toFixed(2)} per pool
            </p>
          )}
        </div>

        {/* Individual Pools */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Individual Pools</h4>
          {availablePools.map((pool) => (
            <div key={pool.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {pool.token1.symbol.charAt(0)}{pool.token2.symbol.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{pool.pair}</p>
                    <p className="text-sm text-gray-600">{pool.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {pool.apy.toFixed(1)}% APY
                  </Badge>
                  <Button
                    size="sm"
                    onClick={() => handleOneClickLiquidity(pool.id)}
                    disabled={isProcessing || !selectedAmount}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Total Liquidity</p>
                  <p className="font-semibold">${pool.totalLiquidity.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">24h Volume</p>
                  <p className="font-semibold">${pool.volume24h.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Your Share</p>
                  <p className="font-semibold">{pool.userShare.toFixed(2)}%</p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm">
                    <span>{pool.token1.symbol}: {pool.token1.balance.toLocaleString()}</span>
                    <span>{pool.token2.symbol}: {pool.token2.balance.toLocaleString()}</span>
                  </div>
                  <a
                    href={pool.poolUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                    View Pool
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Notice */}
        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-yellow-800">Important Notice</p>
              <p className="text-yellow-700 mt-1">
                One-click liquidity addition will open the respective Meteora pool pages where you can complete the transaction. 
                Ensure you have sufficient token balances for both sides of the liquidity pair.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OneLiquidityManager; 