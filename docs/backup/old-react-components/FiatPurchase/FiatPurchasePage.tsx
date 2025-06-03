
import React from 'react';
import { useLocation } from 'react-router-dom';
import MoonPayWidget from './MoonPayWidget';
import Header from '../Header';
import Footer from '../Footer';

const FiatPurchasePage: React.FC = () => {
  const location = useLocation();
  const walletAddress = location.state?.walletAddress;

  const handlePurchaseComplete = () => {
    console.log('Purchase flow completed');
    // You can add additional logic here like analytics tracking
  };

  return (
    <div className="min-h-screen bg-white font-urbanist">
      <Header />
      <main className="max-w-4xl mx-auto px-6 lg:px-8 py-12">
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-6 font-urbanist leading-tight">
              Buy AURA with Fiat
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-urbanist">
              Purchase AURA tokens directly with your credit card, debit card, or bank transfer
            </p>
          </div>
          
          <MoonPayWidget 
            walletAddress={walletAddress}
            onPurchaseComplete={handlePurchaseComplete}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FiatPurchasePage;
