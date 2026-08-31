"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { StatementDataWorkspace } from "@/components/advisors/statement-data-workspace";
import { PageSpinner } from "@/components/ui/page-spinner";
import { H1, Muted } from "@/components/ui/typography";
import type { PortfolioSnapshot, StatementPeriod, WealthClient } from "@/lib/wealth/types";

export default function ClientStatementDataPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const periodIdFromUrl = searchParams.get("periodId");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [client, setClient] = useState<WealthClient | null>(null);
  const [periods, setPeriods] = useState<StatementPeriod[]>([]);
  const [snapshots, setSnapshots] = useState<PortfolioSnapshot[]>([]);
  const [activePeriodId, setActivePeriodId] = useState<string | null>(null);

  const load = useCallback(async (keepPeriodId?: string) => {
    setError(null);
    try {
      const res = await fetch(`/api/clients/${params.id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not load client");

      const nextPeriods: StatementPeriod[] = data.periods ?? [];
      const preferredPeriodId =
        keepPeriodId && nextPeriods.some((p) => p.id === keepPeriodId)
          ? keepPeriodId
          : periodIdFromUrl && nextPeriods.some((p) => p.id === periodIdFromUrl)
            ? periodIdFromUrl
            : (nextPeriods[0]?.id ?? null);

      setClient(data.client);
      setPeriods(nextPeriods);
      setActivePeriodId(preferredPeriodId);

      if (preferredPeriodId) {
        const portfolioRes = await fetch(
          `/api/clients/${params.id}/portfolio?periodId=${preferredPeriodId}`,
        );
        const portfolioData = await portfolioRes.json();
        setSnapshots(portfolioData.snapshots ?? data.snapshots ?? []);
      } else {
        setSnapshots(data.snapshots ?? []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load client");
      setClient(null);
    } finally {
      setLoading(false);
    }
  }, [params.id, periodIdFromUrl]);

  useEffect(() => {
    load();
  }, [load]);

  const initialPeriodId = useMemo(() => {
    if (periodIdFromUrl && periods.some((p) => p.id === periodIdFromUrl)) {
      return periodIdFromUrl;
    }
    return activePeriodId;
  }, [activePeriodId, periodIdFromUrl, periods]);

  if (loading) {
    return <PageSpinner className="px-4 sm:px-6" />;
  }

  if (!client) {
    return (
      <div className="flex flex-col gap-3 px-4 py-16 sm:px-6">
        <H1>Client not found</H1>
        <Muted>{error ?? "This client is not in the book."}</Muted>
        <Link href="/advisors/dashboard/clients" className="text-sm underline">
          Back to clients
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-6 sm:px-6">
      <Link
        href={`/advisors/dashboard/clients/${client.id}`}
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        {client.full_name}
      </Link>

      <StatementDataWorkspace
        clientId={client.id}
        clientName={client.full_name}
        periods={periods}
        initialPeriodId={initialPeriodId}
        initialSnapshots={snapshots}
        onChanged={load}
      />
    </div>
  );
}
