"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { SessionDateTimePicker } from "@/components/sessions/session-datetime-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Muted } from "@/components/ui/typography";
import { SESSION_FORMAT_OPTIONS } from "@/lib/sessions/format";

export function ProposeSessionForm({
  clientId,
  submitLabel = "Propose session",
  successMessage,
  onSuccess,
}: {
  clientId?: string;
  submitLabel?: string;
  successMessage?: string;
  onSuccess?: () => void;
}) {
  const [topic, setTopic] = useState("");
  const [proposedAt, setProposedAt] = useState<string | null>(null);
  const [format, setFormat] = useState("video");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!proposedAt) {
      setError("Choose a date and time");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/session-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, proposedAt, format, clientId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not send request");
      setDone(true);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send request");
    } finally {
      setSaving(false);
    }
  }

  if (done) {
    return (
      <Muted className="text-sm leading-relaxed">
        {successMessage ??
          "Your session proposal was sent. It will be confirmed once both sides agree on the time."}
      </Muted>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px]">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="session-topic">What would you like to discuss?</Label>
          <Input
            id="session-topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            required
            placeholder="Portfolio review, tax planning, legacy goals..."
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="session-format">Format</Label>
          <Select
            id="session-format"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
          >
            {SESSION_FORMAT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <SessionDateTimePicker value={proposedAt} onChange={setProposedAt} />

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" size="sm" disabled={saving || !topic.trim() || !proposedAt} className="w-fit">
        {saving ? <Loader2 className="size-4 animate-spin" /> : null}
        {submitLabel}
      </Button>
    </form>
  );
}
