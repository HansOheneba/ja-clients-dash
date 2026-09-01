"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FileWarning } from "lucide-react";

import { GenerateReportButton } from "@/components/reports/generate-report-button";
import { Muted, TextSmall } from "@/components/ui/typography";
import { statementKindTitle } from "@/lib/wealth/period-calendar";
import type { OutstandingReport } from "@/lib/wealth/wm-types";

export function OutstandingReportsNotice({ clientId }: { clientId?: string }) {
  const [items, setItems] = useState<OutstandingReport[]>([]);

  const load = useCallback(async () => {
    const url = clientId
      ? `/api/reports/outstanding?clientId=${clientId}`
      : "/api/reports/outstanding";
    const res = await fetch(url);
    const data = await res.json().catch(() => ({}));
    setItems(Array.isArray(data.items) ? data.items : []);
  }, [clientId]);

  useEffect(() => {
    load();
    const handler = () => load();
    window.addEventListener("ja:report-generated", handler);
    return () => window.removeEventListener("ja:report-generated", handler);
  }, [load]);

  const groups = useMemo(() => {
    const map = new Map<string, OutstandingReport[]>();
    for (const item of items) {
      const list = map.get(item.clientId) ?? [];
      list.push(item);
      map.set(item.clientId, list);
    }
    return [...map.entries()].map(([id, rows]) => ({
      clientId: id,
      clientName: rows[0]?.clientName ?? "",
      rows,
    }));
  }, [items]);

  if (groups.length === 0) return null;

  const clientCount = groups.length;
  const heading = clientId
    ? "Statement PDFs still to generate"
    : `${clientCount} client${clientCount === 1 ? "" : "s"} need a statement generated`;

  return (
    <div className="rounded-(--radius-card) border border-brand-accent/35 bg-brand-accent/8 p-5">
      <div className="mb-3 flex items-start gap-2.5">
        <FileWarning className="mt-0.5 size-4 shrink-0 text-brand-accent" />
        <div>
          <TextSmall className="font-semibold">{heading}</TextSmall>
          <Muted className="text-sm">
            Statement data is on file. The PDF is not created until you generate it, and it
            will not appear in the client portal until then.
          </Muted>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {groups.map((group) => (
          <div key={group.clientId} className="flex flex-col gap-2">
            {clientId ? null : (
              <Link
                href={`/advisors/dashboard/clients/${group.clientId}?tab=Reports`}
                className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
              >
                {group.clientName}
              </Link>
            )}
            {group.rows.map((row) => (
              <div
                key={`${row.clientId}-${row.kind}-${row.periodId}`}
                className="flex flex-col gap-2 rounded-lg border border-border/50 bg-background/70 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <TextSmall className="font-medium">
                    {statementKindTitle(row.kind)}
                  </TextSmall>
                  <Muted className="text-[13px]">{row.windowLabel}</Muted>
                </div>
                <GenerateReportButton
                  clientId={row.clientId}
                  periodId={row.periodId}
                  kind={row.kind}
                  buttonVariant="outline"
                  compact
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
