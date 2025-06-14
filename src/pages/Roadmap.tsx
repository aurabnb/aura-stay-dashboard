
import React from 'react';
import Header from '../components/Header';
import RoadmapTracker from '../components/RoadmapTracker';
import TreasuryProgress from '../components/TreasuryProgress';
import { useTreasuryData } from '../hooks/useTreasuryData';

const RoadmapPage = () => {
  const { data: treasury, loading, error } = useTreasuryData();

  return (
    <div className="min-h-screen bg-white font-urbanist">
      <Header />
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="space-y-12">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-6 font-urbanist leading-tight">
              Project Roadmap
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-urbanist">
              Follow our journey towards building the future of digital real estate and Web3 innovation
            </p>
          </div>
          
          <RoadmapTracker />
          
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-black mb-8 text-center font-urbanist">
              Treasury Progress
            </h2>
            <TreasuryProgress treasury={treasury} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default RoadmapPage;
