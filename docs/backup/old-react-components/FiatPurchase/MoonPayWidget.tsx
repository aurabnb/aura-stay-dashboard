
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, CreditCard, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MoonPayWidgetProps {
  walletAddress?: string;
  onPurchaseComplete?: () => void;
}

const MoonPayWidget: React.FC<MoonPayWidgetProps> = ({ walletAddress, onPurchaseComplete }) => {
  const [purchaseStep, setPurchaseStep] = useState<'initial' | 'moonpay' | 'swap'>('initial');
  const { toast } = useToast();

  // MoonPay configuration - using sandbox
  const moonPayConfig = {
    apiKey: 'pk_test_sandbox_key', // Sandbox key for testing
    currencyCode: 'SOL',
    colorCode: '%23000000', // URL encoded black color
    defaultAmount: '50',
    redirectURL: encodeURIComponent(window.location.origin),
  };

  const buildMoonPayUrl = () => {
    const baseUrl = 'https://buy-sandbox.moonpay.com';
    const params = new URLSearchParams({
      apiKey: moonPayConfig.apiKey,
      currencyCode: moonPayConfig.currencyCode,
      walletAddress: walletAddress || '',
      colorCode: moonPayConfig.colorCode,
      defaultAmount: moonPayConfig.defaultAmount,
      redirectURL: moonPayConfig.redirectURL,
      showWalletAddressForm: 'true',
    });

    return `${baseUrl}?${params.toString()}`;
  };

  const handleBuyWithCard = () => {
    if (!walletAddress) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet first to purchase SOL",
        variant: "destructive"
      });
      return;
    }

    setPurchaseStep('moonpay');
    
    // Open MoonPay in new window
    const moonPayUrl = buildMoonPayUrl();
    console.log('Opening MoonPay URL:', moonPayUrl);
    
    const newWindow = window.open(moonPayUrl, '_blank', 'width=500,height=700,scrollbars=yes,resizable=yes');
    
    if (!newWindow) {
      toast({
        title: "Popup Blocked",
        description: "Please allow popups for this site and try again",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "MoonPay Opened",
      description: "Complete your SOL purchase in the new window, then return here to swap for AURA",
    });
  };

  const handleSwapOnMeteora = () => {
    setPurchaseStep('swap');
    // Direct link to Meteora SOL/AURA pool - using a generic Meteora URL for now
    const meteoraSwapUrl = 'https://meteora.ag/pools/9Wd2xPc6KmF6qmqbsQSbhemAmRpVfgVBFUPeLpYw7';
    
    const newWindow = window.open(meteoraSwapUrl, '_blank');
    
    if (!newWindow) {
      toast({
        title: "Popup Blocked",
        description: "Please allow popups for this site and try again",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Redirecting to Meteora",
      description: "Complete your SOL → AURA swap on Meteora",
    });
    
    // Call completion callback if provided
    if (onPurchaseComplete) {
      onPurchaseComplete();
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-blue-900 font-urbanist flex items-center gap-2">
                <CreditCard className="h-6 w-6" />
                Buy AURA with Card
              </CardTitle>
              <CardDescription className="text-blue-700 font-urbanist mt-2">
                Purchase AURA tokens using your credit card, debit card, or bank transfer
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
              2-Step Process
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Process Overview */}
          <div className="bg-white/70 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-3 font-urbanist">How it works:</h4>
            <div className="space-y-2">
              <div className={`flex items-center gap-3 ${purchaseStep === 'moonpay' || purchaseStep === 'swap' ? 'text-green-700' : 'text-blue-700'}`}>
                {purchaseStep === 'moonpay' || purchaseStep === 'swap' ? <CheckCircle className="h-4 w-4" /> : <div className="w-4 h-4 rounded-full bg-blue-300 flex items-center justify-center text-xs font-bold text-white">1</div>}
                <span className="text-sm">Buy SOL with your card via MoonPay</span>
              </div>
              <div className={`flex items-center gap-3 ${purchaseStep === 'swap' ? 'text-green-700' : 'text-gray-500'}`}>
                {purchaseStep === 'swap' ? <CheckCircle className="h-4 w-4" /> : <div className="w-4 h-4 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold text-white">2</div>}
                <span className="text-sm">Swap SOL for AURA on Meteora</span>
              </div>
            </div>
          </div>

          {/* Fee Information */}
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
              <div>
                <h5 className="font-medium text-amber-800 font-urbanist">Fee Information</h5>
                <ul className="text-sm text-amber-700 mt-1 space-y-1">
                  <li>• MoonPay: ~4.5% for card purchases</li>
                  <li>• Meteora: ~0.25% swap fee</li>
                  <li>• Network: Small SOL gas fees</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {purchaseStep === 'initial' && (
              <Button 
                onClick={handleBuyWithCard}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-urbanist flex items-center gap-2"
                disabled={!walletAddress}
              >
                <CreditCard className="h-4 w-4" />
                Step 1: Buy SOL with Card
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}

            {purchaseStep === 'moonpay' && (
              <div className="space-y-3">
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Step 1 in progress...</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    Complete your SOL purchase in the MoonPay window, then click below to continue.
                  </p>
                </div>
                
                <Button 
                  onClick={handleSwapOnMeteora}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-urbanist flex items-center gap-2"
                >
                  <ArrowRight className="h-4 w-4" />
                  Step 2: Swap SOL for AURA on Meteora
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            )}

            {purchaseStep === 'swap' && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 text-green-800 mb-2">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">Almost done!</span>
                </div>
                <p className="text-sm text-green-700">
                  Complete your SOL → AURA swap on Meteora. Your AURA tokens will appear in your wallet once the swap is confirmed.
                </p>
              </div>
            )}
          </div>

          {/* Wallet Address Display */}
          {walletAddress && (
            <div className="bg-gray-50 p-3 rounded-lg border">
              <div className="text-xs text-gray-600 mb-1">SOL will be sent to:</div>
              <div className="font-mono text-sm text-gray-800">
                {walletAddress.slice(0, 8)}...{walletAddress.slice(-8)}
              </div>
            </div>
          )}

          {!walletAddress && (
            <div className="bg-red-50 p-3 rounded-lg border border-red-200">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Connect your wallet to continue</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold font-urbanist">Supported Payment Methods</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium">Credit Cards</div>
              <div className="text-xs text-gray-600">Visa, Mastercard</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium">Debit Cards</div>
              <div className="text-xs text-gray-600">Most banks</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium">Apple Pay</div>
              <div className="text-xs text-gray-600">iOS devices</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium">Bank Transfer</div>
              <div className="text-xs text-gray-600">Lower fees</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MoonPayWidget;
