"use client";

import { useEffect, useState } from "react";

import { PageShell } from "@/components/layout/page-shell";
import { AdvisorReportsList } from "@/components/reports/advisor-reports-list";
import { GenerateReportButton } from "@/components/reports/generate-report-button";
import { GenerateReportsGuide } from "@/components/reports/generate-reports-guide";
import { OutstandingReportsNotice } from "@/components/reports/outstanding-reports-notice";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { H1, Muted, TextSmall } from "@/components/ui/typography";

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
    <PageShell className="flex flex-col gap-5">
      <header className="flex flex-col gap-1">
        <H1>Reports</H1>
        <Muted>
          Reports are created only when you click Generate. That PDF then appears in the
          client portal.
        </Muted>
      </header>

      <OutstandingReportsNotice />

      <div className="flex flex-col gap-4 rounded-(--radius-card) border border-border/60 bg-card p-5">
        <div>
          <TextSmall className="font-semibold">Generate a statement</TextSmall>
          <Muted className="text-sm">
            Choose a client, then generate. Nothing is sent to their portal until you do.
          </Muted>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="min-w-[16rem] flex-1">
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
      </div>

      <GenerateReportsGuide />
      <AdvisorReportsList />
    </PageShell>
  );
}
