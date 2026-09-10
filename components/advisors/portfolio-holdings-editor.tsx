"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";

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
  original_value_usd: string;
  market_value_usd: string;
};

function toDraft(holdings: PortfolioHolding[]): DraftHolding[] {
  return holdings.map((row) => ({
    localId: row.id,
    bucket: row.bucket,
    investment_name: row.investment_name,
    ticker: row.ticker,
    original_value_usd: String(row.original_value_usd),
    market_value_usd: String(row.market_value_usd),
  }));
}

function newDraftRow(bucket: PortfolioBucket = "growth"): DraftHolding {
  return {
    localId: crypto.randomUUID(),
    bucket,
    investment_name: "",
    ticker: "",
    original_value_usd: "",
    market_value_usd: "",
  };
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

  const totals = useMemo(() => {
    const original = draft.reduce((sum, row) => sum + Number(row.original_value_usd || 0), 0);
    const market = draft.reduce((sum, row) => sum + Number(row.market_value_usd || 0), 0);
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
        .filter((row) => row.investment_name.trim() && row.ticker.trim())
        .map((row) => ({
          bucket: row.bucket,
          investment_name: row.investment_name.trim(),
          ticker: row.ticker.trim(),
          original_value_usd: Number(row.original_value_usd || 0),
          market_value_usd: Number(row.market_value_usd || 0),
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
      onMessage("Holdings saved. They will appear on the next generated report.");
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
            Stock and fund positions by bucket. Saved rows appear on the holdings breakdown page in
            the wealth report PDF.
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
              <Muted>No holdings yet. Add positions for any invested bucket.</Muted>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bucket</TableHead>
                      <TableHead>Investment</TableHead>
                      <TableHead>Ticker</TableHead>
                      <TableHead className="text-right">Original</TableHead>
                      <TableHead className="text-right">Market</TableHead>
                      <TableHead className="text-right">Gain/loss</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {draft.map((row) => {
                      const gain =
                        Number(row.market_value_usd || 0) - Number(row.original_value_usd || 0);
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
                              placeholder="e.g. Vanguard S&P 500"
                              onChange={(e) =>
                                updateRow(row.localId, { investment_name: e.target.value })
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={row.ticker}
                              placeholder="VUAA"
                              className="font-mono"
                              onChange={(e) =>
                                updateRow(row.localId, { ticker: e.target.value.toUpperCase() })
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              className="text-right font-numeric"
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
                              className="text-right font-numeric"
                              value={row.market_value_usd}
                              onChange={(e) =>
                                updateRow(row.localId, { market_value_usd: e.target.value })
                              }
                            />
                          </TableCell>
                          <TableCell className="text-right font-numeric text-muted-foreground">
                            {formatUsd(gain, true)}
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
                  <span className="text-muted-foreground">Original total: </span>
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
              Tip: market value totals for a bucket should align with the current bucket value above
              (e.g. Growth portfolio).
            </TextSmall>
          </>
        )}
      </DashCardContent>
    </DashCard>
  );
}
