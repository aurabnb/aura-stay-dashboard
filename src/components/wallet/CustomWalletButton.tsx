'use client';

import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletReadyState } from '@solana/wallet-adapter-base';
import { Wallet, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CustomWalletButtonProps {
  className?: string;
  mobile?: boolean;
}

export const CustomWalletButton: React.FC<CustomWalletButtonProps> = ({ 
  className, 
  mobile = false 
}) => {
  const { wallets, select, connecting, connected } = useWallet();
  const [walletOptionsOpen, setWalletOptionsOpen] = useState(false);
  const { toast } = useToast();

  // Filter to only show ready wallets
  const readyWallets = wallets.filter(
    (wallet) => wallet.readyState === WalletReadyState.Installed
  );

  const handleWalletSelect = async (walletName: string) => {
    try {
      select(walletName as any); // Type assertion for wallet adapter compatibility
      setWalletOptionsOpen(false);
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error?.message || "Failed to connect wallet",
        variant: "destructive",
      });
    }
  };

  if (connected) {
    return null; // Don't show button when connected
  }

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setWalletOptionsOpen(!walletOptionsOpen);
        }}
        disabled={connecting}
        className={`${
          mobile ? "w-full justify-center" : "flex"
        } bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-full text-sm font-medium items-center gap-2 transition-colors disabled:opacity-50 ${className}`}
      >
        <Wallet className="h-4 w-4" />
        {connecting ? "Connecting..." : "Connect Wallet"}
        {!connecting && <ChevronDown className="h-3 w-3" />}
      </button>

      {walletOptionsOpen && !connecting && (
        <div
          className={`absolute bg-white border border-gray-200 rounded-lg shadow-lg z-50 ${
            mobile ? "w-full left-0 mt-2" : "min-w-[180px] left-0 mt-2"
          }`}
        >
          {readyWallets.length > 0 ? (
            readyWallets.map((wallet) => (
              <button
                key={wallet.adapter.name}
                onClick={(e) => {
                  e.stopPropagation();
                  handleWalletSelect(wallet.adapter.name);
                }}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm flex items-center gap-3 border-b last:border-0"
              >
                <img
                  src={wallet.adapter.icon}
                  alt={wallet.adapter.name}
                  className="w-6 h-6"
                  onError={(e) => {
                    // Fallback to letter avatar if icon fails to load
                    (e.target as HTMLImageElement).style.display = 'none';
                    const fallback = (e.target as HTMLImageElement).nextElementSibling;
                    if (fallback) {
                      (fallback as HTMLElement).style.display = 'flex';
                    }
                  }}
                />
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold bg-gray-600 hidden"
                >
                  {wallet.adapter.name.charAt(0).toUpperCase()}
                </div>
                {wallet.adapter.name}
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              <p className="mb-2">No wallet extensions detected</p>
              <div className="space-y-2">
                <a
                  href="https://phantom.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-purple-600 hover:text-purple-700 text-xs"
                >
                  Install Phantom →
                </a>
                <a
                  href="https://solflare.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-orange-600 hover:text-orange-700 text-xs"
                >
                  Install Solflare →
                </a>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 