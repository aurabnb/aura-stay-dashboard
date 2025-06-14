import React from 'react';

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

interface WalletCardProps {
  wallet: WalletData;
}

const WalletCard = ({ wallet }: WalletCardProps) => {
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTokenAmount = (symbol: string, amount: number) => {
    // Format CULT as whole number, others with decimals
    if (symbol === 'CULT') {
      return amount.toLocaleString(undefined, { maximumFractionDigits: 0 });
    }
    return amount.toLocaleString(undefined, { maximumFractionDigits: 6 });
  };

  const renderLPDetails = (lpDetails: LPDetails) => (
    <div className="mt-2 bg-blue-50 p-3 rounded-lg">
      <div className="text-sm font-medium text-blue-900 mb-2">LP Position Details</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-white p-2 rounded">
          <div className="text-xs font-medium text-gray-700">{lpDetails.token1.symbol}</div>
          <div className="text-xs text-gray-600">
            {formatTokenAmount(lpDetails.token1.symbol, lpDetails.token1.amount)}
            (${lpDetails.token1.usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
          </div>
        </div>
        <div className="bg-white p-2 rounded">
          <div className="text-xs font-medium text-gray-700">{lpDetails.token2.symbol}</div>
          <div className="text-xs text-gray-600">
            {formatTokenAmount(lpDetails.token2.symbol, lpDetails.token2.amount)}
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

  // Always show AURA and LPs, even if zero balance. Sort so LPs are shown last.
  let balancesToShow = wallet.balances ? [...wallet.balances] : [];
  // Remove filter for balances > 0; show all, but prioritize AURA and LPs
  // Move AURA token and LPs to top of list for visibility
  balancesToShow.sort((a, b) => {
    if (a.token_symbol === "AURA") return -1;
    if (b.token_symbol === "AURA") return 1;
    if (a.is_lp_token && !b.is_lp_token) return -1;
    if (!a.is_lp_token && b.is_lp_token) return 1;
    return 0;
  });

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h3 className="text-xl font-semibold mb-2 font-urbanist">{wallet.name}</h3>
      <p className="text-gray-600 mb-4 font-urbanist">
        {wallet.blockchain} - {formatAddress(wallet.address)}
      </p>
      <div className="text-lg font-bold text-green-600 mb-4">
        ${wallet.totalUsdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
      
      {balancesToShow && balancesToShow.length > 0 ? (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Assets ({balancesToShow.length})</h4>
          <div className="max-h-48 overflow-y-auto space-y-2">
            {balancesToShow.map((balance, index) => (
              <div key={`${balance.token_symbol}_${balance.token_address || index}`} className="border-l-2 border-blue-200 pl-3">
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
      ) : (
        <div className="text-sm text-gray-500 italic">
          No balance data available - click refresh to fetch latest data
        </div>
      )}
    </div>
  );
};

export default WalletCard;
