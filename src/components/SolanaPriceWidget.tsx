
import React from 'react';

interface SolanaPriceWidgetProps {
  solPrice: number;
  apiStatus: 'loading' | 'success' | 'error';
  onRefresh: () => void;
}

const SolanaPriceWidget = ({ solPrice, apiStatus, onRefresh }: SolanaPriceWidgetProps) => {
  if (!solPrice) return null;

  return (
    <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-gray-700 flex items-center gap-2">
            Solana Price
            <div className={`w-2 h-2 rounded-full ${
              apiStatus === 'success' ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
          </div>
          <div className="text-2xl font-bold text-purple-600">
            ${solPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <button 
          onClick={onRefresh}
          className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-sm"
        >
          Refresh
        </button>
      </div>
    </div>
  );
};

export default SolanaPriceWidget;
