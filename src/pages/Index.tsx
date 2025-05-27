
import React from 'react';
import Header from '../components/Header';
import TreasuryProgress from '../components/TreasuryProgress';
import FundingBreakdown from '../components/FundingBreakdown';
import VolcanoStayShowcase from '../components/VolcanoStayShowcase';
import AuraTokenChart from '../components/AuraTokenChart';
import AuraRoadmapTracker from '../components/AuraRoadmapTracker';
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

          {/* AURA Token Chart */}
          <AuraTokenChart />

          {/* Volcano Stay Showcase */}
          <VolcanoStayShowcase />

          {/* Funding Breakdown */}
          <FundingBreakdown />

          {/* AURA Roadmap Progress */}
          <AuraRoadmapTracker />
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <h3 className="text-xl font-semibold mb-4 font-urbanist">Treasury Monitor</h3>
              <p className="text-gray-600 mb-6 font-urbanist">
                Track live funding progress and wallet balances
              </p>
              <a 
                href="/value-indicator"
                className="inline-block bg-black text-white px-6 py-2 rounded-full font-urbanist hover:bg-gray-800 transition-colors"
              >
                View Treasury
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
