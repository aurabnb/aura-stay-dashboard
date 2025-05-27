
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, ExternalLink, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface JupiterToken {
  address: string;
  chainId: number;
  decimals: number;
  name: string;
  symbol: string;
  logoURI?: string;
  tags?: string[];
}

interface JupiterTokenListProps {
  onTokenSelect: (token: JupiterToken) => void;
  selectedToken?: JupiterToken;
}

const JupiterTokenList: React.FC<JupiterTokenListProps> = ({ onTokenSelect, selectedToken }) => {
  const [tokens, setTokens] = useState<JupiterToken[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const FEATURED_TOKENS = [
    'So11111111111111111111111111111111111111112', // SOL
    '3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe', // AURA
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
    'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // USDT
  ];

  useEffect(() => {
    fetchTokenList();
  }, []);

  const fetchTokenList = async () => {
    try {
      const response = await fetch('https://token.jup.ag/strict');
      const data = await response.json();
      
      // Sort tokens to show featured ones first, then by market cap/popularity
      const sortedTokens = data.sort((a: JupiterToken, b: JupiterToken) => {
        const aIsFeatured = FEATURED_TOKENS.includes(a.address);
        const bIsFeatured = FEATURED_TOKENS.includes(b.address);
        
        if (aIsFeatured && !bIsFeatured) return -1;
        if (!aIsFeatured && bIsFeatured) return 1;
        
        return a.symbol.localeCompare(b.symbol);
      });
      
      setTokens(sortedTokens);
    } catch (error) {
      console.error('Error fetching Jupiter token list:', error);
      toast({
        title: "Error",
        description: "Failed to load token list",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredTokens = tokens.filter(token => 
    token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    token.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 50); // Limit to 50 results for performance

  const openTokenOnJupiter = (token: JupiterToken) => {
    const jupiterUrl = `https://jup.ag/swap/SOL-${token.address}`;
    window.open(jupiterUrl, '_blank');
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading tokens...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Jupiter Token List
        </CardTitle>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search tokens..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent className="max-h-96 overflow-y-auto">
        <div className="space-y-2">
          {filteredTokens.map((token) => (
            <div
              key={token.address}
              className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                selectedToken?.address === token.address 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => onTokenSelect(token)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {token.logoURI && (
                    <img 
                      src={token.logoURI} 
                      alt={token.symbol}
                      className="w-8 h-8 rounded-full"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{token.symbol}</span>
                      {FEATURED_TOKENS.includes(token.address) && (
                        <Badge variant="secondary" className="text-xs">Featured</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{token.name}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    openTokenOnJupiter(token);
                  }}
                  className="flex items-center gap-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  Trade
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default JupiterTokenList;
