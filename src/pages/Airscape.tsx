
import React from 'react';
import Header from '../components/Header';
import AirscapeShowcase from '../components/AirscapeShowcase';

const AirscapePage = () => {
  return (
    <div className="min-h-screen bg-white font-urbanist">
      <Header />
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-6 font-urbanist leading-tight">
            Airscape Global Resorts
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto font-urbanist">
            Invest in and experience boutique unique stays at larger resort properties with innovative booking systems and sustainable practices
          </p>
        </div>
        
        <AirscapeShowcase />
      </main>
    </div>
  );
};

export default AirscapePage;
