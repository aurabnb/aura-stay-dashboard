'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { 
  VOLCANO_FUNDING_GOAL, 
  FUNDING_WALLET_ADDRESS, 
  MONITORED_WALLETS, 
  SOL_FALLBACK_PRICE_USD 
} from '@/lib/constants';
import { useTreasuryData } from '@/hooks/useTreasuryData';

interface ValidationItem {
  key: string;
  label: string;
  expected: any;
  actual: any;
  status: 'success' | 'error' | 'warning';
  description: string;
}

const TreasuryValidation: React.FC = () => {
  const { data, loading, error } = useTreasuryData();

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Dynamic Data Validation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">Loading validation...</div>
        </CardContent>
      </Card>
    );
  }

  const validations: ValidationItem[] = [
    // Constants validation
    {
      key: 'funding_goal',
      label: 'Volcano Funding Goal',
      expected: '$100,000',
      actual: `$${VOLCANO_FUNDING_GOAL.toLocaleString()}`,
      status: VOLCANO_FUNDING_GOAL === 100_000 ? 'success' : 'error',
      description: 'Should be $100,000 as per audit report'
    },
    {
      key: 'funding_wallet',
      label: 'Funding Wallet Address',
      expected: 'BRRGD28WnhKvdaHYMZRDc9dGn5LWa7YM5xzww2NRyN5L',
      actual: FUNDING_WALLET_ADDRESS,
      status: FUNDING_WALLET_ADDRESS === 'BRRGD28WnhKvdaHYMZRDc9dGn5LWa7YM5xzww2NRyN5L' ? 'success' : 'error',
      description: 'Primary treasury wallet for SOL inflows'
    },
    {
      key: 'sol_price',
      label: 'SOL Fallback Price',
      expected: '$174.33',
      actual: `$${SOL_FALLBACK_PRICE_USD}`,
      status: SOL_FALLBACK_PRICE_USD === 174.33 ? 'success' : 'error',
      description: 'Fallback SOL price for calculations'
    },
    {
      key: 'monitored_wallets_count',
      label: 'Monitored Wallets Count',
      expected: '4 wallets',
      actual: `${MONITORED_WALLETS.length} wallets`,
      status: MONITORED_WALLETS.length === 4 ? 'success' : 'error',
      description: 'Should track Operations, Business Costs, Marketing, Project Funding'
    },
    
    // Data structure validation
    {
      key: 'treasury_data',
      label: 'Treasury Data Available',
      expected: 'ConsolidatedData object',
      actual: data ? 'Available' : 'Missing',
      status: data ? 'success' : 'error',
      description: 'Dynamic treasury data from API'
    },
    {
      key: 'wallet_data',
      label: 'Wallet Data Structure',
      expected: 'WalletData array',
      actual: data?.wallets ? `${data.wallets.length} wallets` : 'Missing',
      status: data?.wallets && data.wallets.length > 0 ? 'success' : 'error',
      description: 'Dynamic wallet balance data'
    },
    {
      key: 'sol_price_dynamic',
      label: 'Dynamic SOL Price',
      expected: '> 0',
      actual: data?.solPrice ? `$${data.solPrice.toFixed(2)}` : 'Missing',
      status: data?.solPrice && data.solPrice > 0 ? 'success' : 'warning',
      description: 'Live SOL price from API'
    }
  ];

  // Check specific wallet addresses
  const expectedWallets = [
    { name: 'Operations', address: 'fa1ro8lT7gSdZSn7XTz6a3zNquphpGlEh7omB2f6GTh' },
    { name: 'Business Costs', address: 'Hxa3IlrmJq2fEDmc4gETZDdAPhQ6HyWqn2Es3vVKkFg' },
    { name: 'Marketing', address: '7QapFoyM5VPGMuycCCdaYUoe29c8EzadJkJYBDKKFf4DN2' },
    { name: 'Project Funding – SOL', address: 'Aftv2wfPusikfHFwdklFNpsmrFEgrBheHXo6jS4LkM8i' }
  ];

  expectedWallets.forEach((expectedWallet, index) => {
    const actualWallet = MONITORED_WALLETS[index];
    validations.push({
      key: `wallet_${index}`,
      label: `${expectedWallet.name} Address`,
      expected: expectedWallet.address,
      actual: actualWallet?.address || 'Missing',
      status: actualWallet?.address === expectedWallet.address ? 'success' : 'error',
      description: `Wallet address for ${expectedWallet.name}`
    });
  });

  // Check LP token data structure if available
  if (data?.wallets) {
    const hasLPTokens = data.wallets.some(wallet => 
      wallet.balances?.some(balance => balance.is_lp_token && balance.lp_details)
    );
    
    validations.push({
      key: 'lp_tokens',
      label: 'LP Token Data Structure',
      expected: 'LPDetails with pool info',
      actual: hasLPTokens ? 'Available' : 'No LP positions',
      status: hasLPTokens ? 'success' : 'warning',
      description: 'Enhanced LP token tracking with Meteora data'
    });
  }

  const successCount = validations.filter(v => v.status === 'success').length;
  const errorCount = validations.filter(v => v.status === 'error').length;
  const warningCount = validations.filter(v => v.status === 'warning').length;

  const getIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-600" />;
      case 'warning': return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      default: return null;
    }
  };

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'success': return 'default';
      case 'error': return 'destructive';
      case 'warning': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Dynamic Data Validation Report
          <div className="flex gap-2">
            <Badge variant="default" className="bg-green-600">
              ✓ {successCount}
            </Badge>
            {errorCount > 0 && (
              <Badge variant="destructive">
                ✗ {errorCount}
              </Badge>
            )}
            {warningCount > 0 && (
              <Badge variant="secondary">
                ⚠ {warningCount}
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <span className="font-medium text-red-800">Data Loading Error</span>
            </div>
            <p className="text-red-700 mt-1">{error}</p>
          </div>
        )}

        <div className="space-y-3">
          {validations.map((validation) => (
            <div 
              key={validation.key}
              className={`border rounded-lg p-4 ${
                validation.status === 'error' ? 'border-red-200 bg-red-50' :
                validation.status === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                'border-green-200 bg-green-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {getIcon(validation.status)}
                  <div>
                    <div className="font-medium">{validation.label}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {validation.description}
                    </div>
                  </div>
                </div>
                <Badge variant={getBadgeVariant(validation.status)}>
                  {validation.status.toUpperCase()}
                </Badge>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Expected:</span>
                  <div className="font-mono text-xs mt-1 p-2 bg-gray-100 rounded">
                    {validation.expected}
                  </div>
                </div>
                <div>
                  <span className="font-medium">Actual:</span>
                  <div className="font-mono text-xs mt-1 p-2 bg-gray-100 rounded">
                    {validation.actual}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {errorCount === 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-800">
                ✅ All Critical Dynamic Data Validations Pass!
              </span>
            </div>
            <p className="text-green-700 mt-1">
              The Next.js app has successfully restored all dynamic constants and data structures 
              from the original React app as documented in the audit report.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TreasuryValidation; 