"use client";

import Link from "next/link";

import { PageShell } from "@/components/layout/page-shell";
import { AdvisorReportsList } from "@/components/reports/advisor-reports-list";
import { GenerateReportsGuide } from "@/components/reports/generate-reports-guide";
import { H1, Muted } from "@/components/ui/typography";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AdvisorReportsPage() {
  return (
    <PageShell className="flex flex-col gap-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <H1>Reports</H1>
          <Muted>Generate investment statements and download reports across your book</Muted>
        </div>
        <Link
          href="/advisors/dashboard/clients"
          className={cn(buttonVariants({ size: "sm" }))}
        >
          Choose a client to generate
        </Link>
      </header>

      <GenerateReportsGuide />

      <AdvisorReportsList />
    </PageShell>
  );
}
