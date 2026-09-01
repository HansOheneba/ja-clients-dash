"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";

import { RequestSessionForm } from "@/components/clients/request-session-form";
import { ClientEmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DashCard,
  DashCardContent,
  DashCardHeader,
  DashCardTitle,
} from "@/components/ui/dash-card";
import { H3, Muted, TextSmall } from "@/components/ui/typography";
import type { SessionRequest, WmSession } from "@/lib/wealth/wm-types";
import { cn } from "@/lib/utils";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function PastSessionRecap({ session }: { session: WmSession }) {
  const [open, setOpen] = useState(false);
  const hasRecap =
    session.recap_topics.length > 0 ||
    session.recap_decisions.length > 0 ||
    session.recap_next_steps.length > 0;

  return (
    <div className="rounded-xl border border-border/40 bg-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div>
          <TextSmall className="font-medium">{session.title}</TextSmall>
          <Muted className="text-sm">
            {session.scheduled_at ? formatDateTime(session.scheduled_at) : "Completed session"}
          </Muted>
        </div>
        {hasRecap ? (
          open ? <ChevronUp className="size-4 shrink-0" /> : <ChevronDown className="size-4 shrink-0" />
        ) : (
          <Badge variant="outline">No recap yet</Badge>
        )}
      </button>
      {open && hasRecap ? (
        <div className="space-y-3 border-t border-border/40 px-4 py-3">
          {session.recap_topics.length > 0 ? (
            <div>
              <H3 className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Topics</H3>
              <ul className="list-inside list-disc text-sm">
                {session.recap_topics.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {session.recap_decisions.length > 0 ? (
            <div>
              <H3 className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Decisions</H3>
              <ul className="list-inside list-disc text-sm">
                {session.recap_decisions.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {session.recap_next_steps.length > 0 ? (
            <div>
              <H3 className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Next steps</H3>
              <ul className="list-inside list-disc text-sm">
                {session.recap_next_steps.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function ClientSessionsView({ advisorName }: { advisorName: string }) {
  const [sessions, setSessions] = useState<WmSession[]>([]);
  const [requests, setRequests] = useState<SessionRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sessionsRes, requestsRes] = await Promise.all([
        fetch("/api/sessions"),
        fetch("/api/session-requests"),
      ]);
      const sessionsData = await sessionsRes.json();
      const requestsData = await requestsRes.json();
      setSessions(sessionsData.sessions ?? []);
      setRequests(requestsData.requests ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const now = new Date();
  const upcoming = sessions.filter(
    (s) =>
      s.scheduled_at &&
      new Date(s.scheduled_at) >= now &&
      s.status !== "cancelled" &&
      s.status !== "completed",
  );
  const past = sessions.filter(
    (s) =>
      s.status === "completed" ||
      (s.scheduled_at && new Date(s.scheduled_at) < now) ||
      !s.scheduled_at,
  );
  const pendingRequests = requests.filter((r) => r.status === "pending");

  return (
    <div className="flex flex-col gap-6">
      <DashCard>
        <DashCardHeader>
          <DashCardTitle>Upcoming session</DashCardTitle>
        </DashCardHeader>
        <DashCardContent>
          {upcoming.length > 0 ? (
            <div className="flex flex-col gap-3">
              {upcoming.map((s) => (
                <div key={s.id} className="rounded-xl border border-border/40 p-4">
                  <TextSmall className="font-medium">{s.title}</TextSmall>
                  <Muted className="text-sm">{formatDateTime(s.scheduled_at!)}</Muted>
                  <Badge variant="secondary" className="mt-2 capitalize">
                    {s.format}
                  </Badge>
                  <div className="mt-3">
                    <Link
                      href="/clients/dashboard/messages"
                      className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                    >
                      Message to reschedule
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <ClientEmptyState
              variant="sessions"
              compact
              title="No upcoming session"
              description="Request time with your wealth manager and they will confirm a slot."
            />
          )}
        </DashCardContent>
      </DashCard>

      {pendingRequests.length > 0 ? (
        <section>
          <H3 className="mb-3 text-base">Pending requests</H3>
          <div className="flex flex-col gap-2">
            {pendingRequests.map((r) => (
              <div key={r.id} className="rounded-xl border border-border/40 p-4">
                <TextSmall className="font-medium">{r.topic}</TextSmall>
                <Muted className="text-sm">Preferred: {r.preferred_times}</Muted>
                <Badge variant="outline" className="mt-2">
                  Awaiting confirmation
                </Badge>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <DashCard>
        <DashCardHeader>
          <DashCardTitle>Request a session</DashCardTitle>
        </DashCardHeader>
        <DashCardContent>
          <RequestSessionForm advisorName={advisorName} onSuccess={load} />
        </DashCardContent>
      </DashCard>

      <section>
        <H3 className="mb-3 text-base">Past sessions</H3>
        {past.length > 0 ? (
          <div className="flex flex-col gap-2">
            {past.map((s) => (
              <PastSessionRecap key={s.id} session={s} />
            ))}
          </div>
        ) : (
          <DashCard>
            <DashCardContent>
              <ClientEmptyState
                variant="sessions"
                compact
                title="No past sessions yet"
                description="Session recaps from your wealth manager will appear here after each meeting."
              />
            </DashCardContent>
          </DashCard>
        )}
      </section>
    </div>
  );
}
