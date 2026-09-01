"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { H3, Muted, TextSmall } from "@/components/ui/typography";
import type { DocumentRequest, VaultDocument } from "@/lib/wealth/wm-types";

export function DocumentsWorkspace() {
  const [requests, setRequests] = useState<DocumentRequest[]>([]);
  const [expiring, setExpiring] = useState<(VaultDocument & { client_name: string })[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [reqRes, expRes] = await Promise.all([
      fetch("/api/documents"),
      fetch("/api/documents?view=expiring"),
    ]);
    const reqData = await reqRes.json();
    const expData = await expRes.json();
    setRequests((reqData.requests ?? []).filter((r: DocumentRequest) => r.status === "pending"));
    setExpiring(expData.documents ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <section>
        <H3 className="mb-3 text-base">Outstanding requests</H3>
        {requests.length === 0 ? (
          <Muted>No outstanding document requests.</Muted>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border">
            {requests.map((r, i) => (
              <div
                key={r.id}
                className={`flex items-center justify-between px-4 py-3 ${i < requests.length - 1 ? "border-b border-border/60" : ""}`}
              >
                <div>
                  <Link
                    href={`/advisors/dashboard/clients/${r.client_id}?tab=Documents`}
                    className="font-medium hover:underline"
                  >
                    {r.client_name}
                  </Link>
                  <Muted className="text-sm">{r.title}</Muted>
                </div>
                <Muted className="text-sm">
                  {r.due_date
                    ? new Date(`${r.due_date}T12:00:00`).toLocaleDateString("en-GB")
                    : "No due date"}
                </Muted>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <H3 className="mb-3 text-base">Expiring documents (30 days)</H3>
        {expiring.length === 0 ? (
          <Muted>No documents expiring soon.</Muted>
        ) : (
          <div className="flex flex-col gap-2">
            {expiring.map((d) => (
              <div key={d.id} className="flex items-center justify-between rounded-xl border border-border p-4">
                <div>
                  <TextSmall className="font-medium">{d.title}</TextSmall>
                  <Muted className="text-sm">{d.client_name}</Muted>
                </div>
                <Badge variant="outline">
                  {d.expires_on
                    ? new Date(`${d.expires_on}T12:00:00`).toLocaleDateString("en-GB")
                    : "N/A"}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
