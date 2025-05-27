import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TradePanel from './TradingDashboard/TradePanel';
import TokenList from './TradingDashboard/TokenList';
import LiquidityPools from './TradingDashboard/LiquidityPools';
import AnalyticsSection from './TradingDashboard/AnalyticsSection';
import ConstructionSection from './TradingDashboard/ConstructionSection';

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
      totalLiquidity: 750000,
      volume24h: 125000,
      fees24h: 375,
      apy: 15.2,
      userShare: 0.5,
      poolUrl: 'https://www.meteora.ag/pools/FVtpMFtDtskHt5MmLExkjKrCkXQi8ebVZHuFhRnQL6W5'
    },
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
      totalLiquidity: 181793.41,
      volume24h: 101105.95,
      fees24h: 2022.12,
      apy: 409.03,
      userShare: 0.0,
      poolUrl: 'https://meteora.ag/pools/6W59P1TZCbckwGV87mAThgoVAzgybMERJzesokeMM2ms'
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
    <div className="space-y-8">
      <Tabs defaultValue="trade" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="trade">Trade</TabsTrigger>
          <TabsTrigger value="liquidity">Liquidity</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="construction">Construction</TabsTrigger>
          <TabsTrigger value="tokens">All Tokens</TabsTrigger>
        </TabsList>
        
        <TabsContent value="trade" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
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
        
        <TabsContent value="tokens" className="space-y-6">
          <TokenList 
            tokens={tokens}
            selectedToken={selectedToken}
            onTokenSelect={setSelectedToken}
            showAll={true}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TradingDashboard;
