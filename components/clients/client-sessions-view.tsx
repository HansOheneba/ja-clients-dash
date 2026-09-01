"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import { ProposeSessionForm } from "@/components/sessions/propose-session-form";
import { SessionProposalCard } from "@/components/sessions/session-proposal-card";
import { ClientEmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import {
  DashCard,
  DashCardContent,
  DashCardHeader,
  DashCardTitle,
} from "@/components/ui/dash-card";
import { H3, Muted, TextSmall } from "@/components/ui/typography";
import { formatSessionDateTime } from "@/lib/sessions/datetime";
import { formatSessionFormat } from "@/lib/sessions/format";
import { isActiveProposal } from "@/lib/sessions/proposal-utils";
import type { SessionRequest, WmSession } from "@/lib/wealth/wm-types";
import { cn } from "@/lib/utils";

function PastSessionRecap({ session }: { session: WmSession }) {
  const [open, setOpen] = useState(false);
  const hasRecap =
    session.recap_topics.length > 0 ||
    session.recap_decisions.length > 0 ||
    session.recap_action_items.length > 0 ||
    session.recap_next_steps.length > 0;

  return (
    <div className="rounded-xl border border-border/40 bg-card">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div>
          <TextSmall className="font-medium">{session.title}</TextSmall>
          <Muted className="text-sm">
            {session.scheduled_at ? formatSessionDateTime(session.scheduled_at) : "Completed session"}
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
                {session.recap_topics.map((topic) => (
                  <li key={topic}>{topic}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {session.recap_decisions.length > 0 ? (
            <div>
              <H3 className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Decisions</H3>
              <ul className="list-inside list-disc text-sm">
                {session.recap_decisions.map((decision) => (
                  <li key={decision}>{decision}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {session.recap_action_items.length > 0 ? (
            <div>
              <H3 className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Action items</H3>
              <ul className="list-inside list-disc text-sm">
                {session.recap_action_items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {session.recap_next_steps.length > 0 ? (
            <div>
              <H3 className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Next steps</H3>
              <ul className="list-inside list-disc text-sm">
                {session.recap_next_steps.map((step) => (
                  <li key={step}>{step}</li>
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
      const res = await fetch("/api/sessions");
      const data = await res.json();
      setSessions(data.sessions ?? []);
      setRequests(data.requests ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const now = new Date();
  const activeProposals = requests.filter(isActiveProposal);
  const upcoming = sessions.filter(
    (session) =>
      session.scheduled_at &&
      new Date(session.scheduled_at) >= now &&
      session.status === "confirmed",
  );
  const past = sessions.filter(
    (session) =>
      session.status === "completed" ||
      (session.scheduled_at && new Date(session.scheduled_at) < now) ||
      !session.scheduled_at,
  );

  return (
    <div
      className={cn(
        "flex flex-col gap-6 transition-opacity",
        loading && "pointer-events-none opacity-45",
      )}
    >
      <DashCard className={loading ? "bg-muted/20" : undefined}>
        <DashCardHeader>
          <DashCardTitle>Upcoming session</DashCardTitle>
        </DashCardHeader>
        <DashCardContent>
          {loading ? (
            <Muted className="text-sm">Loading sessions...</Muted>
          ) : upcoming.length > 0 ? (
            <div className="flex flex-col gap-3">
              {upcoming.map((session) => (
                <div key={session.id} className="rounded-xl border border-border/40 p-4">
                  <TextSmall className="font-medium">{session.title}</TextSmall>
                  <Muted className="text-sm">{formatSessionDateTime(session.scheduled_at!)}</Muted>
                  <Badge variant="secondary">{formatSessionFormat(session.format)}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <ClientEmptyState
              variant="sessions"
              compact
              title="No confirmed session"
              description="Propose a time below. Your session is locked in once you and your wealth manager both agree."
            />
          )}
        </DashCardContent>
      </DashCard>

      {activeProposals.length > 0 ? (
        <section>
          <H3 className="mb-3 text-base">Pending confirmation</H3>
          <div className="flex flex-col gap-3">
            {activeProposals.map((request) => (
              <SessionProposalCard
                key={request.id}
                request={request}
                viewerRole="client"
                onUpdated={load}
              />
            ))}
          </div>
        </section>
      ) : null}

      <DashCard>
        <DashCardHeader>
          <DashCardTitle>Request a session</DashCardTitle>
        </DashCardHeader>
        <DashCardContent>
          <ProposeSessionForm
            submitLabel="Request session"
            successMessage={`Your session proposal was sent to ${advisorName}. It will be confirmed once you both agree on the time.`}
            onSuccess={load}
          />
        </DashCardContent>
      </DashCard>

      <section>
        <H3 className="mb-3 text-base">Past sessions</H3>
        {loading ? (
          <Muted className="text-sm">Loading past sessions...</Muted>
        ) : past.length > 0 ? (
          <div className="flex flex-col gap-2">
            {past.map((session) => (
              <PastSessionRecap key={session.id} session={session} />
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
