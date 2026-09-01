"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { H3, Muted, TextSmall } from "@/components/ui/typography";
import type { SessionRequest, WmSession } from "@/lib/wealth/wm-types";

export function SessionsWorkspace() {
  const [sessions, setSessions] = useState<WmSession[]>([]);
  const [requests, setRequests] = useState<SessionRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [sessRes, reqRes] = await Promise.all([
      fetch("/api/sessions"),
      fetch("/api/session-requests"),
    ]);
    const sessData = await sessRes.json();
    const reqData = await reqRes.json();
    setSessions(sessData.sessions ?? []);
    setRequests(reqData.requests ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const pending = requests.filter((r) => r.status === "pending");
  const recapBacklog = sessions.filter(
    (s) => s.scheduled_at && new Date(s.scheduled_at) < new Date() && !s.recap_logged_at,
  );
  const upcoming = sessions.filter(
    (s) => s.scheduled_at && new Date(s.scheduled_at) >= new Date(),
  );

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <section>
        <H3 className="mb-3 text-base">Pending requests</H3>
        {pending.length === 0 ? (
          <Muted>No pending session requests.</Muted>
        ) : (
          <div className="flex flex-col gap-2">
            {pending.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-xl border border-border p-4">
                <div>
                  <Link
                    href={`/advisors/dashboard/clients/${r.client_id}?tab=Sessions`}
                    className="font-medium hover:underline"
                  >
                    {r.client_name}
                  </Link>
                  <Muted className="text-sm">{r.topic}</Muted>
                </div>
                <Button
                  size="sm"
                  onClick={async () => {
                    const scheduledAt = prompt("Scheduled at (ISO):");
                    if (!scheduledAt) return;
                    await fetch("/api/session-requests", {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ id: r.id, action: "accept", scheduledAt }),
                    });
                    load();
                  }}
                >
                  Accept
                </Button>
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
            {recapBacklog.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-xl border border-border p-4">
                <div>
                  <Link
                    href={`/advisors/dashboard/clients/${s.client_id}?tab=Sessions`}
                    className="font-medium hover:underline"
                  >
                    {s.client_name ?? "Client"}
                  </Link>
                  <Muted className="text-sm">{s.title}</Muted>
                </div>
                <Badge variant="destructive">Needs recap</Badge>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <H3 className="mb-3 text-base">Upcoming this week</H3>
        {upcoming.length === 0 ? (
          <Muted>No upcoming sessions.</Muted>
        ) : (
          <div className="flex flex-col gap-2">
            {upcoming.map((s) => (
              <div key={s.id} className="rounded-xl border border-border p-4">
                <TextSmall className="font-medium">
                  {s.client_name} · {s.title}
                </TextSmall>
                <Muted className="text-sm">
                  {s.scheduled_at ? new Date(s.scheduled_at).toLocaleString("en-GB") : "TBD"}
                </Muted>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
