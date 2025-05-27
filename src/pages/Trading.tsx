
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import TradingDashboard from '../components/TradingDashboard';

const TradingPage = () => {
  return (
    <div className="min-h-screen bg-white font-urbanist">
      <Header />
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="space-y-12">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-6 font-urbanist leading-tight">
              Trading Hub
            </h1>
          </div>
          
          <TradingDashboard />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TradingPage;
