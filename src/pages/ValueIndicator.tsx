
import React from 'react';
import Header from '../components/Header';
import ValueIndicator from '../components/ValueIndicator';
import MonitoredWallets from '../components/MonitoredWallets';

const ValueIndicatorPage = () => {
  return (
    <div className="min-h-screen bg-white font-urbanist">
      <Header />
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="space-y-12">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-6 font-urbanist leading-tight">
              Value Indicator Dashboard
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-urbanist">
              Real-time tracking of Aura Foundation's treasury and market value metrics
            </p>
          </div>
          <ValueIndicator />
          <MonitoredWallets />
        </div>
      </main>
    </div>
  );
};

export default ValueIndicatorPage;
