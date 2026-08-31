"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Muted } from "@/components/ui/typography";

export function RequestSessionForm({ advisorName }: { advisorName: string }) {
  const [topic, setTopic] = useState("");
  const [preferredTimes, setPreferredTimes] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/session-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, preferredTimes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not send request");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send request");
    } finally {
      setSaving(false);
    }
  }

  if (done) {
    return (
      <Muted className="text-sm leading-relaxed">
        Your session request was sent to {advisorName}. They will confirm a time with you.
      </Muted>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
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
        <Label htmlFor="session-times">Preferred times</Label>
        <Textarea
          id="session-times"
          value={preferredTimes}
          onChange={(e) => setPreferredTimes(e.target.value)}
          required
          rows={3}
          placeholder="Share a few options that work for you."
        />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" size="sm" disabled={saving} className="w-fit">
        {saving ? <Loader2 className="size-4 animate-spin" /> : null}
        Request session
      </Button>
    </form>
  );
}
