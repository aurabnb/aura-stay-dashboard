'use client'

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  Menu,
  X,
  Copy,
  ExternalLink,
  Search,
  Bell,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CustomWalletButton } from '@/components/wallet/CustomWalletButton';

/* -------------------------------------------------------------------------- */
/*                                   Header                                   */
/* -------------------------------------------------------------------------- */

export function Header() {
  return <HeaderContent />
}

function HeaderContent() {
  /* ----------------------------- dropdown state ---------------------------- */
  const [mobileOpen, setMobileOpen] = useState(false);
  const [financeOpen, setFinanceOpen] = useState(false);
  const [projectOpen, setProjectOpen] = useState(false);

  /* ----------------------------- other state ------------------------------ */
  const [mounted, setMounted] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  // Initialize after mount to avoid SSR issues
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleBuyWithFiat = () => {
    router.push("/buy-fiat");
    setMobileOpen(false);
  };

  /* ------------------------------ misc ----------------------------------- */
  const isActive = (path: string) => pathname === path;
  
  useEffect(() => {
    const close = () => {
      setFinanceOpen(false);
      setProjectOpen(false);
    };
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  /* ----------------------------------------------------------------------- */
  /*                                RENDER                                   */
  /* ----------------------------------------------------------------------- */
  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* ---------------------------- brand ----------------------------- */}
          <Link href="/">
            <img
              src="/lovable-uploads/99705421-813e-4d11-89a5-90bffaa2147a.png"
              alt="AURA logo"
              className="h-8 w-auto"
            />
          </Link>

          {/* ---------------------------- nav links ------------------------- */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors ${
                isActive("/")
                  ? "text-black"
                  : "text-gray-600 hover:text-black"
              }`}
            >
              Home
            </Link>

            {/* finance dropdown */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFinanceOpen(!financeOpen);
                }}
                className="flex items-center text-sm font-medium text-gray-600 hover:text-black transition-colors"
              >
                Finance
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              {financeOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2">
                  <Link
                    href="/dashboard"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Treasury Dashboard
                  </Link>
                  <Link
                    href="/user-dashboard#staking"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Staking
                  </Link>
                  <Link
                    href="/user-dashboard"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    📊 User Dashboard
                  </Link>
                  <Link
                    href="/analytics"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Analytics
                  </Link>
                  <Link
                    href="/burn-tracking"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Burn Tracking
                  </Link>
                  <Link
                    href="/user-dashboard#expenses"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Expense Tracker
                  </Link>
                  <hr className="border-gray-200 my-2" />
                  <Link
                    href="/admin"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-semibold"
                  >
                    🔧 Admin Dashboard
                  </Link>
                </div>
              )}
            </div>

            {/* Projects dropdown */}
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                className={`text-sm font-medium transition-colors flex items-center gap-1 ${
                  projectOpen ? "text-black" : "text-gray-600 hover:text-black"
                }`}
                onClick={() => setProjectOpen(!projectOpen)}
              >
                Projects
                <ChevronDown className="h-4 w-4" />
              </button>
              {projectOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
                  <Link
                    href="/roadmap"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setProjectOpen(false)}
                  >
                    Roadmap
                  </Link>
                  <Link
                    href="/volcano-house"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setProjectOpen(false)}
                  >
                    Volcano House
                  </Link>
                  <Link
                    href="/properties"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setProjectOpen(false)}
                  >
                    All Properties
                  </Link>
                </div>
              )}
            </div>

            <Link
              href="/blog"
              className={`text-sm font-medium transition-colors ${
                isActive("/blog")
                  ? "text-black"
                  : "text-gray-600 hover:text-black"
              }`}
            >
              Blog
            </Link>
            <Link
              href="/contact"
              className={`text-sm font-medium transition-colors ${
                isActive("/contact")
                  ? "text-black"
                  : "text-gray-600 hover:text-black"
              }`}
            >
              Contact
            </Link>
          </nav>

          {/* -------------------------- actions ----------------------------- */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Global Search - temporarily disabled for SSG build */}

            <WalletSection />

            {/* Notification Test Button temporarily disabled for SSG */}

            <button
              onClick={handleBuyWithFiat}
              className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
            >
              Buy with Fiat
            </button>
            <Link href="/dashboard/trading">
              <button className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-full text-sm font-medium transition-colors">
                Buy $AURA
              </button>
            </Link>
          </div>

          {/* ------------------------ mobile toggle ------------------------- */}
          <button
            className="lg:hidden p-2 -mr-2"
            onClick={(e) => {
              e.stopPropagation();
              setMobileOpen(!mobileOpen);
            }}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* ------------------------- mobile panel ------------------------- */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white/95 backdrop-blur-sm">
            <div className="px-6 py-4 space-y-4">
              <Link
                href="/"
                className="block text-sm font-medium text-gray-900"
                onClick={() => setMobileOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/dashboard"
                className="block text-sm font-medium text-gray-900"
                onClick={() => setMobileOpen(false)}
              >
                Treasury Dashboard
              </Link>
              <Link
                href="/user-dashboard#staking"
                className="block text-sm font-medium text-gray-900"
                onClick={() => setMobileOpen(false)}
              >
                Staking
              </Link>
              <Link
                href="/user-dashboard"
                className="block text-sm font-medium text-gray-900"
                onClick={() => setMobileOpen(false)}
              >
                📊 User Dashboard
              </Link>
              <Link
                href="/analytics"
                className="block text-sm font-medium text-gray-900"
                onClick={() => setMobileOpen(false)}
              >
                Analytics
              </Link>
              <Link
                href="/volcano-house"
                className="block text-sm font-medium text-gray-900"
                onClick={() => setMobileOpen(false)}
              >
                Volcano House
              </Link>
              <Link
                href="/properties"
                className="block text-sm font-medium text-gray-900"
                onClick={() => setMobileOpen(false)}
              >
                Properties
              </Link>
              <Link
                href="/blog"
                className="block text-sm font-medium text-gray-900"
                onClick={() => setMobileOpen(false)}
              >
                Blog
              </Link>
              <Link
                href="/contact"
                className="block text-sm font-medium text-gray-900"
                onClick={() => setMobileOpen(false)}
              >
                Contact
              </Link>
              <hr className="border-gray-200 my-2" />
              <Link
                href="/admin"
                className="block text-sm font-medium text-orange-600"
                onClick={() => setMobileOpen(false)}
              >
                🔧 Admin Dashboard
              </Link>

              <div className="pt-4 border-t border-gray-200 space-y-3">
                <WalletSection />

                <button
                  onClick={handleBuyWithFiat}
                  className="bg-gray-700 hover:bg-gray-800 text-white w-full py-3 rounded-full text-sm font-medium"
                >
                  Buy with Fiat
                </button>
                <Link href="/dashboard/trading">
                  <button className="bg-black hover:bg-gray-800 text-white w-full py-3 rounded-full text-sm font-medium">
                    Buy $AURA
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/*                              wallet section                                */
/* -------------------------------------------------------------------------- */

// Simple client-only wallet component
function WalletSection({ mobile = false }: { mobile?: boolean }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return placeholder during SSR
    return (
      <button 
        className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-full text-sm font-medium"
        disabled
      >
        Connect Wallet
      </button>
    );
  }

  return <CustomWalletButton mobile={mobile} />;
}
