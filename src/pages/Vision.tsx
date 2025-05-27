
import React from 'react';
import Header from '../components/Header';

const Vision = () => {
  return (
    <div className="min-h-screen bg-white font-urbanist">
      <Header />
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="space-y-20">
          {/* Hero Section */}
          <section className="text-center py-16">
            <h1 className="text-4xl md:text-6xl font-bold text-black mb-8 font-urbanist leading-tight">
              Our Vision for the Future
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto font-urbanist leading-relaxed">
              Redefining travel through blockchain technology and community ownership
            </p>
          </section>

          {/* Mission Statement */}
          <section className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-3xl p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 font-urbanist">
              Redefining Hospitality Through Blockchain
            </h2>
            <p className="text-lg text-gray-700 max-w-4xl mx-auto font-urbanist leading-relaxed">
              AURA isn't just about accommodation—it's about creating a new paradigm where travelers become stakeholders. We are building the future of unique stays with cult locations in paradise.
            </p>
          </section>

          {/* How It Works */}
          <section className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-12">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 font-urbanist">How AURA Works</h2>
              <p className="text-lg text-gray-600 font-urbanist">Simple, transparent, community-driven</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white font-bold text-xl">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-4 font-urbanist">Community Funding</h3>
                <p className="text-gray-700 font-urbanist">
                  LP rewards from $AURA trading automatically fund property acquisitions and development
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white font-bold text-xl">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-4 font-urbanist">Democratic Decisions</h3>
                <p className="text-gray-700 font-urbanist">
                  Every aspect of each property is voted on by $AURA holders—from design to amenities
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white font-bold text-xl">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-4 font-urbanist">Shared Returns</h3>
                <p className="text-gray-700 font-urbanist">
                  Revenue flows back to token holders transparently, creating real ownership value
                </p>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="bg-gradient-to-r from-black to-gray-900 rounded-3xl p-16 text-center text-white">
            <h2 className="text-4xl md:text-5xl font-bold mb-8 font-urbanist">
              Ready to Shape Travel's Future?
            </h2>
            <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto font-urbanist leading-relaxed">
              Join the AURA community and help build the world's first decentralized unique stay network. 
              Every token holder becomes a co-owner in this revolutionary hospitality ecosystem.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button className="bg-white hover:bg-gray-100 text-black px-10 py-4 rounded-full font-urbanist font-semibold text-lg transition-all hover:scale-105">
                Buy $AURA Token
              </button>
              <button className="border-2 border-white hover:bg-white hover:text-black text-white px-10 py-4 rounded-full font-urbanist font-semibold text-lg transition-all hover:scale-105">
                Read Whitepaper
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Vision;
