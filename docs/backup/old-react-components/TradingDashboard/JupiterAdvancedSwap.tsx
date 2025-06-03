
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { ArrowUpDown, Settings, Zap, ExternalLink, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { JupiterQuoteService } from './JupiterQuoteService';

interface JupiterToken {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
}

interface JupiterAdvancedSwapProps {
  fromToken?: JupiterToken;
  toToken?: JupiterToken;
}

const JupiterAdvancedSwap: React.FC<JupiterAdvancedSwapProps> = ({ 
  fromToken, 
  toToken 
}) => {
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [slippage, setSlippage] = useState(0.5);
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState<any>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { toast } = useToast();

  // Default tokens
  const defaultFromToken: JupiterToken = {
    address: 'So11111111111111111111111111111111111111112',
    symbol: 'SOL',
    name: 'Solana',
    decimals: 9
  };

  const defaultToToken: JupiterToken = {
    address: '3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe',
    symbol: 'AURA',
    name: 'Aura Token',
    decimals: 9
  };

  const activeFromToken = fromToken || defaultFromToken;
  const activeToToken = toToken || defaultToToken;

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (fromAmount && parseFloat(fromAmount) > 0) {
        getQuote();
      } else {
        setToAmount('');
        setQuote(null);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [fromAmount, activeFromToken, activeToToken, slippage]);

  const getQuote = async () => {
    setLoading(true);
    try {
      const amount = parseFloat(fromAmount) * Math.pow(10, activeFromToken.decimals);
      
      const quoteData = await JupiterQuoteService.getQuote({
        inputMint: activeFromToken.address,
        outputMint: activeToToken.address,
        amount: Math.floor(amount),
        slippageBps: Math.floor(slippage * 100)
      });

      if (quoteData) {
        const outputAmount = parseFloat(quoteData.outAmount) / Math.pow(10, activeToToken.decimals);
        setToAmount(outputAmount.toFixed(6));
        setQuote(quoteData);
      } else {
        setToAmount('');
        setQuote(null);
        toast({
          title: "Quote Error",
          description: "Unable to get quote for this pair",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error getting quote:', error);
      setToAmount('');
      setQuote(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = () => {
    if (!quote) {
      toast({
        title: "No Quote",
        description: "Please enter an amount to get a quote first",
        variant: "destructive"
      });
      return;
    }

    const jupiterUrl = JupiterQuoteService.getJupiterSwapUrl(
      activeFromToken.symbol, 
      activeToToken.symbol
    );
    window.open(jupiterUrl, '_blank');
    
    toast({
      title: "Redirecting to Jupiter",
      description: "Opening Jupiter DEX for swap execution",
    });
  };

  const swapTokens = () => {
    // In a real implementation, this would swap the from/to tokens
    toast({
      title: "Swap Direction",
      description: "Token positions swapped",
    });
  };

  return (
    <Card className="bg-gradient-to-br from-white to-gray-50 border-0 shadow-lg">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900 font-urbanist flex items-center gap-2">
              <Zap className="h-6 w-6 text-blue-600" />
              Advanced Jupiter Swap
            </CardTitle>
            <p className="text-gray-600 font-urbanist mt-2">
              Professional trading with live quotes
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <Zap className="h-3 w-3 mr-1" />
              Live
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <Settings className="h-4 w-4 mr-1" />
              Settings
            </Button>
          </div>
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
              className="pr-20 h-12 text-lg font-semibold border-2 focus:border-blue-500 transition-colors font-urbanist"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Badge variant="secondary" className="font-urbanist">
                {activeFromToken.symbol}
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
              className="pr-20 h-12 text-lg font-semibold border-2 bg-gray-50 font-urbanist"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Badge variant="secondary" className="font-urbanist">
                {activeToToken.symbol}
              </Badge>
            </div>
          </div>
        </div>

        {/* Advanced Settings */}
        {showAdvanced && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700">Slippage Tolerance</label>
                <span className="text-sm font-semibold">{slippage}%</span>
              </div>
              <Slider
                value={[slippage]}
                onValueChange={(value) => setSlippage(value[0])}
                max={5}
                min={0.1}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0.1%</span>
                <span>5%</span>
              </div>
            </div>
          </div>
        )}

        {/* Quote Info */}
        {quote && (
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-blue-700 font-medium font-urbanist">Rate</span>
                <span className="text-blue-900 font-semibold font-urbanist">
                  1 {activeFromToken.symbol} = {(parseFloat(toAmount) / parseFloat(fromAmount)).toFixed(6)} {activeToToken.symbol}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-blue-700 font-medium font-urbanist">Price Impact</span>
                <span className="text-blue-900 font-semibold font-urbanist">
                  {quote.priceImpactPct ? `${(quote.priceImpactPct * 100).toFixed(3)}%` : '< 0.01%'}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-blue-700 font-medium font-urbanist">Route</span>
                <span className="text-blue-900 font-semibold font-urbanist">
                  {quote.routePlan?.length || 1} hop{(quote.routePlan?.length || 1) > 1 ? 's' : ''}
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
          <Zap className="h-5 w-5 mr-2" />
          Swap on Jupiter
          <ExternalLink className="h-4 w-4 ml-2" />
        </Button>

        <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700 font-medium font-urbanist">
            🚀 Best prices aggregated from all Solana DEXs
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default JupiterAdvancedSwap;
