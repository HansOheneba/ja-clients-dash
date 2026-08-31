"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Download, FileText } from "lucide-react";

import { GenerateReportButton } from "@/components/reports/generate-report-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DashCard,
  DashCardContent,
  DashCardDescription,
  DashCardHeader,
  DashCardTitle,
} from "@/components/ui/dash-card";
import { Muted, TextSmall } from "@/components/ui/typography";

type ReportDoc = {
  id: string;
  name: string;
  date: string;
  sizeKb: number;
  downloadUrl: string;
  clientName?: string;
};

export function AdvisorReportsList({ clientId }: { clientId?: string }) {
  const [reports, setReports] = useState<ReportDoc[]>([]);

  const load = useCallback(async () => {
    const url = clientId ? `/api/reports?clientId=${clientId}` : "/api/reports";
    const res = await fetch(url);
    const data = await res.json();
    setReports(data.reports ?? []);
  }, [clientId]);

  useEffect(() => {
    load();
    const handler = () => load();
    window.addEventListener("ja:report-generated", handler);
    return () => window.removeEventListener("ja:report-generated", handler);
  }, [load]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <TextSmall className="font-semibold">Investment reports</TextSmall>
          <Muted>
            Download past statements, or generate a monthly, quarterly, or annual PDF
          </Muted>
        </div>
        {clientId ? <GenerateReportButton clientId={clientId} /> : null}
      </div>

      <DashCard>
        <DashCardHeader>
          <DashCardTitle>Reports</DashCardTitle>
          <DashCardDescription>
            {reports.length === 0 ? "No reports generated yet." : `${reports.length} on file`}
          </DashCardDescription>
        </DashCardHeader>
        <DashCardContent className="gap-3">
          {reports.length === 0 && clientId ? (
            <div className="flex flex-col gap-3 py-2">
              <Muted>
                No reports yet. Enter statement data for this client, then generate a PDF.
              </Muted>
              <Link href={`/advisors/dashboard/clients/${clientId}/statement`}>
                <Button variant="outline" size="sm" className="w-fit">
                  Enter statement data
                </Button>
              </Link>
            </div>
          ) : null}
          {reports.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center gap-3 border-b border-border/60 pb-3 last:border-0 last:pb-0"
            >
              <FileText className="size-4 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <TextSmall className="truncate font-medium">{doc.name}</TextSmall>
                <Muted>
                  {doc.clientName ? `${doc.clientName} · ` : ""}
                  {doc.date}
                </Muted>
              </div>
              <Badge variant="outline">PDF</Badge>
              <a
                href={doc.downloadUrl}
                download
                aria-label={`Download ${doc.name}`}
                className="inline-flex size-8 items-center justify-center rounded-md hover:bg-muted"
              >
                <Download className="size-4" />
              </a>
            </div>
          ))}
        </DashCardContent>
      </DashCard>
    </div>
  );
}
