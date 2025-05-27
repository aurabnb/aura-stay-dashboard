
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ValueIndicatorPage from "./pages/ValueIndicator";
import MultisigPage from "./pages/Multisig";
import CommunityBoardPage from "./pages/CommunityBoard";
import StakeToEarnPage from "./pages/StakeToEarn";
import GovernancePage from "./pages/Governance";
import TradingPage from "./pages/Trading";
import InvestmentHubPage from "./pages/InvestmentHub";
import PropertiesPage from "./pages/Properties";
import SamsaraPage from "./pages/Samsara";
import AirscapePage from "./pages/Airscape";
import BookingPage from "./pages/Booking";
import LocalVendorsPage from "./pages/LocalVendors";
import Vision from "./pages/Vision";
import Roadmap from "./pages/Roadmap";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/vision" element={<Vision />} />
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="/value-indicator" element={<ValueIndicatorPage />} />
          <Route path="/multisig" element={<MultisigPage />} />
          <Route path="/community-board" element={<CommunityBoardPage />} />
          <Route path="/stake-to-earn" element={<StakeToEarnPage />} />
          <Route path="/governance" element={<GovernancePage />} />
          <Route path="/trading" element={<TradingPage />} />
          <Route path="/investment-hub" element={<InvestmentHubPage />} />
          <Route path="/properties" element={<PropertiesPage />} />
          <Route path="/samsara" element={<SamsaraPage />} />
          <Route path="/airscape" element={<AirscapePage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/local-vendors" element={<LocalVendorsPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
