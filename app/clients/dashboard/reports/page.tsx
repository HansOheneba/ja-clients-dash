"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, Search } from "lucide-react";

import { PageShell } from "@/components/layout/page-shell";
import { ClientReportsPanel } from "@/components/reports/client-reports-panel";
import { Button } from "@/components/ui/button";
import { H1, Muted } from "@/components/ui/typography";
import { Input } from "@/components/ui/input";

export default function ClientReportsPage() {
  const [query, setQuery] = useState("");
  const [clientId, setClientId] = useState<string | null>(null);

  const loadMe = useCallback(async () => {
    try {
      const meRes = await fetch("/api/me");
      const me = await meRes.json();
      setClientId(me.clientId ?? null);
    } catch {
      setClientId(null);
    }
  }, []);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  return (
    <PageShell className="flex flex-col gap-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <H1>Reports</H1>
          <Muted>
            View and download investment reports published by your wealth manager.
          </Muted>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {clientId ? (
            <a href={`/api/clients/${clientId}/export`}>
              <Button size="sm" variant="outline">
                <Download className="size-4" />
                Export account data
              </Button>
            </a>
          ) : null}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search reports..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-8 w-full pl-8 text-sm sm:w-48"
            />
          </div>
        </div>
      </header>

      <ClientReportsPanel searchQuery={query} />
    </PageShell>
  );
}
