import Link from "next/link";
import { TrendingDown, TrendingUp } from "lucide-react";

import { AllocationPieChart, AssetAreaChart } from "@/components/charts/asset-charts";
import { PageShell } from "@/components/layout/page-shell";
import { KpiItem, KpiStrip } from "@/components/ui/kpi-strip";
import {
  DashCard,
  DashCardContent,
  DashCardDescription,
  DashCardHeader,
  DashCardTitle,
} from "@/components/ui/dash-card";
import { H1, Muted, TextSmall } from "@/components/ui/typography";
import { clients } from "@/lib/advisor-clients-data";
import { cn } from "@/lib/utils";

type AssetRollup = { name: string; totalUSD: number; clientCount: number; color: string };

const rollupMap = new Map<string, AssetRollup>();

for (const client of clients) {
  for (const asset of client.portfolio.assets) {
    const existing = rollupMap.get(asset.name);
    if (existing) {
      existing.totalUSD += asset.value;
      existing.clientCount += 1;
    } else {
      rollupMap.set(asset.name, {
        name: asset.name,
        totalUSD: asset.value,
        clientCount: 1,
        color: asset.color,
      });
    }
  }
}

const assetRollups = Array.from(rollupMap.values()).sort((a, b) => b.totalUSD - a.totalUSD);
const totalAUM = clients.reduce((s, c) => s + c.portfolio.total, 0);
const avgYtd = (clients.reduce((s, c) => s + c.portfolio.ytd, 0) / clients.length).toFixed(1);
const largestClient = [...clients].sort((a, b) => b.portfolio.total - a.portfolio.total)[0];
const activeCount = clients.filter((c) => c.status === "Active").length;

const bookHistory = clients[0].portfolio.history.map((point, index) => ({
  month: point.month,
  value: clients.reduce(
    (sum, client) => sum + (client.portfolio.history[index]?.value ?? 0),
    0,
  ),
}));

const allocationSlices = assetRollups.map((row) => ({
  name: row.name,
  value: Math.round((row.totalUSD / totalAUM) * 100),
  color: row.color,
}));

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${n}`;
}

export default function AdvisorPortfolioPage() {
  return (
    <PageShell className="flex flex-col gap-5">
      <header className="flex flex-col gap-1">
        <H1>Portfolio</H1>
        <Muted>Book-level allocation, trajectory, and per-client breakdown</Muted>
      </header>

      <KpiStrip>
        <KpiItem label="Total AUM" value={fmt(totalAUM)} change={`${clients.length} clients`} trend="neutral" />
        <KpiItem
          label="Avg YTD return"
          value={`${Number(avgYtd) >= 0 ? "+" : ""}${avgYtd}%`}
          change="Book average"
          trend={Number(avgYtd) >= 0 ? "up" : "down"}
        />
        <KpiItem
          label="Active clients"
          value={String(activeCount)}
          change={`of ${clients.length} total`}
          trend="neutral"
        />
        <KpiItem
          label="Largest client"
          value={fmt(largestClient.portfolio.total)}
          change={largestClient.name}
          trend="neutral"
        />
      </KpiStrip>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:items-start">
        <DashCard>
          <DashCardHeader className="mb-2">
            <div>
              <DashCardTitle>Book allocation</DashCardTitle>
              <DashCardDescription>% of total AUM by holding</DashCardDescription>
            </div>
          </DashCardHeader>
          <DashCardContent>
            <AllocationPieChart data={allocationSlices} size="large" />
          </DashCardContent>
        </DashCard>

        <DashCard className="lg:col-span-2">
          <DashCardHeader className="mb-2">
            <div>
              <DashCardTitle>AUM by holding</DashCardTitle>
              <DashCardDescription>Aggregated value across all client portfolios</DashCardDescription>
            </div>
          </DashCardHeader>
          <DashCardContent className="gap-0">
            {assetRollups.map((row) => {
              const pct = (row.totalUSD / totalAUM) * 100;
              return (
                <div
                  key={row.name}
                  className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto] items-center gap-3 border-b border-border/60 py-3 last:border-0"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: row.color }}
                      />
                      <TextSmall className="truncate font-medium">{row.name}</TextSmall>
                    </div>
                    <Muted className="text-xs">
                      {row.clientCount} client{row.clientCount !== 1 ? "s" : ""}
                    </Muted>
                  </div>
                  <div className="min-w-0">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: row.color }}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <TextSmall className="font-numeric font-semibold">{fmt(row.totalUSD)}</TextSmall>
                    <Muted className="text-xs font-numeric">{pct.toFixed(1)}%</Muted>
                  </div>
                </div>
              );
            })}
          </DashCardContent>
        </DashCard>
      </div>

      <DashCard>
        <DashCardHeader className="mb-2">
          <div>
            <DashCardTitle>Book AUM over time</DashCardTitle>
            <DashCardDescription>Combined portfolio value across all clients</DashCardDescription>
          </div>
        </DashCardHeader>
        <DashCardContent>
          <AssetAreaChart
            data={bookHistory}
            color="#202356"
            gradientId="book-aum-history"
            height={220}
            yAxisLabel="Book AUM (USD)"
            seriesLabel="Total book AUM"
          />
        </DashCardContent>
      </DashCard>

      <DashCard>
        <DashCardHeader className="mb-2">
          <div>
            <DashCardTitle>Client portfolios</DashCardTitle>
            <DashCardDescription>AUM, YTD return, and allocation by client</DashCardDescription>
          </div>
          <Link
            href="/advisors/dashboard/demo/reports"
            className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Generate a report
          </Link>
        </DashCardHeader>
        <DashCardContent className="gap-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border/60 text-left text-xs text-muted-foreground">
                  <th className="pb-2 pr-4 font-medium">Client</th>
                  <th className="pb-2 pr-4 font-medium text-right">AUM</th>
                  <th className="pb-2 pr-4 font-medium text-right">YTD</th>
                  <th className="pb-2 pr-4 font-medium">Allocation</th>
                  <th className="pb-2 font-medium text-right">Report</th>
                </tr>
              </thead>
              <tbody>
                {[...clients]
                  .sort((a, b) => b.portfolio.total - a.portfolio.total)
                  .map((c) => (
                    <tr key={c.id} className="border-b border-border/40 last:border-0">
                      <td className="py-2.5 pr-4">
                        <Link
                          href={`/advisors/dashboard/clients/${c.id}`}
                          className="flex items-center gap-2 transition-colors hover:text-foreground"
                        >
                          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-sidebar text-xs font-semibold text-sidebar-foreground">
                            {c.initials}
                          </div>
                          <div>
                            <TextSmall className="font-medium">{c.name}</TextSmall>
                            <Muted className="text-xs">{c.status}</Muted>
                          </div>
                        </Link>
                      </td>
                      <td className="py-2.5 pr-4 text-right font-numeric font-semibold">
                        {fmt(c.portfolio.total)}
                      </td>
                      <td
                        className={cn(
                          "py-2.5 pr-4 text-right font-numeric font-semibold",
                          c.portfolio.ytd >= 0 ? "text-green-600" : "text-red-500",
                        )}
                      >
                        <span className="inline-flex items-center justify-end gap-1">
                          {c.portfolio.ytd >= 0 ? (
                            <TrendingUp className="size-3.5" />
                          ) : (
                            <TrendingDown className="size-3.5" />
                          )}
                          {c.portfolio.ytd > 0 ? "+" : ""}
                          {c.portfolio.ytd}%
                        </span>
                      </td>
                      <td className="py-2.5">
                        <div className="flex h-2 w-full max-w-xs overflow-hidden rounded-full bg-muted">
                          {c.portfolio.assets.map((a) => (
                            <div
                              key={a.name}
                              title={`${a.name}: ${a.allocation}%`}
                              className="h-full"
                              style={{
                                width: `${a.allocation}%`,
                                backgroundColor: a.color,
                              }}
                            />
                          ))}
                        </div>
                        <Muted className="mt-1 text-xs">
                          {c.portfolio.assets
                            .slice(0, 3)
                            .map((a) => `${a.allocation}% ${a.name}`)
                            .join(" · ")}
                        </Muted>
                      </td>
                      <td className="py-2.5 pl-4 text-right">
                        <Link
                          href={`/advisors/dashboard/demo/reports?client=${c.id}`}
                          className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                        >
                          Generate
                        </Link>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </DashCardContent>
      </DashCard>
    </PageShell>
  );
}
