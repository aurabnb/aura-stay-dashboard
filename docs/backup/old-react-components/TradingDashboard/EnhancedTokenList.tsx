
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, TrendingDown, ExternalLink, Activity, Search, Filter, Star, StarOff, RefreshCw, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Token {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  icon: string;
  jupiterUrl?: string;
  priceChange7d?: number;
  liquidity?: number;
  isVerified?: boolean;
  holders?: number;
}

interface EnhancedTokenListProps {
  tokens: Token[];
  selectedToken: string;
  onTokenSelect: (symbol: string) => void;
  showAll?: boolean;
}

const EnhancedTokenList: React.FC<EnhancedTokenListProps> = ({ 
  tokens, 
  selectedToken, 
  onTokenSelect, 
  showAll = false 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'price' | 'change24h' | 'volume24h' | 'marketCap'>('marketCap');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterBy, setFilterBy] = useState<'all' | 'gainers' | 'losers' | 'verified'>('all');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);
  const [priceAlerts, setPriceAlerts] = useState<Map<string, number>>(new Map());
  const { toast } = useToast();

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('tokenFavorites');
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }
  }, []);

  // Save favorites to localStorage
  const toggleFavorite = (symbol: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(symbol)) {
      newFavorites.delete(symbol);
      toast({
        title: "Removed from Favorites",
        description: `${symbol} removed from your watchlist`,
      });
    } else {
      newFavorites.add(symbol);
      toast({
        title: "Added to Favorites",
        description: `${symbol} added to your watchlist`,
      });
    }
    setFavorites(newFavorites);
    localStorage.setItem('tokenFavorites', JSON.stringify(Array.from(newFavorites)));
  };

  // Filter and sort tokens
  const filteredAndSortedTokens = tokens
    .filter(token => {
      const matchesSearch = token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           token.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      switch (filterBy) {
        case 'gainers':
          return matchesSearch && token.change24h > 0;
        case 'losers':
          return matchesSearch && token.change24h < 0;
        case 'verified':
          return matchesSearch && token.isVerified;
        default:
          return matchesSearch;
      }
    })
    .sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
    });

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Simulate API refresh
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Data Refreshed",
        description: "Token prices updated successfully",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Unable to update token data",
        variant: "destructive"
      });
    } finally {
      setRefreshing(false);
    }
  };

  const setPriceAlert = (symbol: string, targetPrice: number) => {
    setPriceAlerts(new Map(priceAlerts.set(symbol, targetPrice)));
    toast({
      title: "Price Alert Set",
      description: `Alert set for ${symbol} at $${targetPrice.toFixed(8)}`,
    });
  };

  return (
    <Card className="bg-white border border-gray-200 shadow-lg">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-black font-urbanist flex items-center gap-2">
              <Activity className="h-6 w-6 text-black" />
              Enhanced Token Trading
            </CardTitle>
            <CardDescription className="text-gray-600 font-urbanist mt-2">
              Advanced token analysis with favorites and alerts
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300 font-urbanist">
              {filteredAndSortedTokens.length} Tokens
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="font-urbanist"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search tokens..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 font-urbanist"
            />
          </div>
          
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="marketCap">Market Cap</SelectItem>
              <SelectItem value="price">Price</SelectItem>
              <SelectItem value="change24h">24h Change</SelectItem>
              <SelectItem value="volume24h">Volume</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterBy} onValueChange={(value: any) => setFilterBy(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tokens</SelectItem>
              <SelectItem value="gainers">Gainers</SelectItem>
              <SelectItem value="losers">Losers</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="font-urbanist"
          >
            <Filter className="h-4 w-4 mr-1" />
            {sortOrder === 'desc' ? 'Desc' : 'Asc'}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {filteredAndSortedTokens.map((token) => (
            <div 
              key={token.symbol}
              className={`p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg ${
                selectedToken === token.symbol 
                  ? 'border-black bg-gray-50 shadow-md transform scale-[1.02]' 
                  : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-400'
              }`}
              onClick={() => onTokenSelect(token.symbol)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg border border-gray-200 overflow-hidden relative">
                    {token.symbol === 'AURA' ? (
                      <img 
                        src="/lovable-uploads/b11e3dd5-3cee-4c90-acbc-63877841c36d.png" 
                        alt="AURA Token"
                        className="w-16 h-16 object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {token.symbol.charAt(0)}
                      </div>
                    )}
                    {token.isVerified && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xl font-bold text-black font-urbanist">{token.symbol}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(token.symbol);
                        }}
                        className="p-1 h-auto"
                      >
                        {favorites.has(token.symbol) ? (
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        ) : (
                          <StarOff className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                      {selectedToken === token.symbol && (
                        <Badge variant="default" className="bg-black text-white">
                          Selected
                        </Badge>
                      )}
                      {priceAlerts.has(token.symbol) && (
                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Alert
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 font-urbanist">{token.name}</p>
                    {token.holders && (
                      <p className="text-xs text-gray-500 font-urbanist">{token.holders.toLocaleString()} holders</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-black font-urbanist">${token.price.toFixed(8)}</p>
                  <div className="flex items-center gap-2 justify-end">
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                      token.change24h > 0 ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {token.change24h > 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                      <span className={`text-sm font-semibold ${
                        token.change24h > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {token.change24h > 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                  {token.priceChange7d && (
                    <p className={`text-xs font-medium ${
                      token.priceChange7d > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      7d: {token.priceChange7d > 0 ? '+' : ''}{token.priceChange7d.toFixed(2)}%
                    </p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-700 font-medium font-urbanist mb-1">Volume 24h</p>
                  <p className="text-sm font-bold text-black font-urbanist">${token.volume24h.toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-700 font-medium font-urbanist mb-1">Market Cap</p>
                  <p className="text-sm font-bold text-black font-urbanist">${token.marketCap.toLocaleString()}</p>
                </div>
                {token.liquidity && (
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-700 font-medium font-urbanist mb-1">Liquidity</p>
                    <p className="text-sm font-bold text-black font-urbanist">${token.liquidity.toLocaleString()}</p>
                  </div>
                )}
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-700 font-medium font-urbanist mb-1">Status</p>
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${token.isVerified ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                    <span className="text-xs font-medium">{token.isVerified ? 'Verified' : 'Unverified'}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 pt-2">
                {token.jupiterUrl && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(token.jupiterUrl, '_blank');
                    }}
                    className="flex items-center gap-2 bg-black text-white border-black hover:bg-gray-800 hover:border-gray-800 shadow-md hover:shadow-lg transition-all duration-300 font-urbanist"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Trade
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    const price = prompt(`Set price alert for ${token.symbol} (current: $${token.price.toFixed(8)}):`);
                    if (price && !isNaN(Number(price))) {
                      setPriceAlert(token.symbol, Number(price));
                    }
                  }}
                  className="font-urbanist"
                >
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Alert
                </Button>
              </div>
            </div>
          ))}
        </div>

        {filteredAndSortedTokens.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 font-urbanist">No tokens match your search criteria</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedTokenList;
