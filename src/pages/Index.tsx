
import React from 'react';
import Header from '../components/Header';
import ApiStatusWidget from '../components/ApiStatusWidget';
import SolanaPriceWidget from '../components/SolanaPriceWidget';
import TreasurySummary from '../components/TreasurySummary';
import TreasuryProgress from '../components/TreasuryProgress';
import FundingBreakdown from '../components/FundingBreakdown';
import VolcanoStayShowcase from '../components/VolcanoStayShowcase';
import RoadmapTracker from '../components/RoadmapTracker';
import WalletCard from '../components/WalletCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useTreasuryData } from '../hooks/useTreasuryData';

const Index = () => {
  const { data, loading, error, lastRefresh, apiStatus, fetchData } = useTreasuryData();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-white font-urbanist">
      <Header />
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="space-y-12">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-6 font-urbanist leading-tight">
              Building the World's First<br />
              Decentralized Travel Network
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-urbanist">
              Starting with boutique eco-stays, scaling to resort communities. Every property owned by the community, every decision voted on-chain.
            </p>
          </div>

          {/* Treasury Progress for Volcano Stay */}
          <TreasuryProgress currentAmount={20000} targetAmount={100000} />

          {/* Volcano Stay Showcase */}
          <VolcanoStayShowcase />

          {/* Funding Breakdown */}
          <FundingBreakdown />

          {/* Roadmap Progress */}
          <RoadmapTracker />

          <ApiStatusWidget apiStatus={apiStatus} lastRefresh={lastRefresh} />

          {data?.solPrice && (
            <SolanaPriceWidget 
              solPrice={data.solPrice} 
              apiStatus={apiStatus.solPrice}
              onRefresh={fetchData}
            />
          )}

          {data?.treasury && (
            <TreasurySummary 
              treasury={data.treasury} 
              apiStatus={apiStatus.auraMarketCap}
            />
          )}

          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-semibold font-urbanist">Monitored Wallets</h2>
                <div className={`w-2 h-2 rounded-full ${
                  apiStatus.wallets === 'success' ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
              </div>
              <button 
                onClick={fetchData}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
              >
                Refresh Data
              </button>
            </div>
            
            {error && (
              <div className="text-red-600 p-4 bg-red-50 rounded-lg">
                <p className="font-medium">Error loading wallet data</p>
                <p className="text-sm mt-1">{error}</p>
                <button 
                  onClick={fetchData}
                  className="mt-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                >
                  Retry
                </button>
              </div>
            )}
            
            {data?.wallets && data.wallets.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.wallets.map((wallet) => (
                  <WalletCard key={wallet.wallet_id} wallet={wallet} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No wallet data available. Click refresh to fetch latest data.
              </div>
            )}
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <h3 className="text-xl font-semibold mb-4 font-urbanist">Multisig Wallet</h3>
              <p className="text-gray-600 mb-6 font-urbanist">
                Transparent multi-signature wallet management
              </p>
              <a 
                href="/multisig"
                className="inline-block bg-black text-white px-6 py-2 rounded-full font-urbanist hover:bg-gray-800 transition-colors"
              >
                View Wallet
              </a>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <h3 className="text-xl font-semibold mb-4 font-urbanist">Community Board</h3>
              <p className="text-gray-600 mb-6 font-urbanist">
                Share suggestions and join discussions
              </p>
              <a 
                href="/community-board"
                className="inline-block bg-black text-white px-6 py-2 rounded-full font-urbanist hover:bg-gray-800 transition-colors"
              >
                Join Community
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
