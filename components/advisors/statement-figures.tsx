"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import { formatCompactUsd } from "@/lib/wealth/constants";
import type { PortfolioBucket } from "@/lib/wealth/types";
import { cn } from "@/lib/utils";

export type FigureTone = "positive" | "negative" | "neutral";

export const BUCKET_DOT: Record<PortfolioBucket, string> = {
  income: "bg-amber-600",
  growth: "bg-brand-primary",
  venture: "bg-violet-600",
  treasury: "bg-teal-700",
  coa: "bg-emerald-700",
};

export const BUCKET_SHORT: Record<PortfolioBucket, string> = {
  income: "Income",
  growth: "Growth",
  venture: "Venture",
  treasury: "Treasury",
  coa: "Cash",
};

export function figureTone(value: number | null | undefined): FigureTone {
  if (value == null || !Number.isFinite(value) || value === 0) return "neutral";
  return value > 0 ? "positive" : "negative";
}

export function figureToneClass(tone: FigureTone): string {
  if (tone === "positive") return "text-emerald-800";
  if (tone === "negative") return "text-red-700";
  return "text-muted-foreground";
}

export function moneyDisplay(raw: string, signed = false): { text: string; tone: FigureTone } {
  if (raw.trim() === "") return { text: "n/a", tone: "neutral" };
  const value = Number(raw);
  if (!Number.isFinite(value)) return { text: raw, tone: "neutral" };
  return { text: formatCompactUsd(value, signed), tone: signed ? figureTone(value) : "neutral" };
}

export function pctDisplay(raw: string): { text: string; tone: FigureTone } {
  if (raw.trim() === "") return { text: "n/a", tone: "neutral" };
  const value = Number(raw);
  if (!Number.isFinite(value)) return { text: raw, tone: "neutral" };
  const text = `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
  return { text, tone: figureTone(value) };
}

export function FigureField({
  value,
  onChange,
  display,
  tone = "neutral",
  emphasis = "secondary",
  align = "right",
  ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  display: string;
  tone?: FigureTone;
  emphasis?: "primary" | "secondary";
  align?: "left" | "right";
  ariaLabel: string;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <Input
        autoFocus
        type="number"
        step="any"
        aria-label={ariaLabel}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={() => setEditing(false)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === "Escape") {
            event.currentTarget.blur();
          }
        }}
        className={cn(
          "h-8 min-w-[6.5rem] border-border/80 bg-background px-2 shadow-none focus-visible:ring-1",
          align === "right" && "text-right",
        )}
      />
    );
  }

  return (
    <button
      type="button"
      aria-label={`${ariaLabel}, ${display}. Activate to edit.`}
      onClick={() => setEditing(true)}
      className={cn(
        "w-full rounded-md px-1 py-1 font-numeric tabular-nums transition-colors hover:bg-muted/80",
        align === "right" ? "text-right" : "text-left",
        emphasis === "primary"
          ? "text-sm font-semibold text-brand-primary"
          : cn("text-[13px]", tone === "neutral" ? "text-foreground" : figureToneClass(tone)),
        display === "n/a" && "text-muted-foreground",
      )}
    >
      {display}
    </button>
  );
}
