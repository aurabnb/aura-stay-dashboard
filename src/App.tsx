
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Inter, Poppins } from "next/font/google";
import { ClientProviders } from "@/components/providers/ClientProviders";
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics';

// Import your existing pages
import HomePage from '@/app/page'
import DashboardPage from '@/app/dashboard/page'
import StakingPage from '@/app/staking/page'
import PropertiesPage from '@/app/properties/page'
import RoadmapPage from '@/app/roadmap/page'

function App() {
  return (
    <ErrorBoundary>
      <ClientProviders>
        <GoogleAnalytics />
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/staking" element={<StakingPage />} />
            <Route path="/properties" element={<PropertiesPage />} />
            <Route path="/roadmap" element={<RoadmapPage />} />
            {/* Add more routes as needed */}
          </Routes>
        </Router>
      </ClientProviders>
    </ErrorBoundary>
  )
}

export default App
