import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TradePanel from './TradingDashboard/TradePanel';
import TokenList from './TradingDashboard/TokenList';
import LiquidityPools from './TradingDashboard/LiquidityPools';
import AnalyticsSection from './TradingDashboard/AnalyticsSection';
import ConstructionSection from './TradingDashboard/ConstructionSection';
import PortfolioTracker from './TradingDashboard/PortfolioTracker';
import PriceChart from './TradingDashboard/PriceChart';
import PriceAlerts from './TradingDashboard/PriceAlerts';

interface Token {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  icon: string;
  jupiterUrl?: string;
}

interface LiquidityPool {
  pair: string;
  totalLiquidity: number;
  volume24h: number;
  fees24h: number;
  apy: number;
  userShare: number;
  poolUrl: string;
}

const TradingDashboard = () => {
  const [selectedToken, setSelectedToken] = useState('AURA');
  const [tradeAmount, setTradeAmount] = useState('');
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');

  const tokens: Token[] = [
    {
      symbol: 'AURA',
      name: 'Aura Token',
      price: 0.00011566,
      change24h: 12.5,
      volume24h: 125000,
      marketCap: 4500000,
      icon: '🌟',
      jupiterUrl: 'https://jup.ag/swap/SOL-3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe'
    }
  ];

  const liquidityPools: LiquidityPool[] = [
    {
      pair: 'AURA/WBTC',
      totalLiquidity: 450000,
      volume24h: 85000,
      fees24h: 255,
      apy: 12.8,
      userShare: 0.2,
      poolUrl: 'https://www.meteora.ag/pools/8trgRQFSHKSiUUY19Qba5MrcRoq6ALnbmaocvfti3ZjP'
    },
    {
      pair: 'ETH/AURA',
      totalLiquidity: 900000,
      volume24h: 200000,
      fees24h: 600,
      apy: 18.5,
      userShare: 1.2,
      poolUrl: 'https://www.meteora.ag/pools/GyQ4VWSERBxvLRJmRatxk3DMdF6GeMk4hsBo4h7jcpfX'
    },
    {
      pair: 'AURA/ETH',
      totalLiquidity: 820000,
      volume24h: 180000,
      fees24h: 540,
      apy: 16.8,
      userShare: 0.8,
      poolUrl: 'https://www.meteora.ag/pools/GTMY5eBd4cXaihz2ZB69g3WkVmvhudamf1kQn3E9preW'
    },
    {
      pair: 'AURA/SOL',
      totalLiquidity: 80297.12,
      volume24h: 47482.89,
      fees24h: 949.66,
      apy: 434.67,
      userShare: 0.0,
      poolUrl: 'https://meteora.ag/pools/9Wd2xPc6KmF6qmqbsQSbhemAmRpVfgVBFUPeLpYw7'
    }
  ];

  const handleTrade = () => {
    console.log(`${tradeType}ing ${tradeAmount} ${selectedToken}`);
    const token = tokens.find(t => t.symbol === selectedToken);
    if (token?.jupiterUrl) {
      window.open(token.jupiterUrl, '_blank');
    }
  };

  const handleAddLiquidity = (poolUrl: string) => {
    window.open(poolUrl, '_blank');
  };

  return (
    <div className="space-y-8 bg-gradient-to-br from-gray-50 to-white min-h-screen p-6">
      <Tabs defaultValue="trade" className="w-full">
        <div className="flex justify-center mb-8">
          <TabsList className="grid w-full max-w-4xl grid-cols-6 bg-white shadow-lg rounded-xl border-0 p-2">
            <TabsTrigger 
              value="trade" 
              className="data-[state=active]:bg-black data-[state=active]:text-white font-semibold font-urbanist transition-all duration-300"
            >
              Trade
            </TabsTrigger>
            <TabsTrigger 
              value="portfolio"
              className="data-[state=active]:bg-gray-800 data-[state=active]:text-white font-semibold font-urbanist transition-all duration-300"
            >
              Portfolio
            </TabsTrigger>
            <TabsTrigger 
              value="charts"
              className="data-[state=active]:bg-gray-700 data-[state=active]:text-white font-semibold font-urbanist transition-all duration-300"
            >
              Charts
            </TabsTrigger>
            <TabsTrigger 
              value="alerts"
              className="data-[state=active]:bg-orange-600 data-[state=active]:text-white font-semibold font-urbanist transition-all duration-300"
            >
              Alerts
            </TabsTrigger>
            <TabsTrigger 
              value="liquidity"
              className="data-[state=active]:bg-gray-600 data-[state=active]:text-white font-semibold font-urbanist transition-all duration-300"
            >
              Liquidity
            </TabsTrigger>
            <TabsTrigger 
              value="analytics"
              className="data-[state=active]:bg-gray-500 data-[state=active]:text-white font-semibold font-urbanist transition-all duration-300"
            >
              Analytics
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="trade" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <TokenList 
                tokens={tokens}
                selectedToken={selectedToken}
                onTokenSelect={setSelectedToken}
              />
            </div>
            <div>
              <TradePanel
                selectedToken={selectedToken}
                tradeAmount={tradeAmount}
                tradeType={tradeType}
                tokens={tokens}
                onTradeAmountChange={setTradeAmount}
                onTradeTypeChange={setTradeType}
                onTrade={handleTrade}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-6">
          <PortfolioTracker />
        </TabsContent>

        <TabsContent value="charts" className="space-y-6">
          <PriceChart 
            tokenAddress="3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe"
            tokenSymbol="AURA"
          />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <PriceAlerts />
        </TabsContent>
        
        <TabsContent value="liquidity" className="space-y-6">
          <LiquidityPools 
            liquidityPools={liquidityPools}
            onAddLiquidity={handleAddLiquidity}
          />
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-6">
          <AnalyticsSection />
        </TabsContent>

        <TabsContent value="construction" className="space-y-6">
          <ConstructionSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TradingDashboard;
