"use client";

import { useCallback, useEffect, useState } from "react";

import { isPortfolioEmpty } from "@/components/ui/empty-state";
import { BUCKET_COLORS } from "@/lib/wealth/constants";

export type LivePortfolioBucket = {
  id: string;
  label: string;
  totalUSD: number;
  allocationPct: number;
  ytdPct: number | null;
  history: { month: string; value: number }[];
};

export type LivePortfolioData = {
  totalUSD: number;
  periodGainUsd: number;
  periodReturnPct: number;
  ytdPct: number;
  buckets: LivePortfolioBucket[];
  history: { month: string; value: number }[];
  clientName?: string;
  cashUSD?: number;
};

type ApiResponse = {
  portfolio: {
    totalUSD: number;
    periodGainUsd: number;
    periodReturnPct: number;
    ytdPct: number;
    buckets: LivePortfolioBucket[];
    history: { month: string; value: number }[];
  };
  profile: { fullName: string } | null;
};

export function useJaPortfolio(clientId?: string) {
  const [data, setData] = useState<LivePortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = clientId ? `/api/portfolio?clientId=${clientId}` : "/api/portfolio";
      const res = await fetch(url);
      const json: ApiResponse & { error?: string } = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to load portfolio");

      const coa = json.portfolio.buckets.find((b) => b.id === "coa");
      setData({
        ...json.portfolio,
        clientName: json.profile?.fullName,
        cashUSD: coa?.totalUSD ?? 0,
        buckets: json.portfolio.buckets.map((b) => ({
          ...b,
          color: BUCKET_COLORS[b.id as keyof typeof BUCKET_COLORS],
        })),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    load();
  }, [load]);

  const allocationSlices = (data?.buckets ?? []).map((b) => ({
    name: b.label,
    value: Math.round(b.allocationPct),
    color: BUCKET_COLORS[b.id as keyof typeof BUCKET_COLORS] ?? "#999",
  }));

  const empty = isPortfolioEmpty(data);

  return { data, allocationSlices, loading, error, reload: load, empty };
}
