"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Label } from "@/components/ui/label";
import { Muted, TextSmall } from "@/components/ui/typography";

export function NotificationPreferences({
  initialEnabled,
  description,
}: {
  initialEnabled: boolean;
  description: string;
}) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onToggle(checked: boolean) {
    setSaving(true);
    setError(null);
    const previous = enabled;
    setEnabled(checked);

    try {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailNotifications: checked }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not update preferences");
    } catch (err) {
      setEnabled(previous);
      setError(err instanceof Error ? err.message : "Could not update preferences");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <label className="flex items-start gap-3">
        {saving ? (
          <Loader2 className="mt-1 size-4 shrink-0 animate-spin text-muted-foreground" />
        ) : (
          <input
            type="checkbox"
            className="mt-1 size-4 accent-primary"
            checked={enabled}
            onChange={(e) => onToggle(e.target.checked)}
            disabled={saving}
          />
        )}
        <span className="flex flex-col gap-1">
          <Label className="text-sm font-medium">Email notifications</Label>
          <Muted className="text-sm leading-relaxed">{description}</Muted>
        </span>
      </label>
      <TextSmall className="text-muted-foreground">
        Sign-in codes are always sent by email when you log in. This setting only affects
        portfolio and report updates.
      </TextSmall>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
