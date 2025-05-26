
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, ExternalLink } from 'lucide-react';

interface WalletData {
  description: string;
  address: string;
  notes: string;
  liveValue: string;
  status: string;
}

interface Transaction {
  date: string;
  amount: string;
  description: string;
  category: string;
  hash: string;
  status: string;
}

const MultisigWallet = () => {
  const [wallets] = useState<WalletData[]>([
    {
      description: "Marketing Wallet - Solana",
      address: "7bPeyF5YPQdsycCCtvysGCE7EdmG64gUJKKFr4DN2",
      notes: "Include any LP tokens in Meteora.",
      liveValue: "Data source pending",
      status: "Error"
    },
    {
      description: "Operations Wallet - Solana",
      address: "AXYFBhfHh45ZGqpSYBSMEQdQVgQC4x1xRvHzph",
      notes: "Include any LP tokens in Meteora.",
      liveValue: "Data source pending",
      status: "Error"
    },
    {
      description: "Business Wallet - Solana",
      address: "Hxa31rmLq2TEDm64qE7ZDACPNGHyWqn2SE3vKvfg",
      notes: "Include any LP tokens in Meteora.",
      liveValue: "Data source pending",
      status: "Error"
    },
    {
      description: "Funding Wallet - Solana",
      address: "Aftv2wFpusiKHfHWdkiFNPsmrFEgrBheHX6ejS4LkM8i",
      notes: "Include any LP tokens in Meteora.",
      liveValue: "Data source pending",
      status: "Error"
    },
    {
      description: "Funding Wallet - Ethereum",
      address: "0xf05fc9a3c6011c76eb6fe4cbb956eeac8750306d",
      notes: "Include LP tokens.\nDcult: 0x2d77b594b9bbaed03221f7c63af8c4307432daf1\nCult: 0xf0f9D895aCa5c8678f706FB8216fa22957685A13",
      liveValue: "Data source pending",
      status: "Error"
    },
    {
      description: "Believe.app LP Wallet - Solana",
      address: "BRGD2RhNKvdaWYZBc9dGnLajWa7YMS5xZw2NRlN5j",
      notes: "Include any LP tokens in Meteora.",
      liveValue: "Data source pending",
      status: "Error"
    }
  ]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Monitored Wallets
        </CardTitle>
        <CardDescription>
          Key foundation and project wallet addresses with their live values.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Description</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Address</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Notes / Assets to Track</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Live Value (USD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {wallets.map((wallet, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-700">{wallet.description}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-gray-600 truncate max-w-[200px]">
                        {wallet.address}
                      </span>
                      <ExternalLink className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-pointer" />
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 max-w-[300px]">
                    <div className="whitespace-pre-line">{wallet.notes}</div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-red-500">{wallet.liveValue}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 text-sm text-gray-500 border-t pt-4">
          <p>Live values require a dedicated backend function. Displaying placeholders or last known state.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MultisigWallet;
