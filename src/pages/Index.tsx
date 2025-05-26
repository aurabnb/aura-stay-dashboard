
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from '../components/Header';
import ValueIndicator from '../components/ValueIndicator';
import MultisigWallet from '../components/MultisigWallet';
import CommunityBoard from '../components/CommunityBoard';

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <ValueIndicator />
          <MultisigWallet />
          <CommunityBoard />
        </div>
      </main>
    </div>
  );
};

export default Index;
