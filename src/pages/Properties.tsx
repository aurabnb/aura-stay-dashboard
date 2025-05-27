
import React from 'react';
import Header from '../components/Header';

const PropertiesPage = () => {
  return (
    <div className="min-h-screen bg-white font-urbanist">
      <Header />
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-6 font-urbanist leading-tight">
            Properties
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-urbanist">
            Explore our collection of boutique unique stays across the globe
          </p>
        </div>
        
        <div className="bg-blue-50 p-8 rounded-lg text-center">
          <p className="text-gray-600 mb-4">Property showcase coming soon in Phase 2.1</p>
          <p className="text-sm text-gray-500">
            This will feature Volcan stay and new Aura properties with Airbnb integration
          </p>
        </div>
      </main>
    </div>
  );
};

export default PropertiesPage;
