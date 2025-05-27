
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, RefreshCw, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TokenPrice {
  id: string;
  mintSymbol: string;
  vsToken: string;
  vsTokenSymbol: string;
  price: number;
}

const JupiterPriceAPI: React.FC = () => {
  const [prices, setPrices] = useState<TokenPrice[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { toast } = useToast();

  const AURA_TOKEN = '3YmNY3Giya7AKNNQbqo35HPuqTrrcgT9KADQBM2hDWNe';

  const fetchPrices = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://price.jup.ag/v6/price?ids=${AURA_TOKEN}&vsToken=So11111111111111111111111111111111111111112`
      );
      
      const data = await response.json();
      
      if (data.data && Object.keys(data.data).length > 0) {
        const priceData = Object.entries(data.data).map(([key, value]: [string, any]) => ({
          id: key,
          mintSymbol: value.mintSymbol || 'AURA',
          vsToken: value.vsToken,
          vsTokenSymbol: value.vsTokenSymbol || 'SOL',
          price: value.price
        }));
        
        setPrices(priceData);
        setLastUpdated(new Date());
        
        toast({
          title: "Prices Updated",
          description: "Latest prices fetched from Jupiter",
        });
      } else {
        throw new Error('No price data received');
      }
    } catch (error) {
      console.error('Error fetching Jupiter prices:', error);
      toast({
        title: "Price Fetch Error",
        description: "Failed to get latest prices from Jupiter",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="bg-white border border-gray-200 shadow-lg">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-black font-urbanist flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-green-600" />
              Live Prices
            </CardTitle>
            <p className="text-gray-600 font-urbanist mt-2">
              Real-time prices from Jupiter API
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 font-urbanist">
              Live Data
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchPrices}
              disabled={loading}
              className="font-urbanist"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
        {lastUpdated && (
          <p className="text-sm text-gray-500 font-urbanist mt-2">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {prices.length > 0 ? (
            prices.map((priceData) => (
              <div 
                key={priceData.id}
                className="p-6 border-2 border-gray-200 rounded-xl bg-gradient-to-r from-white to-gray-50 hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg border border-gray-200">
                      <img 
                        src="/lovable-uploads/a85f448b-cd5c-46a7-a2b5-7bdabd161e26.png" 
                        alt="AURA Token"
                        className="w-8 h-8 object-contain"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xl font-bold text-black font-urbanist">
                          {priceData.mintSymbol} / {priceData.vsTokenSymbol}
                        </p>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          Jupiter
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 font-urbanist">Live Price Feed</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-black font-urbanist">
                      {priceData.price.toFixed(8)} {priceData.vsTokenSymbol}
                    </p>
                    <div className="flex items-center gap-2 justify-end mt-1">
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-100">
                        <TrendingUp className="h-4 w-4 text-green-700" />
                        <span className="text-sm font-semibold text-green-700">Live</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(`https://jup.ag/swap/${priceData.vsTokenSymbol}-${priceData.mintSymbol}`, '_blank')}
                    className="flex items-center gap-2 bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:border-blue-700 shadow-md hover:shadow-lg transition-all duration-300 font-urbanist"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Trade on Jupiter
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 font-urbanist">
                {loading ? 'Loading prices...' : 'No price data available'}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default JupiterPriceAPI;
