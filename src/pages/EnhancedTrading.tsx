
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import EnhancedTradingDashboard from '../components/TradingDashboard/EnhancedTradingDashboard';

const EnhancedTradingPage = () => {
  return (
    <div className="min-h-screen bg-white font-urbanist">
      <Header />
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="space-y-12">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-6 font-urbanist leading-tight">
              Enhanced Trading Hub
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-urbanist leading-relaxed">
              Advanced trading platform with comprehensive analytics, portfolio management, and professional-grade tools
            </p>
          </div>
          
          <EnhancedTradingDashboard />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EnhancedTradingPage;
