"use client";

import { useState } from "react";
import { Download, FileText, Loader2 } from "lucide-react";

import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import {
  DashCard,
  DashCardContent,
  DashCardDescription,
  DashCardHeader,
  DashCardTitle,
} from "@/components/ui/dash-card";
import { H1, Muted, TextSmall } from "@/components/ui/typography";

const SAMPLE_REPORTS = [
  {
    id: "john-doe",
    name: "John Doe | Q2 2026 investment report",
    date: "30 June 2026",
    size: "Sample PDF",
  },
];

export default function ClientDemoReportsPage() {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function downloadSample(clientId: string) {
    setLoadingId(clientId);
    setMessage(null);
    try {
      const res = await fetch(`/api/reports/demo-generate?clientId=${clientId}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Download failed");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const disposition = res.headers.get("Content-Disposition");
      const match = disposition?.match(/filename="([^"]+)"/);
      const link = document.createElement("a");
      link.href = url;
      link.download = match?.[1] ?? "investment-report.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Download failed");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <PageShell className="flex flex-col gap-5">
      <header className="flex flex-col gap-1">
        <H1>Reports</H1>
        <Muted>Sample statements. Live reports are published by your wealth manager.</Muted>
      </header>

      <DashCard padding="sm" className="border-brand-primary/20 bg-brand-primary/5">
        <DashCardContent>
          <TextSmall className="leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">Clients download, managers generate.</span>{" "}
            Your wealth manager enters portfolio values on the client record, then generates the
            PDF. When a statement is ready it appears here for you to view or download.
          </TextSmall>
        </DashCardContent>
      </DashCard>

      <DashCard>
        <DashCardHeader>
          <div>
            <DashCardTitle>Sample investment reports</DashCardTitle>
            <DashCardDescription>Placeholder vault for design review</DashCardDescription>
          </div>
        </DashCardHeader>
        <DashCardContent className="gap-3">
          {SAMPLE_REPORTS.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center gap-3 border-b border-border/60 pb-3 last:border-0 last:pb-0"
            >
              <FileText className="size-4 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <TextSmall className="truncate font-medium">{doc.name}</TextSmall>
                <Muted>
                  {doc.date} · {doc.size}
                </Muted>
              </div>
              <Button
                size="sm"
                variant="outline"
                disabled={loadingId === doc.id}
                onClick={() => downloadSample(doc.id)}
              >
                {loadingId === doc.id ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Download className="size-4" />
                )}
                Download
              </Button>
            </div>
          ))}
          {message ? <Muted className="text-destructive">{message}</Muted> : null}
        </DashCardContent>
      </DashCard>
    </PageShell>
  );
}
