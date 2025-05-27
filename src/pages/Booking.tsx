
import React from 'react';
import Header from '../components/Header';

const BookingPage = () => {
  return (
    <div className="min-h-screen bg-white font-urbanist">
      <Header />
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-6 font-urbanist leading-tight">
            Booking
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-urbanist">
            Book your next unique stay experience
          </p>
        </div>
        
        <div className="bg-yellow-50 p-8 rounded-lg text-center">
          <p className="text-gray-600 mb-4">Advanced booking system coming in Phase 4</p>
          <p className="text-sm text-gray-500">
            Features will include fiat payments, calendar integration, and symbiotic Airbnb booking
          </p>
        </div>
      </main>
    </div>
  );
};

export default BookingPage;
