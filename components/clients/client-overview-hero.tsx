"use client";

import { useCurrency } from "@/lib/currency-context";
import { cn } from "@/lib/utils";

type ClientOverviewHeroProps = {
  totalUSD: number;
  ytdPct: number;
  periodGainUsd: number;
  loading?: boolean;
};

export function ClientOverviewHero({
  totalUSD,
  ytdPct,
  periodGainUsd,
  loading,
}: ClientOverviewHeroProps) {
  const { format } = useCurrency();

  if (loading) {
    return (
      <div className="animate-pulse rounded-2xl bg-brand-primary/20 px-6 py-8">
        <div className="mb-2 h-3 w-32 rounded bg-white/20" />
        <div className="h-9 w-48 rounded bg-white/20" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-[#0a1f3d] px-5 py-5 text-white sm:px-6 sm:py-6">
      <p className="text-xs font-medium tracking-wide text-[#c9a227]">
        TOTAL PORTFOLIO VALUE
      </p>
      <div className="mt-1 flex flex-wrap items-baseline gap-2 sm:gap-3">
        <p className="font-numeric text-3xl font-medium">{format(totalUSD)}</p>
        <span
          className={cn(
            "font-numeric text-sm",
            ytdPct >= 0 ? "text-[#8fd19e]" : "text-red-300",
          )}
        >
          {ytdPct >= 0 ? "+" : ""}
          {ytdPct.toFixed(1)}% YTD
        </span>
      </div>
      <p className="mt-2 text-xs text-[#b9c3d4]">
        {periodGainUsd >= 0 ? "Up" : "Down"} {format(Math.abs(periodGainUsd))} this period
      </p>
    </div>
  );
}
