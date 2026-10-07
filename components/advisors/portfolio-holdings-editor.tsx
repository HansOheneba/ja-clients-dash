"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Plus, RefreshCw, Trash2 } from "lucide-react";

import {
  BUCKET_DOT,
  FigureField,
  figureTone,
  figureToneClass,
  moneyDisplay,
} from "@/components/advisors/statement-figures";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  ColumnLabel,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Muted, TextSmall } from "@/components/ui/typography";
import { BUCKET_LABELS, formatCompactUsd, HOLDINGS_BUCKETS } from "@/lib/wealth/constants";
import type { PortfolioBucket, PortfolioHolding } from "@/lib/wealth/types";
import { cn } from "@/lib/utils";

type DraftHolding = {
  localId: string;
  bucket: PortfolioBucket;
  investment_name: string;
  ticker: string;
  quantity: string;
  original_value_usd: string;
  market_value_usd: string;
  livePrice: number | null;
  liveChangePct: number | null;
  quotedCurrency: string | null;
  priceStatus: "idle" | "loading" | "ok" | "error";
  priceError: string | null;
};

function toDraft(holdings: PortfolioHolding[]): DraftHolding[] {
  return holdings.map((row) => ({
    localId: row.id,
    bucket: row.bucket,
    investment_name: row.investment_name,
    ticker: row.ticker,
    quantity: row.quantity != null && row.quantity > 0 ? String(row.quantity) : "",
    original_value_usd: String(row.original_value_usd),
    market_value_usd: String(row.market_value_usd),
    livePrice: null,
    liveChangePct: null,
    quotedCurrency: null,
    priceStatus: "idle",
    priceError: null,
  }));
}

function newDraftRow(bucket: PortfolioBucket = "growth"): DraftHolding {
  return {
    localId: crypto.randomUUID(),
    bucket,
    investment_name: "",
    ticker: "",
    quantity: "",
    original_value_usd: "",
    market_value_usd: "",
    livePrice: null,
    liveChangePct: null,
    quotedCurrency: null,
    priceStatus: "idle",
    priceError: null,
  };
}

function rowMarket(row: DraftHolding): number {
  const quantity = Number(row.quantity);
  if (row.livePrice != null && quantity > 0) return quantity * row.livePrice;
  return Number(row.market_value_usd || 0);
}

function quantityDisplay(raw: string): string {
  if (raw.trim() === "") return "n/a";
  const value = Number(raw);
  if (!Number.isFinite(value)) return raw;
  return value.toLocaleString("en-US", { maximumFractionDigits: 4 });
}

function groupedHoldings(rows: DraftHolding[]) {
  const order: PortfolioBucket[] = [...HOLDINGS_BUCKETS];
  for (const row of rows) {
    if (!order.includes(row.bucket)) order.push(row.bucket);
  }
  return order
    .map((bucket) => ({
      bucket,
      rows: rows.filter((row) => row.bucket === bucket),
    }))
    .filter((group) => group.rows.length > 0);
}

function formatUnitPrice(value: number) {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

type PortfolioHoldingsEditorProps = {
  clientId: string;
  periodId: string | null;
  holdings: PortfolioHolding[];
  onSaved: (holdings: PortfolioHolding[]) => void;
  onMessage: (message: string | null) => void;
};

export function PortfolioHoldingsEditor({
  clientId,
  periodId,
  holdings,
  onSaved,
  onMessage,
}: PortfolioHoldingsEditorProps) {
  const [draft, setDraft] = useState<DraftHolding[]>(() => toDraft(holdings));
  const [addBucket, setAddBucket] = useState<PortfolioBucket>("growth");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraft(toDraft(holdings));
  }, [holdings]);

  const priceKey = draft
    .filter((row) => row.ticker.trim() && Number(row.quantity) > 0)
    .map((row) => `${row.localId}|${row.ticker.trim().toUpperCase()}|${row.quantity}`)
    .join(";");

  const refreshPrice = useCallback(async (localId: string, ticker: string, quantity: number) => {
    setDraft((rows) =>
      rows.map((row) =>
        row.localId === localId ? { ...row, priceStatus: "loading", priceError: null } : row,
      ),
    );

    try {
      const res = await fetch(`/api/market/quote?symbol=${encodeURIComponent(ticker)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not price this symbol");

      setDraft((rows) =>
        rows.map((row) => {
          if (row.localId !== localId) return row;
          if (row.ticker.trim().toUpperCase() !== ticker || Number(row.quantity) !== quantity) {
            return row;
          }
          const priceUsd = Number(data.priceUsd);
          return {
            ...row,
            investment_name: row.investment_name.trim() || data.name || row.investment_name,
            livePrice: priceUsd,
            liveChangePct:
              data.changePercent == null || !Number.isFinite(Number(data.changePercent))
                ? null
                : Number(data.changePercent),
            quotedCurrency: data.quotedCurrency ?? "USD",
            market_value_usd: (quantity * priceUsd).toFixed(2),
            priceStatus: "ok",
            priceError: null,
          };
        }),
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not price this symbol";
      setDraft((rows) =>
        rows.map((row) => {
          if (row.localId !== localId) return row;
          if (row.ticker.trim().toUpperCase() !== ticker || Number(row.quantity) !== quantity) {
            return row;
          }
          return { ...row, priceStatus: "error", livePrice: null, priceError: message };
        }),
      );
    }
  }, []);

  useEffect(() => {
    if (!priceKey) return;
    const timers = priceKey.split(";").map((part) => {
      const [localId, ticker, quantity] = part.split("|");
      return window.setTimeout(() => {
        void refreshPrice(localId, ticker, Number(quantity));
      }, 450);
    });
    return () => {
      for (const timer of timers) window.clearTimeout(timer);
    };
  }, [priceKey, refreshPrice]);

  const totals = useMemo(() => {
    const original = draft.reduce((sum, row) => sum + Number(row.original_value_usd || 0), 0);
    const market = draft.reduce((sum, row) => sum + rowMarket(row), 0);
    return { original, market, gain: market - original };
  }, [draft]);

  function updateRow(localId: string, patch: Partial<DraftHolding>) {
    setDraft((rows) => rows.map((row) => (row.localId === localId ? { ...row, ...patch } : row)));
  }

  function removeRow(localId: string) {
    setDraft((rows) => rows.filter((row) => row.localId !== localId));
  }

  async function saveHoldings() {
    if (!periodId) {
      onMessage("Select a statement period before saving holdings.");
      return;
    }

    setSaving(true);
    onMessage(null);
    try {
      const payload = draft
        .filter((row) => row.ticker.trim() && (row.investment_name.trim() || Number(row.quantity) > 0))
        .map((row) => ({
          bucket: row.bucket,
          investment_name: row.investment_name.trim(),
          ticker: row.ticker.trim(),
          quantity: row.quantity.trim() === "" ? null : Number(row.quantity),
          original_value_usd: Number(row.original_value_usd || 0),
          market_value_usd: rowMarket(row),
        }));

      const res = await fetch(`/api/clients/${clientId}/holdings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ periodId, holdings: payload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not save holdings");

      const saved = (data.holdings ?? []) as PortfolioHolding[];
      setDraft(toDraft(saved));
      onSaved(saved);
      const warnings = (data.warnings ?? []) as string[];
      onMessage(
        warnings.length > 0
          ? `Holdings saved. ${warnings.join(" ")}`
          : "Holdings saved. Market values use the live price where a quantity was entered.",
      );
    } catch (err) {
      onMessage(err instanceof Error ? err.message : "Could not save holdings");
    } finally {
      setSaving(false);
    }
  }

  const groups = groupedHoldings(draft);
  const gainTone = figureTone(totals.gain);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-[11px] font-semibold tracking-[0.16em] text-brand-primary uppercase">
            Portfolio holdings
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Investments currently held across the client&apos;s portfolios
          </p>
        </div>
        <Button type="button" size="sm" onClick={saveHoldings} disabled={saving || !periodId}>
          {saving ? <Loader2 className="size-4 animate-spin" /> : null}
          Save holdings
        </Button>
      </div>

      {!periodId ? (
        <Muted>Select a statement period to add holdings.</Muted>
      ) : (
        <>
          {draft.length > 0 ? (
            <p className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span>
                <span className="font-numeric font-medium text-foreground">{draft.length}</span>{" "}
                {draft.length === 1 ? "holding" : "holdings"}
              </span>
              <span>
                <span className="font-numeric font-medium text-brand-primary">
                  {formatCompactUsd(totals.market)}
                </span>{" "}
                market value
              </span>
              <span>
                <span className="font-numeric text-foreground">{formatCompactUsd(totals.original)}</span>{" "}
                cost basis
              </span>
              <span className={cn("font-numeric", figureToneClass(gainTone))}>
                {formatCompactUsd(totals.gain, true)} unrealised
              </span>
            </p>
          ) : null}

          <div className="flex flex-wrap items-end gap-2">
            <div className="flex flex-col gap-1.5">
              <TextSmall className="font-medium">Add to portfolio</TextSmall>
              <Select
                value={addBucket}
                onChange={(e) => setAddBucket(e.target.value as PortfolioBucket)}
                className="min-w-48"
              >
                {HOLDINGS_BUCKETS.map((bucket) => (
                  <option key={bucket} value={bucket}>
                    {BUCKET_LABELS[bucket]}
                  </option>
                ))}
              </Select>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDraft((rows) => [...rows, newDraftRow(addBucket)])}
            >
              <Plus className="size-4" />
              Add holding
            </Button>
          </div>

          {draft.length === 0 ? (
            <Muted>No holdings yet. Add a ticker and quantity for each position.</Muted>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
              <Table className="min-w-[820px]">
                <TableHeader>
                  <TableRow>
                    <TableHead><ColumnLabel>Investment</ColumnLabel></TableHead>
                    <TableHead className="text-right"><ColumnLabel align="right">Quantity</ColumnLabel></TableHead>
                    <TableHead className="text-right"><ColumnLabel align="right">Cost basis</ColumnLabel></TableHead>
                    <TableHead className="text-right"><ColumnLabel align="right">Market value</ColumnLabel></TableHead>
                    <TableHead className="w-10" />
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groups.map((group) => (
                    <GroupRows
                      key={group.bucket}
                      bucket={group.bucket}
                      rows={group.rows}
                      onUpdate={updateRow}
                      onRemove={removeRow}
                      onRefresh={(row) =>
                        void refreshPrice(
                          row.localId,
                          row.ticker.trim().toUpperCase(),
                          Number(row.quantity),
                        )
                      }
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <TextSmall className="text-muted-foreground">
            Leave quantity blank for a private holding and enter its market value directly.
            Cost basis is optional and is the amount originally invested.
          </TextSmall>
        </>
      )}
    </section>
  );
}

function GroupRows({
  bucket,
  rows,
  onUpdate,
  onRemove,
  onRefresh,
}: {
  bucket: PortfolioBucket;
  rows: DraftHolding[];
  onUpdate: (localId: string, patch: Partial<DraftHolding>) => void;
  onRemove: (localId: string) => void;
  onRefresh: (row: DraftHolding) => void;
}) {
  return (
    <>
      <TableRow className="bg-muted/40 hover:bg-muted/40">
        <TableCell colSpan={6}>
          <span className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.14em] text-brand-primary uppercase">
            <span className={cn("size-1.5 rounded-full", BUCKET_DOT[bucket])} aria-hidden />
            {BUCKET_LABELS[bucket]}
          </span>
          <span className="ml-3 text-xs font-normal tracking-normal text-muted-foreground normal-case">
            {rows.length} {rows.length === 1 ? "holding" : "holdings"}
          </span>
        </TableCell>
      </TableRow>
      {rows.map((row) => {
        const market = rowMarket(row);
        const cost = Number(row.original_value_usd || 0);
        const gain = cost > 0 ? market - cost : null;
        const live = row.livePrice != null && Number(row.quantity) > 0;
        const dayDivisor = row.liveChangePct == null ? null : 1 + row.liveChangePct / 100;
        const dayMove =
          dayDivisor == null || dayDivisor === 0 ? null : market - market / dayDivisor;
        const costMoney = moneyDisplay(row.original_value_usd);
        return (
          <TableRow key={row.localId}>
            <TableCell className="whitespace-normal">
              <Input
                value={row.investment_name}
                placeholder="Filled from the ticker"
                aria-label="Investment name"
                onChange={(e) => onUpdate(row.localId, { investment_name: e.target.value })}
                className="h-8 border-transparent bg-transparent px-1 text-sm font-medium shadow-none focus-visible:border-input focus-visible:bg-background"
              />
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <Input
                  value={row.ticker}
                  placeholder="AAPL"
                  aria-label="Ticker"
                  onChange={(e) =>
                    onUpdate(row.localId, {
                      ticker: e.target.value.toUpperCase(),
                      livePrice: null,
                      priceStatus: "idle",
                      priceError: null,
                    })
                  }
                  className="h-7 w-24 border-transparent bg-transparent px-1 font-mono text-xs text-muted-foreground shadow-none focus-visible:border-input focus-visible:bg-background"
                />
                <div className="w-40">
                <Select
                  value={row.bucket}
                  aria-label="Portfolio"
                  onChange={(e) =>
                    onUpdate(row.localId, { bucket: e.target.value as PortfolioBucket })
                  }
                  className="h-7 border-transparent bg-transparent text-xs text-muted-foreground"
                >
                  {HOLDINGS_BUCKETS.map((option) => (
                    <option key={option} value={option}>
                      {BUCKET_LABELS[option]}
                    </option>
                  ))}
                </Select>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <FigureField
                ariaLabel="Quantity"
                value={row.quantity}
                display={quantityDisplay(row.quantity)}
                onChange={(value) =>
                  onUpdate(row.localId, {
                    quantity: value,
                    livePrice: null,
                    priceStatus: "idle",
                    priceError: null,
                  })
                }
              />
            </TableCell>
            <TableCell>
              <FigureField
                ariaLabel="Cost basis"
                value={row.original_value_usd}
                display={costMoney.text}
                onChange={(value) => onUpdate(row.localId, { original_value_usd: value })}
              />
            </TableCell>
            <TableCell>
              {live ? (
                <div className="px-1 text-right">
                  <p className="font-numeric text-sm font-semibold text-brand-primary">
                    {formatCompactUsd(market)}
                  </p>
                  {dayMove != null && row.liveChangePct != null ? (
                    <p className={cn("text-xs font-numeric", figureToneClass(figureTone(row.liveChangePct)))}>
                      {formatCompactUsd(dayMove, true)}
                      {` · ${row.liveChangePct > 0 ? "+" : ""}${row.liveChangePct.toFixed(1)}% today`}
                    </p>
                  ) : (
                    <p className="text-xs font-numeric text-muted-foreground">
                      {formatUnitPrice(row.livePrice ?? 0)}
                      {row.quotedCurrency && row.quotedCurrency !== "USD"
                        ? ` · from ${row.quotedCurrency}`
                        : ""}
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <FigureField
                    ariaLabel="Market value"
                    value={row.market_value_usd}
                    display={moneyDisplay(row.market_value_usd).text}
                    emphasis="primary"
                    onChange={(value) =>
                      onUpdate(row.localId, {
                        market_value_usd: value,
                        livePrice: null,
                        priceStatus: "idle",
                      })
                    }
                  />
                  {row.priceError ? (
                    <TextSmall className="mt-1 text-right text-destructive">{row.priceError}</TextSmall>
                  ) : gain != null ? (
                    <p className={cn("px-1 text-right text-xs font-numeric", figureToneClass(figureTone(gain)))}>
                      {formatCompactUsd(gain, true)} vs cost
                    </p>
                  ) : null}
                </>
              )}
            </TableCell>
            <TableCell>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Refresh price"
                disabled={!row.ticker.trim() || !(Number(row.quantity) > 0)}
                onClick={() => onRefresh(row)}
              >
                <RefreshCw className={row.priceStatus === "loading" ? "animate-spin" : ""} />
              </Button>
            </TableCell>
            <TableCell>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Remove holding"
                onClick={() => onRemove(row.localId)}
              >
                <Trash2 className="size-4" />
              </Button>
            </TableCell>
          </TableRow>
        );
      })}
    </>
  );
}
