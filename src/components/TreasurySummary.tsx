
import React from 'react';

interface TreasuryMetrics {
  totalMarketCap: number;
  volatileAssets: number;
  hardAssets: number;
  lastUpdated: string;
}

interface TreasurySummaryProps {
  treasury: TreasuryMetrics;
  apiStatus: 'loading' | 'success' | 'error';
}

const TreasurySummary = ({ treasury, apiStatus }: TreasurySummaryProps) => {
  return (
    <div className="bg-gray-50 rounded-lg p-8">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-2xl font-semibold font-urbanist">Value Indicator</h2>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            apiStatus === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          <span className="text-xs text-gray-600">Market Cap Status</span>
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex justify-between">
          <span className="text-gray-600">Total Market Cap:</span>
          <span className="font-semibold">
            ${treasury.totalMarketCap.toLocaleString()}
            {treasury.totalMarketCap === 0 && (
              <span className="text-red-500 text-sm ml-2">(Error fetching)</span>
            )}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Volatile Assets:</span>
          <span className="font-semibold">${treasury.volatileAssets.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Hard Assets:</span>
          <span className="font-semibold">${treasury.hardAssets.toLocaleString()}</span>
        </div>
        <div className="flex justify-between border-t pt-2 font-semibold">
          <span className="text-gray-800">Total Treasury Value:</span>
          <span className="text-green-600">${(treasury.volatileAssets + treasury.hardAssets).toLocaleString()}</span>
        </div>
      </div>
      <a 
        href="/value-indicator"
        className="inline-block bg-black text-white px-6 py-2 rounded-full font-urbanist hover:bg-gray-800 transition-colors mt-6"
      >
        View Dashboard
      </a>
    </div>
  );
};

export default TreasurySummary;
