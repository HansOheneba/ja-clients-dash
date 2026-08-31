import type { PortfolioBucket, TransactionType } from "./types";

export const BUCKET_LABELS: Record<PortfolioBucket, string> = {
  income: "Income Portfolio",
  growth: "Growth Portfolio",
  venture: "Venture Portfolio",
  treasury: "Treasury Portfolio",
  coa: "Cash On Account (COA)",
};

export const BUCKET_COLORS: Record<PortfolioBucket, string> = {
  income: "#b2936b",
  growth: "#202356",
  venture: "#829850",
  treasury: "#484848",
  coa: "#c4b5a0",
};

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  drawdown: "Drawdown",
  deposit: "Deposit",
  transfer: "Transfer",
  fee: "Fee",
  other: "Other",
};

export const ALL_BUCKETS: PortfolioBucket[] = [
  "income",
  "growth",
  "venture",
  "treasury",
  "coa",
];

/** Household estate planning snapshot. Not used on the investment report. */
export const ESTATE_STATUS_OPTIONS = [
  "No will or trust yet",
  "Will in place",
  "Trust in place",
  "Will and trust in place",
  "In discussion with counsel",
] as const;

export const OVERVIEW_BUCKETS: PortfolioBucket[] = [
  "income",
  "growth",
  "venture",
  "coa",
];

export const PERFORMANCE_BUCKETS: PortfolioBucket[] = [
  "income",
  "growth",
  "treasury",
  "venture",
];

export function formatUsd(value: number, signed = false): string {
  const abs = Math.abs(value);
  const formatted = abs.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
  if (!signed || value === 0) return formatted;
  return value > 0 ? `+ ${formatted}` : `- ${formatted}`;
}

export function formatPct(value: number | null | undefined, signed = false): string {
  if (value == null) return "N/A";
  const formatted = `${Math.abs(value).toFixed(1)}%`;
  if (!signed || value === 0) return formatted;
  return value > 0 ? `+ ${formatted}` : `- ${formatted}`;
}
