'use client';

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
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
} from "@/lib/constants";
import { useTreasuryData } from "@/hooks/useTreasuryData";
import type { ConsolidatedData } from "@/types/treasury";

/* -------------------------------------------------------------------------- */
/*                                COUNT-UP HOOK                               */
/* -------------------------------------------------------------------------- */
const useCountUp = (target: number, duration = 800) => {
  const [val, setVal] = useState(0);
  const targetRef = useRef(target);
  
  useEffect(() => {
    targetRef.current = target; // handle prop changes
    const start = performance.now();
    const tick = (t: number) => {
      const elapsed = t - start;
      const pct = Math.min(elapsed / duration, 1);
      setVal(targetRef.current * pct);
      if (pct < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  
  return val;
};

/* -------------------------------------------------------------------------- */
/*                                COMPONENT                                   */
/* -------------------------------------------------------------------------- */
interface Props {
  treasury?: ConsolidatedData | null;
  targetAmount?: number;
}

const TreasuryProgress: React.FC<Props> = ({
  treasury,
  targetAmount = VOLCANO_FUNDING_GOAL,
}) => {
  /* ----------------------- crunch the numbers ----------------------- */
  const { raised, liquid } = useMemo(() => {
    if (!treasury?.wallets)
      return { raised: 573_216, liquid: 4_089.983 };

    const p = treasury.solPrice || SOL_FALLBACK_PRICE_USD;
    const inflowSol =
      treasury.wallets
        .find(w => w.address === FUNDING_WALLET_ADDRESS)
        ?.balances.find(b => b.token_symbol === "SOL")?.balance ?? 0;

    const fallbackSol = treasury.wallets
      .filter(w => w.name.includes("Project Funding"))
      .flatMap(w => w.balances)
      .filter(b => b.token_symbol === "SOL")
      .reduce((s, b) => s + (b.balance || 0), 0);

    const raised = (inflowSol || fallbackSol) * p;

    const ls = ["SOL", "ETH", "USDC", "USDT", "AURA", "CULT"];
    const liquid = treasury.wallets
      .flatMap(w => w.balances)
      .filter(b => b.is_lp_token || ls.includes(b.token_symbol))
      .reduce((s, b) => s + (b.usd_value || 0), 0);

    return { raised, liquid };
  }, [treasury]);

  const pct       = (liquid / targetAmount) * 100;
  const remaining = Math.max(0, targetAmount - liquid);

  /* ------------------------- animated numbers ----------------------- */
  const raisedAnim    = useCountUp(raised);
  const liquidAnim    = useCountUp(liquid);
  const remainingAnim = useCountUp(remaining);

  /* ------------------------------ UI ------------------------------ */
  return (
    <Card className="w-full border-none shadow-lg">
      <CardHeader className="text-center pb-6">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl">
          <Target className="h-6 w-6 text-gray-600 animate-fade-up" />
          Volcano Stay Funding Progress
        </CardTitle>
        <p className="text-lg text-gray-600">
          Track our progress toward fully funding the first AURA eco-stay in
          Guayabo, Costa Rica
        </p>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* progress */}
        <ProgressBar pct={pct} now={liquidAnim} goal={targetAmount} />

        {/* stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Tile icon={DollarSign} bg="bg-gray-600"  label="Total Ever Raised" val={raisedAnim}    sub="Total SOL inflows" />
          <Tile icon={TrendingUp} bg="bg-gray-700"  label="Total Liquid"      val={liquidAnim}    sub="Liquid assets" />
          <Tile icon={Target}     bg="bg-black"     label="Goal"              val={targetAmount}  sub="Build cost" />
          <Tile icon={TrendingUp} bg="bg-gray-800"  label="Remaining"         val={remainingAnim} sub="Still needed" />
        </div>

        {/* project meta */}
        <Meta />

        {/* CTA */}
        <CTA />
      </CardContent>
    </Card>
  );
};

/* -------------------------------------------------------------------------- */
/*                         SUB–COMPONENTS / HELPERS                           */
/* -------------------------------------------------------------------------- */
const ProgressBar: React.FC<{
  pct: number;
  now: number;
  goal: number;
}> = ({ pct, now, goal }) => (
  <div className="space-y-4">
    <div className="flex justify-between">
      <span className="text-lg font-medium">Funding Progress</span>
      <span className="text-lg font-semibold text-gray-600">
        {pct.toFixed(1)}%
      </span>
    </div>

    {/* bar */}
    <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
      <div
        style={{ width: `${Math.min(pct, 100)}%` }}
        className="absolute left-0 top-0 h-full bg-gradient-to-r from-gray-700 to-black transition-[width] duration-700 ease-out animate-pulse-slow"
      />
    </div>

    <div className="flex justify-between text-sm text-gray-500">
      <span>{formatUsd(now)}</span>
      <span>{formatUsd(goal)}</span>
    </div>
  </div>
);

const Tile: React.FC<{
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  bg: string;
  label: string;
  val: number;
  sub: string;
}> = ({ icon: Icon, bg, label, val, sub }) => (
  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border transform transition hover:-translate-y-1 hover:shadow-xl group">
    <div className="flex items-center gap-3 mb-3">
      <div
        className={clsx(
          "w-10 h-10 rounded-lg flex items-center justify-center",
          bg,
          "group-hover:scale-110 transition-transform"
        )}
      >
        <Icon className="h-5 w-5 text-white" />
      </div>
      <span className="font-semibold text-gray-800">{label}</span>
    </div>
    <p className="text-3xl font-bold text-gray-700 mb-1">
      {formatUsd(val)}
    </p>
    <p className="text-sm text-gray-600">{sub}</p>
  </div>
);

const Detail: React.FC<{
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  head: string;
  primary: string;
  secondary: string;
}> = ({ icon: Icon, head, primary, secondary }) => (
  <div>
    <div className="flex items-center gap-2 mb-2">
      <Icon className="h-5 w-5 text-gray-600" />
      <span className="font-semibold">{head}</span>
    </div>
    <p className="text-gray-700 font-medium">{primary}</p>
    <p className="text-xs text-gray-500">{secondary}</p>
  </div>
);

const Meta = () => (
  <div className="bg-gray-50 p-6 rounded-xl border">
    <div className="grid md:grid-cols-2 gap-6">
      <Detail
        icon={MapPin}
        head="Project Location"
        primary="Guayabo, Costa Rica"
        secondary="Edge of Miravalles Volcano, hot springs & rainforest"
      />
      <Detail
        icon={Calendar}
        head="Timeline"
        primary="Q2 2024 – Q4 2024"
        secondary="Construction phase with community voting"
      />
    </div>
  </div>
);

const CTA = () => (
  <div className="text-center space-y-4">
    <p className="text-gray-600 font-medium">
      🎯 LP rewards, liquid assets & cross-chain holdings power this build
    </p>
    <div className="flex flex-col sm:flex-row gap-3 justify-center">
      <BtnLink href="/value-indicator" primary>
        Monitor Treasury Live
      </BtnLink>
      <BtnLink href="#" primary={false}>
        Join Build Updates
      </BtnLink>
    </div>
  </div>
);

const BtnLink: React.FC<{ href: string; primary?: boolean; children: React.ReactNode }> = ({
  href,
  primary = true,
  children,
}) => (
  <Link
    href={href}
    className={clsx(
      "px-8 py-3 rounded-full font-medium transition inline-block",
      primary
        ? "bg-black text-white hover:bg-gray-800"
        : "border border-gray-300 text-gray-700 hover:border-gray-400"
    )}
  >
    {children}
  </Link>
);

// Wrapper component that uses the hook
const TreasuryProgressContainer: React.FC = () => {
  const { data: treasury, loading, error } = useTreasuryData();

  if (loading) {
    return (
      <Card className="w-full border-none shadow-lg">
        <CardContent className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full border-none shadow-lg">
        <CardContent className="p-8 text-center">
          <p className="text-red-600">Error loading treasury data: {error}</p>
        </CardContent>
      </Card>
    );
  }

  return <TreasuryProgress treasury={treasury} />;
};

export { TreasuryProgress };
export default TreasuryProgressContainer; 