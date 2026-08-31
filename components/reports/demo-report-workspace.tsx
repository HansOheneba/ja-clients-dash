"use client";

import { useMemo, useState } from "react";
import { FileText, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DashCard,
  DashCardContent,
  DashCardDescription,
  DashCardHeader,
  DashCardTitle,
} from "@/components/ui/dash-card";
import { Input } from "@/components/ui/input";
import { KpiItem, KpiStrip } from "@/components/ui/kpi-strip";
import { Select } from "@/components/ui/select";
import { Muted, TextSmall } from "@/components/ui/typography";
import {
  getDemoSnapshots,
  listDemoReportClients,
  type DemoSnapshotInput,
} from "@/lib/reports/demo-client-data";
import { ALL_BUCKETS, BUCKET_COLORS, BUCKET_LABELS, formatUsd } from "@/lib/wealth/constants";
import type { PortfolioBucket } from "@/lib/wealth/types";

type DraftRow = {
  bucket: PortfolioBucket;
  previous_value_usd: string;
  current_value_usd: string;
  period_change_pct: string;
  ytd_pct: string;
  inception_gain_usd: string;
  inception_pct: string;
  annualized_return_pct: string;
};

function toDraft(rows: DemoSnapshotInput[]): DraftRow[] {
  const map = new Map(rows.map((row) => [row.bucket, row]));
  return ALL_BUCKETS.map((bucket) => {
    const row = map.get(bucket);
    return {
      bucket,
      previous_value_usd: String(row?.previous_value_usd ?? 0),
      current_value_usd: String(row?.current_value_usd ?? 0),
      period_change_pct: row?.period_change_pct == null ? "" : String(row.period_change_pct),
      ytd_pct: row?.ytd_pct == null ? "" : String(row.ytd_pct),
      inception_gain_usd: row?.inception_gain_usd == null ? "" : String(row.inception_gain_usd),
      inception_pct: row?.inception_pct == null ? "" : String(row.inception_pct),
      annualized_return_pct:
        row?.annualized_return_pct == null ? "" : String(row.annualized_return_pct),
    };
  });
}

function num(value: string) {
  if (value.trim() === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function toPayload(rows: DraftRow[]): DemoSnapshotInput[] {
  return rows.map((row) => ({
    bucket: row.bucket,
    previous_value_usd: Number(row.previous_value_usd || 0),
    current_value_usd: Number(row.current_value_usd || 0),
    period_change_pct: num(row.period_change_pct),
    ytd_pct: num(row.ytd_pct),
    inception_gain_usd: num(row.inception_gain_usd),
    inception_pct: num(row.inception_pct),
    annualized_return_pct: num(row.annualized_return_pct),
  }));
}

const DRAFT_KEYS = [
  "previous_value_usd",
  "current_value_usd",
  "period_change_pct",
  "ytd_pct",
  "inception_gain_usd",
  "inception_pct",
  "annualized_return_pct",
] as const;

export function DemoReportWorkspace({
  initialClientId,
}: {
  initialClientId?: string;
}) {
  const demoClients = listDemoReportClients();
  const firstId =
    (initialClientId && demoClients.some((c) => c.id === initialClientId)
      ? initialClientId
      : demoClients[0]?.id) ?? "john-doe";
  const [clientId, setClientId] = useState(firstId);
  const [draft, setDraft] = useState<DraftRow[]>(() => toDraft(getDemoSnapshots(clientId)));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const totals = useMemo(() => {
    const previous = draft.reduce((sum, row) => sum + Number(row.previous_value_usd || 0), 0);
    const current = draft.reduce((sum, row) => sum + Number(row.current_value_usd || 0), 0);
    const investedPrev = draft
      .filter((row) => row.bucket !== "coa")
      .reduce((sum, row) => sum + Number(row.previous_value_usd || 0), 0);
    const investedCurr = draft
      .filter((row) => row.bucket !== "coa")
      .reduce((sum, row) => sum + Number(row.current_value_usd || 0), 0);
    const gain = investedCurr - investedPrev;
    const periodPct = investedPrev > 0 ? (gain / investedPrev) * 100 : 0;
    return { previous, current, gain, periodPct };
  }, [draft]);

  function selectClient(nextId: string) {
    setClientId(nextId);
    setDraft(toDraft(getDemoSnapshots(nextId)));
    setMessage(null);
  }

  async function generateStatement() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/reports/demo-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, snapshots: toPayload(draft) }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Generation failed");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const disposition = res.headers.get("Content-Disposition");
      const match = disposition?.match(/filename="([^"]+)"/);
      const fileName = match?.[1] ?? "investment-report.pdf";
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setMessage(`Downloaded ${fileName}`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <DashCard padding="sm" className="border-brand-primary/20 bg-brand-primary/5">
        <DashCardContent>
          <TextSmall className="leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">Where the numbers come from.</span>{" "}
            On a live client, the wealth manager opens the record, goes to{" "}
            <span className="font-medium text-foreground">Portfolio</span>, enters previous and
            current values for each bucket, saves, then generates. This demo uses sample clients
            so you can edit the same fields and download a PDF without touching your book.
          </TextSmall>
        </DashCardContent>
      </DashCard>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <TextSmall className="font-medium">Sample client</TextSmall>
          <Select
            value={clientId}
            onChange={(e) => selectClient(e.target.value)}
            className="min-w-64"
          >
            {demoClients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </Select>
        </div>
        <Button size="sm" onClick={generateStatement} disabled={loading}>
          {loading ? <Loader2 className="size-4 animate-spin" /> : <FileText className="size-4" />}
          Generate statement
        </Button>
      </div>

      {message ? (
        <Muted className={message.startsWith("Downloaded") ? undefined : "text-destructive"}>
          {message}
        </Muted>
      ) : null}

      <KpiStrip cols={4}>
        <KpiItem
          label="Current value"
          value={formatUsd(totals.current)}
          change={`Previous ${formatUsd(totals.previous)}`}
          trend="neutral"
        />
        <KpiItem
          label="Period gain"
          value={formatUsd(totals.gain)}
          change={`${totals.periodPct >= 0 ? "+" : ""}${totals.periodPct.toFixed(1)}%`}
          trend={totals.gain >= 0 ? "up" : "down"}
        />
        <KpiItem label="Buckets" value={String(ALL_BUCKETS.length)} change="Report source data" trend="neutral" />
        <KpiItem
          label="PDF"
          value="Sample"
          change="Does not save to the live vault"
          trend="neutral"
        />
      </KpiStrip>

      <DashCard>
        <DashCardHeader className="mb-3">
          <div>
            <DashCardTitle>Portfolio buckets</DashCardTitle>
            <DashCardDescription>
              These figures are what the investment report PDF prints. Change a value, then
              generate.
            </DashCardDescription>
          </div>
        </DashCardHeader>
        <DashCardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="pb-2 pr-3 font-medium">Bucket</th>
                <th className="pb-2 pr-3 font-medium">Previous</th>
                <th className="pb-2 pr-3 font-medium">Current</th>
                <th className="pb-2 pr-3 font-medium">Period %</th>
                <th className="pb-2 pr-3 font-medium">YTD %</th>
                <th className="pb-2 pr-3 font-medium">Inception gain</th>
                <th className="pb-2 pr-3 font-medium">Inception %</th>
                <th className="pb-2 font-medium">Annualised %</th>
              </tr>
            </thead>
            <tbody>
              {draft.map((row, index) => (
                <tr key={row.bucket} className="border-b border-border/50 last:border-0">
                  <td className="py-2 pr-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: BUCKET_COLORS[row.bucket] }}
                      />
                      <TextSmall className="font-medium">{BUCKET_LABELS[row.bucket]}</TextSmall>
                    </div>
                  </td>
                  {DRAFT_KEYS.map((key) => (
                    <td key={key} className="py-2 pr-3">
                      <Input
                        type="number"
                        step="0.01"
                        className="h-8 min-w-[5.5rem] px-2"
                        value={row[key]}
                        onChange={(e) => {
                          const next = [...draft];
                          next[index] = { ...row, [key]: e.target.value };
                          setDraft(next);
                        }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t text-sm">
                <td className="pt-3 pr-3 font-medium">Total</td>
                <td className="pt-3 pr-3 font-numeric font-medium">{formatUsd(totals.previous)}</td>
                <td className="pt-3 pr-3 font-numeric font-medium">{formatUsd(totals.current)}</td>
                <td className="pt-3 pr-3 font-numeric text-muted-foreground">
                  {totals.periodPct >= 0 ? "+" : ""}
                  {totals.periodPct.toFixed(1)}%
                </td>
                <td colSpan={4} />
              </tr>
            </tfoot>
          </table>
        </DashCardContent>
      </DashCard>
    </div>
  );
}
