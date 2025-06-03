'use client';

import { useWallet as useSolanaWallet, useConnection } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';
import { anchorService } from '@/lib/services/anchorService';

export function useWallet() {
  const solanaWallet = useSolanaWallet();
  const { connection } = useConnection();
  const [isInitialized, setIsInitialized] = useState(false);
  const [balance, setBalance] = useState<number>(0);

  // Initialize Anchor service when wallet connects
  useEffect(() => {
    const initializeAnchor = async () => {
      if (solanaWallet.connected && solanaWallet.publicKey) {
        try {
          await anchorService.initializeWithWallet(solanaWallet);
          setIsInitialized(true);
          
          // Fetch balance
          const walletBalance = await anchorService.getAccountBalance(solanaWallet.publicKey);
          setBalance(walletBalance);
        } catch (error) {
          console.error('Failed to initialize Anchor service:', error);
          setIsInitialized(false);
        }
      } else {
        setIsInitialized(false);
        setBalance(0);
      }
    };

    initializeAnchor();
  }, [solanaWallet.connected, solanaWallet.publicKey]);

  // Refresh balance periodically
  useEffect(() => {
    const refreshBalance = async () => {
      if (solanaWallet.publicKey && isInitialized) {
        try {
          const newBalance = await anchorService.getAccountBalance(solanaWallet.publicKey);
          setBalance(newBalance);
        } catch (error) {
          console.error('Failed to refresh balance:', error);
        }
      }
    };

    const interval = setInterval(refreshBalance, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [solanaWallet.publicKey, isInitialized]);

  return {
    ...solanaWallet,
    connection,
    isInitialized,
    balance,
    anchorService: isInitialized ? anchorService : null,
  };
} 