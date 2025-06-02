import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ErrorBoundary from "./components/ErrorBoundary";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import EnhancedIndex from "./pages/EnhancedIndex";
import ValueIndicatorPage from "./pages/ValueIndicator";
import MultisigPage from "./pages/Multisig";
import CommunityBoardPage from "./pages/CommunityBoard";
import StakeToEarnPage from "./pages/StakeToEarn";
import GovernancePage from "./pages/Governance";
import TradingPage from "./pages/Trading";
import EnhancedTradingPage from "./pages/EnhancedTrading";
import InvestmentHubPage from "./pages/InvestmentHub";
import PropertiesPage from "./pages/Properties";
import SamsaraPage from "./pages/Samsara";
import AirscapePage from "./pages/Airscape";
import BookingPage from "./pages/Booking";
import LocalVendorsPage from "./pages/LocalVendors";
import Roadmap from "./pages/Roadmap";
import Transparency from "./pages/Transparency";
import NotFound from "./pages/NotFound";
import FiatPurchase from "./pages/FiatPurchase";
import TestingPage from "./pages/Testing";
import VolcanoHousePage from "./pages/VolcanoHouse";
import BurnRedistributionPage from "./pages/BurnRedistribution";
import WalletHubPage from "./pages/WalletHub";
import AnalyticsPage from "./pages/Analytics";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary showDetails={process.env.NODE_ENV === 'development'}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/enhanced" element={<EnhancedIndex />} />
            <Route path="/roadmap" element={<Roadmap />} />
            <Route path="/transparency" element={<Transparency />} />
            <Route path="/value-indicator" element={<ValueIndicatorPage />} />
            <Route path="/multisig" element={<MultisigPage />} />
            <Route path="/community-board" element={<CommunityBoardPage />} />
            <Route path="/stake-to-earn" element={<StakeToEarnPage />} />
            <Route path="/governance" element={<GovernancePage />} />
            <Route path="/trading" element={<TradingPage />} />
            <Route path="/enhanced-trading" element={<EnhancedTradingPage />} />
            <Route path="/testing" element={<TestingPage />} />
            <Route path="/buy-fiat" element={<FiatPurchase />} />
            <Route path="/investment-hub" element={<InvestmentHubPage />} />
            <Route path="/properties" element={<PropertiesPage />} />
            <Route path="/samsara" element={<SamsaraPage />} />
            <Route path="/airscape" element={<AirscapePage />} />
            <Route path="/booking" element={<BookingPage />} />
            <Route path="/local-vendors" element={<LocalVendorsPage />} />
            <Route path="/volcano-house" element={<VolcanoHousePage />} />
            <Route path="/burn-redistribution" element={<BurnRedistributionPage />} />
            <Route path="/wallet-hub" element={<WalletHubPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/multisig" element={<MultisigPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
