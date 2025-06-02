import React from 'react';
import Header from '../components/Header';
import BurnRedistributionDashboard from '../components/BurnRedistributionDashboard';

const BurnRedistributionPage = () => {
  return (
    <div className="min-h-screen bg-white font-urbanist">
      <Header />
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            2% Burn & Redistribution
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Automatic token burning and reward distribution system. 2% of all buy/sell transactions 
            are burned and redistributed to stakers four times daily.
          </p>
        </div>
        <BurnRedistributionDashboard />
      </main>
    </div>
  );
};

export default BurnRedistributionPage; 