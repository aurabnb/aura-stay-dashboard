import { useState, useEffect } from 'react';
import type { ConsolidatedData } from '@/types/treasury';

interface TreasuryDataState {
  data: ConsolidatedData | null;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

export function useRealTreasuryData() {
  const [state, setState] = useState<TreasuryDataState>({
    data: null,
    loading: true,
    error: null,
    lastUpdated: null,
  });

  const fetchTreasuryData = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await fetch('/api/treasury?type=real');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch treasury data: ${response.statusText}`);
      }
      
      const data: ConsolidatedData = await response.json();
      
      setState({
        data,
        loading: false,
        error: null,
        lastUpdated: data.treasury.lastUpdated,
      });
    } catch (error) {
      console.error('Error fetching real treasury data:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }));
    }
  };

  const refetch = () => {
    fetchTreasuryData();
  };

  useEffect(() => {
    fetchTreasuryData();
    
    // Set up periodic refresh (every 5 minutes)
    const interval = setInterval(fetchTreasuryData, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    ...state,
    refetch,
    // Helper derived values
    totalValue: state.data?.treasury.totalMarketCap || 0,
    volatileAssets: state.data?.treasury.volatileAssets || 0,
    hardAssets: state.data?.treasury.hardAssets || 0,
    wallets: state.data?.wallets || [],
    solPrice: state.data?.solPrice || 0,
  };
}

// Hook for treasury overview data
export function useRealTreasuryOverview() {
  const [state, setState] = useState({
    data: null as any,
    loading: true,
    error: null as string | null,
  });

  const fetchOverview = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await fetch('/api/treasury?type=real-overview');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch treasury overview: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      setState({
        data,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error fetching treasury overview:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }));
    }
  };

  useEffect(() => {
    fetchOverview();
    
    // Set up periodic refresh (every 5 minutes)
    const interval = setInterval(fetchOverview, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    ...state,
    refetch: fetchOverview,
  };
} 