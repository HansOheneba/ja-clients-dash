"use client";

import { Bookmark, Download } from "lucide-react";

import { PageShell } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DashCard, DashCardContent, DashCardDescription, DashCardHeader, DashCardTitle,
} from "@/components/ui/dash-card";
import { H1, Muted, TextSmall } from "@/components/ui/typography";
import { marketInsights, TYPE_LABEL } from "@/lib/data/market-insights";

export default function MarketInsightsPage() {
  return (
    <PageShell className="flex flex-col gap-(--spacing-section)">
      <header className="flex flex-col gap-1">
        <H1>Market Insights</H1>
        <Muted>JA Wealth house views, research, and curated commentary. Updated regularly.</Muted>
      </header>

      <div className="flex flex-col gap-(--spacing-grid)">
        {marketInsights.map(insight => (
          <DashCard key={insight.id}>
            <DashCardHeader>
              <div>
                <div className="mb-2 flex flex-wrap gap-2">
                  <Badge variant="secondary">{insight.tag}</Badge>
                  <Badge variant="outline">{TYPE_LABEL[insight.type]}</Badge>
                </div>
                <DashCardTitle>{insight.title}</DashCardTitle>
                <DashCardDescription>
                  {insight.date} · {insight.readTimeMin} min read
                </DashCardDescription>
              </div>
            </DashCardHeader>
            <DashCardContent>
              <TextSmall className="leading-relaxed text-muted-foreground">{insight.preview}</TextSmall>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="outline" size="sm">Read full article</Button>
                <Button variant="ghost" size="sm">
                  <Bookmark className="size-3.5" />
                  Save
                </Button>
                {insight.hasDownload && (
                  <Button variant="ghost" size="sm">
                    <Download className="size-3.5" />
                    Download
                  </Button>
                )}
              </div>
            </DashCardContent>
          </DashCard>
        ))}
      </div>
    </PageShell>
  );
}
