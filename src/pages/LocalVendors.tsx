
import React from 'react';
import Header from '../components/Header';

const LocalVendorsPage = () => {
  return (
    <div className="min-h-screen bg-white font-urbanist">
      <Header />
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-6 font-urbanist leading-tight">
            Local Vendors
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-urbanist">
            Supporting local economies through our vendor ecosystem
          </p>
        </div>
        
        <div className="bg-orange-50 p-8 rounded-lg text-center">
          <p className="text-gray-600 mb-4">Local vendor services integration coming in Phase 4.6</p>
          <p className="text-sm text-gray-500">
            Vendor application process, directory, booking system, and community feedback
          </p>
        </div>
      </main>
    </div>
  );
};

export default LocalVendorsPage;
