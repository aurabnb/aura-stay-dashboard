'use client';

import React from "react";
import { MapPin, Target, LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

/* ----------------------- tiny helpers ----------------------- */
const fmt = (n: number) =>
  n >= 1e6
    ? `${+(n / 1e6).toFixed(1)}M`
    : n >= 1e3
    ? `${+(n / 1e3).toFixed(1)}K`
    : n.toString();

const StatCard: React.FC<{
  icon: LucideIcon;
  title: string;
  value: string | number;
  note: string;
  href?: string;
  loading?: boolean;
  error?: boolean;
  dark?: boolean;
}> = ({ icon: Icon, title, value, note, href, loading, error, dark }) => (
  <Card
    className={`border-none shadow-lg hover:shadow-xl transition-shadow ${
      dark ? "bg-black text-white" : ""
    }`}
  >
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-2">{title}</p>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-2xl font-bold ${
                error ? "text-red-500" : dark ? "text-white" : "text-gray-900"
              }`}
            >
              {value}
            </span>
          </div>
          <p className="text-xs text-gray-500">{note}</p>
          {href && (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-700 hover:text-black mt-1 inline-block underline"
            >
              Visit →
            </a>
          )}
        </div>
        <div
          className={`w-12 h-12 rounded-lg flex items-center justify-center ${
            dark ? "bg-gray-800" : "bg-gray-50"
          }`}
        >
          <Icon
            className={`w-6 h-6 ${dark ? "text-white" : "text-gray-700"}`}
          />
        </div>
      </div>
    </CardContent>
  </Card>
);

/* ------------------------- main widget ------------------------- */
const AuraStats: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* project metrics */}
      <div>
        <h3 className="font-semibold text-lg mb-4">Project Progress</h3>
        <div className="grid gap-6 md:grid-cols-2">
          <StatCard
            icon={MapPin}
            title="Properties in Pipeline"
            value="1"
            note="Eco-stay planned"
          />
          <StatCard
            icon={Target}
            title="Growth Target"
            value="15"
            note="Properties by Year 1"
            dark
          />
        </div>
      </div>
    </div>
  );
};

export { AuraStats }; 