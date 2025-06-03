import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { 
  Flame, 
  TrendingUp, 
  Clock, 
  Users, 
  DollarSign, 
  ExternalLink, 
  RefreshCw,
  Zap,
  Award,
  Timer
} from 'lucide-react';
import { 
  believeAPI, 
  BurnTransaction, 
  BurnDistributionData 
} from '@/api/believe';
import { useToast } from '@/hooks/use-toast';

const BurnRedistributionDashboard: React.FC = () => {
  const [burnHistory, setBurnHistory] = useState<BurnTransaction[]>([]);
  const [stakingMetrics, setStakingMetrics] = useState<any>(null);
  const [distributionData, setDistributionData] = useState<BurnDistributionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDistributing, setIsDistributing] = useState(false);
  const { toast } = useToast();

  // Fetch all data
  const fetchBurnData = async () => {
    try {
      setLoading(true);
      const [history, metrics, distribution] = await Promise.all([
        believeAPI.getBurnHistory(20),
        believeAPI.getStakingMetrics(),
        believeAPI.distributeStakingRewards()
      ]);

      setBurnHistory(history);
      setStakingMetrics(metrics);
      setDistributionData(distribution);
    } catch (error) {
      console.error('Failed to fetch burn data:', error);
      toast({
        title: "Data Loading Failed",
        description: "Could not load burn and redistribution data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Manual reward distribution
  const handleManualDistribution = async () => {
    setIsDistributing(true);
    try {
      const result = await believeAPI.distributeStakingRewards();
      setDistributionData(result);
      
      toast({
        title: "Rewards Distributed!",
        description: `Distributed ${result.totalBurned.toFixed(4)} AURA to ${result.stakingRewards.length} stakers`
      });
      
      // Refresh data after distribution
      await fetchBurnData();
    } catch (error) {
      toast({
        title: "Distribution Failed",
        description: "Could not distribute rewards. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDistributing(false);
    }
  };

  useEffect(() => {
    fetchBurnData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchBurnData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const nextDistributionTime = distributionData?.nextDistribution 
    ? new Date(distributionData.nextDistribution) 
    : new Date(Date.now() + 6 * 60 * 60 * 1000);

  const timeUntilDistribution = Math.max(0, nextDistributionTime.getTime() - Date.now());
  const hoursUntil = Math.floor(timeUntilDistribution / (1000 * 60 * 60));
  const minutesUntil = Math.floor((timeUntilDistribution % (1000 * 60 * 60)) / (1000 * 60));

  return (
    <div className="space-y-8">
      {/* Header Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Flame className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-sm text-red-700">Total Burned</p>
                <p className="text-2xl font-bold text-red-900">
                  {distributionData?.totalBurned.toFixed(4) || '0.0000'} AURA
                </p>
                <p className="text-xs text-red-600">2% of all transactions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-blue-700">Total Stakers</p>
                <p className="text-2xl font-bold text-blue-900">
                  {stakingMetrics?.totalStakers.toLocaleString() || '0'}
                </p>
                <p className="text-xs text-blue-600">Active staking wallets</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-teal-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Award className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-green-700">Rewards Distributed</p>
                <p className="text-2xl font-bold text-green-900">
                  {stakingMetrics?.totalRewardsDistributed.toFixed(4) || '0.0000'} AURA
                </p>
                <p className="text-xs text-green-600">From burn pool</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Timer className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-purple-700">Next Distribution</p>
                <p className="text-2xl font-bold text-purple-900">
                  {hoursUntil}h {minutesUntil}m
                </p>
                <p className="text-xs text-purple-600">Automatic (4x daily)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribution Progress */}
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-yellow-900">
                <Zap className="h-6 w-6" />
                Reward Distribution System
              </CardTitle>
              <CardDescription className="text-yellow-700">
                Automated distribution of burn rewards to stakers every 6 hours
              </CardDescription>
            </div>
            <Button
              onClick={handleManualDistribution}
              disabled={isDistributing}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              {isDistributing ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Zap className="h-4 w-4 mr-2" />
              )}
              {isDistributing ? 'Distributing...' : 'Manual Distribution'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-yellow-800">Progress to next distribution:</span>
              <span className="font-semibold text-yellow-900">
                {((6 * 60 - (hoursUntil * 60 + minutesUntil)) / (6 * 60) * 100).toFixed(1)}%
              </span>
            </div>
            <Progress 
              value={((6 * 60 - (hoursUntil * 60 + minutesUntil)) / (6 * 60) * 100)} 
              className="h-3 bg-yellow-200"
            />
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-yellow-700">Current Burn Pool</p>
                <p className="font-bold text-yellow-900">
                  {distributionData?.totalBurned.toFixed(4) || '0.0000'} AURA
                </p>
              </div>
              <div>
                <p className="text-yellow-700">Reward per Token</p>
                <p className="font-bold text-yellow-900">
                  {distributionData?.rewardPerToken.toFixed(8) || '0.00000000'}
                </p>
              </div>
              <div>
                <p className="text-yellow-700">Distribution Round</p>
                <p className="font-bold text-yellow-900">
                  #{distributionData?.distributionRound || 0}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="burns" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="burns">Burn History</TabsTrigger>
          <TabsTrigger value="rewards">Staking Rewards</TabsTrigger>
          <TabsTrigger value="metrics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="burns" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-red-600" />
                  Recent Burn Transactions
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchBurnData}
                  className="text-gray-600"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount Burned</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {burnHistory.map((burn, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {burn.transactionHash.slice(0, 8)}...{burn.transactionHash.slice(-6)}
                            </code>
                            <a
                              href={`https://solscan.io/tx/${burn.transactionHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={burn.type === 'buy' ? 'border-green-300 text-green-700' : 'border-red-300 text-red-700'}
                          >
                            {burn.type.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {burn.amount.toFixed(4)} AURA
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {new Date(burn.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline"
                            className={burn.status === 'confirmed' ? 'border-green-300 text-green-700' : 'border-yellow-300 text-yellow-700'}
                          >
                            {burn.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-green-600" />
                Recent Reward Distributions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {distributionData?.stakingRewards && distributionData.stakingRewards.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Wallet</TableHead>
                        <TableHead>Staked Amount</TableHead>
                        <TableHead>Reward Earned</TableHead>
                        <TableHead>Share %</TableHead>
                        <TableHead>Round</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {distributionData.stakingRewards.map((reward, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {reward.stakingWallet.slice(0, 8)}...{reward.stakingWallet.slice(-6)}
                            </code>
                          </TableCell>
                          <TableCell>
                            {reward.stakingBalance.toLocaleString()} AURA
                          </TableCell>
                          <TableCell className="font-semibold text-green-700">
                            +{reward.rewardAmount.toFixed(6)} AURA
                          </TableCell>
                          <TableCell>
                            {reward.rewardPercentage.toFixed(2)}%
                          </TableCell>
                          <TableCell>
                            #{reward.distributionRound}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Award className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No recent reward distributions</p>
                  <p className="text-sm mt-2">Rewards are distributed automatically every 6 hours</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Burn Efficiency Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Burn Rate</span>
                  <span className="font-semibold">2.00%</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Volume Burned</span>
                  <span className="font-semibold">
                    ${((distributionData?.totalBurned || 0) * 0.00011566 * 174.33).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Average Burn per Transaction</span>
                  <span className="font-semibold">
                    {burnHistory.length > 0 
                      ? (burnHistory.reduce((sum, burn) => sum + burn.amount, 0) / burnHistory.length).toFixed(4)
                      : '0.0000'
                    } AURA
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Staking Pool Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Staked</span>
                  <span className="font-semibold">
                    {stakingMetrics?.totalStaked.toLocaleString() || '0'} AURA
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Average Stake Size</span>
                  <span className="font-semibold">
                    {stakingMetrics?.averageStake.toLocaleString() || '0'} AURA
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Participation Rate</span>
                  <span className="font-semibold">72.3%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BurnRedistributionDashboard; 