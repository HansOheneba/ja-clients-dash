"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Muted, TextSmall } from "@/components/ui/typography";
import { ALL_BUCKETS, BUCKET_LABELS } from "@/lib/wealth/constants";
import type { PortfolioSnapshot } from "@/lib/wealth/types";

export function PortfolioQuickUpdate({
  clientId,
  snapshots,
  onSaved,
}: {
  clientId: string;
  snapshots: PortfolioSnapshot[];
  onSaved?: () => void;
}) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      ALL_BUCKETS.map((b) => [
        b,
        String(snapshots.find((s) => s.bucket === b)?.current_value_usd ?? 0),
      ]),
    ),
  );
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSave() {
    setLoading(true);
    setMessage(null);
    try {
      const snapshotRows = ALL_BUCKETS.map((bucket) => {
        const existing = snapshots.find((s) => s.bucket === bucket);
        const current = Number(values[bucket] ?? 0);
        const previous = existing?.previous_value_usd ?? current;
        return {
          bucket,
          previous_value_usd: previous,
          current_value_usd: current,
          period_change_pct:
            previous > 0 ? ((current - previous) / previous) * 100 : null,
          ytd_pct: existing?.ytd_pct ?? null,
          inception_gain_usd: existing?.inception_gain_usd ?? null,
          inception_pct: existing?.inception_pct ?? null,
          annualized_return_pct: existing?.annualized_return_pct ?? null,
        };
      });

      const res = await fetch(`/api/clients/${clientId}/portfolio`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          snapshots: snapshotRows,
          auditNote: note.trim() || null,
          quickUpdate: true,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Update failed");
      }
      setMessage("Portfolio updated. Audit entry recorded.");
      onSaved?.();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Update failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <TextSmall className="font-semibold">Quick value update</TextSmall>
      <Muted className="mb-4 text-sm">
        Update per asset class. Changes are logged in the audit trail.
      </Muted>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ALL_BUCKETS.map((bucket) => (
          <div key={bucket} className="flex flex-col gap-1">
            <Label htmlFor={`qv-${bucket}`}>{BUCKET_LABELS[bucket]}</Label>
            <Input
              id={`qv-${bucket}`}
              type="number"
              min={0}
              step="0.01"
              value={values[bucket]}
              onChange={(e) => setValues((v) => ({ ...v, [bucket]: e.target.value }))}
            />
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-col gap-1">
        <Label htmlFor="qv-note">Note (required for audit)</Label>
        <Textarea
          id="qv-note"
          rows={2}
          placeholder="Reason for this update"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>
      <div className="mt-4 flex items-center gap-3">
        <Button size="sm" disabled={loading || !note.trim()} onClick={handleSave}>
          {loading ? <Loader2 className="size-4 animate-spin" /> : null}
          Save values
        </Button>
        {message ? <Muted className="text-sm">{message}</Muted> : null}
      </div>
    </div>
  );
}
