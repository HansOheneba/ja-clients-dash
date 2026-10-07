"use client";

import { useEffect, useMemo, useState } from "react";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";

import { AssetAreaChart } from "@/components/charts/asset-charts";
import {
  DashCard,
  DashCardContent,
  DashCardDescription,
  DashCardHeader,
  DashCardTitle,
} from "@/components/ui/dash-card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CategoryPill,
  ColumnLabel,
  Table,
  TableBody,
  TableCell,
  TableFooterBar,
  TableHead,
  TableHeader,
  TableRow,
  bucketPillLabel,
  bucketPillTone,
  usePagedRows,
} from "@/components/ui/table";
import { Muted, TextSmall } from "@/components/ui/typography";
import { useCurrency } from "@/lib/currency-context";
import type { TrackedAsset } from "@/lib/market/value-holdings";
import { cn } from "@/lib/utils";

function ChangeCell({ value }: { value: number | null }) {
  if (value == null) return <span className="text-xs text-muted-foreground">n/a</span>;
  const Icon = value === 0 ? Minus : value > 0 ? TrendingUp : TrendingDown;
  return (
    <span
      className={cn(
        "inline-flex items-center justify-end gap-1 font-numeric text-xs font-medium",
        value > 0 && "text-brand-accent",
        value < 0 && "text-destructive",
        value === 0 && "text-muted-foreground",
      )}
    >
      <Icon className="size-3 shrink-0" />
      {value > 0 ? "+" : ""}
      {value.toFixed(1)}%
    </span>
  );
}

function formatQuantity(value: number) {
  return value.toLocaleString("en-US", { maximumFractionDigits: 4 });
}

export function TrackedAssets({
  clientId,
  manageHref,
  refreshKey = 0,
}: {
  clientId?: string;
  manageHref?: string;
  refreshKey?: number;
}) {
  const { convert, currency, format } = useCurrency();
  const [assets, setAssets] = useState<TrackedAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const assetPage = usePagedRows(assets);

  useEffect(() => {
    const url = clientId
      ? `/api/portfolio/assets?clientId=${encodeURIComponent(clientId)}`
      : "/api/portfolio/assets";
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetch(url, { signal: controller.signal, cache: "no-store" })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Could not load assets");
        setAssets((data.assets ?? []) as TrackedAsset[]);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Could not load assets");
        setAssets([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [clientId, refreshKey]);

  useEffect(() => {
    if (assets.length === 0) {
      setSelectedId(null);
      return;
    }
    if (selectedId && assets.some((asset) => asset.id === selectedId)) return;
    setSelectedId((assets.find((asset) => asset.live) ?? assets[0]).id);
  }, [assets, selectedId]);

  const selected = assets.find((asset) => asset.id === selectedId) ?? null;
  const liveAssets = assets.filter((asset) => asset.live);
  const liveTotal = liveAssets.reduce((sum, asset) => sum + asset.marketValueUsd, 0);

  const dayChangePct = useMemo(() => {
    let current = 0;
    let previous = 0;
    for (const asset of liveAssets) {
      const value = asset.marketValueUsd;
      const change = asset.dayChangePct ?? 0;
      const prior = change <= -100 ? value : value / (1 + change / 100);
      current += value;
      previous += prior;
    }
    if (previous <= 0) return null;
    return ((current - previous) / previous) * 100;
  }, [liveAssets]);

  const keyError = assets.some((asset) => asset.priceError?.includes("API key"));

  function formatPrice(amount: number) {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(convert(amount));
  }

  return (
    <DashCard>
      <DashCardHeader>
        <div>
          <DashCardTitle>Individual assets</DashCardTitle>
          <DashCardDescription>
            Listed stocks and funds chosen from the trackable list. Value is the quantity times
            the live market price.
          </DashCardDescription>
        </div>
      </DashCardHeader>
      <DashCardContent className="flex flex-col gap-4">
        {loading ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : error ? (
          <Muted>{error}</Muted>
        ) : assets.length === 0 ? (
          <Muted>
            No individual holdings yet.
            {manageHref
              ? " Choose one from the trackable list. Anything else is a manual value update."
              : " Your wealth manager adds listed stocks and funds here. Other holdings stay as manual values."}
          </Muted>
        ) : (
          <>
            {keyError ? (
              <Muted>
                {manageHref
                  ? "Finnhub rejected the API key, so live prices could not be loaded. Saved values are shown instead."
                  : "Live prices are temporarily unavailable. Values shown are the last saved amounts."}
              </Muted>
            ) : null}

            {liveAssets.length > 0 ? (
              <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
                <TextSmall className="font-numeric text-base font-medium">
                  {format(liveTotal)}
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    live market value
                  </span>
                </TextSmall>
                <ChangeCell value={dayChangePct} />
                <span className="text-xs text-muted-foreground">today</span>
              </div>
            ) : (
              <Muted>
                {manageHref
                  ? "Choose a stock or fund from the list above and enter a quantity. Other holdings stay at the value your wealth manager saved."
                  : "Listed holdings are priced from the market once a quantity is saved. Other values stay as entered."}
              </Muted>
            )}

            <div>
              <Table bleed className="min-w-[720px]">
                <TableHeader>
                  <TableRow>
                    <TableHead><ColumnLabel>Asset</ColumnLabel></TableHead>
                    <TableHead><ColumnLabel>Ticker</ColumnLabel></TableHead>
                    <TableHead><ColumnLabel>Portfolio</ColumnLabel></TableHead>
                    <TableHead className="text-right"><ColumnLabel align="right">Quantity</ColumnLabel></TableHead>
                    <TableHead className="text-right"><ColumnLabel align="right">Price</ColumnLabel></TableHead>
                    <TableHead className="text-right"><ColumnLabel align="right">Value</ColumnLabel></TableHead>
                    <TableHead className="text-right"><ColumnLabel align="right">Today</ColumnLabel></TableHead>
                    <TableHead className="text-right"><ColumnLabel align="right">Past year</ColumnLabel></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assetPage.rows.map((asset) => {
                    const active = asset.id === selectedId;
                    return (
                      <TableRow
                        key={asset.id}
                        data-state={active ? "selected" : undefined}
                        className="cursor-pointer"
                        onClick={() => setSelectedId(asset.id)}
                      >
                        <TableCell className="whitespace-normal font-medium">{asset.name}</TableCell>
                        <TableCell>
                          <CategoryPill tone="sky">{asset.ticker}</CategoryPill>
                        </TableCell>
                        <TableCell>
                          <CategoryPill tone={bucketPillTone(asset.bucket)}>
                            {bucketPillLabel(asset.bucket)}
                          </CategoryPill>
                        </TableCell>
                        <TableCell className="text-right font-numeric">
                          {asset.quantity != null && asset.quantity > 0
                            ? formatQuantity(asset.quantity)
                            : "Add quantity"}
                        </TableCell>
                        <TableCell className="text-right font-numeric">
                          {asset.priceUsd != null ? formatPrice(asset.priceUsd) : "n/a"}
                        </TableCell>
                        <TableCell className="text-right font-numeric">
                          {format(asset.marketValueUsd)}
                        </TableCell>
                        <TableCell className="text-right">
                          <ChangeCell value={asset.dayChangePct} />
                        </TableCell>
                        <TableCell className="text-right">
                          <ChangeCell value={asset.rangeChangePct} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <TableFooterBar
                className="-mx-3.5 w-[calc(100%+1.75rem)] sm:-mx-4 sm:w-[calc(100%+2rem)]"
                total={assetPage.total}
                page={assetPage.page}
                pageCount={assetPage.pageCount}
                pageSize={assetPage.pageSize}
                onPageChange={assetPage.setPage}
                onPageSizeChange={assetPage.setPageSize}
              />
            </div>

            {selected ? (
              <div className="flex flex-col gap-2 border-t border-border/60 pt-4">
                <div>
                  <TextSmall className="font-medium">
                    {selected.name} ({selected.ticker})
                  </TextSmall>
                  <DashCardDescription>
                    {selected.live && selected.quantity != null
                      ? `Value of ${formatQuantity(selected.quantity)} ${
                          selected.quantity === 1 ? "unit" : "units"
                        }, from market prices.`
                      : "Add a quantity to chart this holding from market prices."}
                    {selected.priceError && !keyError ? ` ${selected.priceError}` : ""}
                  </DashCardDescription>
                </div>
                {selected.history.length >= 2 ? (
                  <AssetAreaChart
                    data={selected.history}
                    color="#202356"
                    gradientId={`asset-${selected.id}`}
                    height={220}
                    yAxisLabel="Value (USD)"
                    seriesLabel={selected.ticker}
                  />
                ) : (
                  <Muted>
                    {selected.live
                      ? "Not enough price history yet to chart growth. Today's price is in the table."
                      : "This holding is stored as a value. A quantity turns it into a live position."}
                  </Muted>
                )}
              </div>
            ) : null}
          </>
        )}
      </DashCardContent>
    </DashCard>
  );
}
