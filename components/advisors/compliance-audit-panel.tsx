"use client";

import { useEffect, useState } from "react";

import { Muted, TextSmall } from "@/components/ui/typography";
import type { AuditLogEntry } from "@/lib/wealth/wm-types";

export function ComplianceAuditPanel({ clientId }: { clientId: string }) {
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);

  useEffect(() => {
    fetch(`/api/clients/${clientId}/audit`)
      .then((r) => r.json())
      .then((d) => setEntries(d.entries ?? []));
  }, [clientId]);

  if (entries.length === 0) {
    return <Muted>No audit entries for this client yet.</Muted>;
  }

  return (
    <div className="flex flex-col gap-2">
      {entries.map((e) => (
        <div key={e.id} className="rounded-lg border border-border p-3">
          <div className="flex items-center justify-between gap-2">
            <TextSmall className="font-medium">{e.action}</TextSmall>
            <Muted className="text-xs">
              {new Date(e.created_at).toLocaleString("en-GB")}
            </Muted>
          </div>
          {e.note ? <Muted className="mt-1 text-sm">{e.note}</Muted> : null}
        </div>
      ))}
    </div>
  );
}
