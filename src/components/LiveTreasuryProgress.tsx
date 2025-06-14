
import React from "react";
import { useShyftTreasuryData } from "@/hooks/useShyftTreasuryData";
import TreasuryProgress from "@/components/TreasuryProgress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, RefreshCw } from "lucide-react";

const LiveTreasuryProgress: React.FC = () => {
  const { data: treasury, loading, error, lastRefresh, fetchData, isLiveData } = useShyftTreasuryData();

  if (loading) {
    return (
      <Card className="w-full border-none shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            Loading Live Treasury Data...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full border-none shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Zap className="h-5 w-5" />
            Live Data Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-600 p-4 bg-red-50 rounded-lg">
            <p className="font-medium">Failed to load live treasury data</p>
            <p className="text-sm mt-1">{error}</p>
            <button
              onClick={fetchData}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Live Data Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Zap className="h-3 w-3 mr-1" />
            Live Data via Shyft API
          </Badge>
          {lastRefresh && (
            <span className="text-sm text-gray-500">
              Updated: {lastRefresh.toLocaleTimeString()}
            </span>
          )}
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
        >
          <RefreshCw className="h-3 w-3" />
          Refresh
        </button>
      </div>

      {/* Treasury Progress Component with Live Data */}
      <TreasuryProgress treasury={treasury} />
    </div>
  );
};

export default LiveTreasuryProgress;
