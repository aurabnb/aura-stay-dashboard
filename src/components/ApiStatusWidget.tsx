
import React from 'react';

interface ApiStatus {
  solPrice: 'loading' | 'success' | 'error';
  wallets: 'loading' | 'success' | 'error';
  auraMarketCap: 'loading' | 'success' | 'error';
}

interface ApiStatusWidgetProps {
  apiStatus: ApiStatus;
  lastRefresh: Date | null;
}

const ApiStatusWidget = ({ apiStatus, lastRefresh }: ApiStatusWidgetProps) => {
  return (
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
  );
};

export default ApiStatusWidget;
