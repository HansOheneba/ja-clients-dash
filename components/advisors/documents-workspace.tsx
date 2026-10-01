"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { FileWarning, Loader2 } from "lucide-react";

import {
  AdvisorSectionHeader,
  SurfaceCard,
} from "@/components/advisors/advisor-surface";
import { Badge } from "@/components/ui/badge";
import { Muted, TextSmall } from "@/components/ui/typography";
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
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
      <SurfaceCard>
        <AdvisorSectionHeader
          title="Outstanding requests"
          subtitle="Documents clients still need to upload"
          className="mb-3"
        />
        {requests.length === 0 ? (
          <div className="rounded-lg bg-[#f7f1e8] px-3 py-3.5">
            <Muted className="text-[12px]">No outstanding document requests.</Muted>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {requests.map((r) => (
              <Link
                key={r.id}
                href={`/advisors/dashboard/clients/${r.client_id}?tab=Documents`}
                className="flex items-center justify-between gap-3 rounded-lg bg-[#f7f1e8] px-2.5 py-2 transition-opacity hover:opacity-90"
              >
                <div className="min-w-0">
                  <TextSmall className="text-[12px] font-medium">{r.client_name}</TextSmall>
                  <Muted className="text-[11px]">{r.title}</Muted>
                </div>
                <Muted className="shrink-0 text-[11px]">
                  {r.due_date
                    ? new Date(`${r.due_date}T12:00:00`).toLocaleDateString("en-GB")
                    : "No due date"}
                </Muted>
              </Link>
            ))}
          </div>
        )}
      </SurfaceCard>

      <SurfaceCard>
        <AdvisorSectionHeader
          title="Expiring documents"
          subtitle="KYC and vault items in the next 30 days"
          className="mb-3"
          action={
            <span className="flex size-6 items-center justify-center rounded-md bg-[#c45c57]/12 text-[#a34844]">
              <FileWarning className="size-3.5" />
            </span>
          }
        />
        {expiring.length === 0 ? (
          <div className="rounded-lg bg-[#f8efe9] px-3 py-3.5">
            <Muted className="text-[12px]">No documents expiring soon.</Muted>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {expiring.map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between gap-3 rounded-lg bg-[#f8efe9] px-2.5 py-2"
              >
                <div className="min-w-0">
                  <TextSmall className="text-[12px] font-medium">{d.title}</TextSmall>
                  <Muted className="text-[11px]">{d.client_name}</Muted>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  {d.expires_on
                    ? new Date(`${d.expires_on}T12:00:00`).toLocaleDateString("en-GB")
                    : "N/A"}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </SurfaceCard>
    </div>
  );
}
