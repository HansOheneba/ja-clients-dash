"use client";

import { useEffect, useState } from "react";

import {
  ClientAttentionCards,
  ClientUpdateNote,
} from "@/components/clients/client-attention-cards";
import {
  ClientOverviewEmptyHero,
  ClientOverviewHero,
} from "@/components/clients/client-overview-hero";
import {
  ClientLatestReport,
  ClientPrimaryGoal,
} from "@/components/clients/client-primary-goal";
import { PageShell } from "@/components/layout/page-shell";
import { Muted } from "@/components/ui/typography";
import { useClientDashboard } from "@/lib/client-dashboard-context";
import { fetchJson } from "@/lib/fetch-json";
import type { ClientOverviewData } from "@/lib/wealth/client-overview";

function DashboardLoadingSkeleton() {
  return (
    <>
      <ClientOverviewHero totalUSD={0} ytdPct={0} periodGainUsd={0} loading />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="h-[148px] animate-pulse rounded-xl bg-muted/50" />
        <div className="h-[148px] animate-pulse rounded-xl bg-muted/50" />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="h-[156px] animate-pulse rounded-xl bg-muted/50" />
        <div className="h-[156px] animate-pulse rounded-xl bg-muted/50" />
      </div>
    </>
  );
}

export default function ClientDashboardPage() {
  const { clientName } = useClientDashboard();
  const [overview, setOverview] = useState<ClientOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    fetchJson<{ overview?: ClientOverviewData; error?: string }>("/api/client/overview")
      .then((data) => {
        setOverview(data.overview ?? null);
      })
      .catch(() => {
        setLoadFailed(true);
        setOverview(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const firstName = overview?.clientName?.split(" ")[0] ?? clientName.split(" ")[0] ?? "there";
  const hasPortfolio = overview?.portfolio?.hasData ?? false;

  return (
    <PageShell className="flex w-full flex-col gap-5">
      <header className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">Welcome back, {firstName}</p>
        {overview?.portfolioLastUpdated ? (
          <Muted className="text-xs">Portfolio last updated {overview.portfolioLastUpdated}</Muted>
        ) : loading ? (
          <Muted className="text-xs">Loading your overview...</Muted>
        ) : hasPortfolio ? null : (
          <Muted className="text-xs">
            Nothing loaded yet. Get in touch with us or your wealth manager to get started.
          </Muted>
        )}
      </header>

      {loadFailed ? (
        <div className="rounded-xl border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          We could not load your latest data right now. You can still reach us below to get set up.
        </div>
      ) : null}

      {loading ? (
        <DashboardLoadingSkeleton />
      ) : (
        <>
          {hasPortfolio && overview?.portfolio ? (
            <ClientOverviewHero
              totalUSD={overview.portfolio.totalUSD}
              ytdPct={overview.portfolio.ytdPct}
              periodGainUsd={overview.portfolio.periodGainUsd}
            />
          ) : (
            <ClientOverviewEmptyHero />
          )}

          {overview?.latestUpdate ? (
            <ClientUpdateNote
              title={overview.latestUpdate.title}
              body={overview.latestUpdate.body}
            />
          ) : null}

          <ClientAttentionCards
            nextSession={overview?.nextSession ?? null}
            pendingDocumentRequest={overview?.pendingDocumentRequest ?? null}
          />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ClientPrimaryGoal goal={overview?.primaryGoal ?? null} />
            <ClientLatestReport report={overview?.latestReport ?? null} />
          </div>
        </>
      )}
    </PageShell>
  );
}
