
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

const Header = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [showWalletOptions, setShowWalletOptions] = useState(false);
  const [showFinanceDropdown, setShowFinanceDropdown] = useState(false);
  const location = useLocation();

  const connectWallet = async (walletType: 'phantom' | 'solflare') => {
    try {
      let provider;
      
      if (walletType === 'phantom') {
        provider = (window as any).phantom?.solana;
        if (!provider) {
          window.open('https://phantom.app/', '_blank');
          return;
        }
      } else if (walletType === 'solflare') {
        provider = (window as any).solflare;
        if (!provider) {
          window.open('https://solflare.com/', '_blank');
          return;
        }
      }

      const response = await provider.connect();
      setWalletAddress(response.publicKey.toString());
      setIsConnected(true);
      setShowWalletOptions(false);
      console.log('Connected to', walletType, ':', response.publicKey.toString());
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setWalletAddress('');
  };

  const isActivePage = (path: string) => location.pathname === path;

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/">
                <img 
                  src="/lovable-uploads/99705421-813e-4d11-89a5-90bffaa2147a.png" 
                  alt="AURA" 
                  className="h-8 w-auto"
                />
              </Link>
            </div>
            
            <div className="relative">
              {!isConnected ? (
                <div className="relative">
                  <button
                    onClick={() => setShowWalletOptions(!showWalletOptions)}
                    className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-full text-sm font-medium font-urbanist transition-colors"
                  >
                    Connect Wallet
                  </button>
                  
                  {showWalletOptions && (
                    <div className="absolute top-full mt-2 left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[160px]">
                      <button
                        onClick={() => connectWallet('phantom')}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 font-urbanist text-sm border-b border-gray-100"
                      >
                        Phantom
                      </button>
                      <button
                        onClick={() => connectWallet('solflare')}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 font-urbanist text-sm"
                      >
                        Solflare
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600 font-urbanist">
                    {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
                  </span>
                  <button
                    onClick={disconnectWallet}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm font-medium font-urbanist transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <nav className="hidden lg:flex space-x-8">
            <Link
              to="/"
              className={`px-3 py-2 text-sm font-medium font-urbanist transition-colors ${
                isActivePage('/') 
                  ? 'text-black border-b-2 border-black' 
                  : 'text-gray-700 hover:text-black'
              }`}
            >
              Home
            </Link>

            {/* Finance Dropdown - Limited to AURA pilot essentials */}
            <div className="relative">
              <button
                onClick={() => setShowFinanceDropdown(!showFinanceDropdown)}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium font-urbanist text-gray-700 hover:text-black transition-colors"
              >
                Finance
                <ChevronDown className="h-4 w-4" />
              </button>
              {showFinanceDropdown && (
                <div className="absolute top-full mt-1 left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[200px]">
                  <Link to="/value-indicator" className="block px-4 py-3 hover:bg-gray-50 font-urbanist text-sm border-b border-gray-100">
                    Treasury Monitor
                  </Link>
                  <Link to="/trading" className="block px-4 py-3 hover:bg-gray-50 font-urbanist text-sm">
                    Trading Hub
                  </Link>
                </div>
              )}
            </div>

            <Link
              to="/community-board"
              className={`px-3 py-2 text-sm font-medium font-urbanist transition-colors ${
                isActivePage('/community-board') 
                  ? 'text-black border-b-2 border-black' 
                  : 'text-gray-700 hover:text-black'
              }`}
            >
              Community
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <button className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-full text-sm font-medium font-urbanist transition-colors">
              Buy with Fiat
            </button>
            <button className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-full text-sm font-medium font-urbanist transition-colors">
              Buy $AURA
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
