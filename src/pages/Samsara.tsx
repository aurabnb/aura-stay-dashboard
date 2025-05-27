
import React from 'react';
import Header from '../components/Header';
import SamsaraDetails from '../components/SamsaraDetails';

const SamsaraPage = () => {
  return (
    <div className="min-h-screen bg-white font-urbanist">
      <Header />
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-6 font-urbanist leading-tight">
            Samsara Eco-Community
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto font-urbanist">
            A boutique eco-conscious community in Dominical, Costa Rica featuring 45 sustainable units with ocean views, off-grid farm, and natural pool
          </p>
        </div>
        
        <SamsaraDetails />
      </main>
    </div>
  );
};

export default SamsaraPage;
