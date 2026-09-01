"use client";

import { ClientDocumentsView } from "@/components/clients/client-documents-view";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { H1, Muted } from "@/components/ui/typography";
import { Download } from "lucide-react";

export function ClientDocumentsPageClient({
  clientId,
}: {
  clientId: string | null;
}) {
  return (
    <PageShell className="flex flex-col gap-(--spacing-section)">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <H1>Documents</H1>
          <Muted>
            Upload what your wealth manager has requested and download shared reports and files.
          </Muted>
        </div>
        {clientId ? (
          <a href={`/api/clients/${clientId}/export`}>
            <Button size="sm" variant="outline">
              <Download className="size-4" />
              Export account data
            </Button>
          </a>
        ) : null}
      </header>

      <ClientDocumentsView />
    </PageShell>
  );
}
