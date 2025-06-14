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
      address: "AXYFBhYPhHt4SzGqdpSfBSMWEQmKdCyQScA1xjRvHzph",
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
    <Card className="w-full border-gray-100 shadow-sm">
      <CardHeader className="border-b border-gray-50 bg-gray-50/50">
        <CardTitle className="flex items-center gap-3 text-xl font-urbanist font-semibold text-black">
          <Wallet className="h-5 w-5" />
          Monitored Wallets
        </CardTitle>
        <CardDescription className="font-urbanist text-gray-600">
          Key foundation and project wallet addresses with their live values.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/30">
              <tr className="border-b border-gray-100">
                <th className="text-left py-4 px-6 font-medium text-gray-900 font-urbanist">Description</th>
                <th className="text-left py-4 px-6 font-medium text-gray-900 font-urbanist">Address</th>
                <th className="text-left py-4 px-6 font-medium text-gray-900 font-urbanist">Notes / Assets to Track</th>
                <th className="text-right py-4 px-6 font-medium text-gray-900 font-urbanist">Live Value (USD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {wallets.map((wallet, index) => (
                <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 text-gray-800 font-urbanist font-medium">{wallet.description}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm text-gray-600 truncate max-w-[200px]">
                        {wallet.address}
                      </span>
                      <ExternalLink className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors" />
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600 max-w-[300px] font-urbanist">
                    <div className="whitespace-pre-line">{wallet.notes}</div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <span className="text-red-500 font-urbanist font-medium">{wallet.liveValue}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 px-6 pb-6 text-sm text-gray-500 border-t border-gray-50 pt-4">
          <p className="font-urbanist">Live values require a dedicated backend function. Displaying placeholders or last known state.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MultisigWallet;
