"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";

import { AllocationPieChart, AssetAreaChart } from "@/components/charts/asset-charts";
import { PageShell } from "@/components/layout/page-shell";
import { ClientReportsPanel } from "@/components/reports/client-reports-panel";
import {
  DashCard,
  DashCardContent,
  DashCardDescription,
  DashCardHeader,
  DashCardTitle,
} from "@/components/ui/dash-card";
import { KpiItem, KpiStrip } from "@/components/ui/kpi-strip";
import { Skeleton } from "@/components/ui/skeleton";
import { H1, Muted, TextSmall } from "@/components/ui/typography";
import { useCurrency } from "@/lib/currency-context";
import { useJaPortfolio } from "@/lib/hooks/use-ja-portfolio";
import { BUCKET_COLORS } from "@/lib/wealth/constants";
import { cn } from "@/lib/utils";

function ChangeCell({ value }: { value: number | null }) {
  if (value == null) return <span className="text-xs text-muted-foreground">N/A</span>;
  const Icon = value === 0 ? Minus : value > 0 ? TrendingUp : TrendingDown;
  return (
    <span className={cn(
      "inline-flex items-center gap-1 font-numeric text-xs font-medium",
      value > 0 && "text-brand-accent",
      value < 0 && "text-destructive",
      value === 0 && "text-muted-foreground"
    )}>
      <Icon className="size-3 shrink-0" />
      {value > 0 ? "+" : ""}{value.toFixed(1)}%
    </span>
  );
}

export default function ClientPortfolioPage() {
  const { format } = useCurrency();
  const { data, allocationSlices, loading, error } = useJaPortfolio();

  if (loading) {
    return (
      <PageShell className="flex flex-col gap-(--spacing-section)">
        <header className="flex flex-col gap-1">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </header>

        <KpiStrip>
          <KpiItem label="Total Portfolio" value="" loading />
          <KpiItem label="Period Gain" value="" loading />
          <KpiItem label="Best Portfolio" value="" loading />
          <KpiItem label="Cash On Account" value="" loading />
        </KpiStrip>

        <div className="grid grid-cols-1 gap-(--spacing-grid) lg:grid-cols-3">
          <DashCard>
            <DashCardHeader>
              <Skeleton className="h-5 w-36" />
              <Skeleton className="mt-2 h-3 w-48" />
            </DashCardHeader>
            <DashCardContent>
              <Skeleton className="mx-auto size-40 rounded-full" />
            </DashCardContent>
          </DashCard>
          <DashCard className="lg:col-span-2">
            <DashCardHeader>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="mt-2 h-3 w-44" />
            </DashCardHeader>
            <DashCardContent>
              <Skeleton className="h-48 w-full rounded-lg" />
            </DashCardContent>
          </DashCard>
        </div>

        <DashCard>
          <DashCardHeader>
            <Skeleton className="h-5 w-36" />
            <Skeleton className="mt-2 h-3 w-52" />
          </DashCardHeader>
          <DashCardContent className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full" />
            ))}
          </DashCardContent>
        </DashCard>
      </PageShell>
    );
  }

  if (error || !data) {
    return (
      <PageShell className="flex flex-col gap-(--spacing-section)">
        <H1>My Portfolio</H1>
        <Muted>Could not load portfolio. Run the SQL in supabase/manual/001_full_setup.sql and check .env.local.</Muted>
        <TextSmall className="text-destructive">{error}</TextSmall>
      </PageShell>
    );
  }

  const bestBucket = [...data.buckets]
    .filter((b) => b.ytdPct != null && b.id !== "coa")
    .sort((a, b) => (b.ytdPct ?? 0) - (a.ytdPct ?? 0))[0];

  return (
    <PageShell className="flex flex-col gap-(--spacing-section)">
      <header className="flex flex-col gap-1">
        <H1>My Portfolio</H1>
        <Muted>JA managed portfolios: Income, Growth, Venture, Treasury, and Cash on Account.</Muted>
      </header>

      <KpiStrip>
        <KpiItem label="Total Portfolio" value={format(data.totalUSD)} change={`+${data.periodReturnPct.toFixed(1)}% this period`} trend="up" />
        <KpiItem label="Period Gain" value={format(data.periodGainUsd)} change="Statement period" trend={data.periodGainUsd >= 0 ? "up" : "down"} />
        <KpiItem label="Best Portfolio" value={bestBucket?.label ?? "N/A"} change={bestBucket?.ytdPct != null ? `+${bestBucket.ytdPct.toFixed(1)}% YTD` : ""} trend="up" />
        <KpiItem label="Cash On Account" value={format(data.cashUSD ?? 0)} change="Uninvested cash" trend="neutral" />
      </KpiStrip>

      <div className="grid grid-cols-1 gap-(--spacing-grid) lg:grid-cols-3">
        <DashCard>
          <DashCardHeader>
            <div>
              <DashCardTitle>Portfolio Allocation</DashCardTitle>
              <DashCardDescription>By JA bucket, % of total</DashCardDescription>
            </div>
          </DashCardHeader>
          <DashCardContent>
            <AllocationPieChart data={allocationSlices} />
          </DashCardContent>
        </DashCard>

        <DashCard className="lg:col-span-2">
          <DashCardHeader>
            <div>
              <DashCardTitle>Value Over Time</DashCardTitle>
              <DashCardDescription>Total portfolio trajectory</DashCardDescription>
            </div>
          </DashCardHeader>
          <DashCardContent>
            <AssetAreaChart
              data={data.history}
              color="#202356"
              gradientId="ja-portfolio-total"
              height={220}
              yAxisLabel="Value (USD)"
              seriesLabel="Portfolio value"
            />
          </DashCardContent>
        </DashCard>
      </div>

      <DashCard>
        <DashCardHeader>
          <DashCardTitle>Portfolio Buckets</DashCardTitle>
          <DashCardDescription>Current values and period performance</DashCardDescription>
        </DashCardHeader>
        <DashCardContent className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-3 pr-4 font-medium">Bucket</th>
                <th className="pb-3 pr-4 font-medium text-right">Value</th>
                <th className="pb-3 pr-4 font-medium text-right">Allocation</th>
                <th className="pb-3 font-medium text-right">YTD</th>
              </tr>
            </thead>
            <tbody>
              {data.buckets.map((bucket) => (
                <tr key={bucket.id} className="border-b border-border/50 last:border-0">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <span
                        className="size-2.5 rounded-full"
                        style={{ backgroundColor: BUCKET_COLORS[bucket.id as keyof typeof BUCKET_COLORS] }}
                      />
                      <TextSmall className="font-medium">{bucket.label}</TextSmall>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-right font-numeric">{format(bucket.totalUSD)}</td>
                  <td className="py-3 pr-4 text-right font-numeric">{bucket.allocationPct.toFixed(1)}%</td>
                  <td className="py-3 text-right"><ChangeCell value={bucket.ytdPct} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </DashCardContent>
      </DashCard>

      <ClientReportsPanel variant="compact" />
    </PageShell>
  );
}
