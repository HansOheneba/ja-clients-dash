"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { H3, Muted, TextSmall } from "@/components/ui/typography";
import type { SessionRequest, WmSession } from "@/lib/wealth/wm-types";

export function ClientSessionsTab({ clientId }: { clientId: string }) {
  const [sessions, setSessions] = useState<WmSession[]>([]);
  const [requests, setRequests] = useState<SessionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [recapSessionId, setRecapSessionId] = useState<string | null>(null);
  const [recap, setRecap] = useState({
    topics: "",
    decisions: "",
    actionItems: "",
    nextSteps: "",
  });

  const load = useCallback(async () => {
    const res = await fetch(`/api/sessions?clientId=${clientId}`);
    const data = await res.json();
    setSessions(data.sessions ?? []);
    setRequests(data.requests ?? []);
    setLoading(false);
  }, [clientId]);

  useEffect(() => {
    load();
  }, [load]);

  async function acceptRequest(id: string) {
    const scheduledAt = prompt("Enter scheduled date/time (ISO format):");
    if (!scheduledAt) return;
    await fetch("/api/session-requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "accept", scheduledAt }),
    });
    load();
  }

  async function saveRecap() {
    if (!recapSessionId) return;
    await fetch("/api/sessions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: recapSessionId,
        topics: recap.topics.split("\n").filter(Boolean),
        decisions: recap.decisions.split("\n").filter(Boolean),
        actionItems: recap.actionItems.split("\n").filter(Boolean),
        nextSteps: recap.nextSteps.split("\n").filter(Boolean),
      }),
    });
    setRecapSessionId(null);
    load();
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const upcoming = sessions.filter(
    (s) => s.scheduled_at && new Date(s.scheduled_at) >= new Date() && s.status !== "cancelled",
  );
  const past = sessions.filter(
    (s) => !s.scheduled_at || new Date(s.scheduled_at) < new Date() || s.status === "completed",
  );
  const pending = requests.filter((r) => r.status === "pending");

  return (
    <div className="flex flex-col gap-6 pb-12">
      {pending.length > 0 ? (
        <section>
          <H3 className="mb-3 text-base">Pending requests</H3>
          <div className="flex flex-col gap-2">
            {pending.map((r) => (
              <div key={r.id} className="rounded-xl border border-border p-4">
                <TextSmall className="font-medium">{r.topic}</TextSmall>
                <Muted className="text-sm">Preferred: {r.preferred_times}</Muted>
                <div className="mt-2 flex gap-2">
                  <Button size="sm" onClick={() => acceptRequest(r.id)}>
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      await fetch("/api/session-requests", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id: r.id, action: "decline" }),
                      });
                      load();
                    }}
                  >
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <H3 className="mb-3 text-base">Upcoming sessions</H3>
        {upcoming.length === 0 ? (
          <Muted>No upcoming sessions scheduled.</Muted>
        ) : (
          <div className="flex flex-col gap-2">
            {upcoming.map((s) => (
              <div key={s.id} className="rounded-xl border border-border p-4">
                <div className="flex items-center justify-between gap-2">
                  <TextSmall className="font-medium">{s.title}</TextSmall>
                  <Badge variant="secondary">{s.status}</Badge>
                </div>
                <Muted className="text-sm">
                  {s.scheduled_at
                    ? new Date(s.scheduled_at).toLocaleString("en-GB")
                    : "TBD"}{" "}
                  · {s.format}
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
            {past.map((s) => (
              <div key={s.id} className="rounded-xl border border-border p-4">
                <div className="flex items-center justify-between gap-2">
                  <TextSmall className="font-medium">{s.title}</TextSmall>
                  {!s.recap_logged_at ? (
                    <Button size="sm" variant="outline" onClick={() => setRecapSessionId(s.id)}>
                      Log recap
                    </Button>
                  ) : (
                    <Badge variant="secondary">Recap logged</Badge>
                  )}
                </div>
                {s.recap_logged_at ? (
                  <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                    {s.recap_topics.length > 0 ? (
                      <p>Topics: {s.recap_topics.join("; ")}</p>
                    ) : null}
                    {s.recap_decisions.length > 0 ? (
                      <p>Decisions: {s.recap_decisions.join("; ")}</p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>

      {recapSessionId ? (
        <div className="rounded-xl border border-border bg-muted/20 p-4">
          <H3 className="mb-3 text-base">Log session recap</H3>
          <div className="grid gap-3">
            <div>
              <Label>Topics (one per line)</Label>
              <Textarea
                value={recap.topics}
                onChange={(e) => setRecap((r) => ({ ...r, topics: e.target.value }))}
              />
            </div>
            <div>
              <Label>Decisions</Label>
              <Textarea
                value={recap.decisions}
                onChange={(e) => setRecap((r) => ({ ...r, decisions: e.target.value }))}
              />
            </div>
            <div>
              <Label>Action items</Label>
              <Textarea
                value={recap.actionItems}
                onChange={(e) => setRecap((r) => ({ ...r, actionItems: e.target.value }))}
              />
            </div>
            <div>
              <Label>Next steps</Label>
              <Textarea
                value={recap.nextSteps}
                onChange={(e) => setRecap((r) => ({ ...r, nextSteps: e.target.value }))}
              />
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <Button size="sm" onClick={saveRecap}>
              Save recap
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setRecapSessionId(null)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : null}

      <section>
        <H3 className="mb-3 text-base">Schedule session</H3>
        <ScheduleSessionForm clientId={clientId} onCreated={load} />
      </section>
    </div>
  );
}

function ScheduleSessionForm({
  clientId,
  onCreated,
}: {
  clientId: string;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState("Advisory session");
  const [scheduledAt, setScheduledAt] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!scheduledAt) return;
    setLoading(true);
    await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId, title, scheduledAt }),
    });
    setLoading(false);
    onCreated();
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1">
        <Label htmlFor="sess-title">Title</Label>
        <Input id="sess-title" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="flex-1">
        <Label htmlFor="sess-at">Date and time</Label>
        <Input
          id="sess-at"
          type="datetime-local"
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
        />
      </div>
      <Button type="submit" size="sm" disabled={loading}>
        Schedule
      </Button>
    </form>
  );
}
