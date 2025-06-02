import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  Menu,
  X,
  Wallet,
  Copy,
  ExternalLink,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/* -------------------------------------------------------------------------- */
/*                              Wallet helpers                                */
/* -------------------------------------------------------------------------- */
interface WalletAdapter {
  connect: () => Promise<{ publicKey: { toString: () => string } }>;
  disconnect?: () => Promise<void>;
  on?: (event: string, handler: () => void) => void;
  publicKey?: { toString: () => string } | null;
}

/* -------------------------------------------------------------------------- */
/*                                   Header                                   */
/* -------------------------------------------------------------------------- */
const Header: React.FC = () => {
  /* ----------------------------- dropdown state ---------------------------- */
  const [mobileOpen, setMobileOpen] = useState(false);
  const [walletOptsOpen, setWalletOptsOpen] = useState(false);
  const [financeOpen, setFinanceOpen] = useState(false);
  const [projectOpen, setProjectOpen] = useState(false);

  /* ----------------------------- wallet state ------------------------------ */
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [connectedWallet, setConnectedWallet] = useState<
    "phantom" | "solflare" | null
  >(null);
  const [walletAdapter, setWalletAdapter] = useState<WalletAdapter | null>(
    null
  );

  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  /* ------------------------ check existing wallet ------------------------- */
  useEffect(() => {
    const phantom = (window as any).phantom?.solana;
    if (phantom?.isConnected && phantom?.publicKey) {
      initWallet("phantom", phantom.publicKey.toString(), phantom);
      return;
    }
    const solflare = (window as any).solflare;
    if (solflare?.isConnected && solflare?.publicKey) {
      initWallet("solflare", solflare.publicKey.toString(), solflare);
    }
  }, []);

  /* ----------------------- wallet connect helpers ------------------------- */
  const initWallet = (
    type: "phantom" | "solflare",
    address: string,
    adapter: WalletAdapter
  ) => {
    setIsConnected(true);
    setWalletAddress(address);
    setConnectedWallet(type);
    setWalletAdapter(adapter);
  };

  const connectWallet = async (type: "phantom" | "solflare") => {
    const provider: WalletAdapter | null =
      type === "phantom"
        ? (window as any).phantom?.solana
        : (window as any).solflare;

    if (!provider) {
      toast({
        title: `${type === "phantom" ? "Phantom" : "Solflare"} Wallet Missing`,
        description: "Install the wallet extension to continue.",
      });
      window.open(
        type === "phantom" ? "https://phantom.app/" : "https://solflare.com/",
        "_blank"
      );
      return;
    }

    try {
      const { publicKey } = await provider.connect();
      initWallet(type, publicKey.toString(), provider);
      provider.on?.("disconnect", disconnectWallet);
      setWalletOptsOpen(false);
      setMobileOpen(false);
      toast({ title: "Wallet Connected!", description: `Connected to ${type}` });
    } catch (err: any) {
      toast({
        title: "Connection Failed",
        description:
          err?.message?.includes("User rejected")
            ? "Cancelled by user"
            : "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const disconnectWallet = async () => {
    try {
      await walletAdapter?.disconnect?.();
    } finally {
      setIsConnected(false);
      setWalletAddress("");
      setConnectedWallet(null);
      setWalletAdapter(null);
      toast({ title: "Wallet Disconnected" });
    }
  };

  /* --------------------------- quick actions ---------------------------- */
  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    toast({ title: "Address Copied! 📋" });
  };
  const openInExplorer = () =>
    window.open(
      `https://explorer.solana.com/address/${walletAddress}`,
      "_blank"
    );
  const handleBuyWithFiat = () => {
    if (!isConnected) {
      toast({
        title: "Wallet Required",
        description: "Connect a wallet first",
        variant: "destructive",
      });
      return;
    }
    navigate("/buy-fiat", { state: { walletAddress } });
    setMobileOpen(false);
  };

  /* ------------------------------ misc ----------------------------------- */
  const isActive = (path: string) => location.pathname === path;
  useEffect(() => {
    const close = () => {
      setWalletOptsOpen(false);
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
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center h-20 justify-between">
        {/* logo */}
        <Link to="/">
          <img
            src="/lovable-uploads/99705421-813e-4d11-89a5-90bffaa2147a.png"
            alt="AURA logo"
            className="h-8 w-auto"
          />
        </Link>

        {/* ------------------------ desktop navbar ------------------------ */}
        <nav className="hidden lg:flex space-x-8 items-center">
          <NavLink to="/" active={isActive("/")}>
            Home
          </NavLink>

          <Dropdown
            label="Project"
            open={projectOpen}
            setOpen={setProjectOpen}
            items={[
              { to: "/roadmap", label: "Roadmap" },
              { to: "/transparency", label: "Transparency" },
              { to: "/volcano-house", label: "Volcano House" },
            ]}
          />

          <Dropdown
            label="Finance"
            open={financeOpen}
            setOpen={setFinanceOpen}
            items={[
              { to: "/value-indicator", label: "Treasury Monitor" },
              { to: "/trading", label: "Trading Hub" },
              { to: "/burn-redistribution", label: "2% Burn System" },
              { to: "/wallet-hub", label: "Wallet Hub" },
            ]}
          />

          <NavLink to="/community-board" active={isActive("/community-board")}>
            Community
          </NavLink>
        </nav>

        {/* ----------------------- desktop actions ------------------------ */}
        <div className="hidden lg:flex items-center gap-4">
          <WalletSection
            isConnected={isConnected}
            walletAddress={walletAddress}
            connectedWallet={connectedWallet}
            walletOptionsOpen={walletOptsOpen}
            setWalletOptionsOpen={setWalletOptsOpen}
            connectWallet={connectWallet}
            disconnectWallet={disconnectWallet}
            copyAddress={copyAddress}
            openInExplorer={openInExplorer}
          />

          <button
            onClick={handleBuyWithFiat}
            className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
          >
            Buy with Fiat
          </button>
          <Link
            to="/trading"
            className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-full text-sm font-medium transition-colors inline-block text-center"
          >
            Buy $AURA
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
        <div className="lg:hidden border-t border-gray-100 bg-white shadow-md">
          <div className="px-6 pt-6 pb-8 space-y-6">

            <MobileLink to="/" onClick={() => setMobileOpen(false)}>Home</MobileLink>

            <MobileGroup label="Project">
              <MobileLink to="/roadmap" onClick={() => setMobileOpen(false)}>
                Roadmap
              </MobileLink>
              <MobileLink to="/transparency" onClick={() => setMobileOpen(false)}>
                Transparency
              </MobileLink>
              <MobileLink to="/volcano-house" onClick={() => setMobileOpen(false)}>
                Volcano House
              </MobileLink>
            </MobileGroup>

            <MobileGroup label="Finance">
              <MobileLink to="/value-indicator" onClick={() => setMobileOpen(false)}>
                Treasury Monitor
              </MobileLink>
              <MobileLink to="/trading" onClick={() => setMobileOpen(false)}>
                Trading Hub
              </MobileLink>
              <MobileLink to="/burn-redistribution" onClick={() => setMobileOpen(false)}>
                2% Burn System
              </MobileLink>
              <MobileLink to="/wallet-hub" onClick={() => setMobileOpen(false)}>
                Wallet Hub
              </MobileLink>
              <MobileLink to="/analytics" onClick={() => setMobileOpen(false)}>
                Analytics
              </MobileLink>
              <MobileLink to="/multisig" onClick={() => setMobileOpen(false)}>
                Multisig
              </MobileLink>
            </MobileGroup>

            <MobileLink to="/community-board" onClick={() => setMobileOpen(false)}>
              Community
            </MobileLink>

            {/* wallet actions */}
            <WalletSection
              mobile
              isConnected={isConnected}
              walletAddress={walletAddress}
              connectedWallet={connectedWallet}
              walletOptionsOpen={walletOptsOpen}
              setWalletOptionsOpen={setWalletOptsOpen}
              connectWallet={connectWallet}
              disconnectWallet={disconnectWallet}
              copyAddress={copyAddress}
              openInExplorer={openInExplorer}
            />

            <button
              onClick={handleBuyWithFiat}
              className="bg-gray-700 hover:bg-gray-800 text-white w-full py-3 rounded-full text-sm font-medium"
            >
              Buy with Fiat
            </button>
            <Link
              to="/trading"
              className="bg-black hover:bg-gray-800 text-white w-full py-3 rounded-full text-sm font-medium"
            >
              Buy $AURA
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

/* -------------------------------------------------------------------------- */
/*                                sub-components                              */
/* -------------------------------------------------------------------------- */
const NavLink: React.FC<{
  to: string;
  active: boolean;
  children: React.ReactNode;
}> = ({ to, active, children }) => (
  <Link
    to={to}
    className={`px-3 py-2 text-sm font-medium transition-colors ${
      active
        ? "text-black border-b-2 border-black"
        : "text-gray-700 hover:text-black"
    }`}
  >
    {children}
  </Link>
);

interface DropItem {
  to: string;
  label: string;
}
interface DropdownProps {
  label: string;
  open: boolean;
  setOpen: (v: boolean) => void;
  items: DropItem[];
}
const Dropdown: React.FC<DropdownProps> = ({
  label,
  open,
  setOpen,
  items,
}) => (
  <div className="relative">
    <button
      onClick={(e) => {
        e.stopPropagation();
        setOpen(!open);
      }}
      className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-black transition-colors"
    >
      {label}
      <ChevronDown className="h-4 w-4" />
    </button>
    {open && (
      <div className="absolute top-full mt-1 left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[160px]">
        {items.map((it) => (
          <Link
            key={it.to}
            to={it.to}
            className="block px-4 py-3 hover:bg-gray-50 text-sm border-b last:border-0"
          >
            {it.label}
          </Link>
        ))}
      </div>
    )}
  </div>
);

interface WalletSectionProps {
  mobile?: boolean;
  isConnected: boolean;
  walletAddress: string;
  connectedWallet: "phantom" | "solflare" | null;
  walletOptionsOpen: boolean;
  setWalletOptionsOpen: (v: boolean) => void;
  connectWallet: (t: "phantom" | "solflare") => void;
  disconnectWallet: () => void;
  copyAddress: () => void;
  openInExplorer: () => void;
}

const WalletSection: React.FC<WalletSectionProps> = ({
  mobile,
  isConnected,
  walletAddress,
  connectedWallet,
  walletOptionsOpen,
  setWalletOptionsOpen,
  connectWallet,
  disconnectWallet,
  copyAddress,
  openInExplorer,
}) => {
  if (!isConnected) {
    return (
      <div className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setWalletOptionsOpen(!walletOptionsOpen);
          }}
          className={`${
            mobile ? "w-full justify-center" : "flex"
          } bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-full text-sm font-medium items-center gap-2`}
        >
          <Wallet className="h-4 w-4" />
          Connect Wallet
        </button>

        {walletOptionsOpen && (
          <div
            className={`absolute bg-white border border-gray-200 rounded-lg shadow-lg z-50 ${
              mobile ? "w-full left-0 mt-2" : "min-w-[180px] left-0 mt-2"
            }`}
          >
            {["phantom", "solflare"].map((w) => (
              <button
                key={w}
                onClick={(e) => {
                  e.stopPropagation();
                  connectWallet(w as "phantom" | "solflare");
                }}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm flex items-center gap-3 border-b last:border-0"
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                    w === "phantom" ? "bg-purple-600" : "bg-orange-500"
                  }`}
                >
                  {w === "phantom" ? "P" : "S"}
                </div>
                {w === "phantom" ? "Phantom" : "Solflare"}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  /* --- connected state --- */
  return (
    <div className={mobile ? "space-y-3" : "flex items-center space-x-2"}>
      <div className="flex items-center space-x-2 bg-gray-100 rounded-full px-4 py-2">
        <div
          className={`w-3 h-3 rounded-full ${
            connectedWallet === "phantom" ? "bg-purple-600" : "bg-orange-500"
          }`}
        />
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

/* ---------- mobile helpers ---------- */
interface MobileLinkProps {
  to: string;
  onClick: () => void;
  children: React.ReactNode;
}
const MobileLink: React.FC<MobileLinkProps> = ({ to, onClick, children }) => (
  <Link
    to={to}
    onClick={onClick}
    className="block text-gray-700 text-base font-medium py-3 border-b border-gray-100"
  >
    {children}
  </Link>
);

interface MobileGroupProps {
  label: string;
  children: React.ReactNode;
}
const MobileGroup: React.FC<MobileGroupProps> = ({ label, children }) => (
  <div>
    <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">
      {label}
    </p>
    <div className="pl-4 space-y-1">{children}</div>
  </div>
);

/* ---------- tiny clsx util (avoid extra dep) ---------- */
function clsx(...args: (string | undefined | false)[]) {
  return args.filter(Boolean).join(" ");
}

export default Header;
