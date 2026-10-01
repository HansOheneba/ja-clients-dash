"use client";

import { Line, LineChart, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatChartCompactUsd, formatChartUsd } from "@/lib/chart-format";
import { cn } from "@/lib/utils";

type Point = { month: string; value: number };

const chartConfig = {
  value: {
    label: "Book AUM",
    color: "#202356",
  },
} satisfies ChartConfig;

export function BookAumChart({
  data,
  className,
  height = 220,
}: {
  data: Point[];
  className?: string;
  height?: number;
}) {
  if (data.length < 2) {
    return (
      <p className="py-10 text-sm text-muted-foreground">
        Add statement history across clients to show book AUM over time.
      </p>
    );
  }

  return (
    <ChartContainer
      config={chartConfig}
      className={cn("aspect-auto w-full min-h-0 min-w-0", className)}
      style={{ height }}
    >
      <LineChart
        accessibilityLayer
        data={data}
        margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
      >
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          minTickGap={40}
          tick={{ fill: "#9a9a9a", fontSize: 11 }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={6}
          width={56}
          tickFormatter={(value) => formatChartCompactUsd(Number(value))}
          tick={{ fill: "#9a9a9a", fontSize: 11 }}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) => formatChartUsd(Number(value))}
            />
          }
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke="var(--color-value)"
          strokeWidth={1.75}
          dot={false}
          activeDot={{ r: 3.5, strokeWidth: 0, fill: "#202356" }}
        />
      </LineChart>
    </ChartContainer>
  );
}
