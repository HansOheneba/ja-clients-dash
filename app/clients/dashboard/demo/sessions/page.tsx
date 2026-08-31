"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronUp,
  Download,
  ExternalLink,
  FileText,
  Mail,
  MessageSquare,
  Video,
} from "lucide-react";

import { PageShell } from "@/components/layout/page-shell";
import { Button, buttonVariants } from "@/components/ui/button";
import { H1, H2, H3, H4, Lead, Muted, Overline, TextSmall } from "@/components/ui/typography";
import {
  advisoryIntents,
  DOMAIN_LABEL,
  getSessionsOverview,
  pastSessions,
  sessionTypes,
  upcomingSessions,
  type AdvisoryDomain,
  type PastSession,
  type Session,
} from "@/lib/data/sessions";
import { cn } from "@/lib/utils";

const DOMAIN_TONE: Record<AdvisoryDomain, string> = {
  portfolio: "border-brand-primary/30 bg-brand-primary/5 text-brand-primary",
  legacy: "border-amber-200/60 bg-amber-50/70 text-amber-900",
  tax: "border-slate-200/60 bg-slate-50/70 text-slate-800",
  concierge: "border-brand-accent/30 bg-brand-accent/8 text-brand-accent",
  general: "border-border/40 bg-muted/30 text-foreground/80",
};

function SessionOverviewHero() {
  const overview = getSessionsOverview();

  return (
    <section className="rounded-2xl border border-border/20 bg-linear-to-br from-card via-card to-muted/15 px-6 py-8 sm:px-10 sm:py-10">
      <H1 className="mb-3">Advisory Sessions</H1>
      <Lead className="max-w-2xl text-[1.05rem] leading-relaxed text-foreground/75">
        Your advisory relationship timeline. Upcoming decisions, preparation guidance, and
        outcomes from past sessions.
      </Lead>

      <div className="mt-6 flex flex-wrap gap-3">
        <span className="inline-flex items-center rounded-full border border-border/40 bg-background/80 px-4 py-2 text-body-sm font-medium">
          Next: {overview.nextSessionType}
        </span>
        <span className="inline-flex items-center rounded-full border border-border/40 bg-background/80 px-4 py-2 text-body-sm font-medium">
          {overview.upcomingCount} Upcoming
        </span>
        {overview.preparationCount > 0 ? (
          <span className="inline-flex items-center rounded-full border border-amber-200/60 bg-amber-50/80 px-4 py-2 text-body-sm font-medium text-amber-900">
            {overview.preparationCount} Require preparation
          </span>
        ) : null}
        <span className="inline-flex items-center rounded-full border border-border/40 bg-background/80 px-4 py-2 text-body-sm font-medium text-foreground/80">
          {overview.nextSessionDate}
        </span>
      </div>

      <div className="mt-8 border-t border-border/30 pt-6">
        <Overline className="mb-2 block">Last advisory outcome</Overline>
        <TextSmall className="max-w-3xl leading-relaxed text-foreground/85">
          {overview.lastOutcome}
        </TextSmall>
      </div>
    </section>
  );
}

function DomainBadge({ domain }: { domain: AdvisoryDomain }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 rounded-full border px-3 py-1 text-caption font-medium",
        DOMAIN_TONE[domain],
      )}
    >
      {DOMAIN_LABEL[domain]}
    </span>
  );
}

function UpcomingSessionCard({
  session,
  emphasis = "default",
}: {
  session: Session;
  emphasis?: "preparation" | "default";
}) {
  const domain = session.domain ?? "general";

  return (
    <article
      className={cn(
        "rounded-2xl border px-6 py-7 sm:px-8",
        emphasis === "preparation" && "border-amber-200/50 bg-amber-50/35",
        emphasis === "default" && "border-border/30 bg-card shadow-sm",
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          {emphasis === "preparation" ? (
            <Overline className="mb-2 block text-amber-800/90">Requires preparation</Overline>
          ) : null}
          <H3 className="text-[1.2rem] leading-snug">{session.type}</H3>
          <Muted className="mt-1.5 text-body-sm">
            {session.advisor} · {session.date}, {session.time}
          </Muted>
          <Muted className="mt-0.5 text-body-sm">{session.format}</Muted>
        </div>
        <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
          <DomainBadge domain={domain} />
          <span
            className={cn(
              "text-caption font-semibold uppercase tracking-wide",
              session.status === "Confirmed" ? "text-emerald-700" : "text-amber-700",
            )}
          >
            {session.status}
          </span>
        </div>
      </div>

      {session.purpose ? (
        <div className="mt-5">
          <Overline className="mb-1.5 block">Purpose</Overline>
          <TextSmall className="leading-relaxed text-foreground/85">{session.purpose}</TextSmall>
        </div>
      ) : null}

      {session.expectedOutcome ? (
        <div className="mt-4 rounded-xl bg-background/60 px-4 py-3.5">
          <Overline className="mb-1 block">Expected outcome</Overline>
          <TextSmall className="font-medium leading-snug">{session.expectedOutcome}</TextSmall>
        </div>
      ) : null}

      {session.preparationNotes ? (
        <div className="mt-4">
          <Overline className="mb-1.5 block">Prepare before session</Overline>
          <TextSmall className="leading-relaxed text-muted-foreground">
            {session.preparationNotes}
          </TextSmall>
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-2">
        {session.joinUrl ? (
          <a
            href={session.joinUrl}
            target="_blank"
            rel="noreferrer"
            className={buttonVariants({ size: "sm" })}
          >
            <Video className="size-4" />
            Join Zoom
            <ExternalLink className="size-3" />
          </a>
        ) : null}
        <Button variant="outline" size="sm">
          <CalendarDays className="size-4" />
          Add to calendar
        </Button>
        <Button variant="ghost" size="sm">
          Reschedule
        </Button>
        <Button variant="ghost" size="sm" className="text-destructive">
          Cancel
        </Button>
      </div>
    </article>
  );
}

function OutcomeCard({ session }: { session: PastSession }) {
  const [expanded, setExpanded] = useState(false);
  const domain = session.domain ?? "general";
  const hasDetail =
    (session.decisions?.length ?? 0) > 0 ||
    (session.actionsTriggered?.length ?? 0) > 0 ||
    (session.changes?.length ?? 0) > 0;

  return (
    <article className="rounded-xl border border-border/20 bg-card px-5 py-5 sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <DomainBadge domain={domain} />
            <Overline>{session.date}</Overline>
          </div>
          <TextSmall className="font-semibold">{session.type}</TextSmall>
          <Muted className="mt-2 text-body-sm leading-relaxed">
            {session.advisorSummary ?? session.outcome}
          </Muted>
        </div>
        {session.hasMinutes ? (
          <Button variant="outline" size="sm" className="shrink-0 gap-1.5">
            <Download className="size-3.5" />
            Minutes
          </Button>
        ) : null}
      </div>

      {hasDetail ? (
        <>
          <Button
            variant="ghost"
            size="sm"
            className="mt-4 gap-2 px-0 text-brand-primary hover:bg-transparent"
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? "Hide outcome details" : "View decisions and changes"}
            {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </Button>

          {expanded ? (
            <div className="mt-4 grid grid-cols-1 gap-5 border-t border-border/30 pt-5 sm:grid-cols-3">
              {session.decisions && session.decisions.length > 0 ? (
                <div>
                  <Overline className="mb-2 block">Decisions made</Overline>
                  <ul className="flex flex-col gap-2">
                    {session.decisions.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-body-sm">
                        <Check className="mt-0.5 size-3.5 shrink-0 text-brand-accent" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {session.actionsTriggered && session.actionsTriggered.length > 0 ? (
                <div>
                  <Overline className="mb-2 block">Actions triggered</Overline>
                  <ul className="flex flex-col gap-2">
                    {session.actionsTriggered.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-body-sm">
                        <ArrowRight className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {session.changes && session.changes.length > 0 ? (
                <div>
                  <Overline className="mb-2 block">What changed</Overline>
                  <ul className="flex flex-col gap-2">
                    {session.changes.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-body-sm text-muted-foreground">
                        <FileText className="mt-0.5 size-3.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}
        </>
      ) : null}
    </article>
  );
}

function AdvisorPanel() {
  const overview = getSessionsOverview();

  return (
    <aside className="rounded-2xl border border-border/25 bg-linear-to-b from-card to-muted/20 px-6 py-7">
      <Overline className="mb-5 block">Your advisor</Overline>

      <div className="flex items-center gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-brand-primary text-lg font-semibold text-white">
          JA
        </div>
        <div>
          <H4>{overview.advisorName}</H4>
          <Muted className="text-body-sm">Senior Wealth Advisor</Muted>
        </div>
      </div>

      <Muted className="mt-5 text-body-sm leading-relaxed">
        Jude Addo leads your advisory sessions and coordinates outcomes across portfolio, legacy,
        and planning workstreams.
      </Muted>

      <div className="mt-6 flex flex-col gap-2.5">
        <Link
          href="/clients/dashboard/messages"
          className={cn(buttonVariants({ size: "default" }), "w-full justify-center gap-2")}
        >
          <MessageSquare className="size-4" />
          Message advisor
        </Link>
        <Link
          href="/clients/dashboard/demo/advisor-insights"
          className={cn(buttonVariants({ variant: "outline", size: "default" }), "w-full justify-center")}
        >
          View advisor insights
        </Link>
      </div>

      <div className="mt-7 border-t border-border/30 pt-5">
        <Overline className="mb-2 block">Advisor email</Overline>
        <div className="flex items-center gap-2">
          <Mail className="size-4 shrink-0 text-brand-accent" />
          <TextSmall className="font-medium">jude.addo@jawealth.co</TextSmall>
        </div>
      </div>
    </aside>
  );
}

function RequestAdvisorySection() {
  const [showAllTypes, setShowAllTypes] = useState(false);

  return (
    <section>
      <H2 className="mb-2">Request advisory support</H2>
      <Muted className="mb-7 max-w-xl">
        Describe what you need to decide. Your advisor will schedule the right session type.
      </Muted>

      <div className="overflow-hidden rounded-2xl border border-border/25 bg-card divide-y divide-border/20">
        {advisoryIntents.map((intent) => (
          <button
            key={intent.id}
            type="button"
            className="group flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/25 sm:px-6 sm:py-5"
          >
            <div className="min-w-0 flex-1">
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                <TextSmall className="font-semibold">{intent.label}</TextSmall>
                <DomainBadge domain={intent.domain} />
              </div>
              <Muted className="text-body-sm">{intent.description}</Muted>
              <Muted className="mt-1 text-caption">Maps to: {intent.sessionType}</Muted>
            </div>
            <span className="hidden shrink-0 text-body-sm font-medium text-brand-primary sm:inline">
              Request session
            </span>
            <ArrowRight className="size-4 shrink-0 text-muted-foreground/40 group-hover:text-brand-primary" />
          </button>
        ))}
      </div>

      <div className="mt-5">
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 px-0 text-muted-foreground hover:bg-transparent"
          onClick={() => setShowAllTypes((v) => !v)}
        >
          {showAllTypes ? "Hide all session types" : `View all ${sessionTypes.length} session types`}
          {showAllTypes ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </Button>

        {showAllTypes ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {sessionTypes.map((type) => (
              <button
                key={type}
                type="button"
                className="rounded-full border border-border/40 bg-muted/20 px-3.5 py-1.5 text-caption font-medium transition-colors hover:border-brand-primary/30 hover:bg-muted/40"
              >
                {type}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default function SessionsPage() {
  const preparationSessions = upcomingSessions.filter((s) => s.requiresPreparation);
  const otherUpcoming = upcomingSessions.filter((s) => !s.requiresPreparation);

  return (
    <PageShell className="flex flex-col gap-10 lg:gap-12">
      <SessionOverviewHero />

      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-12">
        <div className="order-2 flex min-w-0 flex-col gap-12 lg:order-1 lg:gap-14">
          {preparationSessions.length > 0 ? (
            <section>
              <H2 className="mb-2">Requires preparation</H2>
              <Muted className="mb-7 max-w-xl">
                Upcoming advisory sessions with decisions to prepare for.
              </Muted>
              <div className="flex flex-col gap-5">
                {preparationSessions.map((session) => (
                  <UpcomingSessionCard key={session.id} session={session} emphasis="preparation" />
                ))}
              </div>
            </section>
          ) : null}

          {otherUpcoming.length > 0 ? (
            <section>
              <H2 className="mb-2">Upcoming sessions</H2>
              <Muted className="mb-7 max-w-xl">Confirmed advisory meetings on your calendar.</Muted>
              <div className="flex flex-col gap-5">
                {otherUpcoming.map((session) => (
                  <UpcomingSessionCard key={session.id} session={session} emphasis="default" />
                ))}
              </div>
            </section>
          ) : null}

          {preparationSessions.length === 0 && otherUpcoming.length === 0 ? (
            <section>
              <H2 className="mb-2">Upcoming sessions</H2>
              <Muted className="rounded-xl border border-border/20 bg-muted/10 px-5 py-6">
                No upcoming sessions scheduled. Request advisory support below.
              </Muted>
            </section>
          ) : null}

          <section>
            <H2 className="mb-2">Advisory outcomes</H2>
            <Muted className="mb-7 max-w-xl">
              Decisions, actions, and changes from past advisory sessions.
            </Muted>
            <div className="flex flex-col gap-4">
              {pastSessions.map((session) => (
                <OutcomeCard key={session.id} session={session} />
              ))}
            </div>
          </section>

          <RequestAdvisorySection />
        </div>

        <div className="order-1 flex flex-col gap-6 lg:order-2 lg:sticky lg:top-8">
          <AdvisorPanel />
        </div>
      </div>
    </PageShell>
  );
}
