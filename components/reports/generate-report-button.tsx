"use client";

import { useState } from "react";
import { ChevronDown, FileText, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { statementKindTitle, type ReportKind } from "@/lib/wealth/period-calendar";

type Props = {
  clientId: string;
  periodId?: string;
  kind?: ReportKind;
  className?: string;
  buttonVariant?: "default" | "outline";
  compact?: boolean;
};

const KINDS: { kind: ReportKind; hint: string }[] = [
  { kind: "monthly", hint: "The month you have open" },
  { kind: "quarterly", hint: "Calendar quarter of that month" },
  { kind: "annual", hint: "Full calendar year" },
];

const KIND_ACTION: Record<ReportKind, string> = {
  monthly: "Generate monthly",
  quarterly: "Generate quarterly",
  annual: "Generate annual",
};

export function GenerateReportButton({
  clientId,
  periodId,
  kind,
  className,
  buttonVariant = "default",
  compact = false,
}: Props) {
  const [loading, setLoading] = useState<ReportKind | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleGenerate(kind: ReportKind) {
    setLoading(kind);
    setMessage(null);
    try {
      const res = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, periodId, kind }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");
      if (!compact) setMessage(`${data.title ?? "Report"} is ready.`);
      window.dispatchEvent(new CustomEvent("ja:report-generated"));
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setLoading(null);
    }
  }

  const busy = loading !== null;

  if (kind) {
    return (
      <div className={className}>
        <Button
          size="sm"
          variant={buttonVariant}
          disabled={busy || !clientId}
          onClick={() => handleGenerate(kind)}
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : <FileText className="size-4" />}
          {KIND_ACTION[kind]}
        </Button>
        {message ? (
          <p className="mt-2 text-xs text-destructive">{message}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={busy || !clientId}
          render={
            <Button size="sm" variant={buttonVariant} disabled={busy || !clientId}>
              {busy ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <FileText className="size-4" />
              )}
              Generate report
              <ChevronDown className="size-4" />
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-64" sideOffset={6}>
          <DropdownMenuLabel>PDF variant</DropdownMenuLabel>
          {KINDS.map(({ kind, hint }) => (
            <DropdownMenuItem
              key={kind}
              disabled={busy}
              onClick={() => handleGenerate(kind)}
            >
              <span className="flex min-w-0 flex-col">
                <span>{statementKindTitle(kind)}</span>
                <span className="text-xs text-muted-foreground">{hint}</span>
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {message ? (
        <p
          className={`mt-2 text-xs ${message.includes("ready") ? "text-muted-foreground" : "text-destructive"}`}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
