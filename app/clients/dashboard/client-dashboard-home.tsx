"use client";

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
import type { ClientOverviewData } from "@/lib/wealth/client-overview";

export function ClientDashboardHome({
  overview,
  clientName,
}: {
  overview: ClientOverviewData | null;
  clientName: string;
}) {
  const firstName = overview?.clientName?.split(" ")[0] ?? clientName.split(" ")[0] ?? "there";
  const hasPortfolio = overview?.portfolio?.hasData ?? false;

  return (
    <PageShell className="flex w-full flex-col gap-5">
      <header className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">Welcome back, {firstName}</p>
        {overview?.portfolioLastUpdated ? (
          <Muted className="text-xs">Portfolio last updated {overview.portfolioLastUpdated}</Muted>
        ) : hasPortfolio ? null : (
          <Muted className="text-xs">
            Nothing loaded yet. Get in touch with us or your wealth manager to get started.
          </Muted>
        )}
      </header>

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
    </PageShell>
  );
}
