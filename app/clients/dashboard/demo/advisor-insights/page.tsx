"use client";

import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  Check,
  Mail,
  MessageSquare,
  Minus,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

import { PageShell } from "@/components/layout/page-shell";
import { Button, buttonVariants } from "@/components/ui/button";
import { H1, H2, H3, H4, Lead, Muted, Overline, TextSmall } from "@/components/ui/typography";
import {
  advisorActivity,
  advisorNotes,
  advisorRelationship,
  getInsightsSummaryFromData,
  recommendations,
  type PortfolioImpact,
  type Recommendation,
} from "@/lib/data/advisor-insights";
import { cn } from "@/lib/utils";

const STATUS_CHART_COLORS = {
  pending: "#c9a227",
  implemented: "#5a7d5a",
  declined: "#9ca3af",
};

function parseActivityDate(date: string): number {
  const parsed = Date.parse(date.replace(/(\d{1,2}) (\w{3}) (\d{4})/, "$2 $1, $3"));
  return Number.isNaN(parsed) ? 0 : parsed;
}

function OutcomeIndicator({ label, value }: { label: string; value: PortfolioImpact["projectedRisk"] }) {
  const Icon =
    value === "Lower" ? TrendingDown : value === "Higher" ? TrendingUp : Minus;
  const tone =
    value === "Lower"
      ? "text-emerald-700"
      : value === "Higher"
        ? "text-amber-700"
        : "text-muted-foreground";

  return (
    <div className="flex flex-col gap-1">
      <Overline>{label}</Overline>
      <span className={cn("inline-flex items-center gap-1.5 text-body-sm font-medium", tone)}>
        <Icon className="size-3.5 shrink-0" />
        {value}
      </span>
    </div>
  );
}

function PortfolioImpactBlock({ impact }: { impact: PortfolioImpact }) {
  return (
    <div className="mt-6 rounded-xl bg-muted/30 px-5 py-4">
      <Overline className="mb-3 block">Expected portfolio impact</Overline>
      <ul className="mb-5 flex flex-col gap-2">
        {impact.benefits.map((benefit) => (
          <li key={benefit} className="flex items-start gap-2 text-body-sm text-foreground">
            <Check className="mt-0.5 size-3.5 shrink-0 text-brand-accent" />
            {benefit}
          </li>
        ))}
      </ul>
      <div className="grid grid-cols-1 gap-4 border-t border-border/40 pt-4 sm:grid-cols-3">
        <OutcomeIndicator label="Projected risk" value={impact.projectedRisk} />
        <OutcomeIndicator label="Projected return" value={impact.projectedReturn} />
        <div className="flex flex-col gap-1">
          <Overline>Time horizon</Overline>
          <TextSmall className="font-medium">{impact.timeHorizon}</TextSmall>
        </div>
      </div>
    </div>
  );
}

function PendingActionCard({ rec }: { rec: Recommendation }) {
  return (
    <article className="rounded-2xl border border-border/30 bg-card px-6 py-7 shadow-sm sm:px-8 sm:py-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <Overline className="mb-2 block text-amber-700/80">Requires your attention</Overline>
          <H3 className="text-[1.35rem] leading-snug">{rec.title}</H3>
          <Muted className="mt-1.5 text-body-sm">Recommended {rec.date}</Muted>
        </div>
      </div>

      <Lead className="mt-5 max-w-3xl text-foreground/80">{rec.rationale}</Lead>

      {rec.impact ? <PortfolioImpactBlock impact={rec.impact} /> : null}

      <div className="mt-7 flex flex-wrap gap-3">
        <Button size="default">Accept</Button>
        <Button size="default" variant="outline">
          Discuss
        </Button>
        <Button size="default" variant="ghost">
          Decline
        </Button>
      </div>
    </article>
  );
}

function RecommendationStatusPanel() {
  const summary = getInsightsSummaryFromData();
  const chartData = [
    { name: "Pending", value: summary.pendingCount, color: STATUS_CHART_COLORS.pending },
    { name: "Implemented", value: summary.implementedCount, color: STATUS_CHART_COLORS.implemented },
    { name: "Declined", value: summary.declinedCount, color: STATUS_CHART_COLORS.declined },
  ].filter((d) => d.value > 0);

  return (
    <aside className="rounded-2xl border border-border/25 bg-card px-6 py-6">
      <H4 className="mb-1">Recommendations</H4>
      <Muted className="text-body-sm">Your response history</Muted>

      <div className="relative mx-auto mt-4 h-36 w-full max-w-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={42}
              outerRadius={62}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-numeric text-2xl font-bold leading-none">{summary.completionRatePct}%</span>
          <span className="mt-1 text-overline text-muted-foreground">Complete</span>
        </div>
      </div>

      <dl className="mt-5 flex flex-col gap-3 border-t border-border/40 pt-5">
        {chartData.map((item) => (
          <div key={item.name} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <TextSmall>{item.name}</TextSmall>
            </div>
            <TextSmall className="font-semibold tabular-nums">{item.value}</TextSmall>
          </div>
        ))}
      </dl>
    </aside>
  );
}

function RelationshipPanel() {
  const advisor = advisorRelationship;

  return (
    <aside className="rounded-2xl border border-border/25 bg-linear-to-b from-card to-muted/20 px-6 py-7">
      <Overline className="mb-5 block">Your advisor</Overline>

      <div className="flex items-center gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-brand-primary text-lg font-semibold text-white">
          {advisor.name
            .split(" ")
            .map((part) => part[0])
            .join("")}
        </div>
        <div>
          <H4>{advisor.name}</H4>
          <Muted className="text-body-sm">{advisor.title}</Muted>
        </div>
      </div>

      <dl className="mt-7 flex flex-col gap-5">
        <div>
          <Overline className="mb-1.5 block">Next meeting</Overline>
          <div className="flex items-start gap-2">
            <Calendar className="mt-0.5 size-4 shrink-0 text-brand-accent" />
            <div>
              <TextSmall className="font-semibold">{advisor.nextMeetingDate}</TextSmall>
              <Muted className="text-body-sm">{advisor.nextMeetingType}</Muted>
            </div>
          </div>
        </div>
        <div>
          <Overline className="mb-1.5 block">Preferred contact</Overline>
          <div className="flex items-center gap-2">
            <Mail className="size-4 shrink-0 text-brand-accent" />
            <TextSmall className="font-medium">{advisor.email}</TextSmall>
          </div>
        </div>
      </dl>

      <div className="mt-7 flex flex-col gap-2.5">
        <Link
          href="/clients/dashboard/messages"
          className={cn(buttonVariants({ size: "default" }), "w-full justify-center gap-2")}
        >
          <MessageSquare className="size-4" />
          Message advisor
        </Link>
        <Link
          href="/clients/dashboard/demo/sessions"
          className={cn(buttonVariants({ variant: "outline", size: "default" }), "w-full justify-center")}
        >
          Schedule session
        </Link>
      </div>
    </aside>
  );
}

function ActivityTimeline() {
  const items = [...advisorActivity].sort(
    (a, b) => parseActivityDate(b.date) - parseActivityDate(a.date),
  );

  return (
    <section>
      <H2 className="mb-6">Advisor activity</H2>
      <div className="relative pl-1">
        <div className="absolute bottom-2 left-[5px] top-2 w-px bg-border/60" aria-hidden />
        <ul className="flex flex-col gap-0">
          {items.map((item, index) => (
            <li key={item.id} className="relative flex gap-5 pb-7 last:pb-0">
              <span
                className={cn(
                  "relative z-10 mt-1.5 size-[11px] shrink-0 rounded-full border-2 border-card",
                  index === 0 ? "bg-brand-accent" : "bg-muted-foreground/35",
                )}
              />
              <div className="min-w-0 flex-1 pt-0.5">
                <Overline className="mb-1 block">{item.date}</Overline>
                <TextSmall className="font-medium leading-snug">{item.label}</TextSmall>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function ArchivedRecommendationRow({ rec }: { rec: Recommendation }) {
  const statusLabel =
    rec.status === "implemented" ? "Implemented" : rec.status === "declined" ? "Declined" : "Pending";

  return (
    <div className="flex flex-col gap-1 border-b border-border/30 py-4 last:border-0 sm:flex-row sm:items-baseline sm:justify-between">
      <div className="min-w-0">
        <TextSmall className="font-medium text-foreground/85">{rec.title}</TextSmall>
        <Muted className="text-body-sm">{rec.date}</Muted>
      </div>
      <span
        className={cn(
          "shrink-0 text-caption font-medium",
          rec.status === "implemented" && "text-emerald-700",
          rec.status === "declined" && "text-muted-foreground",
        )}
      >
        {statusLabel}
      </span>
    </div>
  );
}

export default function AdvisorInsightsPage() {
  const summary = getInsightsSummaryFromData();
  const pendingRecs = recommendations.filter((r) => r.status === "pending-acknowledgement");
  const archivedRecs = recommendations.filter((r) => r.status !== "pending-acknowledgement");
  const featuredNote = advisorNotes.find((n) => n.featured) ?? advisorNotes[0];
  const secondaryNotes = advisorNotes.filter((n) => n.id !== featuredNote?.id);

  const portfolioWord = summary.portfolioUpdateCount === 1 ? "update" : "updates";
  const recommendationWord = summary.pendingCount === 1 ? "recommendation" : "recommendations";

  return (
    <PageShell className="flex flex-col gap-10 lg:gap-12">
      {/* Executive summary */}
      <section className="rounded-2xl border border-border/20 bg-linear-to-br from-card via-card to-muted/15 px-6 py-8 sm:px-10 sm:py-10">
        <H1 className="mb-3">Advisor Insights</H1>
        <Lead className="max-w-2xl text-[1.05rem] leading-relaxed text-foreground/75">
          Your advisor has shared{" "}
          <span className="font-medium text-foreground">
            {summary.pendingCount} {recommendationWord}
          </span>{" "}
          and{" "}
          <span className="font-medium text-foreground">
            {summary.portfolioUpdateCount} portfolio {portfolioWord}
          </span>
          .
        </Lead>
        <div className="mt-6 flex flex-wrap gap-3">
          <span className="inline-flex items-center rounded-full border border-amber-200/60 bg-amber-50/80 px-4 py-2 text-body-sm font-medium text-amber-900">
            {summary.pendingCount} Pending
          </span>
          <span className="inline-flex items-center rounded-full border border-emerald-200/50 bg-emerald-50/60 px-4 py-2 text-body-sm font-medium text-emerald-900">
            {summary.implementedCount} Implemented
          </span>
          <span className="inline-flex items-center rounded-full border border-border/40 bg-background/80 px-4 py-2 text-body-sm font-medium text-foreground/80">
            Next review: {summary.nextReviewDate}
          </span>
        </div>
      </section>

      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-12">
        {/* Main column */}
        <div className="flex min-w-0 flex-col gap-12 lg:gap-14">
          {/* Priority actions */}
          <section>
            <H2 className="mb-2">Requires your attention</H2>
            <Muted className="mb-7 max-w-xl">
              Recommendations awaiting your decision. Review expected impact before responding.
            </Muted>
            <div className="flex flex-col gap-6">
              {pendingRecs.map((rec) => (
                <PendingActionCard key={rec.id} rec={rec} />
              ))}
            </div>
          </section>

          {/* Activity timeline */}
          <ActivityTimeline />

          {/* Featured market commentary */}
          {featuredNote ? (
            <section>
              <H2 className="mb-6">Market commentary</H2>
              <article className="rounded-2xl border border-border/25 bg-card px-7 py-8 shadow-sm sm:px-9 sm:py-9">
                <Overline className="mb-3 block">{featuredNote.type}</Overline>
                <H3 className="mb-2 text-[1.4rem]">{featuredNote.subject}</H3>
                <Muted className="mb-5 text-body-sm">
                  {featuredNote.advisor} · {featuredNote.date}
                </Muted>
                <Lead className="max-w-3xl leading-relaxed text-foreground/80">
                  {featuredNote.body}
                </Lead>
                <Button variant="ghost" className="mt-6 gap-2 px-0 text-brand-primary hover:bg-transparent">
                  Read full commentary
                  <ArrowRight className="size-4" />
                </Button>
              </article>

              {secondaryNotes.length > 0 ? (
                <div className="mt-6 flex flex-col gap-4">
                  {secondaryNotes.map((note) => (
                    <div
                      key={note.id}
                      className="rounded-xl border border-border/20 bg-muted/15 px-5 py-4"
                    >
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                        <TextSmall className="font-medium">{note.subject}</TextSmall>
                        <Muted className="shrink-0 text-body-sm">
                          {note.date} · {note.type}
                        </Muted>
                      </div>
                      <Muted className="mt-2 line-clamp-2 text-body-sm leading-relaxed">
                        {note.body}
                      </Muted>
                    </div>
                  ))}
                </div>
              ) : null}
            </section>
          ) : null}

          {/* Archived recommendations */}
          <section>
            <H2 className="mb-2">Recommendation history</H2>
            <Muted className="mb-5">Previously addressed recommendations from your advisor.</Muted>
            <div className="rounded-xl border border-border/20 bg-muted/10 px-5 sm:px-6">
              {archivedRecs.map((rec) => (
                <ArchivedRecommendationRow key={rec.id} rec={rec} />
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-6 lg:sticky lg:top-8">
          <RelationshipPanel />
          <RecommendationStatusPanel />
        </div>
      </div>
    </PageShell>
  );
}
