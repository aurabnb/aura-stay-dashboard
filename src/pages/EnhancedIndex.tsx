
import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import EnhancedAuraStats from '../components/EnhancedAuraStats';
import EnhancedRoadmapTracker from '../components/EnhancedRoadmapTracker';
import LoadingSpinner from '../components/LoadingSpinner';
import { useTreasuryData } from '../hooks/useTreasuryData';

const EnhancedIndex = () => {
  const { data, loading, error } = useTreasuryData();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-white font-urbanist">
      <Header />
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="space-y-20">
          {/* Hero Section */}
          <section className="text-center py-16">
            <h1 className="text-5xl md:text-7xl font-bold text-black mb-8 font-urbanist leading-tight">
              Building the World's First<br />
              <span className="text-gray-800">Decentralized Unique Stay Network</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-5xl mx-auto font-urbanist leading-relaxed mb-16">
              Starting with boutique eco-stays, scaling to resort communities. Every property owned by the community, every decision voted on-chain.
            </p>
            
            {/* Hero Image */}
            <div className="mb-16">
              <img 
                src="/lovable-uploads/2c54a081-ee21-40e5-8639-04f3b307ca0b.png" 
                alt="Northern lights over a serene landscape"
                className="w-full max-w-4xl mx-auto rounded-3xl shadow-2xl"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link 
                to="/enhanced-trading"
                className="bg-black hover:bg-gray-800 text-white px-10 py-4 rounded-full font-urbanist font-semibold text-lg transition-all hover:scale-105 shadow-lg inline-block text-center"
              >
                Launch Enhanced Trading
              </Link>
              <Link 
                to="/roadmap"
                className="border-2 border-gray-300 hover:border-gray-400 text-gray-700 px-10 py-4 rounded-full font-urbanist font-semibold text-lg transition-all hover:scale-105 inline-block text-center"
              >
                View Enhanced Roadmap
              </Link>
            </div>
          </section>

          {/* Enhanced Stats */}
          <section>
            <EnhancedAuraStats />
          </section>

          {/* Enhanced Roadmap Preview */}
          <section>
            <EnhancedRoadmapTracker />
          </section>

          {/* Community Access */}
          <section className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-10 text-center border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-8">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-6 font-urbanist">Enhanced Analytics</h3>
              <p className="text-gray-700 mb-8 font-urbanist text-lg leading-relaxed">
                Advanced treasury monitoring with real-time analytics, portfolio insights, and performance tracking
              </p>
              <Link 
                to="/value-indicator"
                className="inline-block bg-black text-white px-8 py-4 rounded-full font-urbanist font-semibold hover:bg-gray-800 transition-colors text-lg"
              >
                Explore Analytics
              </Link>
            </div>
            
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-10 text-center border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-8">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-6 font-urbanist">Interactive Roadmap</h3>
              <p className="text-gray-700 mb-8 font-urbanist text-lg leading-relaxed">
                Detailed project timeline with progress tracking, dependency mapping, and milestone analytics
              </p>
              <Link 
                to="/roadmap"
                className="inline-block bg-gray-700 text-white px-8 py-4 rounded-full font-urbanist font-semibold hover:bg-gray-800 transition-colors text-lg"
              >
                View Roadmap
              </Link>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-10 text-center border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-8">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-6 font-urbanist">Advanced Trading</h3>
              <p className="text-gray-700 mb-8 font-urbanist text-lg leading-relaxed">
                Professional trading tools with portfolio management, price alerts, and comprehensive market analysis
              </p>
              <Link 
                to="/enhanced-trading"
                className="inline-block bg-gray-800 text-white px-8 py-4 rounded-full font-urbanist font-semibold hover:bg-gray-900 transition-colors text-lg"
              >
                Start Trading
              </Link>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EnhancedIndex;
