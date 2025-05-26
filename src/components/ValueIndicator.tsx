
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, TrendingUp } from 'lucide-react';

interface ValueData {
  totalMarketCap: number;
  volatileAssets: number;
  hardAssets: number;
  speculativeInterest: number;
  totalValue: number;
  lastUpdated: string;
}

const ValueIndicator = () => {
  const [valueData, setValueData] = useState<ValueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call - in real implementation, this would call your Supabase edge function
    const fetchValueData = async () => {
      try {
        setLoading(true);
        // Simulated data based on your screenshots
        const mockData: ValueData = {
          totalMarketCap: 0,
          volatileAssets: 0,
          hardAssets: 0,
          speculativeInterest: 0,
          totalValue: 0,
          lastUpdated: new Date().toISOString()
        };
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setValueData(mockData);
        setError("Error loading core values: Supabase anon key is not configured. Please set NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment variables.");
      } catch (err) {
        setError("Failed to fetch value data");
      } finally {
        setLoading(false);
      }
    };

    fetchValueData();
  }, []);

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Aura Value Indicator
          </CardTitle>
          <CardDescription>
            Tracking of Aura Foundation's treasury and market value.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Aura Value Indicator
        </CardTitle>
        <CardDescription>
          Tracking of Aura Foundation's treasury and market value.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Asset Category</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Value (USD)</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="py-3 px-4 text-gray-700">Total Market Cap</td>
                <td className="py-3 px-4 text-right text-gray-700">$ N/A</td>
                <td className="py-3 px-4 text-right text-red-500">Error</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-gray-700">Volatile Assets</td>
                <td className="py-3 px-4 text-right text-gray-700">$ N/A</td>
                <td className="py-3 px-4 text-right text-red-500">Error</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-gray-700">Hard Assets</td>
                <td className="py-3 px-4 text-right text-gray-700">$ N/A</td>
                <td className="py-3 px-4 text-right text-red-500">Error</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-gray-700">Speculative Interest</td>
                <td className="py-3 px-4 text-right text-gray-700">$ 0.00</td>
                <td className="py-3 px-4 text-right text-red-500">Error</td>
              </tr>
              <tr className="border-t-2 border-gray-300 bg-gray-50">
                <td className="py-3 px-4 font-semibold text-gray-900">Total Value</td>
                <td className="py-3 px-4 text-right font-semibold text-gray-900">$ 0.00</td>
                <td className="py-3 px-4 text-right text-red-500">Error</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="text-sm text-gray-500 border-t pt-4">
          <p>Could not load live values. Displaying default or last known values.</p>
          <p className="mt-1">
            <strong>Note:</strong> "Speculative Interest" = Total Market Cap - (Volatile Assets + Hard Assets). 
            "Total Value" = Speculative Interest + Volatile Assets + Hard Assets.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ValueIndicator;
