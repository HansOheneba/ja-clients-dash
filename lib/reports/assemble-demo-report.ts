import { getClientById, type AdvisorClient } from "@/lib/advisor-clients-data";
import {
  buildExecutiveSummary,
  DEFAULT_REPORT_NOTICES,
  formatOrdinalDate,
  formatReference,
} from "@/lib/reports/assemble-report-data";
import { getDemoSnapshots, type DemoSnapshotInput } from "@/lib/reports/demo-client-data";
import { computeReportTotalPages } from "@/lib/reports/pdf/report-theme";
import { JOHN_DOE_TEMPLATE_GROWTH_HOLDINGS } from "@/lib/reports/template-holdings";
import type {
  InvestmentReportData,
  ReportHoldingsBreakdown,
  ReportSnapshotRow,
  ReportTransactionRow,
} from "@/lib/reports/types";
import {
  BUCKET_COLORS,
  BUCKET_LABELS,
  OVERVIEW_BUCKETS,
  PERFORMANCE_BUCKETS,
} from "@/lib/wealth/constants";
import { ALL_REPORT_SECTIONS } from "@/lib/wealth/wm-types";

export type { DemoSnapshotInput } from "@/lib/reports/demo-client-data";

const MONTH_NUM: Record<string, number> = {
  Jan: 1,
  Feb: 2,
  Mar: 3,
  Apr: 4,
  May: 5,
  Jun: 6,
  Jul: 7,
  Aug: 8,
  Sep: 9,
  Oct: 10,
  Nov: 11,
  Dec: 12,
};

const JOHN_DOE_TRANSACTIONS: ReportTransactionRow[] = [
  {
    id: "demo-tx-1",
    date: "2026-02-24",
    amountUsd: 250000,
    description: "Growth Portfolio Investment",
    transactionType: "deposit",
  },
];

const DEMO_DISCLAIMER_BODY = [
  "This document has been printed at the client's request and shows the status of the client's portfolio on the date indicated. The document has been provided in the format agreed with the client. This valuation does not show all portfolio features and does not contain details of recent transactions. The information provided may only be valid for a limited period and may be out of date at the time the valuation is generated and/or sent out. Only the formal valuation issued by the Group is binding. Positions are reflected according to the reference currency of the client.",
  "The portfolio valuations, as well as stock market and currency prices, apply for the time the valuation is printed. This valuation does not necessarily reflect the real market conditions under which new transactions might be executed, nor the conditions under which existing transactions might be closed out or liquidated.",
  "Portfolio valuations are based on prices or net asset values obtained from the Group's usual sources of information, or in special cases information provided directly by the Client. Although prices and net asset values come from sources considered to be reliable, the Group does not guarantee or accept any responsibility for their accuracy. If a valuation is not given, this means that a price could not be determined. The prices shown are not tax value prices. Custodian banks, operations currently under way and any assets under pledge are not specifically indicated. Performance, and appreciation or depreciation in value, is shown purely for information purposes. Past performance should not be considered as a guarantee or indication of future results. This portfolio valuation is for information and is not signed. The Group does not provide any guarantee or accept any responsibility whatsoever as to its accuracy or completeness. Consequently, it expressly disclaims all responsibility for any loss or damage incurred as a result of its dissemination or use.",
  "The client is requested to check this portfolio valuation and in event of a disagreement, to notify the Group within one month from the date on which this document was communicated by the Group.",
].join("\n\n");

const JOHN_DOE_GROWTH_HOLDINGS: ReportHoldingsBreakdown = {
  bucket: "growth",
  label: "Growth Portfolio Breakdown",
  rows: JOHN_DOE_TEMPLATE_GROWTH_HOLDINGS.map((row) => ({ ...row, bucket: "growth" as const })),
};

function demoHoldingsBreakdowns(clientId: string): ReportHoldingsBreakdown[] {
  if (clientId !== "john-doe") return [];
  return [JOHN_DOE_GROWTH_HOLDINGS];
}

function historyPoints(client: AdvisorClient) {
  let year = client.id === "john-doe" ? 2024 : 2025;
  let lastMonth = 0;
  return client.portfolio.history
    .filter((point) => point.value > 0)
    .map((point) => {
      const month = MONTH_NUM[point.month] ?? 1;
      if (lastMonth && month < lastMonth) year += 1;
      lastMonth = month;
      return {
        date: `${year}-${String(month).padStart(2, "0")}-25`,
        valueUsd: point.value,
      };
    });
}

function parseLocation(location: string): {
  city: string;
  region: string | null;
  country: string;
} {
  const [city, regionOrCountry] = location.split(",").map((part) => part.trim());
  if (regionOrCountry === "UK" || regionOrCountry === "US") {
    return { city: city ?? "", region: null, country: regionOrCountry };
  }
  return {
    city: city ?? "",
    region: regionOrCountry ?? null,
    country: "US",
  };
}

function periodForClient(client: AdvisorClient) {
  if (client.id === "john-doe") {
    return {
      label: "Q2 2026 (25 Mar - 25 Jun 2026)",
      start: "2026-03-25",
      end: "2026-06-25",
    };
  }
  return {
    label: "Q2 2026 (1 Apr - 30 Jun 2026)",
    start: "2026-04-01",
    end: "2026-06-30",
  };
}

function transactionsForPeriod(client: AdvisorClient): ReportTransactionRow[] {
  if (client.id !== "john-doe") return [];
  return JOHN_DOE_TRANSACTIONS;
}

function clientNumber(client: AdvisorClient) {
  if (client.id === "john-doe") return "CN000";
  return `CN-${client.initials}`;
}

function referenceCode(client: AdvisorClient) {
  if (client.id === "john-doe") return "JAG000";
  return `JAG${client.initials}`;
}

export function assembleDemoInvestmentReport(
  clientId: string,
  snapshots?: DemoSnapshotInput[],
  preparedOn = new Date(),
): InvestmentReportData {
  const client = getClientById(clientId);
  if (!client) throw new Error("Demo client not found");

  const period = periodForClient(client);
  const rows = snapshots ?? getDemoSnapshots(clientId);
  const byBucket = new Map(rows.map((row) => [row.bucket, row]));

  const overviewRows: ReportSnapshotRow[] = OVERVIEW_BUCKETS.map((bucket) => {
    const snap = byBucket.get(bucket);
    const previous = snap?.previous_value_usd ?? 0;
    const current = snap?.current_value_usd ?? 0;
    return {
      bucket,
      label: BUCKET_LABELS[bucket],
      previousValueUsd: previous,
      currentValueUsd: current,
      periodChangeUsd: current - previous,
      periodChangePct: snap?.period_change_pct ?? null,
      ytdPct: snap?.ytd_pct ?? null,
    };
  });

  const investedRows = overviewRows.filter((row) => row.bucket !== "coa");
  const investedPrevious = investedRows.reduce((sum, row) => sum + row.previousValueUsd, 0);
  const investedCurrent = investedRows.reduce((sum, row) => sum + row.currentValueUsd, 0);
  const totalCurrent = overviewRows.reduce((sum, row) => sum + row.currentValueUsd, 0);
  const periodGainUsd = investedCurrent - investedPrevious;
  const periodReturnPct =
    investedPrevious > 0 ? (periodGainUsd / investedPrevious) * 100 : 0;

  const performanceRows = PERFORMANCE_BUCKETS.map((bucket) => {
    const snap = byBucket.get(bucket);
    return {
      bucket,
      label: BUCKET_LABELS[bucket],
      inceptionGainUsd: snap?.inception_gain_usd ?? null,
      inceptionPct: snap?.inception_pct ?? null,
      annualizedReturnPct: snap?.annualized_return_pct ?? null,
    };
  });

  const allocationTotal = overviewRows.reduce((sum, row) => sum + row.currentValueUsd, 0);
  const allocationSlices = overviewRows
    .filter((row) => row.currentValueUsd > 0)
    .map((row) => ({
      bucket: row.bucket,
      label: row.label,
      valueUsd: row.currentValueUsd,
      allocationPct: allocationTotal > 0 ? (row.currentValueUsd / allocationTotal) * 100 : 0,
      color: BUCKET_COLORS[row.bucket],
    }));

  const transactions = transactionsForPeriod(client);
  const location = parseLocation(client.location);
  const refCode = referenceCode(client);
  const holdingsBreakdowns = demoHoldingsBreakdowns(clientId);

  return {
    clientName: client.name,
    clientNumber: clientNumber(client),
    referenceCode: refCode,
    reference: formatReference(refCode, preparedOn),
    preparedOn: formatOrdinalDate(preparedOn),
    reportKindTitle: client.id === "john-doe" ? "Investment Report" : "Monthly statement",
    statementPeriodLabel: period.label,
    periodStart: period.start,
    periodEnd: period.end,
    previousStatementLabel: formatOrdinalDate(period.start),
    currentStatementLabel: formatOrdinalDate(period.end),
    address: {
      line1: client.id === "john-doe" ? "Beverly Hills Drive" : "",
      city: location.city,
      region: location.region,
      postalCode: client.id === "john-doe" ? "90210" : null,
      country: location.country,
    },
    currency: "USD",
    totalPortfolioValueUsd: totalCurrent,
    periodGainUsd,
    periodReturnPct,
    overviewRows,
    performanceRows,
    allocationSlices,
    holdingsBreakdowns,
    historyPoints: historyPoints(client),
    transactions,
    contributions: transactions.filter((tx) => tx.transactionType === "deposit"),
    withdrawals: transactions.filter((tx) => tx.transactionType === "drawdown"),
    otherActivity: [],
    transactionsNote: null,
    executiveSummary: buildExecutiveSummary(
      period.label,
      periodGainUsd,
      periodReturnPct,
      totalCurrent,
    ),
    importantNotices: DEFAULT_REPORT_NOTICES,
    advisor: {
      fullName: "JA Wealth",
      email: "hello@jawealth.com",
      phone: null,
      title: "Wealth Manager",
    },
    disclaimerTitle: "Important Notice Regarding Valuations & Performance",
    disclaimerBody: DEMO_DISCLAIMER_BODY,
    includedSections: [...ALL_REPORT_SECTIONS],
    totalPages: computeReportTotalPages(holdingsBreakdowns.length),
  };
}
