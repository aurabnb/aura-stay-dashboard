
import React from 'react';
import Header from '../components/Header';

const Index = () => {
  return (
    <div className="min-h-screen bg-white font-urbanist">
      <Header />
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="space-y-12">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-6 font-urbanist leading-tight">
              Redefining the Art of Unique<br />
              Short Term Stays
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-urbanist">
              Aura turns dream stays into community owned assets, everywhere on earth
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <h3 className="text-xl font-semibold mb-4 font-urbanist">Value Indicator</h3>
              <p className="text-gray-600 mb-6 font-urbanist">
                Track real-time treasury value and monitored wallets
              </p>
              <a 
                href="/value-indicator"
                className="inline-block bg-black text-white px-6 py-2 rounded-full font-urbanist hover:bg-gray-800 transition-colors"
              >
                View Dashboard
              </a>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <h3 className="text-xl font-semibold mb-4 font-urbanist">Multisig Wallet</h3>
              <p className="text-gray-600 mb-6 font-urbanist">
                Transparent multi-signature wallet management
              </p>
              <a 
                href="/multisig"
                className="inline-block bg-black text-white px-6 py-2 rounded-full font-urbanist hover:bg-gray-800 transition-colors"
              >
                View Wallet
              </a>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <h3 className="text-xl font-semibold mb-4 font-urbanist">Community Board</h3>
              <p className="text-gray-600 mb-6 font-urbanist">
                Share suggestions and join discussions
              </p>
              <a 
                href="/community-board"
                className="inline-block bg-black text-white px-6 py-2 rounded-full font-urbanist hover:bg-gray-800 transition-colors"
              >
                Join Community
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
