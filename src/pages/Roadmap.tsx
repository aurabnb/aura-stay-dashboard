
import React from 'react';
import Header from '../components/Header';
import AuraRoadmapTracker from '../components/AuraRoadmapTracker';
import VolcanoStayShowcase from '../components/VolcanoStayShowcase';
import TreasuryProgress from '../components/TreasuryProgress';

const Roadmap = () => {
  return (
    <div className="min-h-screen bg-white font-urbanist">
      <Header />
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="space-y-20">
          {/* Hero Section */}
          <section className="text-center py-16">
            <h1 className="text-4xl md:text-6xl font-bold text-black mb-8 font-urbanist leading-tight">
              AURA Roadmap
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto font-urbanist leading-relaxed">
              Track our progress from pilot to global network
            </p>
          </section>

          {/* Roadmap Progress */}
          <section>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 font-urbanist">Our Journey Forward</h2>
              <p className="text-lg text-gray-600 font-urbanist">Tracking progress through our pilot phase</p>
            </div>
            <AuraRoadmapTracker />
          </section>

          {/* Treasury Progress */}
          <section className="bg-gray-50 rounded-3xl p-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 font-urbanist">Funding Our First Stay</h2>
              <p className="text-lg text-gray-600 font-urbanist max-w-3xl mx-auto">
                Watch our community-driven funding in real-time as we build the Volcano Stay in Costa Rica
              </p>
            </div>
            <TreasuryProgress currentAmount={20000} targetAmount={100000} />
          </section>

          {/* Volcano Stay Showcase */}
          <section>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 font-urbanist">Meet Your First Investment</h2>
              <p className="text-lg text-gray-600 font-urbanist max-w-3xl mx-auto">
                An eco-luxury experience at the edge of Costa Rica's Miravalles Volcano
              </p>
            </div>
            <VolcanoStayShowcase />
          </section>
        </div>
      </main>
    </div>
  );
};

export default Roadmap;
