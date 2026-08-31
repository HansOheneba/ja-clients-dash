"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";

import { AllocationPieChart, AssetAreaChart } from "@/components/charts/asset-charts";
import { Button } from "@/components/ui/button";
import {
  DashCard,
  DashCardContent,
  DashCardDescription,
  DashCardHeader,
  DashCardTitle,
} from "@/components/ui/dash-card";
import { KpiItem, KpiStrip } from "@/components/ui/kpi-strip";
import { Muted, TextSmall } from "@/components/ui/typography";
import { BUCKET_COLORS, BUCKET_LABELS, formatUsd } from "@/lib/wealth/constants";
import type { JaPortfolioSummary } from "@/lib/api/domain/wealth-portfolio";
import type { PortfolioSnapshot, StatementPeriod } from "@/lib/wealth/types";

function formatStatementDate(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function PortfolioOverview({
  clientId,
  portfolio,
  snapshots,
  latestPeriod,
}: {
  clientId: string;
  portfolio: JaPortfolioSummary | null;
  snapshots: PortfolioSnapshot[];
  latestPeriod: StatementPeriod | null;
}) {
  const statementHref = `/advisors/dashboard/clients/${clientId}/statement`;

  const slices = (portfolio?.buckets ?? []).map((b) => ({
    name: b.label,
    value: Math.round(b.allocationPct),
    color:
      b.id === "income"
        ? "#b2936b"
        : b.id === "growth"
          ? "#202356"
          : b.id === "venture"
            ? "#829850"
            : b.id === "treasury"
              ? "#484848"
              : "#c4b5a0",
  }));

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <TextSmall className="font-semibold">Portfolio trends</TextSmall>
          <Muted>
            Allocation and value over time from saved statement data. To update figures, use
            Statement data.
          </Muted>
        </div>
        <Link href={statementHref}>
          <Button size="sm">
            <Pencil className="size-4" />
            Edit statement data
          </Button>
        </Link>
      </div>

      {latestPeriod ? (
        <DashCard padding="sm">
          <DashCardContent className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <TextSmall className="font-medium">Latest statement period</TextSmall>
              <Muted>
                {latestPeriod.label} ({formatStatementDate(latestPeriod.period_start)} to{" "}
                {formatStatementDate(latestPeriod.period_end)})
              </Muted>
            </div>
            <Link href={`${statementHref}?periodId=${latestPeriod.id}`}>
              <Button variant="outline" size="sm">
                Open in statement data
              </Button>
            </Link>
          </DashCardContent>
        </DashCard>
      ) : (
        <DashCard padding="sm" className="border-brand-primary/20 bg-brand-primary/5">
          <DashCardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Muted>No statement periods yet. Add the first period to start tracking portfolio data.</Muted>
            <Link href={statementHref}>
              <Button size="sm">Add statement data</Button>
            </Link>
          </DashCardContent>
        </DashCard>
      )}

      <KpiStrip>
        <KpiItem
          label="Portfolio value"
          value={formatUsd(portfolio?.totalUSD ?? 0)}
          change={
            portfolio ? `${portfolio.periodReturnPct.toFixed(1)}% this period` : "No snapshot yet"
          }
          trend={(portfolio?.periodGainUsd ?? 0) >= 0 ? "up" : "down"}
        />
        <KpiItem
          label="Period gain"
          value={formatUsd(portfolio?.periodGainUsd ?? 0)}
          change="Invested capital"
          trend={(portfolio?.periodGainUsd ?? 0) >= 0 ? "up" : "neutral"}
        />
        <KpiItem
          label="YTD"
          value={`${(portfolio?.ytdPct ?? 0).toFixed(1)}%`}
          change="Statement YTD"
          trend="neutral"
        />
        <KpiItem
          label="Buckets"
          value={String(snapshots.length > 0 ? snapshots.filter((s) => s.current_value_usd > 0).length : 0)}
          change="With current value"
          trend="neutral"
        />
      </KpiStrip>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <DashCard>
          <DashCardHeader>
            <div>
              <DashCardTitle>Allocation</DashCardTitle>
              <DashCardDescription>JA managed buckets</DashCardDescription>
            </div>
          </DashCardHeader>
          <DashCardContent>
            {slices.length > 0 ? (
              <AllocationPieChart data={slices} />
            ) : (
              <Muted>Save statement data to see allocation.</Muted>
            )}
          </DashCardContent>
        </DashCard>
        <DashCard className="lg:col-span-2">
          <DashCardHeader>
            <div>
              <DashCardTitle>Value over time</DashCardTitle>
              <DashCardDescription>From portfolio history</DashCardDescription>
            </div>
          </DashCardHeader>
          <DashCardContent>
            {portfolio && portfolio.history.length > 1 ? (
              <AssetAreaChart
                data={portfolio.history}
                color="#202356"
                gradientId={`portfolio-hist-${clientId}`}
                height={240}
                yAxisLabel="Value (USD)"
                seriesLabel="Portfolio value"
              />
            ) : (
              <Muted>Save statement data to build the value chart.</Muted>
            )}
          </DashCardContent>
        </DashCard>
      </div>

      {snapshots.length > 0 ? (
        <DashCard>
          <DashCardHeader>
            <div>
              <DashCardTitle>Latest bucket values</DashCardTitle>
              <DashCardDescription>
                {latestPeriod ? latestPeriod.label : "Most recent statement period"}
              </DashCardDescription>
            </div>
          </DashCardHeader>
          <DashCardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="pb-2 pr-4 font-medium">Bucket</th>
                  <th className="pb-2 pr-4 font-medium text-right">Previous</th>
                  <th className="pb-2 pr-4 font-medium text-right">Current</th>
                  <th className="pb-2 font-medium text-right">Period %</th>
                </tr>
              </thead>
              <tbody>
                {snapshots.map((row) => (
                  <tr key={row.bucket} className="border-b border-border/50 last:border-0">
                    <td className="py-2.5 pr-4">
                      <div className="flex items-center gap-2">
                        <span
                          className="size-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: BUCKET_COLORS[row.bucket] }}
                        />
                        <TextSmall className="font-medium">{BUCKET_LABELS[row.bucket]}</TextSmall>
                      </div>
                    </td>
                    <td className="py-2.5 pr-4 text-right font-numeric">
                      {formatUsd(row.previous_value_usd)}
                    </td>
                    <td className="py-2.5 pr-4 text-right font-numeric font-medium">
                      {formatUsd(row.current_value_usd)}
                    </td>
                    <td className="py-2.5 text-right font-numeric text-muted-foreground">
                      {row.period_change_pct == null
                        ? "N/A"
                        : `${row.period_change_pct >= 0 ? "+" : ""}${row.period_change_pct.toFixed(1)}%`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </DashCardContent>
        </DashCard>
      ) : null}
    </div>
  );
}
