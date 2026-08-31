/** Compact USD ticks for chart Y axes (e.g. $2.5M, $450k). */
export function formatChartCompactUsd(value: number): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return "";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}k`;
  return `$${Math.round(n)}`;
}

/** Full USD for tooltips. */
export function formatChartUsd(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}
