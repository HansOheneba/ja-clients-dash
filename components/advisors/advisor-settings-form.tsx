"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { WeeklyAvailabilityPicker } from "@/components/advisors/weekly-availability-picker";
import { Button } from "@/components/ui/button";
import {
  DashCard,
  DashCardContent,
  DashCardDescription,
  DashCardHeader,
  DashCardTitle,
} from "@/components/ui/dash-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Muted } from "@/components/ui/typography";
import {
  defaultWeeklyAvailability,
  isValidSchedule,
  parseAvailabilityNotes,
  serializeAvailability,
} from "@/lib/wealth/availability";
import { normalizeTimezoneValue } from "@/lib/wealth/timezones";

export function AdvisorSettingsForm({
  fullName,
  email,
  timezone,
  availabilityNotes,
}: {
  fullName: string;
  email: string;
  timezone?: string | null;
  availabilityNotes?: string | null;
}) {
  const router = useRouter();
  const [name, setName] = useState(fullName);
  const [availability, setAvailability] = useState(
    () => parseAvailabilityNotes(availabilityNotes) ?? defaultWeeklyAvailability(),
  );
  const [tz, setTz] = useState(() => normalizeTimezoneValue(timezone));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [baseline, setBaseline] = useState(() => ({
    name: fullName.trim(),
    tz: normalizeTimezoneValue(timezone),
    schedule: serializeAvailability(
      parseAvailabilityNotes(availabilityNotes) ?? defaultWeeklyAvailability(),
    ),
    hadSchedule: Boolean(parseAvailabilityNotes(availabilityNotes)),
  }));

  const dirty =
    name.trim() !== baseline.name ||
    tz !== baseline.tz ||
    serializeAvailability(availability) !== baseline.schedule ||
    !baseline.hadSchedule;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    const nextName = name.trim();
    if (!nextName) {
      setError("Enter your name.");
      setSaving(false);
      return;
    }

    if (!isValidSchedule(availability)) {
      setError("Add at least one day with a valid time range.");
      setSaving(false);
      return;
    }

    const nextSchedule = serializeAvailability(availability);

    try {
      const res = await fetch("/api/advisors/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: nextName,
          timezone: tz,
          availabilityNotes: nextSchedule,
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Could not save settings");
      setBaseline({
        name: nextName,
        tz,
        schedule: nextSchedule,
        hadSchedule: true,
      });
      setMessage("Settings saved.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save settings");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex max-w-2xl flex-col gap-5">
      <DashCard>
        <DashCardHeader>
          <DashCardTitle>Name</DashCardTitle>
          <DashCardDescription>
            Shown to clients on their profile and in session requests. Email is the address
            you sign in with.
          </DashCardDescription>
        </DashCardHeader>
        <DashCardContent className="gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="advisor-name">Full name</Label>
            <Input
              id="advisor-name"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <Muted>Email</Muted>
            <p className="text-sm font-medium">{email}</p>
          </div>
        </DashCardContent>
      </DashCard>

      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium">Availability</p>
          <Muted>Hours clients can request a review or planning session.</Muted>
        </div>
        <WeeklyAvailabilityPicker
          value={availability}
          onChange={setAvailability}
          timezone={tz}
          onTimezoneChange={setTz}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={saving || !dirty}>
          {saving ? <Loader2 className="size-4 animate-spin" /> : null}
          {saving ? "Saving..." : "Save settings"}
        </Button>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {message && !error ? <Muted>{message}</Muted> : null}
      </div>
    </form>
  );
}
