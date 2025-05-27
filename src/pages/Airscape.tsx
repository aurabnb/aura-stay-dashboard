
import React from 'react';
import Header from '../components/Header';

const AirscapePage = () => {
  return (
    <div className="min-h-screen bg-white font-urbanist">
      <Header />
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-6 font-urbanist leading-tight">
            Airscape
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-urbanist">
            The future of decentralized boutique unique stays
          </p>
        </div>
        
        <div className="bg-purple-50 p-8 rounded-lg text-center">
          <p className="text-gray-600 mb-4">Airscape platform launching in Phase 4</p>
          <p className="text-sm text-gray-500">
            Custom booking engine, wallet integration, and enhanced local vendor ecosystem
          </p>
        </div>
      </main>
    </div>
  );
};

export default AirscapePage;
