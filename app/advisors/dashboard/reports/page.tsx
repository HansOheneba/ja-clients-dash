"use client";

import { useEffect, useState } from "react";

import {
  AdvisorPageHeader,
  SurfaceCard,
  advisorSurface,
} from "@/components/advisors/advisor-surface";
import { PageShell } from "@/components/layout/page-shell";
import { AdvisorReportsList } from "@/components/reports/advisor-reports-list";
import { GenerateReportButton } from "@/components/reports/generate-report-button";
import { GenerateReportsGuide } from "@/components/reports/generate-reports-guide";
import { OutstandingReportsNotice } from "@/components/reports/outstanding-reports-notice";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Muted, TextSmall } from "@/components/ui/typography";

export default function AdvisorReportsPage() {
  const [clientOptions, setClientOptions] = useState<{ id: string; name: string }[]>([]);
  const [clientId, setClientId] = useState("");

  useEffect(() => {
    fetch("/api/clients")
      .then((res) => res.json())
      .then((data) =>
        setClientOptions(
          (data.clients ?? []).map((c: { id: string; full_name: string }) => ({
            id: c.id,
            name: c.full_name,
          })),
        ),
      )
      .catch(() => undefined);
  }, []);

  return (
    <PageShell className={advisorSurface.pageGap}>
      <AdvisorPageHeader
        title="Reports"
        description="Reports are created only when you click Generate. That PDF then appears in the client portal."
      />

      <OutstandingReportsNotice />

      <SurfaceCard>
        <div className="mb-3">
          <TextSmall className="font-semibold">Generate a statement</TextSmall>
          <Muted className="text-[12px]">
            Choose a client, then generate. Nothing is sent to their portal until you do.
          </Muted>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="min-w-64 flex-1">
            <Label htmlFor="report-client">Client</Label>
            <Select
              id="report-client"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
            >
              <option value="">Select a client</option>
              {clientOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
          <GenerateReportButton clientId={clientId} />
        </div>
      </SurfaceCard>

      <GenerateReportsGuide />
      <AdvisorReportsList />
    </PageShell>
  );
}
