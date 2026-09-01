"use client";

import { useCallback, useEffect, useState } from "react";

import { ProposeSessionForm } from "@/components/sessions/propose-session-form";
import { SessionProposalCard } from "@/components/sessions/session-proposal-card";
import { SessionRecapForm } from "@/components/sessions/session-recap-form";
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
import { isActiveProposal, needsRecap } from "@/lib/sessions/proposal-utils";
import type { SessionRequest, WmSession } from "@/lib/wealth/wm-types";
import { cn } from "@/lib/utils";

export function ClientSessionsTab({ clientId }: { clientId: string }) {
  const [sessions, setSessions] = useState<WmSession[]>([]);
  const [requests, setRequests] = useState<SessionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [recapSession, setRecapSession] = useState<WmSession | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/sessions?clientId=${clientId}`);
    const data = await res.json();
    setSessions(data.sessions ?? []);
    setRequests(data.requests ?? []);
    setLoading(false);
  }, [clientId]);

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
      !session.scheduled_at ||
      new Date(session.scheduled_at) < now ||
      session.status === "completed",
  );

  async function saveRecap(recap: {
    topics: string[];
    decisions: string[];
    actionItems: string[];
    nextSteps: string[];
  }) {
    if (!recapSession) return;
    await fetch("/api/sessions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: recapSession.id,
        topics: recap.topics,
        decisions: recap.decisions,
        actionItems: recap.actionItems,
        nextSteps: recap.nextSteps,
      }),
    });
    setRecapSession(null);
    void load();
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-6 pb-12 transition-opacity",
        loading && "pointer-events-none opacity-45",
      )}
    >
      {activeProposals.length > 0 ? (
        <section>
          <H3 className="mb-3 text-base">Pending confirmation</H3>
          <div className="flex flex-col gap-3">
            {activeProposals.map((request) => (
              <SessionProposalCard
                key={request.id}
                request={request}
                viewerRole="advisor"
                onUpdated={load}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <H3 className="mb-3 text-base">Upcoming sessions</H3>
        {upcoming.length === 0 ? (
          <Muted>No confirmed upcoming sessions.</Muted>
        ) : (
          <div className="flex flex-col gap-2">
            {upcoming.map((session) => (
              <div key={session.id} className="rounded-xl border border-border p-4">
                <div className="flex items-center justify-between gap-2">
                  <TextSmall className="font-medium">{session.title}</TextSmall>
                  <Badge variant="secondary">{formatSessionFormat(session.format)}</Badge>
                </div>
                <Muted className="text-sm">
                  {session.scheduled_at
                    ? formatSessionDateTime(session.scheduled_at)
                    : "TBD"}
                </Muted>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <H3 className="mb-3 text-base">Past sessions</H3>
        {past.length === 0 ? (
          <Muted>No past sessions yet.</Muted>
        ) : (
          <div className="flex flex-col gap-2">
            {past.map((session) => (
              <div key={session.id} className="rounded-xl border border-border p-4">
                <div className="flex items-center justify-between gap-2">
                  <TextSmall className="font-medium">{session.title}</TextSmall>
                  {needsRecap(session) ? (
                    <button
                      type="button"
                      className="text-sm font-medium text-primary hover:underline"
                      onClick={() => setRecapSession(session)}
                    >
                      Log recap
                    </button>
                  ) : session.recap_logged_at ? (
                    <Badge variant="secondary">Recap logged</Badge>
                  ) : null}
                </div>
                {session.recap_logged_at ? (
                  <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                    {session.recap_topics.length > 0 ? (
                      <p>Topics: {session.recap_topics.join("; ")}</p>
                    ) : null}
                    {session.recap_decisions.length > 0 ? (
                      <p>Decisions: {session.recap_decisions.join("; ")}</p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>

      {recapSession ? (
        <SessionRecapForm
          sessionTitle={recapSession.title}
          onSave={saveRecap}
          onCancel={() => setRecapSession(null)}
        />
      ) : null}

      <DashCard>
        <DashCardHeader>
          <DashCardTitle>Suggest a session</DashCardTitle>
        </DashCardHeader>
        <DashCardContent>
          <ProposeSessionForm
            clientId={clientId}
            submitLabel="Suggest session"
            onSuccess={load}
          />
        </DashCardContent>
      </DashCard>
    </div>
  );
}
