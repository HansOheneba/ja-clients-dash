"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Download, Eye, FileText } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  DashCard,
  DashCardContent,
  DashCardDescription,
  DashCardHeader,
  DashCardTitle,
} from "@/components/ui/dash-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Muted, TextSmall } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

type ReportDoc = {
  id: string;
  name: string;
  date: string;
  sizeKb: number;
  downloadUrl: string;
};

function formatSize(kb: number): string {
  return kb >= 1000 ? `${(kb / 1000).toFixed(1)} MB` : `${kb} KB`;
}

export function ClientReportsPanel({
  variant = "full",
  className,
  searchQuery = "",
}: {
  variant?: "full" | "compact";
  className?: string;
  searchQuery?: string;
}) {
  const [reports, setReports] = useState<ReportDoc[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reports");
      const data = await res.json();
      setReports(data.reports ?? []);
    } catch {
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const handler = () => load();
    window.addEventListener("ja:report-generated", handler);
    return () => window.removeEventListener("ja:report-generated", handler);
  }, [load]);

  const latest = reports[0];
  const filtered = searchQuery.trim()
    ? reports.filter((r) => r.name.toLowerCase().includes(searchQuery.trim().toLowerCase()))
    : reports;

  if (variant === "compact") {
    return (
      <DashCard className={className}>
        <DashCardHeader className="mb-2">
          <div>
            <DashCardTitle>Wealth reports</DashCardTitle>
            <DashCardDescription>
              Download formal statements prepared by your wealth manager
            </DashCardDescription>
          </div>
        </DashCardHeader>
        <DashCardContent>
          {loading ? (
            <Skeleton className="h-10 w-full" />
          ) : latest ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <TextSmall className="font-medium">{latest.name}</TextSmall>
                <Muted>{latest.date} · {formatSize(latest.sizeKb)}</Muted>
              </div>
              <div className="flex flex-wrap gap-2">
                <a href={latest.downloadUrl} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="outline">
                    <Eye className="size-3.5" />
                    View PDF
                  </Button>
                </a>
                <a href={latest.downloadUrl} download>
                  <Button size="sm">
                    <Download className="size-3.5" />
                    Download
                  </Button>
                </a>
                <Link
                  href="/clients/dashboard/reports"
                  className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                >
                  All reports
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Muted>
                No statements yet. Your wealth manager publishes wealth reports here when
                they are ready.
              </Muted>
              <Link
                href="/clients/dashboard/reports"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-fit")}
              >
                Open reports vault
              </Link>
            </div>
          )}
        </DashCardContent>
      </DashCard>
    );
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <DashCard padding="sm" className="border-brand-primary/20 bg-brand-primary/5">
        <DashCardContent>
          <TextSmall className="leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">How statements work.</span> Your
            wealth manager generates wealth reports from their portal. When a new report
            is ready, you can view or download it here. Clients cannot generate reports
            themselves.
          </TextSmall>
        </DashCardContent>
      </DashCard>

      <DashCard>
        <DashCardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-primary/10">
              <FileText className="size-5 text-brand-primary" />
            </div>
            <div>
              <DashCardTitle>Your wealth reports</DashCardTitle>
              <DashCardDescription>
                {loading
                  ? "Loading..."
                  : `${filtered.length} statement${filtered.length === 1 ? "" : "s"} in your vault`}
              </DashCardDescription>
            </div>
          </div>
        </DashCardHeader>
        <DashCardContent className="gap-0 p-0">
          <div className="divide-y divide-border/40 px-6">
            {loading
              ? Array.from({ length: 2 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-3 py-3">
                    <Skeleton className="size-4 shrink-0 rounded" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                  </div>
                ))
              : null}
            {!loading && filtered.length === 0 ? (
              <Muted className="py-4 text-sm">
                {reports.length === 0
                  ? "No reports yet. Ask your wealth manager to generate a statement after your portfolio is updated for the period."
                  : "No reports match your search."}
              </Muted>
            ) : null}
            {filtered.map((doc) => (
              <div key={doc.id} className="flex items-center gap-3 py-3">
                <FileText className="size-4 shrink-0 text-muted-foreground/60" />
                <div className="min-w-0 flex-1">
                  <TextSmall className="font-medium">{doc.name}</TextSmall>
                  <Muted>{doc.date} · {formatSize(doc.sizeKb)}</Muted>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <a
                    href={doc.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-8 items-center justify-center gap-1 rounded-md border px-2.5 text-xs font-medium"
                  >
                    <Eye className="size-3.5" />
                    View
                  </a>
                  <a
                    href={doc.downloadUrl}
                    download
                    className="inline-flex h-8 items-center justify-center gap-1 rounded-md border bg-primary px-2.5 text-xs font-medium text-primary-foreground"
                  >
                    <Download className="size-3.5" />
                    Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        </DashCardContent>
      </DashCard>
    </div>
  );
}
