"use client";

import Link from "next/link";
import { Fragment, useEffect, useMemo, useState, type ReactNode } from "react";
import { Area, AreaChart, CartesianGrid, Cell, Line, Pie, PieChart, XAxis, YAxis } from "recharts";
import { Plus } from "lucide-react";

import { ComplianceAuditPanel } from "@/components/advisors/compliance-audit-panel";
import { PortfolioQuickUpdate } from "@/components/advisors/portfolio-quick-update";
import { TrackAssetPanel } from "@/components/advisors/track-asset-panel";
import { advisorSurface, SurfaceCard } from "@/components/advisors/advisor-surface";
import { AssetAreaChart } from "@/components/charts/asset-charts";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Muted, Numeric, Overline, TextSmall } from "@/components/ui/typography";
import type { JaPortfolioSummary } from "@/lib/api/domain/wealth-portfolio";
import { formatChartCompactUsd, formatChartUsd } from "@/lib/chart-format";
import { TRACKABLE_ASSETS } from "@/lib/market/trackable-assets";
import type { TrackedAsset } from "@/lib/market/value-holdings";
import {
  BUCKET_COLORS,
  BUCKET_LABELS,
  formatCompactUsd,
  formatUsd,
} from "@/lib/wealth/constants";
import type {
  PortfolioBucket,
  PortfolioSnapshot,
  StatementPeriod,
  WealthTransaction,
} from "@/lib/wealth/types";
import { cn } from "@/lib/utils";

const SECTIONS = ["Overview", "Holdings", "Allocation", "Performance", "Activity"] as const;
type SectionId = (typeof SECTIONS)[number];

const RANGES = ["1M", "3M", "6M", "YTD", "1Y", "3Y", "All"] as const;
type RangeId = (typeof RANGES)[number];

const SHORT_BUCKET: Record<PortfolioBucket, string> = {
  income: "Income",
  growth: "Growth",
  venture: "Venture",
  treasury: "Treasury",
  coa: "Cash",
};

type HistoryPoint = { month: string; value: number; recordedOn?: string };

type BucketSlice = {
  id: PortfolioBucket;
  name: string;
  shortName: string;
  valueUsd: number;
  pct: number;
  color: string;
};

type BreakdownRow = BucketSlice & {
  changeUsd: number | null;
  periodPct: number | null;
};

type ActivityFilter = "all" | "contributions" | "withdrawals";
type ChartMode = "value" | "return";
type AllocationBasis = "bucket" | "assetClass";

type BenchmarkSeries = {
  label: string;
  points: HistoryPoint[];
};

function formatStatementDate(value: string) {
  return new Date(`${value.slice(0, 10)}T12:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function holdingKind(ticker: string): "Stock" | "ETF" | null {
  const match = TRACKABLE_ASSETS.find(
    (asset) => asset.symbol === ticker.trim().toUpperCase(),
  );
  return match?.kind ?? null;
}

function gainPct(asset: TrackedAsset): number | null {
  if (asset.costBasisUsd <= 0) return null;
  return ((asset.marketValueUsd - asset.costBasisUsd) / asset.costBasisUsd) * 100;
}

function quantityLabel(asset: TrackedAsset): string {
  if (asset.quantity == null || asset.quantity <= 0) return "Add quantity";
  const qty = asset.quantity.toLocaleString("en-US", { maximumFractionDigits: 4 });
  const kind = holdingKind(asset.ticker);
  if (kind === "Stock") return `${qty} ${asset.quantity === 1 ? "share" : "shares"}`;
  return `${qty} ${asset.quantity === 1 ? "unit" : "units"}`;
}

function formatPrice(value: number | null): string {
  if (value == null) return "n/a";
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function heroChange(portfolio: JaPortfolioSummary | null): {
  text: string;
  tone: "up" | "down" | "flat";
} | null {
  if (!portfolio) return null;
  const gain = portfolio.periodGainUsd;
  const pct = portfolio.periodReturnPct;
  const pctKnown = pct !== 0 || gain === 0;
  const tone = gain > 0 ? "up" : gain < 0 ? "down" : "flat";
  const money = formatCompactUsd(gain, true);
  if (!pctKnown) return { text: `${money} this period`, tone };
  const pctText = `${pct > 0 ? "+" : ""}${pct.toFixed(1)}%`;
  return { text: `${money} · ${pctText} this period`, tone };
}

function periodNarrative(portfolio: JaPortfolioSummary | null): string | null {
  if (!portfolio) return null;
  const gain = portfolio.periodGainUsd;
  const pct = portfolio.periodReturnPct;
  if (pct === 0 && gain !== 0) return null;
  const pctLabel = `${Math.abs(pct).toFixed(1)}%`;
  const gainLabel = formatCompactUsd(Math.abs(gain));
  if (Math.abs(pct) < 0.05 && Math.abs(gain) < 1) {
    return "Portfolio is unchanged this period.";
  }
  if (gain >= 0) {
    return `Portfolio is up ${pctLabel} this period, adding ${gainLabel} in value.`;
  }
  return `Portfolio is down ${pctLabel} this period, reducing value by ${gainLabel}.`;
}

function buildSlices(
  portfolio: JaPortfolioSummary | null,
  snapshots: PortfolioSnapshot[],
): BucketSlice[] {
  const rows: BucketSlice[] = portfolio
    ? portfolio.buckets.map((bucket) => ({
        id: bucket.id,
        name: bucket.id === "coa" ? "Cash" : bucket.label,
        shortName: SHORT_BUCKET[bucket.id],
        valueUsd: bucket.totalUSD,
        pct: bucket.allocationPct,
        color: BUCKET_COLORS[bucket.id],
      }))
    : snapshots.map((row) => {
        const total = snapshots.reduce((sum, item) => sum + item.current_value_usd, 0);
        return {
          id: row.bucket,
          name: row.bucket === "coa" ? "Cash" : BUCKET_LABELS[row.bucket],
          shortName: SHORT_BUCKET[row.bucket],
          valueUsd: row.current_value_usd,
          pct: total > 0 ? (row.current_value_usd / total) * 100 : 0,
          color: BUCKET_COLORS[row.bucket],
        };
      });

  return [...rows].sort((a, b) => b.valueUsd - a.valueUsd);
}

function buildBreakdown(slices: BucketSlice[], snapshots: PortfolioSnapshot[]): BreakdownRow[] {
  return slices.map((slice) => {
    const snap = snapshots.find((row) => row.bucket === slice.id);
    if (!snap) return { ...slice, changeUsd: null, periodPct: null };
    const changeUsd = snap.current_value_usd - snap.previous_value_usd;
    const periodPct =
      snap.period_change_pct ??
      (snap.previous_value_usd > 0 ? (changeUsd / snap.previous_value_usd) * 100 : null);
    return { ...slice, changeUsd, periodPct };
  });
}

function windowStart(endIso: string, range: Exclude<RangeId, "All">): string {
  const end = new Date(`${endIso}T12:00:00`);
  if (range === "YTD") return `${end.getFullYear()}-01-01`;
  const months = { "1M": 1, "3M": 3, "6M": 6, "1Y": 12, "3Y": 36 }[range];
  const start = new Date(end);
  start.setMonth(start.getMonth() - months);
  const month = String(start.getMonth() + 1).padStart(2, "0");
  const day = String(start.getDate()).padStart(2, "0");
  return `${start.getFullYear()}-${month}-${day}`;
}

function sliceHistory(history: HistoryPoint[], range: RangeId): HistoryPoint[] {
  const dated = history.filter((point) => point.recordedOn);
  if (range === "All") return dated.length > 0 ? dated : history;
  if (dated.length === 0) return [];
  const end = dated[dated.length - 1].recordedOn;
  if (!end) return dated;
  const start = windowStart(end, range);
  return dated.filter((point) => (point.recordedOn ?? "") >= start);
}

function toReturnSeries(points: HistoryPoint[]): HistoryPoint[] {
  const base = points[0]?.value ?? 0;
  if (base <= 0) return points.map((point) => ({ ...point, value: 0 }));
  return points.map((point) => ({
    ...point,
    value: ((point.value - base) / base) * 100,
  }));
}

function movementLabel(tx: WealthTransaction): string {
  if (tx.transaction_type === "fee") return "Fee";
  if (tx.transaction_type === "transfer") return "Transfer";
  if (tx.amount_usd < 0) return "Withdrawal";
  return "Contribution";
}

function ChangeText({ value }: { value: number | null }) {
  if (value == null) return <span className="text-xs text-muted-foreground">n/a</span>;
  return (
    <span
      className={cn(
        "font-numeric text-xs font-medium",
        value > 0 && "text-emerald-700",
        value < 0 && "text-destructive",
        value === 0 && "text-muted-foreground",
      )}
    >
      {value > 0 ? "+" : ""}
      {value.toFixed(1)}%
    </span>
  );
}

function Section({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <SurfaceCard>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h3 className={advisorSurface.sectionTitle}>{title}</h3>
          {description ? <Muted className="mt-0.5 text-[13px]">{description}</Muted> : null}
        </div>
        {action}
      </div>
      {children}
    </SurfaceCard>
  );
}

function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { id: T; label: string }[];
  onChange: (next: T) => void;
  label: string;
}) {
  return (
    <div className="inline-flex rounded-lg bg-muted/60 p-0.5" role="group" aria-label={label}>
      {options.map((option) => {
        const active = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.id)}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-medium transition-colors active:translate-y-px",
              active
                ? "bg-background text-brand-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function AllocationPanel({
  slices,
  selectedId,
  onSelect,
}: {
  slices: BucketSlice[];
  selectedId: PortfolioBucket | null;
  onSelect: (id: PortfolioBucket | null) => void;
}) {
  const [basis, setBasis] = useState<AllocationBasis>("bucket");
  const [hoverId, setHoverId] = useState<PortfolioBucket | null>(null);
  const chartSlices = slices.filter((slice) => slice.valueUsd > 0);
  const focus =
    chartSlices.find((slice) => slice.id === (hoverId ?? selectedId)) ?? null;
  const chartConfig = {
    value: { label: "Value" },
    ...Object.fromEntries(
      chartSlices.map((slice) => [slice.name, { label: slice.name, color: slice.color }]),
    ),
  } satisfies ChartConfig;

  return (
    <Section
      title="Portfolio Allocation"
      description="Buckets are strategies. Holdings are the assets inside them."
      action={
        <Segmented
          label="Allocation basis"
          value={basis}
          onChange={setBasis}
          options={[
            { id: "bucket", label: "By Bucket" },
            { id: "assetClass", label: "By Asset Class" },
          ]}
        />
      }
    >
      {basis === "assetClass" ? (
        <Muted className="max-w-md py-6 text-sm">
          Asset class is not recorded on these holdings yet. Allocation by bucket is available now.
        </Muted>
      ) : chartSlices.length === 0 ? (
        <Muted className="py-6 text-sm">No allocation yet. Add a statement period to see how the portfolio is split.</Muted>
      ) : (
        <div className="grid items-center gap-6 md:grid-cols-[220px_minmax(0,1fr)]">
          <div className="relative mx-auto size-[220px]">
            <ChartContainer config={chartConfig} className="aspect-auto size-[220px]">
              <PieChart>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      nameKey="name"
                      hideLabel
                      formatter={(value, name) => (
                        <span className="font-numeric">
                          {name}: {formatUsd(Number(value))}
                        </span>
                      )}
                    />
                  }
                />
                <Pie
                  data={chartSlices}
                  dataKey="valueUsd"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={68}
                  outerRadius={96}
                  paddingAngle={2}
                  strokeWidth={0}
                  onMouseLeave={() => setHoverId(null)}
                  onClick={(_, index) => {
                    const slice = chartSlices[index];
                    if (!slice) return;
                    onSelect(selectedId === slice.id ? null : slice.id);
                  }}
                >
                  {chartSlices.map((slice) => {
                    const dimmed =
                      (selectedId != null || hoverId != null) &&
                      slice.id !== (hoverId ?? selectedId);
                    return (
                      <Cell
                        key={slice.id}
                        fill={slice.color}
                        fillOpacity={dimmed ? 0.28 : 1}
                        style={{ cursor: "pointer" }}
                        onMouseEnter={() => setHoverId(slice.id)}
                      />
                    );
                  })}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
              <span className="font-numeric text-lg font-semibold text-brand-primary">
                {focus ? `${focus.pct.toFixed(0)}%` : formatCompactUsd(slices.reduce((sum, slice) => sum + slice.valueUsd, 0))}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {focus ? focus.shortName : "Total"}
              </span>
            </div>
          </div>
          <ul className="flex flex-col">
            {slices.map((slice) => {
              const active = slice.id === selectedId;
              return (
                <li key={slice.id}>
                  <button
                    type="button"
                    aria-pressed={active}
                    onMouseEnter={() => setHoverId(slice.id)}
                    onMouseLeave={() => setHoverId(null)}
                    onClick={() => onSelect(active ? null : slice.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left active:translate-y-px",
                      active ? "bg-muted/70" : "hover:bg-muted/40",
                    )}
                  >
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: slice.color }}
                    />
                    <span className="min-w-0 flex-1">
                      <TextSmall className="block truncate font-medium">{slice.name}</TextSmall>
                      <Muted className="text-xs">
                        {formatCompactUsd(slice.valueUsd)} · {slice.pct.toFixed(0)}%
                      </Muted>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </Section>
  );
}

function PortfolioPerformance({
  clientId,
  history,
  range,
  onRangeChange,
  mode,
  onModeChange,
  benchmark = null,
}: {
  clientId: string;
  history: HistoryPoint[];
  range: RangeId;
  onRangeChange: (range: RangeId) => void;
  mode: ChartMode;
  onModeChange: (mode: ChartMode) => void;
  benchmark?: BenchmarkSeries | null;
}) {
  const windowed = sliceHistory(history, range);
  const first = windowed[0];
  const last = windowed[windowed.length - 1];
  const gain = first && last && windowed.length >= 2 ? last.value - first.value : null;
  const ret =
    first && last && windowed.length >= 2 && first.value > 0
      ? ((last.value - first.value) / first.value) * 100
      : null;
  const plotted = mode === "return" ? toReturnSeries(windowed) : windowed;
  const benchmarkByMonth = new Map(
    (benchmark ? (mode === "return" ? toReturnSeries(benchmark.points) : benchmark.points) : []).map(
      (point) => [point.month, point.value],
    ),
  );
  const chartData = plotted.map((point) => ({
    month: point.month,
    value: point.value,
    benchmark: benchmarkByMonth.get(point.month),
  }));
  const hasBenchmark = chartData.some((point) => point.benchmark != null);
  const chartConfig = {
    value: { label: mode === "return" ? "Return" : "Portfolio value", color: "#202356" },
    benchmark: { label: benchmark?.label ?? "Benchmark", color: "#b2936b" },
  } satisfies ChartConfig;

  return (
    <Section
      title="Portfolio Performance"
      action={
        <Segmented
          label="Chart series"
          value={mode}
          onChange={onModeChange}
          options={[
            { id: "value", label: "Portfolio Value" },
            { id: "return", label: "Return %" },
          ]}
        />
      }
    >
      <div className="mb-4 flex flex-wrap items-end gap-x-8 gap-y-3">
        <div>
          <Muted className="text-xs">Current value</Muted>
          <TextSmall className="font-numeric text-xl font-semibold text-brand-primary">
            {last ? formatCompactUsd(last.value) : "n/a"}
          </TextSmall>
        </div>
        <div>
          <Muted className="text-xs">Gain / loss</Muted>
          <TextSmall
            className={cn(
              "font-numeric text-xl font-semibold",
              gain == null && "text-muted-foreground",
              gain != null && gain > 0 && "text-emerald-700",
              gain != null && gain < 0 && "text-destructive",
            )}
          >
            {gain == null ? "n/a" : formatCompactUsd(gain, true)}
          </TextSmall>
        </div>
        <div>
          <Muted className="text-xs">Return</Muted>
          <TextSmall
            className={cn(
              "font-numeric text-xl font-semibold",
              ret == null && "text-muted-foreground",
              ret != null && ret > 0 && "text-emerald-700",
              ret != null && ret < 0 && "text-destructive",
            )}
          >
            {ret == null ? "n/a" : `${ret > 0 ? "+" : ""}${ret.toFixed(1)}%`}
          </TextSmall>
        </div>
      </div>

      {mode === "return" && windowed.length >= 2 && (first?.value ?? 0) <= 0 ? (
        <Muted className="py-8 text-sm">
          Return needs a starting value above zero in this window.
        </Muted>
      ) : windowed.length < 2 ? (
        <Muted className="py-8 text-sm">
          {history.length < 2
            ? "Portfolio trends appear once two statement periods are saved."
            : "Not enough statement history in this window."}
        </Muted>
      ) : (
        <ChartContainer config={chartConfig} className="aspect-auto h-[240px] w-full">
          <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`perf-${clientId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#202356" stopOpacity={0.22} />
                <stop offset="95%" stopColor="#202356" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} minTickGap={28} />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={56}
              tickFormatter={(value) =>
                mode === "return" ? `${Number(value).toFixed(0)}%` : formatChartCompactUsd(Number(value))
              }
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) =>
                    mode === "return"
                      ? `${Number(value).toFixed(1)}%`
                      : formatChartUsd(Number(value))
                  }
                />
              }
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="var(--color-value)"
              strokeWidth={2}
              fill={`url(#perf-${clientId})`}
              dot={{ r: 3, fill: "var(--color-value)", strokeWidth: 0 }}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
            {hasBenchmark ? (
              <Line
                type="monotone"
                dataKey="benchmark"
                stroke="var(--color-benchmark)"
                strokeWidth={1.5}
                dot={false}
                connectNulls
              />
            ) : null}
          </AreaChart>
        </ChartContainer>
      )}

      <div className="mt-4 flex flex-wrap justify-center gap-1">
        {RANGES.map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={item === range}
            onClick={() => onRangeChange(item)}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-medium active:translate-y-px",
              item === range
                ? "bg-brand-primary text-white"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {item}
          </button>
        ))}
      </div>
    </Section>
  );
}

export function PortfolioOverview({
  clientId,
  portfolio,
  snapshots,
  latestPeriod,
  onRefresh,
}: {
  clientId: string;
  portfolio: JaPortfolioSummary | null;
  snapshots: PortfolioSnapshot[];
  latestPeriod: StatementPeriod | null;
  onRefresh?: () => void;
}) {
  const statementHref = `/advisors/dashboard/clients/${clientId}/statement`;
  const [section, setSection] = useState<SectionId>("Overview");
  const [selectedBucket, setSelectedBucket] = useState<PortfolioBucket | null>(null);
  const [range, setRange] = useState<RangeId>("All");
  const [chartMode, setChartMode] = useState<ChartMode>("value");
  const [holdingOpen, setHoldingOpen] = useState(false);
  const [holdingFormKey, setHoldingFormKey] = useState(0);
  const [valuesOpen, setValuesOpen] = useState(false);
  const [auditOpen, setAuditOpen] = useState(false);
  const [transactions, setTransactions] = useState<WealthTransaction[]>([]);
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>("all");
  const [assetRefresh, setAssetRefresh] = useState(0);
  const [assetState, setAssetState] = useState<{
    clientId: string;
    refresh: number;
    assets: TrackedAsset[];
    error: string | null;
  } | null>(null);
  const [selectedHoldingId, setSelectedHoldingId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/clients/${clientId}/transactions`)
      .then((res) => res.json())
      .then((data) => setTransactions(data.transactions ?? []))
      .catch(() => undefined);
  }, [clientId]);

  useEffect(() => {
    const controller = new AbortController();
    const refresh = assetRefresh;
    fetch(`/api/portfolio/assets?clientId=${encodeURIComponent(clientId)}`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Could not load holdings");
        setAssetState({
          clientId,
          refresh,
          assets: (data.assets ?? []) as TrackedAsset[],
          error: null,
        });
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setAssetState({
          clientId,
          refresh,
          assets: [],
          error: err instanceof Error ? err.message : "Could not load holdings",
        });
      });
    return () => controller.abort();
  }, [clientId, assetRefresh]);

  const slices = useMemo(
    () => buildSlices(portfolio, snapshots),
    [portfolio, snapshots],
  );
  const breakdown = useMemo(
    () => buildBreakdown(slices, snapshots),
    [slices, snapshots],
  );
  const total = portfolio?.totalUSD ?? slices.reduce((sum, slice) => sum + slice.valueUsd, 0);
  const cash = slices.find((slice) => slice.id === "coa")?.valueUsd ?? 0;
  const invested = slices
    .filter((slice) => slice.id !== "coa")
    .reduce((sum, slice) => sum + slice.valueUsd, 0);
  const change = heroChange(portfolio);
  const narrative = periodNarrative(portfolio);
  const assetsReady =
    assetState != null &&
    assetState.clientId === clientId &&
    assetState.refresh === assetRefresh;
  const assets = assetsReady ? assetState.assets : [];
  const assetsLoading = !assetsReady;
  const assetsError = assetsReady ? assetState.error : null;
  const holdingsTotal = assets.reduce((sum, asset) => sum + asset.marketValueUsd, 0);
  const visibleAssets = selectedBucket
    ? assets.filter((asset) => asset.bucket === selectedBucket)
    : assets;
  const selectedHolding = assets.find((asset) => asset.id === selectedHoldingId) ?? null;
  const keyError = assets.some((asset) => asset.priceError?.includes("API key"));
  const filteredActivity = transactions.filter((tx) => {
    if (activityFilter === "contributions") return tx.amount_usd > 0;
    if (activityFilter === "withdrawals") return tx.amount_usd < 0;
    return true;
  });

  function openAddHolding() {
    setHoldingFormKey((value) => value + 1);
    setHoldingOpen(true);
  }

  const showHoldings =
    section === "Overview" ||
    section === "Holdings" ||
    (section === "Allocation" && selectedBucket != null);
  const showAllocation = section === "Overview" || section === "Allocation";
  const showPerformance = section === "Overview" || section === "Performance";
  const showBreakdown = section === "Overview" || section === "Allocation";
  const showActivity = section === "Overview" || section === "Activity";

  return (
    <div className="flex flex-col gap-4 pb-12">
      <SurfaceCard>
        <div className="flex items-start justify-between gap-4">
          <div>
            <Overline>Portfolio</Overline>
            <TextSmall className="mt-2 font-medium">
              {latestPeriod ? "Latest statement period" : "No statement period yet"}
            </TextSmall>
            <Muted className="text-[13px]">
              {latestPeriod
                ? `${latestPeriod.label} · ${formatStatementDate(latestPeriod.period_start)} to ${formatStatementDate(latestPeriod.period_end)}`
                : "Add a statement period to start tracking value."}
            </Muted>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button type="button" variant="outline" size="sm">
                  More actions
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="min-w-56" sideOffset={6}>
              <DropdownMenuItem onClick={() => setValuesOpen(true)}>
                Update portfolio values
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link href={statementHref} />}>
                Import statement data
              </DropdownMenuItem>
              <DropdownMenuItem onClick={openAddHolding}>Add holding</DropdownMenuItem>
              <DropdownMenuItem render={<Link href={statementHref} />}>
                Edit allocation
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setAuditOpen(true)}>
                View audit history
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex flex-col items-center px-2 py-8 text-center">
          <Numeric className="text-[2.75rem] text-brand-primary sm:text-5xl">
            {formatCompactUsd(total)}
          </Numeric>
          <Muted className="mt-2 text-xs">Total portfolio value</Muted>
          {change ? (
            <p
              className={cn(
                "mt-2 font-numeric text-sm font-medium",
                change.tone === "up" && "text-emerald-700",
                change.tone === "down" && "text-destructive",
                change.tone === "flat" && "text-muted-foreground",
              )}
            >
              {change.text}
            </p>
          ) : null}
        </div>

        <div className="mx-auto grid w-full max-w-xl grid-cols-3 gap-3 border-t border-border/60 pt-4">
          <div className="text-center">
            <Muted className="text-[11px]">Invested capital</Muted>
            <TextSmall className="mt-1 block font-numeric font-medium">
              {formatCompactUsd(invested)}
            </TextSmall>
          </div>
          <div className="text-center">
            <Muted className="text-[11px]">YTD return</Muted>
            <TextSmall className="mt-1 block font-numeric font-medium">
              {portfolio
                ? `${portfolio.ytdPct > 0 ? "+" : ""}${portfolio.ytdPct.toFixed(1)}%`
                : "n/a"}
            </TextSmall>
          </div>
          <div className="text-center">
            <Muted className="text-[11px]">Cash position</Muted>
            <TextSmall className="mt-1 block font-numeric font-medium">
              {formatCompactUsd(cash)}
            </TextSmall>
          </div>
        </div>
        {narrative ? (
          <p className="mx-auto mt-4 max-w-md text-center text-sm text-muted-foreground">
            {narrative}
          </p>
        ) : null}

        <nav
          id="portfolio-sections"
          className="mt-6 flex gap-1 overflow-x-auto border-b border-border/70"
          aria-label="Portfolio sections"
        >
          {SECTIONS.map((item) => {
            const active = item === section;
            return (
              <button
                key={item}
                type="button"
                aria-pressed={active}
                onClick={() => setSection(item)}
                className={cn(
                  "relative whitespace-nowrap px-3 py-2 text-sm active:translate-y-px",
                  active
                    ? "font-semibold text-brand-primary"
                    : "font-medium text-muted-foreground hover:text-foreground",
                )}
              >
                {item}
                <span
                  className={cn(
                    "absolute inset-x-3 bottom-0 h-0.5 origin-left bg-brand-accent transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
                    active ? "scale-x-100" : "scale-x-0",
                  )}
                />
              </button>
            );
          })}
        </nav>
      </SurfaceCard>

      {showPerformance ? (
        <PortfolioPerformance
          clientId={clientId}
          history={portfolio?.history ?? []}
          range={range}
          onRangeChange={setRange}
          mode={chartMode}
          onModeChange={setChartMode}
        />
      ) : null}

      {showAllocation ? (
        <AllocationPanel
          slices={slices}
          selectedId={selectedBucket}
          onSelect={setSelectedBucket}
        />
      ) : null}

      {showHoldings ? (
        <Section
          title="Holdings"
          description={
            selectedBucket
              ? `Listed assets inside ${BUCKET_LABELS[selectedBucket]}.`
              : "Listed assets inside a portfolio bucket. Value is quantity times the market price."
          }
          action={
            <Button type="button" size="sm" onClick={openAddHolding}>
              <Plus className="size-4" />
              Add holding
            </Button>
          }
        >
          {assetsLoading ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : assetsError ? (
            <Muted>{assetsError}</Muted>
          ) : assets.length === 0 ? (
            <div className="flex flex-col items-start gap-2 py-4">
              <h4 className="font-heading text-base font-semibold text-brand-primary">
                No individual holdings yet
              </h4>
              <Muted className="max-w-md text-sm">
                Track stocks, ETFs, funds, and other listed assets to automatically calculate
                their current market value.
              </Muted>
              <Button type="button" size="sm" className="mt-2" onClick={openAddHolding}>
                <Plus className="size-4" />
                Add holding
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {keyError ? (
                <Muted className="text-sm">
                  Finnhub rejected the API key, so live prices could not be loaded. Saved values
                  are shown instead.
                </Muted>
              ) : null}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Muted className="text-sm">
                  {visibleAssets.length} {visibleAssets.length === 1 ? "holding" : "holdings"} ·{" "}
                  {formatCompactUsd(
                    visibleAssets.reduce((sum, asset) => sum + asset.marketValueUsd, 0),
                  )}{" "}
                  total value
                </Muted>
                {selectedBucket ? (
                  <button
                    type="button"
                    onClick={() => setSelectedBucket(null)}
                    className="text-xs font-medium text-brand-primary hover:underline"
                  >
                    Show all buckets
                  </button>
                ) : null}
              </div>

              {visibleAssets.length === 0 ? (
                <Muted className="text-sm">No holdings in this bucket yet.</Muted>
              ) : section === "Holdings" ? (
                <HoldingsTable
                  assets={visibleAssets}
                  total={total > 0 ? total : holdingsTotal}
                  selectedId={selectedHoldingId}
                  onSelect={setSelectedHoldingId}
                />
              ) : (
                <CompactHoldings
                  assets={[...visibleAssets]
                    .sort((a, b) => b.marketValueUsd - a.marketValueUsd)
                    .slice(0, 5)}
                  onOpen={(id) => {
                    setSelectedHoldingId(id);
                    setSection("Holdings");
                  }}
                />
              )}

              {section === "Overview" && visibleAssets.length > 5 ? (
                <button
                  type="button"
                  onClick={() => setSection("Holdings")}
                  className="self-start text-sm font-medium text-brand-primary hover:underline"
                >
                  View all holdings
                </button>
              ) : null}

              {section === "Holdings" && selectedHolding ? (
                <div className="border-t border-border/60 pt-4">
                  <TextSmall className="font-medium">
                    {selectedHolding.name} ({selectedHolding.ticker})
                  </TextSmall>
                  <Muted className="text-xs">
                    {selectedHolding.bucketLabel}
                    {selectedHolding.priceError && !keyError
                      ? `. ${selectedHolding.priceError}`
                      : ""}
                  </Muted>
                  {selectedHolding.history.length >= 2 ? (
                    <div className="mt-3">
                      <AssetAreaChart
                        data={selectedHolding.history}
                        color="#202356"
                        gradientId={`holding-${selectedHolding.id}`}
                        height={200}
                        yAxisLabel="Value (USD)"
                        seriesLabel={selectedHolding.ticker}
                      />
                    </div>
                  ) : (
                    <Muted className="mt-2 text-sm">
                      {selectedHolding.live
                        ? "Not enough price history yet to chart this holding."
                        : "Add a quantity to price this holding from the market."}
                    </Muted>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </Section>
      ) : null}

      {showBreakdown && breakdown.length > 0 ? (
        <Section
          title="Portfolio Breakdown"
          description={
            latestPeriod
              ? `${latestPeriod.label}. Each row is a strategy, not an individual asset.`
              : "Each row is a strategy, not an individual asset."
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="pb-2 pr-4 font-medium">Bucket</th>
                  <th className="pb-2 pr-4 text-right font-medium">Current value</th>
                  <th className="pb-2 pr-4 text-right font-medium">Change</th>
                  <th className="pb-2 font-medium">Allocation</th>
                </tr>
              </thead>
              <tbody>
                {breakdown.map((row) => (
                  <tr key={row.id} className="border-b border-border/50 last:border-0">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <span
                          className="size-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: row.color }}
                        />
                        <TextSmall className="font-medium">{row.shortName}</TextSmall>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-right font-numeric font-medium">
                      {formatCompactUsd(row.valueUsd)}
                    </td>
                    <td className="py-3 pr-4 text-right">
                      {row.changeUsd == null ? (
                        <span className="text-xs text-muted-foreground">n/a</span>
                      ) : (
                        <div className="flex flex-col items-end">
                          <span
                            className={cn(
                              "font-numeric font-medium",
                              row.changeUsd > 0 && "text-emerald-700",
                              row.changeUsd < 0 && "text-destructive",
                              row.changeUsd === 0 && "text-muted-foreground",
                            )}
                          >
                            {formatCompactUsd(row.changeUsd, true)}
                          </span>
                          <ChangeText value={row.periodPct} />
                        </div>
                      )}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-brand-primary/80"
                            style={{ width: `${Math.min(100, Math.max(0, row.pct))}%` }}
                          />
                        </div>
                        <span className="font-numeric text-xs text-muted-foreground">
                          {row.pct.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      ) : null}

      {showActivity ? (
        <ActivitySection
          transactions={filteredActivity}
          filter={activityFilter}
          onFilter={setActivityFilter}
          expanded={section === "Activity"}
          onExpand={() => setSection("Activity")}
          statementHref={statementHref}
        />
      ) : null}

      <Sheet open={holdingOpen} onOpenChange={setHoldingOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader className="border-b border-border/60">
            <SheetTitle>Add holding</SheetTitle>
            <SheetDescription>
              Search for a listed asset. Current market value is quantity times the market price.
            </SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-6">
            {holdingOpen ? (
              <TrackAssetPanel
                key={holdingFormKey}
                clientId={clientId}
                embedded
                onSaved={() => {
                  setAssetRefresh((value) => value + 1);
                  onRefresh?.();
                }}
              />
            ) : null}
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={valuesOpen} onOpenChange={setValuesOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader className="border-b border-border/60">
            <SheetTitle>Update portfolio values</SheetTitle>
            <SheetDescription>
              For property, private funds, cash, and anything that is not on the trackable list.
              A note is required so the change is written to the audit trail.
            </SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-6">
            {valuesOpen ? (
              <PortfolioQuickUpdate
                clientId={clientId}
                snapshots={snapshots}
                embedded
                onSaved={onRefresh}
              />
            ) : null}
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={auditOpen} onOpenChange={setAuditOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader className="border-b border-border/60">
            <SheetTitle>Audit history</SheetTitle>
            <SheetDescription>Recorded portfolio updates for this client.</SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-6">
            {auditOpen ? <ComplianceAuditPanel clientId={clientId} /> : null}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function CompactHoldings({
  assets,
  onOpen,
}: {
  assets: TrackedAsset[];
  onOpen: (id: string) => void;
}) {
  return (
    <ul>
      {assets.map((asset) => {
        const kind = holdingKind(asset.ticker);
        return (
          <li key={asset.id} className="border-b border-border/50 last:border-0">
            <button
              type="button"
              onClick={() => onOpen(asset.id)}
              className="flex w-full items-center gap-3 py-3 text-left hover:bg-muted/30"
            >
              <span className="min-w-0 flex-1">
                <TextSmall className="block truncate font-medium">{asset.name}</TextSmall>
                <Muted className="text-xs">
                  {kind ? `${kind} · ${asset.bucketLabel}` : asset.bucketLabel}
                </Muted>
              </span>
              <span className="text-right">
                <TextSmall className="block font-numeric font-medium">
                  {formatCompactUsd(asset.marketValueUsd)}
                </TextSmall>
                <ChangeText value={gainPct(asset)} />
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function HoldingsTable({
  assets,
  total,
  selectedId,
  onSelect,
}: {
  assets: TrackedAsset[];
  total: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const groups = (Object.keys(SHORT_BUCKET) as PortfolioBucket[])
    .map((bucket) => ({
      bucket,
      rows: assets
        .filter((asset) => asset.bucket === bucket)
        .sort((a, b) => b.marketValueUsd - a.marketValueUsd),
    }))
    .filter((group) => group.rows.length > 0)
    .sort((a, b) => {
      const aValue = a.rows.reduce((sum, row) => sum + row.marketValueUsd, 0);
      const bValue = b.rows.reduce((sum, row) => sum + row.marketValueUsd, 0);
      return bValue - aValue;
    });

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-sm">
        <thead>
          <tr className="border-b text-left text-xs text-muted-foreground">
            <th className="pb-2 pr-3 font-medium">Asset</th>
            <th className="pb-2 pr-3 font-medium">Type</th>
            <th className="pb-2 pr-3 text-right font-medium">Quantity</th>
            <th className="pb-2 pr-3 text-right font-medium">Current price</th>
            <th className="pb-2 pr-3 text-right font-medium">Current value</th>
            <th className="pb-2 pr-3 text-right font-medium">Gain / loss</th>
            <th className="pb-2 text-right font-medium">Allocation</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => (
            <Fragment key={group.bucket}>
              <tr className="bg-muted/30">
                <td colSpan={7} className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                  {BUCKET_LABELS[group.bucket]}
                </td>
              </tr>
              {group.rows.map((asset) => {
                const share = total > 0 ? (asset.marketValueUsd / total) * 100 : null;
                const active = asset.id === selectedId;
                return (
                  <tr
                    key={asset.id}
                    tabIndex={0}
                    onClick={() => onSelect(asset.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onSelect(asset.id);
                      }
                    }}
                    className={cn(
                      "cursor-pointer border-b border-border/50 last:border-0",
                      active && "bg-muted/40",
                    )}
                  >
                    <td className="py-2.5 pr-3">
                      <TextSmall className="font-medium">{asset.name}</TextSmall>
                      <Muted className="text-xs">{asset.ticker}</Muted>
                    </td>
                    <td className="py-2.5 pr-3 text-muted-foreground">
                      {holdingKind(asset.ticker) ?? "n/a"}
                    </td>
                    <td className="py-2.5 pr-3 text-right font-numeric">{quantityLabel(asset)}</td>
                    <td className="py-2.5 pr-3 text-right font-numeric">
                      {formatPrice(asset.priceUsd)}
                    </td>
                    <td className="py-2.5 pr-3 text-right font-numeric font-medium">
                      {formatUsd(asset.marketValueUsd)}
                    </td>
                    <td className="py-2.5 pr-3 text-right">
                      <ChangeText value={gainPct(asset)} />
                    </td>
                    <td className="py-2.5 text-right font-numeric text-muted-foreground">
                      {share == null ? "n/a" : `${share.toFixed(1)}%`}
                    </td>
                  </tr>
                );
              })}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ActivitySection({
  transactions,
  filter,
  onFilter,
  expanded,
  onExpand,
  statementHref,
}: {
  transactions: WealthTransaction[];
  filter: ActivityFilter;
  onFilter: (filter: ActivityFilter) => void;
  expanded: boolean;
  onExpand: () => void;
  statementHref: string;
}) {
  const limit = expanded ? 8 : 4;
  const visible = transactions.slice(0, limit);
  const remaining = transactions.length - visible.length;

  return (
    <Section
      title="Recent Activity"
      action={
        expanded ? (
          <Link href={statementHref} className="text-sm font-medium text-brand-primary hover:underline">
            Edit in statement data
          </Link>
        ) : (
          <button
            type="button"
            onClick={onExpand}
            className="text-sm font-medium text-brand-primary hover:underline"
          >
            View all activity
          </button>
        )
      }
    >
      <div className="mb-2">
        <Segmented
          label="Activity filter"
          value={filter}
          onChange={onFilter}
          options={[
            { id: "all", label: "All" },
            { id: "contributions", label: "Contributions" },
            { id: "withdrawals", label: "Withdrawals" },
          ]}
        />
      </div>
      {visible.length === 0 ? (
        <Muted className="py-4 text-sm">No activity in this view yet.</Muted>
      ) : (
        <ul>
          {visible.map((tx) => {
            const incoming = tx.amount_usd >= 0;
            return (
              <li
                key={tx.id}
                className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 border-b border-border/50 py-3 last:border-0"
              >
                <span
                  className={cn(
                    "mt-1.5 size-1.5 rounded-full",
                    incoming ? "bg-emerald-600" : "bg-destructive/70",
                  )}
                />
                <span className="min-w-0">
                  <TextSmall className="block font-medium">{tx.description}</TextSmall>
                  <Muted className="text-xs">
                    {formatStatementDate(tx.occurred_on)} · {movementLabel(tx)}
                  </Muted>
                </span>
                <TextSmall
                  className={cn(
                    "font-numeric font-medium",
                    incoming ? "text-emerald-700" : "text-destructive",
                  )}
                >
                  {formatCompactUsd(tx.amount_usd, true)}
                </TextSmall>
              </li>
            );
          })}
        </ul>
      )}
      {expanded && remaining > 0 ? (
        <Link
          href={statementHref}
          className="mt-3 inline-block text-sm font-medium text-brand-primary hover:underline"
        >
          {remaining} more in statement data
        </Link>
      ) : null}
    </Section>
  );
}
