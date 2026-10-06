"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Plus, RefreshCw, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DashCard,
  DashCardContent,
  DashCardDescription,
  DashCardHeader,
  DashCardTitle,
} from "@/components/ui/dash-card";
import { Input } from "@/components/ui/input";
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
import { BUCKET_LABELS, formatUsd, HOLDINGS_BUCKETS } from "@/lib/wealth/constants";
import type { PortfolioBucket, PortfolioHolding } from "@/lib/wealth/types";

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

  return (
    <DashCard>
      <DashCardHeader className="mb-0 flex-row items-start justify-between gap-3 space-y-0">
        <div>
          <DashCardTitle>Portfolio holdings</DashCardTitle>
          <DashCardDescription>
            Enter the ticker and how many shares or units the client holds. Market value is the
            quantity times the live price, and that position is what shows on the portfolio.
          </DashCardDescription>
        </div>
        <Button type="button" size="sm" onClick={saveHoldings} disabled={saving || !periodId}>
          {saving ? <Loader2 className="size-4 animate-spin" /> : null}
          Save holdings
        </Button>
      </DashCardHeader>

      <DashCardContent className="flex flex-col gap-4 pt-4">
        {!periodId ? (
          <Muted>Select a statement period to add holdings.</Muted>
        ) : (
          <>
            <div className="flex flex-wrap items-end gap-2">
              <div className="flex flex-col gap-1.5">
                <TextSmall className="font-medium">Add to bucket</TextSmall>
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
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bucket</TableHead>
                      <TableHead>Investment</TableHead>
                      <TableHead>Ticker</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Cost basis</TableHead>
                      <TableHead className="text-right">Market value</TableHead>
                      <TableHead className="w-10" />
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {draft.map((row) => {
                      const market = rowMarket(row);
                      const cost = Number(row.original_value_usd || 0);
                      const gain = cost > 0 ? market - cost : null;
                      const live = row.livePrice != null && Number(row.quantity) > 0;
                      return (
                        <TableRow key={row.localId}>
                          <TableCell>
                            <Select
                              value={row.bucket}
                              onChange={(e) =>
                                updateRow(row.localId, {
                                  bucket: e.target.value as PortfolioBucket,
                                })
                              }
                              className="min-w-36"
                            >
                              {HOLDINGS_BUCKETS.map((bucket) => (
                                <option key={bucket} value={bucket}>
                                  {BUCKET_LABELS[bucket]}
                                </option>
                              ))}
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input
                              value={row.investment_name}
                              placeholder="Filled from the ticker"
                              onChange={(e) =>
                                updateRow(row.localId, { investment_name: e.target.value })
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={row.ticker}
                              placeholder="AAPL"
                              className="w-28 font-mono"
                              onChange={(e) =>
                                updateRow(row.localId, {
                                  ticker: e.target.value.toUpperCase(),
                                  livePrice: null,
                                  priceStatus: "idle",
                                  priceError: null,
                                })
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              step="any"
                              placeholder="100"
                              className="w-28 text-right font-numeric"
                              value={row.quantity}
                              onChange={(e) =>
                                updateRow(row.localId, {
                                  quantity: e.target.value,
                                  livePrice: null,
                                  priceStatus: "idle",
                                  priceError: null,
                                })
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              className="w-32 text-right font-numeric"
                              value={row.original_value_usd}
                              onChange={(e) =>
                                updateRow(row.localId, { original_value_usd: e.target.value })
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              readOnly={live}
                              className="w-36 text-right font-numeric"
                              value={live ? market.toFixed(2) : row.market_value_usd}
                              onChange={(e) =>
                                updateRow(row.localId, {
                                  market_value_usd: e.target.value,
                                  livePrice: null,
                                  priceStatus: "idle",
                                })
                              }
                            />
                            {live ? (
                              <TextSmall className="mt-1 text-right text-muted-foreground">
                                {formatUnitPrice(row.livePrice ?? 0)}
                                {row.liveChangePct != null
                                  ? ` · ${row.liveChangePct > 0 ? "+" : ""}${row.liveChangePct.toFixed(1)}% today`
                                  : ""}
                                {row.quotedCurrency && row.quotedCurrency !== "USD"
                                  ? ` · from ${row.quotedCurrency}`
                                  : ""}
                              </TextSmall>
                            ) : row.priceError ? (
                              <TextSmall className="mt-1 text-right text-destructive">
                                {row.priceError}
                              </TextSmall>
                            ) : gain != null ? (
                              <TextSmall className="mt-1 text-right text-muted-foreground">
                                {formatUsd(gain, true)} vs cost
                              </TextSmall>
                            ) : null}
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              aria-label="Refresh price"
                              disabled={!row.ticker.trim() || !(Number(row.quantity) > 0)}
                              onClick={() =>
                                void refreshPrice(
                                  row.localId,
                                  row.ticker.trim().toUpperCase(),
                                  Number(row.quantity),
                                )
                              }
                            >
                              <RefreshCw
                                className={row.priceStatus === "loading" ? "animate-spin" : ""}
                              />
                            </Button>
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              aria-label="Remove holding"
                              onClick={() => removeRow(row.localId)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}

            {draft.length > 0 ? (
              <div className="flex flex-wrap gap-4 border-t border-border/60 pt-3 text-sm">
                <span className="font-numeric">
                  <span className="text-muted-foreground">Cost basis: </span>
                  {formatUsd(totals.original)}
                </span>
                <span className="font-numeric">
                  <span className="text-muted-foreground">Market total: </span>
                  {formatUsd(totals.market)}
                </span>
                <span className="font-numeric">
                  <span className="text-muted-foreground">Unrealised: </span>
                  {formatUsd(totals.gain, true)}
                </span>
              </div>
            ) : null}

            <TextSmall className="text-muted-foreground">
              Leave quantity blank for a private holding and enter its market value directly.
              Cost basis is optional and is the amount originally invested.
            </TextSmall>
          </>
        )}
      </DashCardContent>
    </DashCard>
  );
}
