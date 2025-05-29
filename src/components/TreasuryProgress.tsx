import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import clsx from "clsx";
import {
  DollarSign,
  TrendingUp,
  Target,
  MapPin,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatUsd } from "@/lib/utils";
import {
  FUNDING_WALLET_ADDRESS,
  SOL_FALLBACK_PRICE_USD,
  VOLCANO_FUNDING_GOAL,
} from "@/constants";
import type { UseTreasuryDataReturn } from "@/hooks/useTreasuryData";

/* ------------------------------------------------------------------ */
/*                                 API                                */
/* ------------------------------------------------------------------ */
interface TreasuryProgressProps {
  treasury: UseTreasuryDataReturn["data"] | undefined;
  targetAmount?: number;
}

/* ------------------------------------------------------------------ */
/*                              Component                             */
/* ------------------------------------------------------------------ */
const TreasuryProgress: React.FC<TreasuryProgressProps> = ({
  treasury,
  targetAmount = VOLCANO_FUNDING_GOAL,
}) => {
  /* ------------- heavy calculations (memoised) ------------- */
  const { totalRaised, totalLiquid } = useMemo(() => {
    if (!treasury?.wallets) return { totalRaised: 573_216, totalLiquid: 4_089.983 };

    const solPrice = treasury.solPrice || SOL_FALLBACK_PRICE_USD;

    // ever raised
    const inflowWallet = treasury.wallets.find(w => w.address === FUNDING_WALLET_ADDRESS);
    const inflowSol    = inflowWallet?.balances.find(b => b.token_symbol === "SOL")?.balance ?? 0;

    const fallbackSol = treasury.wallets
      .filter(w => w.name.includes("Project Funding"))
      .flatMap(w => w.balances)
      .filter(b => b.token_symbol === "SOL")
      .reduce((sum, b) => sum + (b.balance || 0), 0);

    const totalRaised = (inflowSol || fallbackSol) * solPrice;

    // liquid assets
    const liquidSyms = ["SOL", "ETH", "USDC", "USDT", "AURA", "CULT"];
    const totalLiquid = treasury.wallets
      .flatMap(w => w.balances)
      .filter(b => b.is_lp_token || liquidSyms.includes(b.token_symbol))
      .reduce((sum, b) => sum + (b.usd_value || 0), 0);

    return { totalRaised, totalLiquid };
  }, [treasury]);

  const remaining = targetAmount - totalLiquid;
  const pct       = (totalLiquid / targetAmount) * 100;

  /* ------------------------------- UI ------------------------------- */
  return (
    <Card className="w-full border-none shadow-lg">
      <CardHeader className="text-center pb-6">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl">
          <Target className="h-6 w-6 text-gray-600" />
          Volcano Stay Funding Progress
        </CardTitle>
        <p className="text-lg text-gray-600">
          Track our progress toward fully funding the first AURA eco-stay in
          Guayabo, Costa Rica
        </p>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* progress bar */}
        <ProgressSection pct={pct} totalLiquid={totalLiquid} targetAmount={targetAmount} />

        {/* stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatTile icon={DollarSign} iconBg="bg-gray-600"  title="Total Ever Raised" value={totalRaised}  sub="Total SOL inflows" />
          <StatTile icon={TrendingUp} iconBg="bg-gray-700" title="Total Liquid"       value={totalLiquid} sub="Current liquid assets" />
          <StatTile icon={Target}     iconBg="bg-black"     title="Goal"              value={targetAmount} sub="Complete build cost" />
          <StatTile icon={TrendingUp} iconBg="bg-gray-800" title="Remaining"         value={remaining}   sub="Still needed" />
        </div>

        {/* project details */}
        <ProjectDetails />

        {/* CTA */}
        <CtaSection />
      </CardContent>
    </Card>
  );
};

/* ------------------------------------------------------------------ */
/*                        sub-components / helpers                    */
/* ------------------------------------------------------------------ */

const ProgressSection: React.FC<{ pct: number; totalLiquid: number; targetAmount: number }> = ({ pct, totalLiquid, targetAmount }) => (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <span className="text-lg font-medium">Funding Progress</span>
      <span aria-live="polite" className="text-lg text-gray-600 font-semibold">
        {pct.toFixed(1)}% Complete
      </span>
    </div>
    <div className="relative">
      <Progress value={pct} className="h-4 bg-gray-100" />
      <div
        className="absolute top-0 left-0 h-4 bg-gradient-to-r from-gray-700 to-black rounded-full"
        style={{ width: `${Math.min(pct, 100)}%` }}
      />
    </div>
    <div className="flex justify-between text-sm text-gray-500">
      <span>{formatUsd(totalLiquid)}</span>
      <span>{formatUsd(targetAmount)}</span>
    </div>
  </div>
);

const StatTile: React.FC<{
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  iconBg: string;
  title: string;
  value: number;
  sub: string;
}> = ({ icon: Icon, iconBg, title, value, sub }) => (
  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border">
    <div className="flex items-center gap-3 mb-3">
      <div className={clsx("w-10 h-10 rounded-lg flex items-center justify-center", iconBg)}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <span className="font-semibold text-gray-800">{title}</span>
    </div>
    <p className="text-3xl font-bold text-gray-700 mb-1">{formatUsd(value)}</p>
    <p className="text-sm text-gray-600">{sub}</p>
  </div>
);

const DetailTile: React.FC<{
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  title: string;
  primary: string;
  secondary: string;
}> = ({ icon: Icon, title, primary, secondary }) => (
  <div>
    <div className="flex items-center gap-2 mb-3">
      <Icon className="h-5 w-5 text-gray-600" />
      <span className="font-semibold">{title}</span>
    </div>
    <p className="text-gray-700 mb-2 font-medium">{primary}</p>
    <p className="text-sm text-gray-600">{secondary}</p>
  </div>
);

const ProjectDetails = () => (
  <div className="bg-gray-50 p-6 rounded-xl border">
    <div className="grid md:grid-cols-2 gap-6">
      <DetailTile
        icon={MapPin}
        title="Project Location"
        primary="Guayabo, Costa Rica"
        secondary="Edge of Miravalles Volcano with thermal springs & rainforest"
      />
      <DetailTile
        icon={Calendar}
        title="Timeline"
        primary="Q2 2024 – Q4 2024"
        secondary="Construction with community voting throughout"
      />
    </div>
  </div>
);

const LinkButton: React.FC<{ to: string; variant?: "primary"; children: React.ReactNode }> = ({
  to,
  variant = "primary",
  children,
}) => (
  <Link
    to={to}
    className={clsx(
      "px-8 py-3 rounded-full font-urbanist font-medium transition-colors",
      variant === "primary"
        ? "bg-black text-white hover:bg-gray-800"
        : "border border-gray-300 text-gray-700 hover:border-gray-400"
    )}
  >
    {children}
  </Link>
);

const CtaSection = () => (
  <div className="text-center space-y-4">
    <p className="text-gray-600 font-medium">
      🎯 Current funding includes LP positions, liquid assets, and cross-chain holdings
    </p>
    <div className="flex flex-col sm:flex-row gap-3 justify-center">
      <LinkButton to="/value-indicator">Monitor Treasury Live</LinkButton>
      <button
        type="button"
        className="border border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-3 rounded-full font-urbanist transition-colors font-medium"
      >
        Join Build Updates
      </button>
    </div>
  </div>
);

export default TreasuryProgress;
