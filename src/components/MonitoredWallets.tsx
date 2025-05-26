
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, ExternalLink } from 'lucide-react';

interface WalletData {
  id: string;
  name: string;
  address: string;
  blockchain: string;
  balance: string;
  usdValue: number;
  lastUpdated: string;
}

const MonitoredWallets = () => {
  // Mock data - would be replaced with real data from your edge function
  const wallets: WalletData[] = [
    {
      id: '1',
      name: 'Treasury Wallet',
      address: 'Aftv2wFpusiKHfHWdkiFNPsmrFEgrBheHX6ejS4LkM8i',
      blockchain: 'Solana',
      balance: '0 SOL',
      usdValue: 0,
      lastUpdated: new Date().toISOString()
    },
    {
      id: '2', 
      name: 'Ethereum Treasury',
      address: '0xf05fc9a3c6011c76eb6fe4cbb956eeac8750306d',
      blockchain: 'Ethereum',
      balance: '0 ETH',
      usdValue: 0,
      lastUpdated: new Date().toISOString()
    }
  ];

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const openExplorer = (address: string, blockchain: string) => {
    const urls = {
      Solana: `https://solscan.io/account/${address}`,
      Ethereum: `https://etherscan.io/address/${address}`
    };
    window.open(urls[blockchain as keyof typeof urls], '_blank');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Monitored Wallets
        </CardTitle>
        <CardDescription>
          Real-time tracking of foundation treasury wallets across multiple blockchains.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {wallets.map((wallet) => (
            <div key={wallet.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900 font-urbanist">{wallet.name}</h3>
                  <p className="text-sm text-gray-500">{wallet.blockchain}</p>
                </div>
                <button
                  onClick={() => openExplorer(wallet.address, wallet.blockchain)}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                >
                  <ExternalLink className="h-4 w-4" />
                  Explorer
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Address:</span>
                  <p className="font-mono">{formatAddress(wallet.address)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Balance:</span>
                  <p className="font-semibold">{wallet.balance}</p>
                </div>
                <div>
                  <span className="text-gray-500">USD Value:</span>
                  <p className="font-semibold">${wallet.usdValue.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="mt-2 text-xs text-gray-400">
                Last updated: {new Date(wallet.lastUpdated).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MonitoredWallets;
