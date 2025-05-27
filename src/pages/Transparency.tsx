
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FundingBreakdown from '../components/FundingBreakdown';

const Transparency = () => {
  return (
    <div className="min-h-screen bg-white font-urbanist">
      <Header />
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="space-y-20">
          {/* Hero Section */}
          <section className="text-center py-16">
            <h1 className="text-4xl md:text-6xl font-bold text-black mb-8 font-urbanist leading-tight">
              Financial Transparency
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto font-urbanist leading-relaxed">
              Complete visibility into how funds flow in and out of the AURA ecosystem
            </p>
          </section>

          {/* Funding Transparency */}
          <section>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 font-urbanist">Real-Time Fund Tracking</h2>
              <p className="text-lg text-gray-600 font-urbanist">See exactly how funds flow in and out</p>
            </div>
            <FundingBreakdown />
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Transparency;
