
import React from 'react';
import Header from '../components/Header';

const SamsaraPage = () => {
  return (
    <div className="min-h-screen bg-white font-urbanist">
      <Header />
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-6 font-urbanist leading-tight">
            Samsara
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-urbanist">
            A Boutique Eco-Conscious Community in Dominical, Costa Rica
          </p>
        </div>
        
        <div className="bg-green-50 p-8 rounded-lg text-center">
          <p className="text-gray-600 mb-4">Samsara booking page and details coming in Phase 3.1</p>
          <p className="text-sm text-gray-500">
            45 eco-conscious units with ocean views, solar energy, and natural pools
          </p>
        </div>
      </main>
    </div>
  );
};

export default SamsaraPage;
