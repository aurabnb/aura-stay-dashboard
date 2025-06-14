
import React from 'react';
import Header from '../components/Header';
import MonitoredWallets from '../components/MonitoredWallets';
import ExpenseTracker from '../components/ExpenseTracker';
import LiveTreasuryProgress from '../components/LiveTreasuryProgress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ValueIndicatorPage = () => {
  return (
    <div className="min-h-screen bg-white font-urbanist">
      <Header />
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="space-y-12">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-6 font-urbanist leading-tight">
              Live Treasury Dashboard
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-urbanist">
              Real-time tracking of Aura Foundation's treasury via Shyft API, market value metrics, and expenses
            </p>
          </div>
          
          <Tabs defaultValue="treasury" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="treasury">Live Treasury</TabsTrigger>
              <TabsTrigger value="wallets">Monitored Wallets</TabsTrigger>
              <TabsTrigger value="expenses">Expense Tracker</TabsTrigger>
            </TabsList>
            
            <TabsContent value="treasury" className="space-y-12">
              <LiveTreasuryProgress />
            </TabsContent>
            
            <TabsContent value="wallets" className="space-y-12">
              <MonitoredWallets />
            </TabsContent>
            
            <TabsContent value="expenses" className="space-y-12">
              <ExpenseTracker />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default ValueIndicatorPage;
