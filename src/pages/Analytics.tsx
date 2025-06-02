import React, { useEffect } from 'react';
import Header from '../components/Header';
import AdvancedAnalytics from '../components/AdvancedAnalytics';
import { usePerformanceTracking } from '@/services/performanceMonitor';

const AnalyticsPage = () => {
  const { trackPageView } = usePerformanceTracking();

  useEffect(() => {
    trackPageView('Analytics');
  }, [trackPageView]);

  return (
    <div className="min-h-screen bg-white font-urbanist">
      <Header />
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="space-y-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-6 font-urbanist leading-tight">
              Advanced Analytics
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-urbanist leading-relaxed">
              Deep insights into the AuraBNB ecosystem with real-time data, predictive models, and comprehensive portfolio analytics
            </p>
          </div>
          
          <AdvancedAnalytics />
        </div>
      </main>
    </div>
  );
};

export default AnalyticsPage; 