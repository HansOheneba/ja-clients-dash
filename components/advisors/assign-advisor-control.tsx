"use client";

import { useEffect, useState } from "react";
import { Loader2, UserCog } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Muted, TextSmall } from "@/components/ui/typography";
import type { AdvisorListRow } from "@/lib/wealth/types";
import { cn } from "@/lib/utils";

type Props = {
  clientId: string;
  advisorId: string | null;
  advisors: AdvisorListRow[];
  onAssigned?: (advisorId: string | null) => void;
  /** compact: inline select only; default: labeled block with save button */
  variant?: "compact" | "default";
  className?: string;
};

export function AssignAdvisorControl({
  clientId,
  advisorId,
  advisors,
  onAssigned,
  variant = "default",
  className,
}: Props) {
  const activeAdvisors = advisors.filter((a) => a.is_active || a.id === advisorId);
  const [value, setValue] = useState(advisorId ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const dirty = value !== (advisorId ?? "");

  useEffect(() => {
    setValue(advisorId ?? "");
  }, [advisorId]);

  async function save(nextValue?: string) {
    const target = nextValue ?? value;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ advisorId: target || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not assign manager");
      setValue(target);
      setMessage("Saved");
      onAssigned?.(target || null);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not assign manager");
    } finally {
      setSaving(false);
    }
  }

  if (variant === "compact") {
    return (
      <div className={cn("flex min-w-0 items-center gap-1", className)}>
        <Select
          value={value}
          disabled={saving}
          className="h-8 min-w-[8.5rem] text-xs"
          onChange={(e) => {
            const next = e.target.value;
            setValue(next);
            void save(next);
          }}
        >
          <option value="">Unassigned</option>
          {advisorId && !activeAdvisors.some((a) => a.id === advisorId) ? (
            <option value={advisorId}>Current</option>
          ) : null}
          {activeAdvisors.map((advisor) => (
            <option key={advisor.id} value={advisor.id}>
              {advisor.full_name}
            </option>
          ))}
        </Select>
        {saving ? <Loader2 className="size-3.5 shrink-0 animate-spin text-muted-foreground" /> : null}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center gap-2">
        <UserCog className="size-4 text-muted-foreground" />
        <TextSmall className="font-semibold">Wealth manager</TextSmall>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="min-w-[12rem] flex-1">
          <Label htmlFor={`assign-${clientId}`} className="sr-only">
            Assigned wealth manager
          </Label>
          <Select
            id={`assign-${clientId}`}
            value={value}
            disabled={saving}
            onChange={(e) => setValue(e.target.value)}
          >
            <option value="">Unassigned</option>
            {advisorId && !activeAdvisors.some((a) => a.id === advisorId) ? (
              <option value={advisorId}>Current advisor</option>
            ) : null}
            {activeAdvisors.map((advisor) => (
              <option key={advisor.id} value={advisor.id}>
                {advisor.full_name}
                {advisor.is_active ? "" : " (inactive)"}
              </option>
            ))}
          </Select>
        </div>
        <Button
          type="button"
          size="sm"
          disabled={saving || !dirty}
          onClick={() => save()}
          className="shrink-0"
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : null}
          {saving ? "Saving..." : advisorId ? "Reassign" : "Assign"}
        </Button>
      </div>
      {message ? (
        <Muted className={cn("text-xs", message === "Saved" ? "" : "text-destructive")}>
          {message}
        </Muted>
      ) : (
        <Muted className="text-xs">
          This client&apos;s sessions, messages, and document requests follow the assigned manager.
        </Muted>
      )}
    </div>
  );
}
