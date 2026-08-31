"use client";

import Link from "next/link";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  XCircle,
} from "lucide-react";
import { useState } from "react";

import { ScheduleSessionSheet } from "@/components/advisors/schedule-session-sheet";
import { PageShell } from "@/components/layout/page-shell";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { H1, H2, Lead, Muted, Overline, TextSmall } from "@/components/ui/typography";
import { advisorSessions, type AdvisorSession, type SessionStatus } from "@/lib/data/advisor-sessions";
import { cn } from "@/lib/utils";

const STATUS_ICON: Record<SessionStatus, React.ElementType> = {
  upcoming: Clock,
  completed: CheckCircle2,
  cancelled: XCircle,
};

function AdvisorSessionsOverview() {
  const upcoming = advisorSessions.filter((s) => s.status === "upcoming");
  const next = upcoming[0];
  const prepCount = upcoming.filter((s) => s.agenda).length;

  return (
    <section className="rounded-2xl border border-border/20 bg-linear-to-br from-card via-card to-muted/15 px-6 py-8 sm:px-10 sm:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <H1 className="mb-3">Advisory Sessions</H1>
          <Lead className="max-w-2xl text-foreground/75">
            Firm-wide advisory calendar. Manage preparation, outcomes, and client decisions across your book.
          </Lead>
          <div className="mt-5 flex flex-wrap gap-3">
            <span className="rounded-full border border-border/40 bg-background/80 px-4 py-2 text-body-sm font-medium">
              {upcoming.length} Upcoming
            </span>
            <span className="rounded-full border border-border/40 bg-background/80 px-4 py-2 text-body-sm font-medium">
              {prepCount} With agenda set
            </span>
            {next ? (
              <span className="rounded-full border border-border/40 bg-background/80 px-4 py-2 text-body-sm font-medium text-foreground/80">
                Next: {next.date} · {next.clientName}
              </span>
            ) : null}
          </div>
        </div>
        <ScheduleSessionSheet />
      </div>
    </section>
  );
}

function SessionWorkflowCard({ session }: { session: AdvisorSession }) {
  return (
    <article className="rounded-2xl border border-border/30 bg-card px-5 py-5 sm:px-6">
      <div className="flex items-start gap-4">
        <Avatar size="sm">
          <AvatarFallback className="bg-muted text-xs font-medium">{session.clientInitials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <TextSmall className="font-semibold">{session.clientName}</TextSmall>
            <Link
              href={`/advisors/dashboard/clients/${session.clientId}`}
              className="text-muted-foreground transition-colors hover:text-foreground"
              aria-label={`View ${session.clientName}`}
            >
              <ExternalLink className="size-3" />
            </Link>
            <Badge variant="outline" className="text-xs">{session.type}</Badge>
          </div>
          <Muted className="mt-1 text-body-sm">
            {session.date} at {session.time} · {session.duration}
          </Muted>
          {session.agenda ? (
            <div className="mt-3 rounded-lg bg-muted/30 px-3 py-2.5">
              <Overline className="mb-1 block">Agenda</Overline>
              <TextSmall className="text-muted-foreground">{session.agenda}</TextSmall>
            </div>
          ) : null}
          {session.notes ? (
            <Muted className="mt-2 text-body-sm">{session.notes}</Muted>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" variant="outline">Edit session</Button>
            <Button size="sm" variant="ghost">Record outcomes</Button>
          </div>
        </div>
        <span
          className={cn(
            "shrink-0 text-caption font-semibold uppercase tracking-wide",
            session.status === "upcoming" && "text-amber-700",
            session.status === "completed" && "text-emerald-700",
            session.status === "cancelled" && "text-muted-foreground",
          )}
        >
          {session.status}
        </span>
      </div>
    </article>
  );
}

export default function AdvisorSessionsPage() {
  const [showPast, setShowPast] = useState(true);
  const upcoming = advisorSessions.filter((s) => s.status === "upcoming");
  const past = [...advisorSessions.filter((s) => s.status !== "upcoming")].sort((a, b) =>
    b.date.localeCompare(a.date),
  );

  return (
    <PageShell className="flex flex-col gap-10 lg:gap-12">
      <AdvisorSessionsOverview />

      <section>
        <H2 className="mb-2">Upcoming advisory sessions</H2>
        <Muted className="mb-7 max-w-xl">Sessions requiring preparation and outcome planning.</Muted>
        <div className="flex flex-col gap-4">
          {upcoming.length === 0 ? (
            <Muted className="rounded-xl border border-border/20 bg-muted/10 px-5 py-6 text-center">
              No upcoming sessions scheduled.
            </Muted>
          ) : (
            upcoming.map((session) => <SessionWorkflowCard key={session.id} session={session} />)
          )}
        </div>
      </section>

      <section>
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <H2 className="mb-1">Session outcomes</H2>
            <Muted className="text-body-sm">Completed and cancelled sessions across your client book.</Muted>
          </div>
          <Button variant="ghost" size="sm" className="gap-2" onClick={() => setShowPast((v) => !v)}>
            {showPast ? "Hide" : "Show"}
            {showPast ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </Button>
        </div>
        {showPast ? (
          <div className="flex flex-col gap-3">
            {past.map((session) => {
              const Icon = STATUS_ICON[session.status];
              return (
                <div
                  key={session.id}
                  className="flex items-start gap-4 rounded-xl border border-border/20 bg-muted/10 px-5 py-4"
                >
                  <Icon
                    className={cn(
                      "mt-0.5 size-4 shrink-0",
                      session.status === "completed" ? "text-brand-accent" : "text-muted-foreground",
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <TextSmall className="font-medium">{session.clientName}</TextSmall>
                      <Badge variant="outline" className="text-xs">{session.type}</Badge>
                    </div>
                    <Muted className="text-body-sm">{session.date} · {session.duration}</Muted>
                    {session.notes ? (
                      <TextSmall className="mt-1 text-muted-foreground">{session.notes}</TextSmall>
                    ) : null}
                  </div>
                  <Button size="sm" variant="ghost">Edit outcomes</Button>
                </div>
              );
            })}
          </div>
        ) : null}
      </section>
    </PageShell>
  );
}
