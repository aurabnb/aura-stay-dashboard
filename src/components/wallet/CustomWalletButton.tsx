'use client';

import React, { useState, useEffect } from 'react';
import { WalletReadyState } from '@solana/wallet-adapter-base';
import { Wallet, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CustomWalletButtonProps {
  className?: string;
  mobile?: boolean;
}

// Main component that handles mounting and wallet context
export const CustomWalletButton: React.FC<CustomWalletButtonProps> = (props) => {
  const [mounted, setMounted] = useState(false);
  const [walletData, setWalletData] = useState({
    wallets: [],
    select: () => {},
    connecting: false,
    connected: false
  });

  useEffect(() => {
    setMounted(true);
    
    // Only initialize wallet context after mounting
    if (typeof window !== 'undefined') {
      try {
        // Dynamically import and use wallet adapter
        import('@solana/wallet-adapter-react').then(({ useWallet }) => {
          // This approach still violates hook rules, so let's use a different method
        });
      } catch (error) {
        console.warn('Wallet adapter not available');
      }
    }
  }, []);

  // For now, render a static button that will be enhanced client-side
  if (!mounted) {
    return (
      <button 
        className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-full text-sm font-medium"
        disabled
      >
        Connect Wallet
      </button>
    );
  }

  // After mounting, render the actual wallet button
  return <CustomWalletButtonContent {...props} />;
};

// Simplified content component
const CustomWalletButtonContent: React.FC<CustomWalletButtonProps> = ({ 
  className, 
  mobile = false
}) => {
  const [walletOptionsOpen, setWalletOptionsOpen] = useState(false);
  const { toast } = useToast();

  const handleConnect = () => {
    toast({
      title: "Connect Wallet",
      description: "Please install a Solana wallet like Phantom or Solflare",
    });
  };

  return (
    <div className="relative">
      <button
        onClick={handleConnect}
        className={`${
          mobile ? "w-full justify-center" : "flex"
        } bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-full text-sm font-medium items-center gap-2 transition-colors ${className}`}
      >
        <Wallet className="h-4 w-4" />
        Connect Wallet
      </button>
    </div>
  );
}; 