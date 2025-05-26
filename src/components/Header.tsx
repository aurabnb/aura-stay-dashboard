
import React from 'react';

const Header = () => {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-gray-900">🌟 AURA</span>
            </div>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <a
              href="#"
              className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium"
            >
              Value Indicator
            </a>
            <a
              href="#"
              className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium"
            >
              Multisig Wallet
            </a>
            <a
              href="#"
              className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium"
            >
              Community Board
            </a>
          </nav>

          <div className="flex items-center">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
              Connect Phantom Wallet
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
