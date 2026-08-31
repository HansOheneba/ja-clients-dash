"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, Loader2, Plus, TrendingUp } from "lucide-react";

import { GenerateReportButton } from "@/components/reports/generate-report-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DashCard,
  DashCardContent,
  DashCardDescription,
  DashCardHeader,
  DashCardTitle,
} from "@/components/ui/dash-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KpiItem, KpiStrip } from "@/components/ui/kpi-strip";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Muted, TextSmall } from "@/components/ui/typography";
import {
  ALL_BUCKETS,
  BUCKET_COLORS,
  BUCKET_LABELS,
  formatUsd,
  TRANSACTION_TYPE_LABELS,
} from "@/lib/wealth/constants";
import {
  MONTH_SHORT,
  periodCoveringMonth,
  yearFromPeriodEnd,
} from "@/lib/wealth/period-calendar";
import type {
  PortfolioBucket,
  PortfolioSnapshot,
  StatementPeriod,
  TransactionType,
  WealthTransaction,
} from "@/lib/wealth/types";
import { cn } from "@/lib/utils";

const TX_PAGE_SIZE = 10;

function formatStatementDate(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

type DraftSnapshot = {
  bucket: PortfolioBucket;
  previous_value_usd: string;
  current_value_usd: string;
  period_change_pct: string;
  ytd_pct: string;
  inception_gain_usd: string;
  inception_pct: string;
  annualized_return_pct: string;
};

function toDraft(snapshots: PortfolioSnapshot[]): DraftSnapshot[] {
  const map = new Map(snapshots.map((s) => [s.bucket, s]));
  return ALL_BUCKETS.map((bucket) => {
    const s = map.get(bucket);
    return {
      bucket,
      previous_value_usd: String(s?.previous_value_usd ?? 0),
      current_value_usd: String(s?.current_value_usd ?? 0),
      period_change_pct: s?.period_change_pct == null ? "" : String(s.period_change_pct),
      ytd_pct: s?.ytd_pct == null ? "" : String(s.ytd_pct),
      inception_gain_usd: s?.inception_gain_usd == null ? "" : String(s.inception_gain_usd),
      inception_pct: s?.inception_pct == null ? "" : String(s.inception_pct),
      annualized_return_pct:
        s?.annualized_return_pct == null ? "" : String(s.annualized_return_pct),
    };
  });
}

function num(value: string) {
  if (value.trim() === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function sumField(rows: DraftSnapshot[], key: "previous_value_usd" | "current_value_usd") {
  return rows.reduce((total, row) => total + Number(row[key] || 0), 0);
}

export function StatementDataWorkspace({
  clientId,
  clientName,
  periods,
  initialPeriodId,
  initialSnapshots,
  onChanged,
}: {
  clientId: string;
  clientName: string;
  periods: StatementPeriod[];
  initialPeriodId: string | null;
  initialSnapshots: PortfolioSnapshot[];
  onChanged: (keepPeriodId?: string) => void;
}) {
  const [periodId, setPeriodId] = useState(initialPeriodId ?? periods[0]?.id ?? "");
  const [draft, setDraft] = useState<DraftSnapshot[]>(toDraft(initialSnapshots));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [notify, setNotify] = useState(true);
  const [creatingMonth, setCreatingMonth] = useState<string | null>(null);
  const [tx, setTx] = useState({
    occurredOn: "",
    amountUsd: "",
    description: "",
    bucket: "income" as PortfolioBucket,
    transactionType: "drawdown" as TransactionType,
  });
  const [txPage, setTxPage] = useState(1);
  const [txTotal, setTxTotal] = useState(0);
  const [txRows, setTxRows] = useState<WealthTransaction[]>([]);
  const [txLoading, setTxLoading] = useState(false);
  const [showTxForm, setShowTxForm] = useState(false);

  const selectedPeriod = periods.find((period) => period.id === periodId) ?? null;
  const txPageCount = Math.max(1, Math.ceil(txTotal / TX_PAGE_SIZE));
  const [viewYear, setViewYear] = useState(() => yearFromPeriodEnd(selectedPeriod));
  const lastPeriodId = useRef(periodId);

  useEffect(() => {
    if (!periodId && initialPeriodId) {
      setPeriodId(initialPeriodId);
    }
  }, [initialPeriodId, periodId]);

  useEffect(() => {
    if (!periodId || initialPeriodId === periodId) {
      setDraft(toDraft(initialSnapshots));
    }
  }, [initialSnapshots, initialPeriodId, periodId]);

  useEffect(() => {
    if (lastPeriodId.current === periodId) return;
    lastPeriodId.current = periodId;
    const period = periods.find((p) => p.id === periodId);
    if (period) setViewYear(yearFromPeriodEnd(period));
  }, [periodId, periods]);

  const loadTransactions = useCallback(
    async (page = 1) => {
      if (!periodId) {
        setTxRows([]);
        setTxTotal(0);
        setTxPage(1);
        return;
      }

      setTxLoading(true);
      try {
        const params = new URLSearchParams({
          periodId,
          page: String(page),
          limit: String(TX_PAGE_SIZE),
        });
        const res = await fetch(`/api/clients/${clientId}/transactions?${params}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Could not load transactions");
        setTxRows(data.transactions ?? []);
        setTxTotal(data.total ?? 0);
        setTxPage(data.page ?? page);
      } catch {
        setTxRows([]);
        setTxTotal(0);
      } finally {
        setTxLoading(false);
      }
    },
    [clientId, periodId],
  );

  useEffect(() => {
    loadTransactions(1);
  }, [loadTransactions]);

  const totals = useMemo(() => {
    const previous = sumField(draft, "previous_value_usd");
    const current = sumField(draft, "current_value_usd");
    const gain = current - previous;
    const periodPct = previous > 0 ? (gain / previous) * 100 : 0;
    return { previous, current, gain, periodPct };
  }, [draft]);

  async function loadPeriod(nextId: string) {
    setPeriodId(nextId);
    setTxPage(1);
    const res = await fetch(`/api/clients/${clientId}/portfolio?periodId=${nextId}`);
    const data = await res.json();
    setDraft(toDraft(data.snapshots ?? []));
  }

  async function saveStatementData() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/clients/${clientId}/portfolio`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          periodId,
          notifyClient: notify,
          snapshots: draft.map((row) => ({
            bucket: row.bucket,
            previous_value_usd: Number(row.previous_value_usd || 0),
            current_value_usd: Number(row.current_value_usd || 0),
            period_change_pct: num(row.period_change_pct),
            ytd_pct: num(row.ytd_pct),
            inception_gain_usd: num(row.inception_gain_usd),
            inception_pct: num(row.inception_pct),
            annualized_return_pct: num(row.annualized_return_pct),
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      setMessage("Statement data saved.");
      onChanged(periodId);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function addTransaction(event: React.FormEvent) {
    event.preventDefault();
    const res = await fetch(`/api/clients/${clientId}/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...tx,
        amountUsd: Number(tx.amountUsd),
        notifyClient: notify,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error ?? "Could not add transaction");
      return;
    }
    setTx({ ...tx, amountUsd: "", description: "" });
    setMessage("Transaction recorded.");
    await loadTransactions(txPage);
    onChanged(periodId);
  }

  async function selectOrCreateMonth(year: number, monthIndex0: number) {
    const existing = periodCoveringMonth(periods, year, monthIndex0);
    if (existing) {
      if (existing.id !== periodId) await loadPeriod(existing.id);
      return;
    }

    const key = `${year}-${monthIndex0}`;
    setCreatingMonth(key);
    setMessage(null);
    try {
      const res = await fetch(`/api/clients/${clientId}/periods`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year, month: monthIndex0 + 1 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not open this month");
      setMessage(`Opened ${data.period?.label ?? "month"} for data entry.`);
      if (data.period?.id) {
        onChanged(data.period.id);
        await loadPeriod(data.period.id);
      } else {
        onChanged();
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not open this month");
    } finally {
      setCreatingMonth(null);
    }
  }

  const portfolioHref = `/advisors/dashboard/clients/${clientId}?tab=Portfolio`;

  return (
    <div className="flex flex-col gap-5 pb-24">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <TextSmall className="font-semibold">Statement data for {clientName}</TextSmall>
          <Muted>
            Enter values for one month at a time. Quarterly and annual PDFs roll those months up.
          </Muted>
        </div>
        <div className="flex flex-wrap items-start gap-2">
          <Link href={portfolioHref}>
            <Button variant="outline" size="sm">
              <TrendingUp className="size-4" />
              View trends
            </Button>
          </Link>
          <GenerateReportButton
            clientId={clientId}
            periodId={periodId || undefined}
            buttonVariant="outline"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Label>Month</Label>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Previous year"
              onClick={() => setViewYear((year) => year - 1)}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <TextSmall className="min-w-14 text-center font-medium">{viewYear}</TextSmall>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Next year"
              onClick={() => setViewYear((year) => year + 1)}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-12">
          {MONTH_SHORT.map((name, monthIndex) => {
            const covering = periodCoveringMonth(periods, viewYear, monthIndex);
            const selected = covering?.id === periodId;
            const hasData = Boolean(covering);
            const creating = creatingMonth === `${viewYear}-${monthIndex}`;
            return (
              <button
                key={name}
                type="button"
                disabled={creatingMonth !== null}
                onClick={() => selectOrCreateMonth(viewYear, monthIndex)}
                className={cn(
                  "flex h-9 items-center justify-center rounded-lg text-sm font-medium transition-colors duration-150",
                  selected && "bg-primary text-primary-foreground",
                  !selected && hasData && "bg-muted text-foreground hover:bg-muted/80",
                  !hasData &&
                    "border border-dashed border-border text-muted-foreground hover:bg-muted/60",
                  creatingMonth !== null && "opacity-70",
                )}
              >
                {creating ? <Loader2 className="size-3.5 animate-spin" /> : name}
              </button>
            );
          })}
        </div>
        <Muted>
          {selectedPeriod
            ? `Entering ${selectedPeriod.label}. A filled month already has values. An empty month starts a new one.`
            : "Pick a month to enter values. New months copy the latest figures so you can edit from there."}
        </Muted>
      </div>

      {message ? <Muted>{message}</Muted> : null}

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
          trend={totals.gain >= 0 ? "up" : totals.gain < 0 ? "down" : "neutral"}
        />
        <KpiItem
          label="Buckets"
          value={String(ALL_BUCKETS.length)}
          change="Income through Cash on Account"
          trend="neutral"
        />
        <KpiItem
          label="Transactions"
          value={String(txTotal)}
          change={selectedPeriod ? selectedPeriod.label : "This month"}
          trend="neutral"
        />
      </KpiStrip>

      <DashCard>
        <DashCardHeader className="mb-3">
          <div>
            <DashCardTitle>Bucket values</DashCardTitle>
            <DashCardDescription>
              Previous and current USD for each portfolio bucket in this month.
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
                  {(
                    [
                      "previous_value_usd",
                      "current_value_usd",
                      "period_change_pct",
                      "ytd_pct",
                      "inception_gain_usd",
                      "inception_pct",
                      "annualized_return_pct",
                    ] as const
                  ).map((key) => (
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
                  {totals.periodPct >= 0 ? "+" : ""}{totals.periodPct.toFixed(1)}%
                </td>
                <td colSpan={4} />
              </tr>
            </tfoot>
          </table>
        </DashCardContent>
      </DashCard>

      <DashCard>
        <DashCardHeader className="mb-0 flex-row items-center justify-between gap-3 space-y-0">
          <div>
            <DashCardTitle>Transactions</DashCardTitle>
            <DashCardDescription>
              {selectedPeriod
                ? `Recorded during ${selectedPeriod.label}`
                : "Select a month to view transactions."}
            </DashCardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowTxForm((open) => !open)}
          >
            <Plus className="size-4" />
            Record transaction
            <ChevronDown
              className={cn("size-4 transition-transform", showTxForm && "rotate-180")}
            />
          </Button>
        </DashCardHeader>

        {showTxForm ? (
          <DashCardContent className="border-t border-border/60 pt-4">
            <form onSubmit={addTransaction} className="flex flex-col gap-3">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="tx-date">Date</Label>
                  <Input
                    id="tx-date"
                    type="date"
                    required
                    value={tx.occurredOn}
                    onChange={(e) => setTx({ ...tx, occurredOn: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="tx-amount">Amount (USD)</Label>
                  <Input
                    id="tx-amount"
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={tx.amountUsd}
                    onChange={(e) => setTx({ ...tx, amountUsd: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="tx-bucket">Bucket</Label>
                  <Select
                    id="tx-bucket"
                    value={tx.bucket}
                    onChange={(e) => setTx({ ...tx, bucket: e.target.value as PortfolioBucket })}
                  >
                    {ALL_BUCKETS.map((b) => (
                      <option key={b} value={b}>
                        {BUCKET_LABELS[b]}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="tx-type">Type</Label>
                  <Select
                    id="tx-type"
                    value={tx.transactionType}
                    onChange={(e) =>
                      setTx({ ...tx, transactionType: e.target.value as TransactionType })
                    }
                  >
                    <option value="drawdown">Drawdown</option>
                    <option value="deposit">Deposit</option>
                    <option value="transfer">Transfer</option>
                    <option value="fee">Fee</option>
                    <option value="other">Other</option>
                  </Select>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="tx-desc">Description</Label>
                <Input
                  id="tx-desc"
                  required
                  placeholder="Income Portfolio Drawdown"
                  value={tx.description}
                  onChange={(e) => setTx({ ...tx, description: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm">
                  <Plus className="size-4" />
                  Add transaction
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTxForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DashCardContent>
        ) : null}

        <DashCardContent className={cn(showTxForm && "border-t border-border/60 pt-4")}>
          {!periodId ? (
            <Muted>Pick a month to record and review transactions.</Muted>
          ) : txLoading ? (
            <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Loading transactions...
            </div>
          ) : txRows.length === 0 ? (
            <Muted>No transactions recorded for this period yet.</Muted>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Bucket</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {txRows.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-muted-foreground">
                        {formatStatementDate(item.occurred_on)}
                      </TableCell>
                      <TableCell className="max-w-[16rem] truncate font-medium">
                        {item.description}
                      </TableCell>
                      <TableCell>
                        {item.bucket ? (
                          <span className="inline-flex items-center gap-2">
                            <span
                              className="size-2 shrink-0 rounded-full"
                              style={{ backgroundColor: BUCKET_COLORS[item.bucket] }}
                            />
                            <span className="truncate">{BUCKET_LABELS[item.bucket]}</span>
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {TRANSACTION_TYPE_LABELS[item.transaction_type]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-numeric font-medium">
                        {formatUsd(item.amount_usd)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-4 flex flex-col gap-3 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <Muted>
                  Showing {(txPage - 1) * TX_PAGE_SIZE + 1}
                  {" - "}
                  {Math.min(txPage * TX_PAGE_SIZE, txTotal)} of {txTotal}
                </Muted>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={txPage <= 1 || txLoading}
                    onClick={() => loadTransactions(txPage - 1)}
                  >
                    <ChevronLeft className="size-4" />
                    Previous
                  </Button>
                  <TextSmall className="min-w-16 text-center text-muted-foreground">
                    {txPage} / {txPageCount}
                  </TextSmall>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={txPage >= txPageCount || txLoading}
                    onClick={() => loadTransactions(txPage + 1)}
                  >
                    Next
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </DashCardContent>
      </DashCard>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-sm sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={notify}
              onChange={(e) => setNotify(e.target.checked)}
              className="size-4 accent-primary"
            />
            Email the client when saving
          </label>
          <Button onClick={saveStatementData} disabled={saving || !periodId}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : null}
            Save statement data
          </Button>
        </div>
      </div>
    </div>
  );
}
