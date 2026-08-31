import {
  BUCKET_COLORS,
  BUCKET_LABELS,
  formatUsd,
  OVERVIEW_BUCKETS,
  PERFORMANCE_BUCKETS,
} from "@/lib/wealth/constants";
import type { InvestmentReportData } from "@/lib/reports/types";
import type { PortfolioSnapshot, WealthTransaction } from "@/lib/wealth/types";
import { formatCountryName, formatRegionName } from "@/lib/wealth/countries";
import {
  formatReportReference,
  periodsOverlappingRange,
  reportWindowForPeriod,
  statementKindTitle,
  type ReportKind,
} from "@/lib/wealth/period-calendar";
import {
  getActiveDisclaimer,
  getAdvisorById,
  getClientAddress,
  getClientById,
  getPortfolioHistory,
  getPortfolioSnapshotsForPeriods,
  getStatementPeriod,
  getStatementPeriodsForClient,
  getTransactionsForPeriod,
} from "@/lib/wealth/queries";

export function formatReference(referenceCode: string, date: Date): string {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${referenceCode}/${dd}${mm}${yyyy}`;
}

export function formatOrdinalDate(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(`${value}T12:00:00`);
  const day = date.getDate();
  const suffix =
    day % 10 === 1 && day !== 11
      ? "st"
      : day % 10 === 2 && day !== 12
        ? "nd"
        : day % 10 === 3 && day !== 13
          ? "rd"
          : "th";
  const month = date.toLocaleDateString("en-GB", { month: "long" });
  const year = date.getFullYear();
  return `${day}${suffix} ${month} ${year}`;
}

// The statement note tells the client what the transaction list covers, so it has
// to describe what was actually recorded rather than assume a single bucket.
function describeTransactions(transactions: WealthTransaction[]): string | null {
  if (transactions.length === 0) return null;

  const buckets = new Set(transactions.map((t) => t.bucket));
  const types = new Set(transactions.map((t) => t.transaction_type));
  const [bucket] = [...buckets];

  if (buckets.size === 1 && types.size === 1 && bucket) {
    const label = BUCKET_LABELS[bucket];
    const [type] = [...types];
    return `Note: Showing ${label} ${type} transactions only for this statement period.`;
  }

  return "Note: Showing all transactions recorded during this statement period.";
}

function mapTransaction(t: WealthTransaction) {
  return {
    id: t.id,
    date: t.occurred_on,
    amountUsd: t.amount_usd,
    description: t.description,
    transactionType: t.transaction_type,
  };
}

function splitTransactions(transactions: WealthTransaction[]) {
  const mapped = transactions.map(mapTransaction);
  return {
    all: mapped,
    contributions: mapped.filter((t) => t.transactionType === "deposit"),
    withdrawals: mapped.filter((t) => t.transactionType === "drawdown"),
    otherActivity: mapped.filter(
      (t) =>
        t.transactionType === "transfer" ||
        t.transactionType === "fee" ||
        t.transactionType === "other",
    ),
  };
}

export function buildExecutiveSummary(
  statementPeriodLabel: string,
  periodGainUsd: number,
  periodReturnPct: number,
  totalPortfolioValueUsd: number,
): string {
  const direction = periodGainUsd >= 0 ? "increased" : "decreased";
  const gainText = formatUsd(Math.abs(periodGainUsd));
  const pctText = `${periodReturnPct >= 0 ? "+" : ""}${periodReturnPct.toFixed(1)}%`;
  return `During ${statementPeriodLabel}, your portfolio ${direction} by ${gainText} (${pctText}), bringing total portfolio value to ${formatUsd(totalPortfolioValueUsd)}. This report summarises how your capital is allocated across JA managed portfolios, how value has evolved over time, and activity recorded during the statement period.`;
}

export const DEFAULT_REPORT_NOTICES = [
  "Portfolio valuations reflect statement dates and may change with market conditions.",
  "Period returns reflect invested capital and exclude uninvested cash on account unless noted.",
  "Past performance is not a reliable indicator of future results.",
];

function snapshotsByPeriod(snapshots: PortfolioSnapshot[]) {
  const map = new Map<string, Map<PortfolioSnapshot["bucket"], PortfolioSnapshot>>();
  for (const snap of snapshots) {
    let byBucket = map.get(snap.period_id);
    if (!byBucket) {
      byBucket = new Map();
      map.set(snap.period_id, byBucket);
    }
    byBucket.set(snap.bucket, snap);
  }
  return map;
}

export async function assembleInvestmentReportData(
  clientId: string,
  periodId: string,
  preparedOn = new Date(),
  kind: ReportKind = "monthly",
): Promise<InvestmentReportData> {
  const [client, period, allPeriods, history, disclaimer, address] = await Promise.all([
    getClientById(clientId),
    getStatementPeriod(periodId),
    getStatementPeriodsForClient(clientId),
    getPortfolioHistory(clientId),
    getActiveDisclaimer(),
    getClientAddress(clientId),
  ]);

  if (!client || !period) {
    throw new Error("Client or statement period not found");
  }

  const window = reportWindowForPeriod(period, kind);
  const overlapping =
    kind === "monthly"
      ? [period]
      : periodsOverlappingRange(allPeriods, window.start, window.end);

  if (overlapping.length === 0) {
    throw new Error(
      `No monthly values in this ${kind} window. Enter at least one month of statement data first.`,
    );
  }

  const snapshots = await getPortfolioSnapshotsForPeriods(
    clientId,
    overlapping.map((p) => p.id),
  );
  const byPeriod = snapshotsByPeriod(snapshots);
  const firstPeriod = overlapping[0];
  const lastPeriod = overlapping[overlapping.length - 1];
  const startMap = byPeriod.get(firstPeriod.id) ?? new Map();
  const endMap = byPeriod.get(lastPeriod.id) ?? new Map();

  const overviewRows = OVERVIEW_BUCKETS.map((bucket) => {
    const startSnap = startMap.get(bucket);
    const endSnap = endMap.get(bucket);
    const previous = startSnap?.previous_value_usd ?? 0;
    const current = endSnap?.current_value_usd ?? 0;
    const periodChangeUsd = current - previous;
    const storedPct = overlapping.length === 1 ? (endSnap?.period_change_pct ?? null) : null;
    return {
      bucket,
      label: BUCKET_LABELS[bucket],
      previousValueUsd: previous,
      currentValueUsd: current,
      periodChangeUsd,
      periodChangePct:
        storedPct ?? (previous > 0 ? (periodChangeUsd / previous) * 100 : null),
      ytdPct: endSnap?.ytd_pct ?? null,
    };
  });

  // Cash on account is not invested capital, so it is excluded from both sides of
  // the gain. Mixing an invested baseline with an all-in current value overstated
  // the period gain by the whole cash balance.
  const investedRows = overviewRows.filter((r) => r.bucket !== "coa");
  const investedPrevious = investedRows.reduce((s, r) => s + r.previousValueUsd, 0);
  const investedCurrent = investedRows.reduce((s, r) => s + r.currentValueUsd, 0);
  const totalCurrent = overviewRows.reduce((s, r) => s + r.currentValueUsd, 0);
  const periodGainUsd = investedCurrent - investedPrevious;
  const periodReturnPct =
    investedPrevious > 0 ? (periodGainUsd / investedPrevious) * 100 : 0;

  const performanceRows = PERFORMANCE_BUCKETS.map((bucket) => {
    const snap = endMap.get(bucket);
    return {
      bucket,
      label: BUCKET_LABELS[bucket],
      inceptionGainUsd: snap?.inception_gain_usd ?? null,
      inceptionPct: snap?.inception_pct ?? null,
      annualizedReturnPct: snap?.annualized_return_pct ?? null,
    };
  });

  const allocationTotal = overviewRows.reduce((s, r) => s + r.currentValueUsd, 0);
  const allocationSlices = overviewRows
    .filter((r) => r.currentValueUsd > 0)
    .map((r) => ({
      bucket: r.bucket,
      label: r.label,
      valueUsd: r.currentValueUsd,
      allocationPct:
        allocationTotal > 0 ? (r.currentValueUsd / allocationTotal) * 100 : 0,
      color: BUCKET_COLORS[r.bucket],
    }));

  const transactions = await getTransactionsForPeriod(clientId, window.start, window.end);
  const txGroups = splitTransactions(transactions);
  const advisor = client.advisor_id ? await getAdvisorById(client.advisor_id) : null;
  const kindTitle = statementKindTitle(kind);
  const inWindow = history.filter(
    (h) => h.recorded_on >= window.start && h.recorded_on <= window.end,
  );
  const historyForChart =
    inWindow.length >= 2 ? inWindow : history.filter((h) => h.recorded_on <= window.end);

  return {
    transactionsNote: describeTransactions(transactions),
    executiveSummary: buildExecutiveSummary(
      window.label,
      periodGainUsd,
      periodReturnPct,
      totalCurrent,
    ),
    importantNotices: DEFAULT_REPORT_NOTICES,
    advisor: advisor
      ? {
          fullName: advisor.full_name,
          email: advisor.email,
          phone: advisor.phone,
          title: advisor.title,
        }
      : null,
    contributions: txGroups.contributions,
    withdrawals: txGroups.withdrawals,
    otherActivity: txGroups.otherActivity,
    clientName: client.full_name,
    clientNumber: client.client_number,
    referenceCode: client.client_number,
    reference: formatReportReference(client.client_number, kind, window.end),
    preparedOn: formatOrdinalDate(preparedOn),
    reportKindTitle: kindTitle,
    statementPeriodLabel: window.label,
    periodStart: window.start,
    periodEnd: window.end,
    previousStatementLabel: formatOrdinalDate(window.start),
    currentStatementLabel: formatOrdinalDate(window.end),
    address: {
      line1: address?.line1 ?? "",
      line2: address?.line2,
      city: address?.city ?? "",
      region: formatRegionName(address?.country, address?.region) || address?.region,
      postalCode: address?.postal_code,
      country: formatCountryName(address?.country ?? "US"),
    },
    currency: client.currency,
    totalPortfolioValueUsd: totalCurrent,
    periodGainUsd,
    periodReturnPct,
    overviewRows,
    performanceRows,
    allocationSlices,
    historyPoints: historyForChart.map((h) => ({
      date: h.recorded_on,
      valueUsd: h.total_value_usd,
    })),
    transactions: txGroups.all,
    disclaimerTitle:
      disclaimer?.title ?? "Important Notice Regarding Valuations & Performance",
    disclaimerBody: disclaimer?.body ?? "",
  };
}
