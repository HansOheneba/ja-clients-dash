"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { WeeklyAvailabilityPicker } from "@/components/advisors/weekly-availability-picker";
import { Button } from "@/components/ui/button";
import { PhoneInput } from "@/components/ui/phone-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Muted } from "@/components/ui/typography";
import {
  defaultWeeklyAvailability,
  isValidSchedule,
  parseAvailabilityNotes,
  serializeAvailability,
} from "@/lib/wealth/availability";
import { normalizeTimezoneValue } from "@/lib/wealth/timezones";
import { isValidPhoneNumber } from "react-phone-number-input";

export function WealthManagerOnboardingForm({
  defaultPhone,
  defaultTimezone,
  defaultAvailabilityNotes,
}: {
  defaultPhone?: string | null;
  defaultTimezone?: string | null;
  defaultAvailabilityNotes?: string | null;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availability, setAvailability] = useState(
    () => parseAvailabilityNotes(defaultAvailabilityNotes) ?? defaultWeeklyAvailability(),
  );
  const [timezone, setTimezone] = useState(() => normalizeTimezoneValue(defaultTimezone));
  const [phone, setPhone] = useState(() => defaultPhone?.trim() ?? "");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setSaving(true);
    setError(null);

    if (!phone || !isValidPhoneNumber(phone)) {
      setError("Enter a valid phone number.");
      setSaving(false);
      return;
    }

    if (!isValidSchedule(availability)) {
      setError("Add at least one day with a valid time range.");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/advisors/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          bio: String(data.get("bio") ?? "").trim(),
          timezone,
          availabilityNotes: serializeAvailability(availability),
          completeOnboarding: true,
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Could not save your profile");
      router.push("/advisors/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <Field label="Phone" hint="Select your country code, then enter your number.">
        <PhoneInput value={phone} onChange={setPhone} required placeholder="555 010 1234" />
      </Field>

      <Field
        label="Professional introduction"
        hint="A short bio clients will see on their profile."
      >
        <Textarea
          name="bio"
          required
          rows={4}
          placeholder="Your background, areas of focus, and how you support JA Wealth clients."
        />
      </Field>

      <Field
        label="Availability for client sessions"
        hint="When can clients book a review or planning session with you?"
      >
        <WeeklyAvailabilityPicker
          value={availability}
          onChange={setAvailability}
          timezone={timezone}
          onTimezoneChange={setTimezone}
        />
      </Field>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button type="submit" disabled={saving} className="w-full sm:w-auto">
        {saving ? <Loader2 className="size-4 animate-spin" /> : null}
        {saving ? "Saving..." : "Save and open dashboard"}
      </Button>
    </form>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      {hint ? <Muted className="text-sm">{hint}</Muted> : null}
      {children}
    </div>
  );
}
