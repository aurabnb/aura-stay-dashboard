
import React from 'react';
import Header from '../components/Header';
import PropertyShowcase from '../components/PropertyShowcase';

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
        
        <PropertyShowcase />
      </main>
    </div>
  );
};

export default PropertiesPage;
