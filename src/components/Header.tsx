
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, Wallet, Copy, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WalletAdapter {
  connect: () => Promise<{ publicKey: { toString: () => string } }>;
  disconnect?: () => Promise<void>;
  on?: (event: string, handler: () => void) => void;
  publicKey?: { toString: () => string } | null;
}

const Header = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [showWalletOptions, setShowWalletOptions] = useState(false);
  const [showFinanceDropdown, setShowFinanceDropdown] = useState(false);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [connectedWallet, setConnectedWallet] = useState<'phantom' | 'solflare' | null>(null);
  const [walletAdapter, setWalletAdapter] = useState<WalletAdapter | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check for existing wallet connection on mount
  useEffect(() => {
    checkExistingConnection();
  }, []);

  const checkExistingConnection = async () => {
    try {
      // Check Phantom
      const phantom = (window as any).phantom?.solana;
      if (phantom?.isConnected && phantom?.publicKey) {
        setIsConnected(true);
        setWalletAddress(phantom.publicKey.toString());
        setConnectedWallet('phantom');
        setWalletAdapter(phantom);
        return;
      }

      // Check Solflare
      const solflare = (window as any).solflare;
      if (solflare?.isConnected && solflare?.publicKey) {
        setIsConnected(true);
        setWalletAddress(solflare.publicKey.toString());
        setConnectedWallet('solflare');
        setWalletAdapter(solflare);
        return;
      }
    } catch (error) {
      console.error('Error checking existing wallet connection:', error);
    }
  };

  const connectWallet = async (walletType: 'phantom' | 'solflare') => {
    try {
      let provider: WalletAdapter | null = null;
      
      if (walletType === 'phantom') {
        provider = (window as any).phantom?.solana;
        if (!provider) {
          toast({
            title: "Phantom Wallet Not Found",
            description: "Please install Phantom wallet extension",
          });
          window.open('https://phantom.app/', '_blank');
          return;
        }
      } else if (walletType === 'solflare') {
        provider = (window as any).solflare;
        if (!provider) {
          toast({
            title: "Solflare Wallet Not Found",
            description: "Please install Solflare wallet extension",
          });
          window.open('https://solflare.com/', '_blank');
          return;
        }
      }

      if (!provider) return;

      const response = await provider.connect();
      const address = response.publicKey.toString();
      
      setWalletAddress(address);
      setIsConnected(true);
      setConnectedWallet(walletType);
      setWalletAdapter(provider);
      setShowWalletOptions(false);
      
      // Set up disconnect handler
      if (provider.on) {
        provider.on('disconnect', () => {
          disconnectWallet();
        });
      }

      toast({
        title: "Wallet Connected! 🎉",
        description: `Successfully connected to ${walletType === 'phantom' ? 'Phantom' : 'Solflare'}`,
      });

      console.log(`Connected to ${walletType}:`, address);
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
      
      let errorMessage = 'Failed to connect wallet';
      if (error?.message?.includes('User rejected')) {
        errorMessage = 'Connection cancelled by user';
      }
      
      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const disconnectWallet = async () => {
    try {
      if (walletAdapter?.disconnect) {
        await walletAdapter.disconnect();
      }
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    } finally {
      setIsConnected(false);
      setWalletAddress('');
      setConnectedWallet(null);
      setWalletAdapter(null);
      
      toast({
        title: "Wallet Disconnected",
        description: "Your wallet has been disconnected",
      });
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    toast({
      title: "Address Copied! 📋",
      description: "Wallet address copied to clipboard",
    });
  };

  const openInExplorer = () => {
    window.open(`https://explorer.solana.com/address/${walletAddress}`, '_blank');
  };

  const isActivePage = (path: string) => location.pathname === path;

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowWalletOptions(false);
      setShowFinanceDropdown(false);
      setShowProjectDropdown(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleBuyWithFiat = () => {
    if (isConnected && walletAddress) {
      // Navigate to fiat purchase page with wallet address in state
      navigate('/buy-fiat', { state: { walletAddress } });
    } else {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet first to purchase with fiat",
        variant: "destructive"
      });
    }
  };

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

            {/* Project Dropdown */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowProjectDropdown(!showProjectDropdown);
                  setShowFinanceDropdown(false);
                }}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium font-urbanist text-gray-700 hover:text-black transition-colors"
              >
                Project
                <ChevronDown className="h-4 w-4" />
              </button>
              {showProjectDropdown && (
                <div className="absolute top-full mt-1 left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[180px]">
                  <Link to="/roadmap" className="block px-4 py-3 hover:bg-gray-50 font-urbanist text-sm border-b border-gray-100">
                    Roadmap
                  </Link>
                  <Link to="/vision" className="block px-4 py-3 hover:bg-gray-50 font-urbanist text-sm border-b border-gray-100">
                    Vision
                  </Link>
                  <Link to="/transparency" className="block px-4 py-3 hover:bg-gray-50 font-urbanist text-sm">
                    Transparency
                  </Link>
                </div>
              )}
            </div>

            {/* Finance Dropdown */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFinanceDropdown(!showFinanceDropdown);
                  setShowProjectDropdown(false);
                }}
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
            {/* Wallet Connection */}
            <div className="relative">
              {!isConnected ? (
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowWalletOptions(!showWalletOptions);
                    }}
                    className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-full text-sm font-medium font-urbanist transition-colors flex items-center gap-2"
                  >
                    <Wallet className="h-4 w-4" />
                    Connect Wallet
                  </button>
                  
                  {showWalletOptions && (
                    <div className="absolute top-full mt-2 left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[180px]">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          connectWallet('phantom');
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 font-urbanist text-sm border-b border-gray-100 flex items-center gap-3"
                      >
                        <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          P
                        </div>
                        Phantom
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          connectWallet('solflare');
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 font-urbanist text-sm flex items-center gap-3"
                      >
                        <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          S
                        </div>
                        Solflare
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2 bg-gray-100 rounded-full px-4 py-2">
                    <div className={`w-3 h-3 rounded-full ${connectedWallet === 'phantom' ? 'bg-purple-600' : 'bg-orange-500'}`}></div>
                    <span className="text-sm text-gray-700 font-urbanist font-medium">
                      {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
                    </span>
                    <button
                      onClick={copyAddress}
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                      title="Copy address"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                    <button
                      onClick={openInExplorer}
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                      title="View in explorer"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  </div>
                  <button
                    onClick={disconnectWallet}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-full text-sm font-medium font-urbanist transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
              )}
            </div>

            <button 
              onClick={handleBuyWithFiat}
              className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-full text-sm font-medium font-urbanist transition-colors"
            >
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
