import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface LPDetails {
  poolAddress: string;
  token1: { symbol: string; amount: number; usdValue: number };
  token2: { symbol: string; amount: number; usdValue: number };
  priceRange: { min: number; max: number };
  totalUsdValue: number;
}

interface WalletBalance {
  token_symbol: string;
  token_name: string;
  balance: number;
  usd_value: number;
  token_address?: string;
  is_lp_token: boolean;
  platform: string;
  lp_details?: LPDetails;
}

interface WalletData {
  wallet_id: string;
  name: string;
  address: string;
  blockchain: string;
  balances: WalletBalance[];
  totalUsdValue: number;
}

interface TreasuryMetrics {
  totalMarketCap: number;
  volatileAssets: number;
  hardAssets: number;
  lastUpdated: string;
}

interface ConsolidatedData {
  treasury: TreasuryMetrics;
  wallets: WalletData[];
  solPrice: number;
}

const Index = () => {
  const [data, setData] = useState<ConsolidatedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [apiStatus, setApiStatus] = useState<{
    solPrice: 'loading' | 'success' | 'error';
    wallets: 'loading' | 'success' | 'error';
    auraMarketCap: 'loading' | 'success' | 'error';
  }>({
    solPrice: 'loading',
    wallets: 'loading',
    auraMarketCap: 'loading'
  });

  const fetchData = async () => {
    try {
      console.log('Fetching consolidated data...');
      setError(null);
      setApiStatus({
        solPrice: 'loading',
        wallets: 'loading',
        auraMarketCap: 'loading'
      });

      const { data: responseData, error: fetchError } = await supabase.functions.invoke('fetch-wallet-balances');
      
      if (fetchError) throw fetchError;
      
      console.log('Received consolidated data:', responseData);
      
      if (!responseData || !responseData.wallets || !Array.isArray(responseData.wallets)) {
        console.error('Invalid response structure:', responseData);
        throw new Error('Invalid response structure from server');
      }
      
      setData(responseData);
      setLastRefresh(new Date());
      
      // Update API status based on data quality
      setApiStatus({
        solPrice: responseData.solPrice > 0 ? 'success' : 'error',
        wallets: responseData.wallets.length > 0 ? 'success' : 'error',
        auraMarketCap: responseData.treasury.totalMarketCap > 0 ? 'success' : 'error'
      });

      // Show success toast
      toast({
        title: "Data Updated",
        description: `Successfully fetched data for ${responseData.wallets.length} wallets`,
      });

    } catch (error) {
      console.error('Error fetching consolidated data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch data';
      setError(errorMessage);
      
      setApiStatus({
        solPrice: 'error',
        wallets: 'error',
        auraMarketCap: 'error'
      });

      // Show error toast
      toast({
        title: "Data Fetch Failed", 
        description: errorMessage,
        variant: "destructive",
      });

      setData({
        treasury: {
          totalMarketCap: 0,
          volatileAssets: 0,
          hardAssets: 0,
          lastUpdated: new Date().toISOString()
        },
        wallets: [],
        solPrice: 0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Set up periodic refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const renderLPDetails = (lpDetails: LPDetails) => (
    <div className="mt-2 bg-blue-50 p-3 rounded-lg">
      <div className="text-sm font-medium text-blue-900 mb-2">LP Position Details</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-white p-2 rounded">
          <div className="text-xs font-medium text-gray-700">{lpDetails.token1.symbol}</div>
          <div className="text-xs text-gray-600">
            {lpDetails.token1.amount.toLocaleString(undefined, { maximumFractionDigits: 6 })} 
            (${lpDetails.token1.usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
          </div>
        </div>
        <div className="bg-white p-2 rounded">
          <div className="text-xs font-medium text-gray-700">{lpDetails.token2.symbol}</div>
          <div className="text-xs text-gray-600">
            {lpDetails.token2.amount.toLocaleString(undefined, { maximumFractionDigits: 6 })} 
            (${lpDetails.token2.usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
          </div>
        </div>
      </div>
      <div className="mt-2 bg-white p-2 rounded">
        <div className="text-xs font-medium text-gray-700">Price Range</div>
        <div className="text-xs text-gray-600">
          ${lpDetails.priceRange.min.toFixed(4)} - ${lpDetails.priceRange.max.toFixed(4)}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-white font-urbanist">
        <Header />
        <main className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="text-center mt-8">
            <p className="text-gray-600">Loading treasury data...</p>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-500">Fetching Solana prices...</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-500">Loading wallet balances...</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-500">Calculating AURA market cap...</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-urbanist">
      <Header />
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="space-y-12">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-6 font-urbanist leading-tight">
              Redefining the Art of Unique<br />
              Short Term Stays
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-urbanist">
              Aura turns dream stays into community owned assets, everywhere on earth
            </p>
          </div>

          {/* Enhanced API Status Widget */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700">API Status</h3>
              {lastRefresh && (
                <div className="text-xs text-gray-500">
                  Last updated: {lastRefresh.toLocaleTimeString()}
                </div>
              )}
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  apiStatus.solPrice === 'success' ? 'bg-green-500' : 
                  apiStatus.solPrice === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                }`}></div>
                <span className="text-xs text-gray-600">SOL Price</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  apiStatus.wallets === 'success' ? 'bg-green-500' : 
                  apiStatus.wallets === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                }`}></div>
                <span className="text-xs text-gray-600">Wallets</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  apiStatus.auraMarketCap === 'success' ? 'bg-green-500' : 
                  apiStatus.auraMarketCap === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                }`}></div>
                <span className="text-xs text-gray-600">AURA Market Cap</span>
              </div>
            </div>
          </div>

          {/* Enhanced Solana Price Widget */}
          {data?.solPrice && (
            <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    Solana Price
                    <div className={`w-2 h-2 rounded-full ${
                      apiStatus.solPrice === 'success' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">
                    ${data.solPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                <button 
                  onClick={fetchData}
                  className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-sm"
                >
                  Refresh
                </button>
              </div>
            </div>
          )}

          {/* Enhanced Value Indicator Section */}
          <div className="bg-gray-50 rounded-lg p-8">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-semibold font-urbanist">Value Indicator</h2>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  apiStatus.auraMarketCap === 'success' ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span className="text-xs text-gray-600">Market Cap Status</span>
              </div>
            </div>
            {data?.treasury && (
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Market Cap:</span>
                  <span className="font-semibold">
                    ${data.treasury.totalMarketCap.toLocaleString()}
                    {data.treasury.totalMarketCap === 0 && (
                      <span className="text-red-500 text-sm ml-2">(Error fetching)</span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Volatile Assets:</span>
                  <span className="font-semibold">${data.treasury.volatileAssets.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Hard Assets:</span>
                  <span className="font-semibold">${data.treasury.hardAssets.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t pt-2 font-semibold">
                  <span className="text-gray-800">Total Treasury Value:</span>
                  <span className="text-green-600">${(data.treasury.volatileAssets + data.treasury.hardAssets).toLocaleString()}</span>
                </div>
              </div>
            )}
            <a 
              href="/value-indicator"
              className="inline-block bg-black text-white px-6 py-2 rounded-full font-urbanist hover:bg-gray-800 transition-colors mt-6"
            >
              View Dashboard
            </a>
          </div>

          {/* Enhanced Dynamic Wallets Section */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-semibold font-urbanist">Monitored Wallets</h2>
                <div className={`w-2 h-2 rounded-full ${
                  apiStatus.wallets === 'success' ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
              </div>
              <button 
                onClick={fetchData}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
              >
                Refresh Data
              </button>
            </div>
            
            {error && (
              <div className="text-red-600 p-4 bg-red-50 rounded-lg">
                <p className="font-medium">Error loading wallet data</p>
                <p className="text-sm mt-1">{error}</p>
                <button 
                  onClick={fetchData}
                  className="mt-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                >
                  Retry
                </button>
              </div>
            )}
            
            {data?.wallets && data.wallets.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.wallets.map((wallet) => (
                  <div key={wallet.wallet_id} className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-xl font-semibold mb-2 font-urbanist">{wallet.name}</h3>
                    <p className="text-gray-600 mb-4 font-urbanist">
                      {wallet.blockchain} - {formatAddress(wallet.address)}
                    </p>
                    <div className="text-lg font-bold text-green-600 mb-4">
                      ${wallet.totalUsdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    
                    {wallet.balances && wallet.balances.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-gray-700">Assets ({wallet.balances.length})</h4>
                        <div className="max-h-48 overflow-y-auto space-y-2">
                          {wallet.balances.map((balance, index) => (
                            <div key={index} className="border-l-2 border-blue-200 pl-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="text-sm font-medium">
                                    {balance.token_symbol}
                                    {balance.is_lp_token && (
                                      <span className="ml-1 px-1 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">LP</span>
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-600">{balance.token_name}</div>
                                  <div className="text-xs text-gray-500 capitalize">{balance.platform}</div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm">{balance.balance.toLocaleString(undefined, { maximumFractionDigits: 6 })}</div>
                                  <div className="text-xs text-gray-600">
                                    ${(balance.usd_value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </div>
                                </div>
                              </div>
                              
                              {balance.is_lp_token && balance.lp_details && renderLPDetails(balance.lp_details)}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {(!wallet.balances || wallet.balances.length === 0) && (
                      <div className="text-sm text-gray-500 italic">
                        No balance data available - click refresh to fetch latest data
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No wallet data available. Click refresh to fetch latest data.
              </div>
            )}
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <h3 className="text-xl font-semibold mb-4 font-urbanist">Multisig Wallet</h3>
              <p className="text-gray-600 mb-6 font-urbanist">
                Transparent multi-signature wallet management
              </p>
              <a 
                href="/multisig"
                className="inline-block bg-black text-white px-6 py-2 rounded-full font-urbanist hover:bg-gray-800 transition-colors"
              >
                View Wallet
              </a>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <h3 className="text-xl font-semibold mb-4 font-urbanist">Community Board</h3>
              <p className="text-gray-600 mb-6 font-urbanist">
                Share suggestions and join discussions
              </p>
              <a 
                href="/community-board"
                className="inline-block bg-black text-white px-6 py-2 rounded-full font-urbanist hover:bg-gray-800 transition-colors"
              >
                Join Community
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
