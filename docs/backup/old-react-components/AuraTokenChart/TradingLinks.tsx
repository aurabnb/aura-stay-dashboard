
import React from 'react';
import { Button } from '@/components/ui/button';

interface TradingLinksProps {
  tokenAddress: string;
}

const TradingLinks: React.FC<TradingLinksProps> = ({ tokenAddress }) => {
  return (
    <div className="flex justify-center gap-4 pt-6 border-t border-gray-200">
      <Button 
        variant="outline" 
        onClick={() => window.open(`https://jup.ag/swap/SOL-${tokenAddress}`, '_blank')}
        className="flex items-center gap-2 bg-white border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400 font-urbanist"
      >
        Trade on Jupiter
      </Button>
      <Button 
        variant="outline" 
        onClick={() => window.open(`https://dexscreener.com/solana/${tokenAddress}`, '_blank')}
        className="flex items-center gap-2 bg-white border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400 font-urbanist"
      >
        View on DEXScreener
      </Button>
    </div>
  );
};

export default TradingLinks;
