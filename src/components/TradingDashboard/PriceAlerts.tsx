
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Bell, Plus, Trash2, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  currentPrice: number;
  condition: 'above' | 'below';
  isActive: boolean;
  createdAt: Date;
  triggeredAt?: Date;
}

const PriceAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [newAlert, setNewAlert] = useState({
    symbol: 'AURA',
    targetPrice: '',
    condition: 'above' as 'above' | 'below'
  });
  const [currentAuraPrice] = useState(0.000121); // This would come from real API
  const { toast } = useToast();

  // Mock alerts for demo
  useEffect(() => {
    const mockAlerts: PriceAlert[] = [
      {
        id: '1',
        symbol: 'AURA',
        targetPrice: 0.00015,
        currentPrice: 0.000121,
        condition: 'above',
        isActive: true,
        createdAt: new Date(Date.now() - 86400000), // 1 day ago
      },
      {
        id: '2',
        symbol: 'AURA',
        targetPrice: 0.0001,
        currentPrice: 0.000121,
        condition: 'below',
        isActive: true,
        createdAt: new Date(Date.now() - 3600000), // 1 hour ago
      },
    ];
    setAlerts(mockAlerts);
  }, []);

  // Check alerts (in real app, this would be done server-side)
  useEffect(() => {
    const checkAlerts = () => {
      setAlerts(prevAlerts => 
        prevAlerts.map(alert => {
          if (!alert.isActive || alert.triggeredAt) return alert;
          
          const shouldTrigger = 
            (alert.condition === 'above' && currentAuraPrice >= alert.targetPrice) ||
            (alert.condition === 'below' && currentAuraPrice <= alert.targetPrice);
          
          if (shouldTrigger) {
            toast({
              title: "Price Alert Triggered! 🚨",
              description: `AURA is now ${alert.condition} $${alert.targetPrice.toFixed(8)}`,
            });
            
            return {
              ...alert,
              triggeredAt: new Date(),
              isActive: false
            };
          }
          
          return alert;
        })
      );
    };

    const interval = setInterval(checkAlerts, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [currentAuraPrice, toast]);

  const handleCreateAlert = () => {
    if (!newAlert.targetPrice) {
      toast({
        title: "Error",
        description: "Please enter a target price",
        variant: "destructive"
      });
      return;
    }

    const alert: PriceAlert = {
      id: Date.now().toString(),
      symbol: newAlert.symbol,
      targetPrice: parseFloat(newAlert.targetPrice),
      currentPrice: currentAuraPrice,
      condition: newAlert.condition,
      isActive: true,
      createdAt: new Date()
    };

    setAlerts(prev => [alert, ...prev]);
    setNewAlert({ symbol: 'AURA', targetPrice: '', condition: 'above' });
    
    toast({
      title: "Alert Created! ✅",
      description: `You'll be notified when AURA goes ${newAlert.condition} $${newAlert.targetPrice}`,
    });
  };

  const handleDeleteAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
    toast({
      title: "Alert Deleted",
      description: "Price alert has been removed",
    });
  };

  const toggleAlert = (id: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === id 
          ? { ...alert, isActive: !alert.isActive }
          : alert
      )
    );
  };

  return (
    <Card className="bg-white border border-gray-200 shadow-lg">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-black font-urbanist flex items-center gap-2">
              <Bell className="h-6 w-6 text-orange-600" />
              Price Alerts
            </CardTitle>
            <CardDescription className="text-gray-600 font-urbanist mt-2">
              Get notified when AURA reaches your target prices
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300 font-urbanist">
            {alerts.filter(a => a.isActive).length} Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Create New Alert */}
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-6 rounded-xl border border-orange-200">
          <h3 className="text-lg font-semibold text-gray-900 font-urbanist mb-4 flex items-center gap-2">
            <Plus className="h-5 w-5 text-orange-600" />
            Create New Alert
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 font-urbanist mb-2">Token</label>
              <select 
                value={newAlert.symbol}
                onChange={(e) => setNewAlert(prev => ({ ...prev, symbol: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-lg bg-white"
              >
                <option value="AURA">AURA</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 font-urbanist mb-2">Condition</label>
              <select 
                value={newAlert.condition}
                onChange={(e) => setNewAlert(prev => ({ ...prev, condition: e.target.value as 'above' | 'below' }))}
                className="w-full p-2 border border-gray-300 rounded-lg bg-white"
              >
                <option value="above">Above</option>
                <option value="below">Below</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 font-urbanist mb-2">Target Price ($)</label>
              <Input
                type="number"
                step="0.00000001"
                placeholder="0.00015"
                value={newAlert.targetPrice}
                onChange={(e) => setNewAlert(prev => ({ ...prev, targetPrice: e.target.value }))}
                className="border-gray-300"
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleCreateAlert}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-urbanist"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Alert
              </Button>
            </div>
          </div>
          <div className="mt-3 text-sm text-gray-600 font-urbanist">
            Current AURA Price: <span className="font-semibold">${currentAuraPrice.toFixed(8)}</span>
          </div>
        </div>

        {/* Alerts List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 font-urbanist">Your Alerts ({alerts.length})</h3>
          
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-gray-500 font-urbanist">
              <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No price alerts yet. Create your first one above!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className={`bg-white border rounded-lg p-4 transition-all ${
                    alert.triggeredAt 
                      ? 'border-green-200 bg-green-50' 
                      : alert.isActive 
                        ? 'border-gray-200 hover:shadow-md' 
                        : 'border-gray-100 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        alert.condition === 'above' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {alert.condition === 'above' ? (
                          <TrendingUp className="h-5 w-5 text-green-600" />
                        ) : (
                          <TrendingDown className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 font-urbanist">
                          {alert.symbol} {alert.condition} ${alert.targetPrice.toFixed(8)}
                        </div>
                        <div className="text-sm text-gray-600 font-urbanist">
                          Created {alert.createdAt.toLocaleDateString()}
                          {alert.triggeredAt && (
                            <span className="ml-2 text-green-600 font-medium">
                              • Triggered {alert.triggeredAt.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {alert.triggeredAt ? (
                        <Badge className="bg-green-100 text-green-700 border-green-200">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Triggered
                        </Badge>
                      ) : (
                        <Badge 
                          variant={alert.isActive ? "default" : "outline"}
                          className={alert.isActive ? "bg-orange-600" : ""}
                        >
                          {alert.isActive ? 'Active' : 'Paused'}
                        </Badge>
                      )}
                      
                      {!alert.triggeredAt && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleAlert(alert.id)}
                          className="text-gray-600 hover:text-black"
                        >
                          {alert.isActive ? 'Pause' : 'Resume'}
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAlert(alert.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Alert Info */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-start gap-3">
            <Bell className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900 font-urbanist">How Price Alerts Work</p>
              <p className="text-sm text-blue-700 font-urbanist mt-1">
                Alerts check prices every 10 seconds. You'll receive browser notifications when your target prices are reached. 
                Make sure to enable notifications for this site!
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PriceAlerts;
