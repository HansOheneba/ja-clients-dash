"use client";

import { ArrowUpRight, Calendar } from "lucide-react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { DashboardGrid, PageShell } from "@/components/layout/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DashCard,
  DashCardContent,
  DashCardDescription,
  DashCardHeader,
  DashCardMetric,
  DashCardTitle,
} from "@/components/ui/dash-card";
import { H1, Muted, TextSmall } from "@/components/ui/typography";
import { ClientDate } from "@/components/ui/client-date";

function OverviewContent() {
  return (
    <DashboardShell>
      <PageShell className="flex flex-col gap-(--spacing-section)">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-1">
            <H1>Welcome back, Lois</H1>
            <ClientDate />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              <Calendar />
              Schedule
            </Button>
            <Button size="sm">Share Report</Button>
          </div>
        </header>

        <DashboardGrid>
          <DashCard>
            <DashCardHeader>
              <div>
                <DashCardTitle>Total Net Worth</DashCardTitle>
                <DashCardDescription>
                  Across all JA Wealth managed assets
                </DashCardDescription>
              </div>
              <Badge variant="secondary">+4.2% this quarter</Badge>
            </DashCardHeader>
            <DashCardContent>
              <DashCardMetric>£3,318,930.86</DashCardMetric>
              <div className="mt-6 flex h-32 items-end gap-1.5">
                {[40, 55, 45, 70, 60, 85, 75].map((height, index) => (
                  <div
                    key={index}
                    className="flex-1 rounded-md bg-brand-accent/80"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
            </DashCardContent>
          </DashCard>

          <DashCard>
            <DashCardHeader>
              <DashCardTitle>Legacy Planning</DashCardTitle>
            </DashCardHeader>
            <DashCardContent className="gap-3">
              <div className="flex items-center justify-between">
                <TextSmall>Estate plan review</TextSmall>
                <Badge>In progress</Badge>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-3/5 rounded-full bg-brand-accent" />
              </div>
              <TextSmall className="text-muted-foreground">
                60% complete. Next step with your advisor.
              </TextSmall>
            </DashCardContent>
          </DashCard>

          <DashCard>
            <DashCardHeader>
              <DashCardTitle>JA Wealth</DashCardTitle>
              <ArrowUpRight className="size-4 text-muted-foreground" />
            </DashCardHeader>
            <DashCardContent>
              <DashCardMetric>£1,240,000</DashCardMetric>
              <TextSmall className="mt-1 text-muted-foreground">
                42% of portfolio
              </TextSmall>
            </DashCardContent>
          </DashCard>

          <DashCard>
            <DashCardHeader>
              <DashCardTitle>JA Realty</DashCardTitle>
              <ArrowUpRight className="size-4 text-muted-foreground" />
            </DashCardHeader>
            <DashCardContent>
              <DashCardMetric>£826,000</DashCardMetric>
              <TextSmall className="mt-1 text-muted-foreground">
                28% of portfolio
              </TextSmall>
            </DashCardContent>
          </DashCard>

          <DashCard>
            <DashCardHeader>
              <DashCardTitle>JA Digital</DashCardTitle>
              <ArrowUpRight className="size-4 text-muted-foreground" />
            </DashCardHeader>
            <DashCardContent>
              <DashCardMetric>£531,000</DashCardMetric>
              <TextSmall className="mt-1 text-muted-foreground">
                18% of portfolio
              </TextSmall>
            </DashCardContent>
          </DashCard>

          <DashCard>
            <DashCardHeader>
              <DashCardTitle>Pending Requests</DashCardTitle>
            </DashCardHeader>
            <DashCardContent>
              <DashCardMetric>2</DashCardMetric>
              <TextSmall className="mt-1 text-muted-foreground">
                Succession review, offshore banking
              </TextSmall>
            </DashCardContent>
          </DashCard>

          <DashCard span="full">
            <DashCardHeader>
              <div>
                <DashCardTitle>Recent Activity</DashCardTitle>
                <DashCardDescription>
                  Latest updates across your JA Wealth services
                </DashCardDescription>
              </div>
            </DashCardHeader>
            <DashCardContent className="gap-4">
              {[
                {
                  title: "Quarterly portfolio review completed",
                  date: "3 days ago",
                },
                {
                  title: "New document uploaded: Trust deed amendment",
                  date: "1 week ago",
                },
                {
                  title: "Advisor meeting scheduled for succession planning",
                  date: "2 weeks ago",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex items-center justify-between border-b border-border/60 pb-4 last:border-0 last:pb-0"
                >
                  <TextSmall>{item.title}</TextSmall>
                  <Muted>{item.date}</Muted>
                </div>
              ))}
            </DashCardContent>
          </DashCard>
        </DashboardGrid>
      </PageShell>
    </DashboardShell>
  );
}

export { OverviewContent };
