
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown, DollarSign, Zap, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface JupiterSwapWidgetProps {
  fromToken: string;
  toToken: string;
  onSwap?: () => void;
}

const JupiterSwapWidget: React.FC<JupiterSwapWidgetProps> = ({
  fromToken = 'SOL',
  toToken = 'AURA',
  onSwap
}) => {
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState<any>(null);
  const { toast } = useToast();

  const TOKEN_ADDRESSES = {
    SOL: 'So11111111111111111111111111111111111111112',
    AURA: '3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe',
    USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
  };

  const getQuote = async (inputAmount: string) => {
    if (!inputAmount || parseFloat(inputAmount) <= 0) {
      setToAmount('');
      setQuote(null);
      return;
    }

    setLoading(true);
    try {
      const fromMint = TOKEN_ADDRESSES[fromToken as keyof typeof TOKEN_ADDRESSES];
      const toMint = TOKEN_ADDRESSES[toToken as keyof typeof TOKEN_ADDRESSES];
      
      const amount = Math.floor(parseFloat(inputAmount) * 1000000000); // Convert to lamports for SOL
      
      const response = await fetch(
        `https://quote-api.jup.ag/v6/quote?inputMint=${fromMint}&outputMint=${toMint}&amount=${amount}&slippageBps=50`
      );
      
      const data = await response.json();
      
      if (data.outAmount) {
        const outputAmount = parseFloat(data.outAmount) / 1000000000; // Convert back from lamports
        setToAmount(outputAmount.toFixed(6));
        setQuote(data);
      }
    } catch (error) {
      console.error('Error getting Jupiter quote:', error);
      toast({
        title: "Quote Error",
        description: "Failed to get price quote from Jupiter",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (fromAmount) {
        getQuote(fromAmount);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [fromAmount, fromToken, toToken]);

  const handleSwap = () => {
    if (!quote) {
      toast({
        title: "No Quote",
        description: "Please enter an amount to get a quote first",
        variant: "destructive"
      });
      return;
    }

    // Open Jupiter with pre-filled swap
    const jupiterUrl = `https://jup.ag/swap/${fromToken}-${toToken}`;
    window.open(jupiterUrl, '_blank');
    
    toast({
      title: "Redirecting to Jupiter",
      description: "Opening Jupiter DEX for swap execution",
    });

    onSwap?.();
  };

  const swapTokens = () => {
    // This would swap the from/to tokens in a real implementation
    toast({
      title: "Token Swap",
      description: "Swapping input and output tokens",
    });
  };

  return (
    <Card className="bg-gradient-to-br from-white to-gray-50 border-0 shadow-lg">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900 font-urbanist flex items-center gap-2">
              <Zap className="h-6 w-6 text-blue-600" />
              Jupiter Swap
            </CardTitle>
            <CardDescription className="text-gray-600 font-urbanist mt-2">
              Best prices across Solana DEXs
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-urbanist">
            <Zap className="h-3 w-3 mr-1" />
            Live
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* From Token */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700 font-urbanist">From</label>
          <div className="relative">
            <Input
              type="number"
              placeholder="0.0"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              className="pr-16 h-12 text-lg font-semibold border-2 focus:border-blue-500 transition-colors font-urbanist"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Badge variant="secondary" className="font-urbanist">
                {fromToken}
              </Badge>
            </div>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <button
            onClick={swapTokens}
            className="p-2 rounded-full border-2 border-gray-200 bg-white hover:bg-gray-50 transition-colors"
          >
            <ArrowUpDown className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* To Token */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700 font-urbanist">To</label>
          <div className="relative">
            <Input
              type="text"
              placeholder="0.0"
              value={loading ? "Loading..." : toAmount}
              readOnly
              className="pr-16 h-12 text-lg font-semibold border-2 bg-gray-50 font-urbanist"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Badge variant="secondary" className="font-urbanist">
                {toToken}
              </Badge>
            </div>
          </div>
        </div>

        {/* Quote Info */}
        {quote && (
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-blue-700 font-medium font-urbanist">Rate</span>
                <span className="text-blue-900 font-semibold font-urbanist">
                  1 {fromToken} = {(parseFloat(toAmount) / parseFloat(fromAmount)).toFixed(6)} {toToken}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-blue-700 font-medium font-urbanist">Price Impact</span>
                <span className="text-blue-900 font-semibold font-urbanist">
                  {quote.priceImpactPct ? `${(quote.priceImpactPct * 100).toFixed(3)}%` : '< 0.01%'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Swap Button */}
        <Button 
          onClick={handleSwap} 
          className="w-full h-12 text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 font-urbanist"
          disabled={!fromAmount || !toAmount || loading}
        >
          <DollarSign className="h-5 w-5 mr-2" />
          Swap on Jupiter
          <ExternalLink className="h-4 w-4 ml-2" />
        </Button>

        <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700 font-medium font-urbanist">
            🚀 Powered by Jupiter - Best prices across all Solana DEXs
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default JupiterSwapWidget;
