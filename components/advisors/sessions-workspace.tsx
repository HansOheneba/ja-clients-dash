"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { ProposeSessionForm } from "@/components/sessions/propose-session-form";
import { SessionProposalCard } from "@/components/sessions/session-proposal-card";
import { SessionRecapForm } from "@/components/sessions/session-recap-form";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
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

type ClientOption = { id: string; full_name: string };

export function SessionsWorkspace() {
  const [sessions, setSessions] = useState<WmSession[]>([]);
  const [requests, setRequests] = useState<SessionRequest[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [loading, setLoading] = useState(true);
  const [recapSession, setRecapSession] = useState<WmSession | null>(null);

  const load = useCallback(async () => {
    const [sessRes, reqRes, clientsRes] = await Promise.all([
      fetch("/api/sessions"),
      fetch("/api/session-requests"),
      fetch("/api/clients"),
    ]);
    const sessData = await sessRes.json();
    const reqData = await reqRes.json();
    const clientsData = await clientsRes.json();
    setSessions(sessData.sessions ?? []);
    setRequests(reqData.requests ?? []);
    setClients(
      (clientsData.clients ?? []).map((client: ClientOption) => ({
        id: client.id,
        full_name: client.full_name,
      })),
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const activeProposals = requests.filter(isActiveProposal);
  const recapBacklog = sessions.filter(needsRecap);
  const now = new Date();
  const upcoming = sessions.filter(
    (session) =>
      session.scheduled_at &&
      new Date(session.scheduled_at) >= now &&
      session.status === "confirmed",
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
        "flex flex-col gap-8 transition-opacity",
        loading && "pointer-events-none opacity-45",
      )}
    >
      <DashCard className={loading ? "bg-muted/20" : undefined}>
        <DashCardHeader>
          <DashCardTitle>Suggest a session</DashCardTitle>
        </DashCardHeader>
        <DashCardContent className="space-y-4">
          <div className="max-w-sm">
            <Label htmlFor="suggest-client">Client</Label>
            <Select
              id="suggest-client"
              value={selectedClientId}
              onChange={(event) => setSelectedClientId(event.target.value)}
            >
              <option value="">Select a client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.full_name}
                </option>
              ))}
            </Select>
          </div>
          {selectedClientId ? (
            <ProposeSessionForm
              clientId={selectedClientId}
              submitLabel="Suggest session"
              successMessage="Your session suggestion was sent. It will be confirmed once you and your client both agree."
              onSuccess={load}
            />
          ) : (
            <Muted className="text-sm">Choose a client to propose a session time.</Muted>
          )}
        </DashCardContent>
      </DashCard>

      <section>
        <H3 className="mb-3 text-base">Pending confirmation</H3>
        {loading ? (
          <Muted>Loading requests...</Muted>
        ) : activeProposals.length === 0 ? (
          <Muted>No sessions waiting for confirmation.</Muted>
        ) : (
          <div className="flex flex-col gap-3">
            {activeProposals.map((request) => (
              <div key={request.id} className="space-y-2">
                <Link
                  href={`/advisors/dashboard/clients/${request.client_id}?tab=Sessions`}
                  className="text-sm font-medium hover:underline"
                >
                  {request.client_name}
                </Link>
                <SessionProposalCard
                  request={request}
                  viewerRole="advisor"
                  onUpdated={load}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <H3 className="mb-3 text-base">Recap backlog</H3>
        {recapBacklog.length === 0 ? (
          <Muted>All sessions have recaps logged.</Muted>
        ) : (
          <div className="flex flex-col gap-2">
            {recapBacklog.map((session) => (
              <div
                key={session.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-4"
              >
                <div>
                  <Link
                    href={`/advisors/dashboard/clients/${session.client_id}?tab=Sessions`}
                    className="font-medium hover:underline"
                  >
                    {session.client_name ?? "Client"}
                  </Link>
                  <Muted className="text-sm">{session.title}</Muted>
                </div>
                <button
                  type="button"
                  className="text-sm font-medium text-primary hover:underline"
                  onClick={() => setRecapSession(session)}
                >
                  Log recap
                </button>
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

      <section>
        <H3 className="mb-3 text-base">Upcoming sessions</H3>
        {upcoming.length === 0 ? (
          <Muted>No confirmed upcoming sessions.</Muted>
        ) : (
          <div className="flex flex-col gap-2">
            {upcoming.map((session) => (
              <div key={session.id} className="rounded-xl border border-border p-4">
                <div className="flex items-center justify-between gap-2">
                  <TextSmall className="font-medium">
                    {session.client_name} · {session.title}
                  </TextSmall>
                  <Badge variant="secondary">{formatSessionFormat(session.format)}</Badge>
                </div>
                <Muted className="text-sm">
                  {session.scheduled_at ? formatSessionDateTime(session.scheduled_at) : "TBD"}
                </Muted>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
