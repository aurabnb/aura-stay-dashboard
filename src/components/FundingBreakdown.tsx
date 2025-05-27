
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Building, DollarSign, TrendingUp, Settings } from 'lucide-react';

const FundingBreakdown = () => {
  const lpFundsData = [
    { name: 'Project Funding', value: 80, color: '#10B981', icon: Building },
    { name: 'Marketing', value: 10, color: '#3B82F6', icon: TrendingUp },
    { name: 'Operations', value: 5, color: '#F59E0B', icon: Settings },
    { name: 'Business Costs', value: 5, color: '#EF4444', icon: DollarSign }
  ];

  const revenueData = [
    { name: 'To $AURA Holders', value: 75, color: '#10B981' },
    { name: 'Maintenance & Taxes', value: 10, color: '#6B7280' },
    { name: 'Marketing', value: 10, color: '#3B82F6' },
    { name: 'Operations', value: 5, color: '#F59E0B' }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>LP Funds Distribution</CardTitle>
          <CardDescription>
            How LP rewards from trading fuel every aspect of the AURA ecosystem
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              {lpFundsData.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" style={{ color: item.color }} />
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <span className="text-sm font-semibold">{item.value}%</span>
                    </div>
                    <Progress value={item.value} className="h-2" />
                    <p className="text-xs text-gray-600">
                      {item.name === 'Project Funding' && 'Buying land, building unique stays'}
                      {item.name === 'Marketing' && 'Growth initiatives & community building'}
                      {item.name === 'Operations' && 'For upkeep and administrative tasks'}
                      {item.name === 'Business Costs' && 'Infrastructure and organizational maintenance'}
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={lpFundsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {lpFundsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Distribution</CardTitle>
          <CardDescription>
            How returns from properties flow back to $AURA holders transparently
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              {revenueData.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-sm font-semibold">{item.value}%</span>
                  </div>
                  <Progress value={item.value} className="h-2" />
                  <p className="text-xs text-gray-600">
                    {item.name === 'To $AURA Holders' && 'Real on-chain rewards - your tokens mean real ownership'}
                    {item.name === 'Maintenance & Taxes' && 'Keep properties pristine and regulatory compliance'}
                    {item.name === 'Marketing' && 'Spreading the word and expanding the $AURA movement'}
                    {item.name === 'Operations' && 'Smooth daily management and seamless guest service'}
                  </p>
                </div>
              ))}
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenueData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {revenueData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FundingBreakdown;
