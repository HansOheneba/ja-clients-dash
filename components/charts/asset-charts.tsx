"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Muted } from "@/components/ui/typography";
import { formatChartCompactUsd, formatChartUsd } from "@/lib/chart-format";
import { cn } from "@/lib/utils";

type HistoryPoint = { month: string; value: number };

type AllocationSlice = { name: string; value: number; color: string };

const CHART_SURFACE = "aspect-auto w-full min-h-0 min-w-0";

function buildAllocationConfig(slices: AllocationSlice[]): ChartConfig {
  const config: ChartConfig = {
    allocation: { label: "Allocation" },
  };
  for (const slice of slices) {
    config[slice.name] = { label: slice.name, color: slice.color };
  }
  return config;
}

function ValueAreaChart({
  data,
  color = "#202356",
  gradientId,
  height = 220,
  yAxisLabel = "Value (USD)",
  seriesLabel = "Portfolio value",
  className,
}: {
  data: HistoryPoint[];
  color?: string;
  gradientId: string;
  height?: number;
  yAxisLabel?: string;
  seriesLabel?: string;
  className?: string;
}) {
  const chartConfig = {
    value: {
      label: seriesLabel,
      color,
    },
  } satisfies ChartConfig;

  if (data.length < 2) {
    return (
      <p className="text-sm text-muted-foreground">
        Add at least two statement periods to show value over time.
      </p>
    );
  }

  return (
    <div className={cn("flex w-full min-w-0 flex-col gap-2", className)}>
      <div className="flex items-center justify-between gap-4 text-[11px] text-muted-foreground">
        <span>{yAxisLabel}</span>
        <span>Statement period</span>
      </div>
      <ChartContainer
        config={chartConfig}
        className={CHART_SURFACE}
        style={{ height }}
      >
        <AreaChart
          accessibilityLayer
          data={data}
          margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.25} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={32}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={4}
            width={64}
            tickFormatter={(value) => formatChartCompactUsd(Number(value))}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value) => formatChartUsd(Number(value))}
              />
            }
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="var(--color-value)"
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={{ r: 3, fill: "var(--color-value)", strokeWidth: 0 }}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
}

function AllocationLegend({
  data,
  columns = 2,
}: {
  data: AllocationSlice[];
  columns?: 2 | 3;
}) {
  const columnClass =
    columns === 3 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2";

  return (
    <ul className={cn("grid min-w-0 gap-x-4 gap-y-2.5 text-xs", columnClass)}>
      {data.map((slice) => (
        <li key={slice.name} className="flex min-w-0 items-start gap-2">
          <span
            className="mt-1 size-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: slice.color }}
          />
          <span className="min-w-0 flex-1 leading-snug">{slice.name}</span>
          <Muted className="shrink-0 font-numeric tabular-nums">{slice.value}%</Muted>
        </li>
      ))}
    </ul>
  );
}

function AllocationPieChart({
  data,
  size = "default",
}: {
  data: AllocationSlice[];
  size?: "default" | "large" | "compact";
}) {
  const chartConfig = buildAllocationConfig(data);

  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">No allocation data yet.</p>;
  }

  const chartHeight =
    size === "large" ? 280 : size === "compact" ? 168 : 220;
  const innerRadius = size === "large" ? 72 : size === "compact" ? 48 : 58;
  const outerRadius = size === "large" ? 108 : size === "compact" ? 72 : 88;
  const legendColumns = data.length > 6 ? 3 : 2;

  return (
    <div className="flex min-w-0 flex-col gap-5">
      <ChartContainer
        config={chartConfig}
        className="aspect-auto mx-auto w-full"
        style={{ height: chartHeight, maxWidth: chartHeight }}
      >
        <PieChart margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
          <ChartTooltip
            content={
              <ChartTooltipContent
                nameKey="name"
                hideLabel
                formatter={(value, name) => (
                  <span className="font-numeric">
                    {name}: {Number(value).toFixed(1)}%
                  </span>
                )}
              />
            }
          />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            strokeWidth={0}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>
      <AllocationLegend data={data} columns={legendColumns} />
    </div>
  );
}

function PortfolioLineChart({
  data,
  lines,
  yAxisLabel = "Value (USD)",
  height = 200,
}: {
  data: Record<string, number | string>[];
  lines: { key: string; color: string; label?: string }[];
  yAxisLabel?: string;
  height?: number;
}) {
  const chartConfig = lines.reduce<ChartConfig>((acc, line) => {
    acc[line.key] = {
      label: line.label ?? line.key,
      color: line.color,
    };
    return acc;
  }, {});

  return (
    <div className="flex w-full min-w-0 flex-col gap-2">
      <div className="flex items-center justify-between gap-4 text-[11px] text-muted-foreground">
        <span>{yAxisLabel}</span>
        <span>Statement period</span>
      </div>
      <ChartContainer config={chartConfig} className={CHART_SURFACE} style={{ height }}>
        <LineChart
          accessibilityLayer
          data={data}
          margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
        >
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={32}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={4}
            width={64}
            tickFormatter={(value) => formatChartCompactUsd(Number(value))}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value) => formatChartUsd(Number(value))}
              />
            }
          />
          <ChartLegend
            content={
              <ChartLegendContent className="flex-wrap justify-start gap-x-4 gap-y-2" />
            }
          />
          {lines.map((line) => (
            <Line
              key={line.key}
              type="monotone"
              dataKey={line.key}
              stroke={`var(--color-${line.key})`}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          ))}
        </LineChart>
      </ChartContainer>
    </div>
  );
}

/** @deprecated Use ValueAreaChart. Kept for existing imports. */
function AssetAreaChart({
  data,
  color,
  gradientId,
  height = 220,
  yAxisLabel = "Value (USD)",
  seriesLabel = "Portfolio value",
  showAxis: _showAxis,
}: {
  data: HistoryPoint[];
  color?: string;
  gradientId: string;
  height?: number;
  yAxisLabel?: string;
  seriesLabel?: string;
  showAxis?: boolean;
}) {
  return (
    <ValueAreaChart
      data={data}
      color={color}
      gradientId={gradientId}
      height={height}
      yAxisLabel={yAxisLabel}
      seriesLabel={seriesLabel}
    />
  );
}

export {
  AllocationPieChart,
  AssetAreaChart,
  PortfolioLineChart,
  ValueAreaChart,
};
