"use client";

import { useEffect, useState } from "react";

import { PageShell } from "@/components/layout/page-shell";
import { ReportBuilder } from "@/components/advisors/report-builder";
import { AdvisorReportsList } from "@/components/reports/advisor-reports-list";
import { GenerateReportsGuide } from "@/components/reports/generate-reports-guide";
import { H1, Muted } from "@/components/ui/typography";

export default function AdvisorReportsPage() {
  const [clientOptions, setClientOptions] = useState<{ id: string; name: string }[]>([]);

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
        <Muted>Generate investment statements and download reports across your book</Muted>
      </header>

      <ReportBuilder clientOptions={clientOptions} />
      <GenerateReportsGuide />
      <AdvisorReportsList />
    </PageShell>
  );
}
