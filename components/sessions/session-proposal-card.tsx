"use client";

import { useState } from "react";

import { SessionDateTimePicker } from "@/components/sessions/session-datetime-picker";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatSessionFormat } from "@/lib/sessions/format";
import {
  awaitingParty,
  proposalDateTimeLabel,
} from "@/lib/sessions/proposal-utils";
import type { SessionParty, SessionRequest } from "@/lib/wealth/wm-types";
import { Muted, TextSmall } from "@/components/ui/typography";

export function SessionProposalCard({
  request,
  viewerRole,
  onUpdated,
}: {
  request: SessionRequest;
  viewerRole: SessionParty;
  onUpdated: () => void;
}) {
  const [showCounter, setShowCounter] = useState(false);
  const [counterAt, setCounterAt] = useState<string | null>(request.proposed_at);
  const [busy, setBusy] = useState(false);

  const waitingOn = awaitingParty(request);
  const needsViewerAction = waitingOn === viewerRole;

  async function patch(body: Record<string, unknown>) {
    setBusy(true);
    try {
      await fetch("/api/session-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: request.id, ...body }),
      });
      setShowCounter(false);
      onUpdated();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border border-border/60 bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <TextSmall className="font-medium">{request.topic}</TextSmall>
          <Muted className="text-sm">{proposalDateTimeLabel(request)}</Muted>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="outline">{formatSessionFormat(request.format)}</Badge>
            {needsViewerAction ? (
              <Badge>Needs your confirmation</Badge>
            ) : waitingOn ? (
              <Badge variant="secondary">
                Waiting for {waitingOn === "client" ? "client" : "wealth manager"}
              </Badge>
            ) : (
              <Badge variant="secondary">Awaiting confirmation</Badge>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {needsViewerAction ? (
          <Button size="sm" disabled={busy} onClick={() => void patch({ action: "agree" })}>
            Confirm time
          </Button>
        ) : null}
        <Button
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={() => setShowCounter((open) => !open)}
        >
          Suggest different time
        </Button>
        {viewerRole === "advisor" ? (
          <Button
            size="sm"
            variant="ghost"
            disabled={busy}
            onClick={() => void patch({ action: "decline" })}
          >
            Decline
          </Button>
        ) : null}
      </div>

      {showCounter ? (
        <div className="mt-4 space-y-3 border-t border-border/60 pt-4">
          <SessionDateTimePicker value={counterAt} onChange={setCounterAt} />
          <Button
            size="sm"
            disabled={busy || !counterAt}
            onClick={() => void patch({ action: "propose", proposedAt: counterAt, format: request.format })}
          >
            Send new time
          </Button>
        </div>
      ) : null}
    </div>
  );
}
