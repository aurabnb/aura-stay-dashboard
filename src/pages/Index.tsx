
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from '../components/Header';
import ValueIndicator from '../components/ValueIndicator';
import MultisigWallet from '../components/MultisigWallet';
import CommunityBoard from '../components/CommunityBoard';

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
          <ValueIndicator />
          <MultisigWallet />
          <CommunityBoard />
        </div>
      </main>
    </div>
  );
};

export default Index;
