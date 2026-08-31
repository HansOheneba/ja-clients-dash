// components/ui/kpi-strip.tsx
//
// Reusable KPI grid used on every dashboard tab.
// Visual style (background, border, radius) is driven by:
//   lib/dashboard-theme.ts → dashboardTheme.kpiTile
// Edit that token to restyle every KPI tile across the app.

import * as React from "react";
import { TrendingDown, TrendingUp } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { dashboardTheme } from "@/lib/dashboard-theme";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

export type KpiTone = "good" | "warning" | "danger" | "neutral";

// Prop shape for the array-based API (used by the design-system preview and
// any new page that prefers passing `items={[...]}` over JSX children).
export type KpiItemData = {
  label: string;
  value: string;
  subline?: string;
  tone?: KpiTone;
  icon?: React.ReactNode;
  onClick?: () => void;
};

// ─── Tone → value colour ─────────────────────────────────────────────────────

const toneClass: Record<KpiTone, string> = {
  good:    "text-green-600 dark:text-green-400",
  warning: "text-amber-600 dark:text-amber-400",
  danger:  "text-red-500  dark:text-red-400",
  neutral: "text-foreground",
};

// ─── KpiStrip ────────────────────────────────────────────────────────────────
// Accepts either JSX children (the existing pattern used site-wide) or an
// `items` array for a more concise API.

interface KpiStripProps extends React.ComponentProps<"div"> {
  /** Grid column count. Defaults to auto (fills a row evenly). */
  cols?: 2 | 3 | 4 | 5 | 6;
  /** Render skeletons for every item instead of real values. */
  loading?: boolean;
  /** Array-based alternative to JSX children. */
  items?: KpiItemData[];
}

function KpiStrip({ className, cols, loading, items, children, ...props }: KpiStripProps) {
  const colsClass =
    cols === 2 ? "grid-cols-1 sm:grid-cols-2"
    : cols === 3 ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
    : cols === 5 ? "grid-cols-2 sm:grid-cols-3 xl:grid-cols-5"
    : cols === 6 ? "grid-cols-2 sm:grid-cols-3 xl:grid-cols-6"
    : "grid-cols-2 sm:grid-cols-2 lg:grid-cols-4"; // default (4-col)

  return (
    <div
      data-slot="kpi-strip"
      className={cn("grid gap-3", colsClass, className)}
      {...props}
    >
      {items
        ? items.map((item) => (
            <KpiItem
              key={item.label}
              label={item.label}
              value={item.value}
              subline={item.subline}
              tone={item.tone}
              icon={item.icon}
              loading={loading}
              onClick={item.onClick}
            />
          ))
        : children}
    </div>
  );
}

// ─── KpiItem ─────────────────────────────────────────────────────────────────
// A single tile. Used either as a direct child of KpiStrip or driven by the
// `items` array. Supports the original `change` / `trend` props for backward
// compatibility with all existing pages.

interface KpiItemProps extends React.ComponentProps<"div"> {
  label: string;
  value: string;
  /** Short descriptor line under the value (replaces the old `change` prop). */
  subline?: string;
  /** Legacy alias for `subline` — still accepted everywhere. */
  change?: string;
  /** Colour the value text. */
  tone?: KpiTone;
  /** Legacy trend → maps to tone automatically. */
  trend?: "up" | "down" | "neutral";
  /** Visual emphasis for hero KPI tiles. */
  emphasis?: "primary";
  /** Optional icon shown above the label. */
  icon?: React.ReactNode;
  /** Show skeleton placeholder instead of values. */
  loading?: boolean;
}

function KpiItem({
  className,
  label,
  value,
  subline,
  change,
  tone,
  trend,
  emphasis,
  icon,
  loading,
  onClick,
  ...props
}: KpiItemProps) {
  // Map legacy `trend` to `tone` when no explicit `tone` is given
  const resolvedTone: KpiTone =
    tone ?? (trend === "up" ? "good" : trend === "down" ? "danger" : "neutral");

  const descriptor = subline ?? change;

  // Legacy trend icon shown next to the descriptor line
  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : null;

  return (
    <div
      data-slot="kpi-item"
      onClick={loading ? undefined : onClick}
      className={cn(
        dashboardTheme.kpiTile,
        "flex flex-col gap-1 px-4 py-3.5",
        emphasis === "primary" && "border-brand-primary/30 bg-brand-primary/5",
        onClick && !loading && "cursor-pointer transition-colors hover:border-border",
        className,
      )}
      {...props}
    >
      {icon && (
        <div className="mb-1.5 w-fit rounded-lg bg-muted/60 p-1.5">{icon}</div>
      )}

      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>

      {loading ? (
        <>
          <Skeleton className="mt-1 h-6 w-24" />
          <Skeleton className="mt-1 h-3 w-32" />
        </>
      ) : (
        <>
          <p
            className={cn(
              "text-lg font-bold tabular-nums tracking-tight",
              toneClass[resolvedTone],
            )}
          >
            {value}
          </p>

          {descriptor && (
            <div className="flex items-center gap-1">
              {TrendIcon && (
                <TrendIcon
                  className={cn(
                    "size-3.5",
                    resolvedTone === "good" && "text-green-600",
                    resolvedTone === "danger" && "text-red-500",
                    resolvedTone === "neutral" && "text-muted-foreground",
                  )}
                />
              )}
              <p className="text-[11px] text-muted-foreground">{descriptor}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export { KpiItem, KpiStrip };
