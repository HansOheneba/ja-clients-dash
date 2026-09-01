"use client";

import { useEffect, useState } from "react";

import {
  ClientAttentionCards,
  ClientUpdateNote,
} from "@/components/clients/client-attention-cards";
import { ClientOverviewHero } from "@/components/clients/client-overview-hero";
import {
  ClientLatestReport,
  ClientPrimaryGoal,
} from "@/components/clients/client-primary-goal";
import { PageShell } from "@/components/layout/page-shell";
import { ClientEmptyState } from "@/components/ui/empty-state";
import {
  DashCard,
  DashCardContent,
} from "@/components/ui/dash-card";
import { Muted } from "@/components/ui/typography";
import type { ClientOverviewData } from "@/lib/wealth/client-overview";

export default function ClientDashboardPage() {
  const [overview, setOverview] = useState<ClientOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/client/overview")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setOverview(d.overview ?? null);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  const firstName = overview?.clientName?.split(" ")[0] ?? "there";

  return (
    <PageShell className="flex max-w-3xl flex-col gap-5">
      <header className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">Welcome back, {firstName}</p>
        {overview?.portfolioLastUpdated ? (
          <Muted className="text-xs">Portfolio last updated {overview.portfolioLastUpdated}</Muted>
        ) : loading ? (
          <Muted className="text-xs">Loading your overview...</Muted>
        ) : (
          <Muted className="text-xs">Your wealth manager is setting up your portfolio</Muted>
        )}
      </header>

      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : null}

      {loading ? (
        <ClientOverviewHero totalUSD={0} ytdPct={0} periodGainUsd={0} loading />
      ) : overview?.portfolio?.hasData ? (
        <ClientOverviewHero
          totalUSD={overview.portfolio.totalUSD}
          ytdPct={overview.portfolio.ytdPct}
          periodGainUsd={overview.portfolio.periodGainUsd}
        />
      ) : (
        <DashCard>
          <DashCardContent>
            <ClientEmptyState
              variant="allocation"
              compact
              title="No portfolio data yet"
              description="Your wealth manager will add your portfolio shortly. Values and performance will appear here once they do."
            />
          </DashCardContent>
        </DashCard>
      )}

      {overview?.latestUpdate ? (
        <ClientUpdateNote
          title={overview.latestUpdate.title}
          body={overview.latestUpdate.body}
        />
      ) : null}

      {!loading && overview ? (
        <ClientAttentionCards
          nextSession={overview.nextSession}
          pendingDocumentRequest={overview.pendingDocumentRequest}
        />
      ) : null}

      {!loading && overview ? (
        <>
          <ClientPrimaryGoal goal={overview.primaryGoal} />
          <ClientLatestReport report={overview.latestReport} />
        </>
      ) : null}
    </PageShell>
  );
}
