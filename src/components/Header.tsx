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
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWallet } from '@solana/wallet-adapter-react';
import { CustomWalletButton } from '@/components/wallet/CustomWalletButton';

/* -------------------------------------------------------------------------- */
/*                                   Header                                   */
/* -------------------------------------------------------------------------- */
export function Header() {
  /* ----------------------------- dropdown state ---------------------------- */
  const [mobileOpen, setMobileOpen] = useState(false);
  const [financeOpen, setFinanceOpen] = useState(false);
  const [projectOpen, setProjectOpen] = useState(false);

  /* ----------------------------- wallet state ------------------------------ */
  const { connected, publicKey, disconnect } = useWallet();

  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  /* ----------------------- wallet connect helpers ------------------------- */
  const disconnectWallet = async () => {
    try {
      await disconnect();
      toast({ title: "Wallet Disconnected" });
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  };

  /* --------------------------- quick actions ---------------------------- */
  const copyAddress = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toString());
      toast({ title: "Address Copied! 📋" });
    }
  };
  
  const openInExplorer = () => {
    if (publicKey) {
      window.open(
        `https://explorer.solana.com/address/${publicKey.toString()}`,
        "_blank"
      );
    }
  };

  const handleBuyWithFiat = () => {
    if (!connected) {
      toast({
        title: "Wallet Required",
        description: "Connect a wallet first",
        variant: "destructive",
      });
      return;
    }
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
          <Link href="/" className="flex items-center space-x-3">
            <img
              src="/lovable-uploads/99705421-813e-4d11-89a5-90bffaa2147a.png"
              alt="AURA logo"
              className="h-8 w-auto"
            />
            <span className="text-xl font-bold text-gray-900">AURA</span>
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
                    href="/expense-tracker"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Expense Tracker
                  </Link>
                </div>
              )}
            </div>

            {/* projects dropdown */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setProjectOpen(!projectOpen);
                }}
                className="flex items-center text-sm font-medium text-gray-600 hover:text-black transition-colors"
              >
                Projects
                <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              {projectOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2">
                  <Link
                    href="/volcano-house"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Volcano House
                  </Link>
                  <Link
                    href="/properties"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    All Properties
                  </Link>
                  <Link
                    href="/investment-hub"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Investment Hub
                  </Link>
                  <Link
                    href="/roadmap"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Roadmap
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
            <WalletSection
              connected={connected}
              publicKey={publicKey}
              copyAddress={copyAddress}
              openInExplorer={openInExplorer}
              disconnectWallet={disconnectWallet}
            />

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

              <div className="pt-4 border-t border-gray-200 space-y-3">
                <WalletSection
                  mobile
                  connected={connected}
                  publicKey={publicKey}
                  copyAddress={copyAddress}
                  openInExplorer={openInExplorer}
                  disconnectWallet={disconnectWallet}
                />

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

interface WalletSectionProps {
  mobile?: boolean;
  connected: boolean;
  publicKey: any;
  copyAddress: () => void;
  openInExplorer: () => void;
  disconnectWallet: () => void;
}

const WalletSection: React.FC<WalletSectionProps> = ({
  mobile,
  connected,
  publicKey,
  copyAddress,
  openInExplorer,
  disconnectWallet,
}) => {
  if (!connected) {
    return (
      <CustomWalletButton mobile={mobile} />
    );
  }

  const walletAddress = publicKey?.toString() || '';

  /* --- connected state --- */
  return (
    <div className={mobile ? "space-y-3" : "flex items-center space-x-2"}>
      <div className="flex items-center space-x-2 bg-gray-100 rounded-full px-4 py-2">
        <div className="w-3 h-3 rounded-full bg-green-500" />
        <span className="text-sm font-medium">
          {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
        </span>
        <button
          onClick={copyAddress}
          className="text-gray-500 hover:text-gray-700 transition-colors"
          title="Copy address"
        >
          <Copy className="h-3 w-3" />
        </button>
        <button
          onClick={openInExplorer}
          className="text-gray-500 hover:text-gray-700 transition-colors"
          title="View in explorer"
        >
          <ExternalLink className="h-3 w-3" />
        </button>
      </div>
      <button
        onClick={disconnectWallet}
        className={`bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
          mobile ? "w-full" : ""
        }`}
      >
        Disconnect
      </button>
    </div>
  );
};
