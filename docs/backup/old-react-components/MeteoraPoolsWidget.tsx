
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, TrendingUp, Droplets } from 'lucide-react';

interface MeteoraPoolData {
  poolAddress: string;
  name: string;
  tokenA: {
    symbol: string;
    amount: number;
    usdValue: number;
  };
  tokenB: {
    symbol: string;
    amount: number;
    usdValue: number;
  };
  totalLiquidity: number;
  volume24h: number;
  fees24h: number;
  apy: number;
  userShare: number;
  userUsdValue: number;
}

interface LPDetails {
  meteoraData?: MeteoraPoolData;
  totalUsdValue: number;
}

interface WalletBalance {
  token_symbol: string;
  is_lp_token: boolean;
  lp_details?: LPDetails;
  usd_value: number;
}

interface MeteoraPoolsWidgetProps {
  walletBalances: WalletBalance[];
  walletName: string;
  walletAddress: string;
}

const MeteoraPoolsWidget = ({ walletBalances, walletName, walletAddress }: MeteoraPoolsWidgetProps) => {
  const lpTokens = walletBalances.filter(balance => 
    balance.is_lp_token && balance.lp_details?.meteoraData
  );

  if (lpTokens.length === 0) {
    return null;
  }

  const totalLPValue = lpTokens.reduce((sum, token) => sum + (token.usd_value || 0), 0);
  const totalDailyFees = lpTokens.reduce((sum, token) => 
    sum + (token.lp_details?.meteoraData?.fees24h || 0) * (token.lp_details?.meteoraData?.userShare || 0) / 100, 0
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Droplets className="h-5 w-5 text-blue-600" />
          Meteora Liquidity Pools
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            {walletName}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <p className="text-sm text-gray-600">Total LP Value</p>
            <p className="text-xl font-bold text-blue-600">${totalLPValue.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Daily Fees Earned</p>
            <p className="text-xl font-bold text-green-600">${totalDailyFees.toFixed(2)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Annual Projection</p>
            <p className="text-xl font-bold text-purple-600">${(totalDailyFees * 365).toLocaleString()}</p>
          </div>
        </div>

        {/* Individual Pools */}
        <div className="space-y-3">
          {lpTokens.map((token, index) => {
            const meteora = token.lp_details!.meteoraData!;
            const poolUrl = `https://www.meteora.ag/pools/${meteora.poolAddress}`;
            
            return (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-lg">{meteora.name}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>APY: {meteora.apy.toFixed(1)}%</span>
                      <span>Share: {meteora.userShare.toFixed(3)}%</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">${meteora.userUsdValue.toLocaleString()}</p>
                    <Badge 
                      variant="outline" 
                      className={`${meteora.apy > 100 ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}
                    >
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {meteora.apy > 100 ? 'High Yield' : 'Active'}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600">{meteora.tokenA.symbol}</p>
                    <p className="font-semibold">{meteora.tokenA.amount.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">${meteora.tokenA.usdValue.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">{meteora.tokenB.symbol}</p>
                    <p className="font-semibold">{meteora.tokenB.amount.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">${meteora.tokenB.usdValue.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">24h Volume</p>
                    <p className="font-semibold">${meteora.volume24h.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">24h Fees</p>
                    <p className="font-semibold text-green-600">
                      ${((meteora.fees24h * meteora.userShare) / 100).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(poolUrl, '_blank')}
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View on Meteora
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center text-xs text-gray-500 pt-2 border-t">
          <p>Live data from Meteora DEX • Wallet: {walletAddress.slice(0, 8)}...{walletAddress.slice(-8)}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MeteoraPoolsWidget;
