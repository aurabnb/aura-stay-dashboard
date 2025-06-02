import React from 'react';
import Header from '../components/Header';
import VolcanoHouseCalculator from '../components/VolcanoHouseCalculator';

const VolcanoHousePage = () => {
  return (
    <div className="min-h-screen bg-white font-urbanist">
      <Header />
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <VolcanoHouseCalculator />
      </main>
    </div>
  );
};

export default VolcanoHousePage; 