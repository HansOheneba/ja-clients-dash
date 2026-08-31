"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Download } from "lucide-react";

import { DashboardGrid, PageShell } from "@/components/layout/page-shell";
import { AllocationPieChart } from "@/components/charts/asset-charts";
import { Button, buttonVariants } from "@/components/ui/button";
import { ClientDate } from "@/components/ui/client-date";
import {
  DashCard,
  DashCardContent,
  DashCardDescription,
  DashCardHeader,
  DashCardTitle,
} from "@/components/ui/dash-card";
import { KpiItem, KpiStrip } from "@/components/ui/kpi-strip";
import { Muted, TextSmall, H1 } from "@/components/ui/typography";
import { useCurrency } from "@/lib/currency-context";
import { useJaPortfolio } from "@/lib/hooks/use-ja-portfolio";
import { cn } from "@/lib/utils";

type PortalUpdate = { id: string; title: string; body: string; created_at: string };
type ReportDoc = { id: string; name: string; date: string; downloadUrl: string };

export default function ClientDashboardPage() {
  const { format } = useCurrency();
  const { data: live, allocationSlices, loading, error } = useJaPortfolio();
  const [updates, setUpdates] = useState<PortalUpdate[]>([]);
  const [latestReport, setLatestReport] = useState<ReportDoc | null>(null);

  useEffect(() => {
    fetch("/api/updates")
      .then((r) => r.json())
      .then((d) => setUpdates(d.updates ?? []))
      .catch(() => setUpdates([]));
    fetch("/api/reports")
      .then((r) => r.json())
      .then((d) => setLatestReport(d.reports?.[0] ?? null))
      .catch(() => setLatestReport(null));
  }, []);

  const clientFirstName = live?.clientName?.split(" ")[0] ?? "there";

  return (
    <PageShell className="flex flex-col gap-(--spacing-section)">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-body-sm font-medium text-brand-accent">Prosper with Purpose</p>
          <H1>Good morning, {clientFirstName}.</H1>
          <ClientDate />
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/clients/dashboard/portfolio"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            View portfolio
          </Link>
          <Link href="/clients/dashboard/reports" className={buttonVariants({ size: "sm" })}>
            Reports
          </Link>
        </div>
      </header>

      {error ? (
        <p className="text-sm text-destructive">
          Could not load portfolio data. Try again shortly or contact your wealth manager.
        </p>
      ) : null}

      <KpiStrip>
        <KpiItem
          label="Total portfolio value"
          value={live ? format(live.totalUSD) : ""}
          change={
            live
              ? `${live.periodReturnPct >= 0 ? "+" : ""}${live.periodReturnPct.toFixed(1)}% this period`
              : "Loading..."
          }
          trend={live && live.periodReturnPct >= 0 ? "up" : "down"}
          emphasis="primary"
          loading={loading}
        />
        <KpiItem
          label="Period gain"
          value={live ? format(live.periodGainUsd) : ""}
          change={live ? "Current statement period" : ""}
          trend={live && live.periodGainUsd >= 0 ? "up" : "down"}
          loading={loading}
        />
        <KpiItem
          label="Cash on account"
          value={live?.cashUSD != null ? format(live.cashUSD) : ""}
          change="Uninvested balance"
          trend="neutral"
          loading={loading}
        />
        <KpiItem
          label="YTD performance"
          value={live ? `${live.ytdPct >= 0 ? "+" : ""}${live.ytdPct.toFixed(1)}%` : ""}
          change="JA managed portfolios"
          trend="up"
          loading={loading}
        />
      </KpiStrip>

      <div className="grid grid-cols-1 gap-(--spacing-grid) lg:grid-cols-3">
        <DashCard>
          <DashCardHeader>
            <div>
              <DashCardTitle>Portfolio allocation</DashCardTitle>
              <DashCardDescription>Current statement breakdown</DashCardDescription>
            </div>
          </DashCardHeader>
          <DashCardContent>
            {loading ? (
              <Muted>Loading allocation...</Muted>
            ) : allocationSlices.length > 0 ? (
              <>
                <AllocationPieChart data={allocationSlices} />
                <div className="mt-3 flex flex-col gap-2">
                  {allocationSlices.map((a) => (
                    <div key={a.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="size-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: a.color }}
                        />
                        <TextSmall>{a.name}</TextSmall>
                      </div>
                      <TextSmall className="font-medium">{a.value}%</TextSmall>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <Muted>No allocation data for this period yet.</Muted>
            )}
            <Link
              href="/clients/dashboard/portfolio"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-4 w-full")}
            >
              View full portfolio
              <ArrowRight className="size-3.5" />
            </Link>
          </DashCardContent>
        </DashCard>

        <div className="flex flex-col gap-(--spacing-grid) lg:col-span-2">
          <DashCard>
            <DashCardHeader>
              <div>
                <DashCardTitle>Latest update</DashCardTitle>
                <DashCardDescription>From your wealth manager</DashCardDescription>
              </div>
            </DashCardHeader>
            <DashCardContent>
              {updates[0] ? (
                <>
                  <TextSmall className="font-medium">{updates[0].title}</TextSmall>
                  <TextSmall className="mt-2 leading-relaxed text-muted-foreground">
                    {updates[0].body}
                  </TextSmall>
                  <Muted className="mt-2">
                    {new Date(updates[0].created_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </Muted>
                </>
              ) : (
                <TextSmall className="leading-relaxed text-muted-foreground">
                  When your wealth manager publishes a report or updates your portfolio, it
                  will appear here.
                </TextSmall>
              )}
            </DashCardContent>
          </DashCard>

          <DashCard>
            <DashCardHeader>
              <div>
                <DashCardTitle>Recent report</DashCardTitle>
                <DashCardDescription>Latest statement in your vault</DashCardDescription>
              </div>
            </DashCardHeader>
            <DashCardContent>
              <TextSmall className="font-medium">
                {latestReport?.name ?? "No report yet"}
              </TextSmall>
              <Muted className="mt-1">
                {latestReport
                  ? `Added ${latestReport.date}`
                  : "Your wealth manager will publish statements here"}
              </Muted>
              <div className="mt-4 flex gap-2">
                {latestReport ? (
                  <a href={latestReport.downloadUrl}>
                    <Button variant="outline" size="sm">
                      <Download className="size-3.5" />
                      Download
                    </Button>
                  </a>
                ) : null}
                <Link
                  href="/clients/dashboard/reports"
                  className={buttonVariants({ variant: "ghost", size: "sm" })}
                >
                  All reports
                </Link>
              </div>
            </DashCardContent>
          </DashCard>
        </div>
      </div>

      <DashboardGrid>
        <DashCard>
          <DashCardHeader>
            <DashCardTitle>Demo gallery</DashCardTitle>
            <DashCardDescription>Preview upcoming product screens</DashCardDescription>
          </DashCardHeader>
          <DashCardContent>
            <TextSmall className="text-muted-foreground">
              Sessions, concierge, and other modules are available as design demos with
              sample data.
            </TextSmall>
            <Link
              href="/clients/dashboard/demo"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-4")}
            >
              Open demo gallery
              <ArrowRight className="size-3.5" />
            </Link>
          </DashCardContent>
        </DashCard>
      </DashboardGrid>
    </PageShell>
  );
}
