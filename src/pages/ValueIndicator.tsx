
import React from 'react';
import Header from '../components/Header';
import ValueIndicator from '../components/ValueIndicator';
import MonitoredWallets from '../components/MonitoredWallets';
import ExpenseTracker from '../components/ExpenseTracker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ValueIndicatorPage = () => {
  return (
    <div className="min-h-screen bg-white font-urbanist">
      <Header />
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="space-y-12">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-6 font-urbanist leading-tight">
              Value Indicator Dashboard
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-urbanist">
              Real-time tracking of Aura Foundation's treasury, market value metrics, and expenses
            </p>
            
            {/* Aurora Image */}
            <div className="mb-12 mt-8">
              <img 
                src="/lovable-uploads/f0fefd83-c00f-4677-bdd0-327b97ff0cb1.png" 
                alt="Futuristic eco-pods under northern lights with cherry blossoms"
                className="w-full max-w-4xl mx-auto rounded-2xl shadow-2xl"
              />
            </div>
          </div>
          
          <Tabs defaultValue="treasury" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="treasury">Treasury Overview</TabsTrigger>
              <TabsTrigger value="wallets">Monitored Wallets</TabsTrigger>
              <TabsTrigger value="expenses">Expense Tracker</TabsTrigger>
            </TabsList>
            
            <TabsContent value="treasury" className="space-y-12">
              <ValueIndicator />
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
