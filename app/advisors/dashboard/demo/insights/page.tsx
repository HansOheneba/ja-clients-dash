"use client";

import { Globe, Lock } from "lucide-react";

import { PublishInsightSheet } from "@/components/advisors/publish-insight-sheet";
import { DashboardGrid, PageShell } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DashCard,
  DashCardContent,
  DashCardDescription,
  DashCardHeader,
  DashCardTitle,
} from "@/components/ui/dash-card";
import { KpiItem, KpiStrip } from "@/components/ui/kpi-strip";
import { H1, Muted, TextSmall } from "@/components/ui/typography";
import {
  advisorMarketInsights,
  type InsightCategory,
} from "@/lib/data/advisor-market-insights";

const CATEGORY_COLORS: Record<InsightCategory, string> = {
  Macro: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300",
  Equities: "bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300",
  Property: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
  "Digital Assets": "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300",
  "Fixed Income": "bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300",
  General: "bg-muted text-muted-foreground",
};

export default function AdvisorInsightsPage() {
  const published = advisorMarketInsights.filter((i) => i.status === "published");
  const drafts = advisorMarketInsights.filter((i) => i.status === "draft");

  return (
    <PageShell className="flex flex-col gap-(--spacing-section)">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <H1>Market Insights</H1>
          <Muted>Publish commentary that appears in client portals</Muted>
        </div>
        <PublishInsightSheet />
      </header>

      <KpiStrip>
        <KpiItem
          label="Published"
          value={String(published.length)}
          change="Visible to clients"
          trend="up"
        />
        <KpiItem
          label="Drafts"
          value={String(drafts.length)}
          change="Awaiting publication"
          trend="neutral"
        />
        <KpiItem
          label="Audience"
          value={String(published.filter((i) => i.targetAudience === "all").length)}
          change="Sent to all clients"
          trend="neutral"
        />
        <KpiItem
          label="Targeted"
          value={String(published.filter((i) => i.targetAudience === "select").length)}
          change="Select clients only"
          trend="neutral"
        />
      </KpiStrip>

      <DashboardGrid>
        <DashCard span="full">
          <DashCardHeader>
            <div>
              <DashCardTitle>Published Insights</DashCardTitle>
              <DashCardDescription>
                Live in client portals. Clients see these in their Market Insights tab.
              </DashCardDescription>
            </div>
          </DashCardHeader>
          <DashCardContent className="gap-5">
            {published.map((insight) => (
              <div
                key={insight.id}
                className="flex flex-col gap-3 border-b border-border/60 pb-5 last:border-0 last:pb-0"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-md px-2 py-0.5 text-xs font-medium ${CATEGORY_COLORS[insight.category]}`}
                    >
                      {insight.category}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Globe className="size-3" />
                      {insight.targetAudience === "all" ? "All clients" : "Select clients"}
                    </div>
                  </div>
                  <Muted className="text-xs">{insight.publishedAt}</Muted>
                </div>
                <TextSmall className="font-semibold leading-snug">{insight.title}</TextSmall>
                <TextSmall className="text-muted-foreground leading-relaxed">
                  {insight.summary}
                </TextSmall>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                    Unpublish
                  </Button>
                </div>
              </div>
            ))}
          </DashCardContent>
        </DashCard>

        {drafts.length > 0 && (
          <DashCard span="full">
            <DashCardHeader>
              <div>
                <DashCardTitle>Drafts</DashCardTitle>
                <DashCardDescription>
                  Not yet visible to clients. Review and publish when ready.
                </DashCardDescription>
              </div>
            </DashCardHeader>
            <DashCardContent className="gap-5">
              {drafts.map((insight) => (
                <div
                  key={insight.id}
                  className="flex flex-col gap-3 rounded-lg border border-dashed border-border/80 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-md px-2 py-0.5 text-xs font-medium ${CATEGORY_COLORS[insight.category]}`}
                      >
                        {insight.category}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Lock className="size-3" />
                        Draft
                      </div>
                    </div>
                  </div>
                  <TextSmall className="font-semibold leading-snug">{insight.title}</TextSmall>
                  <TextSmall className="text-muted-foreground leading-relaxed">
                    {insight.summary}
                  </TextSmall>
                  <div className="flex gap-2">
                    <Button size="sm">Publish</Button>
                    <Button variant="outline" size="sm">
                      Edit draft
                    </Button>
                  </div>
                </div>
              ))}
            </DashCardContent>
          </DashCard>
        )}
      </DashboardGrid>
    </PageShell>
  );
}
