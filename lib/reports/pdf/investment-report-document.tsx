import React from "react";
import { Document, Text, View } from "@react-pdf/renderer";

import type { InvestmentReportData, ReportTransactionRow } from "@/lib/reports/types";
import { formatPct, formatUsd } from "@/lib/wealth/constants";
import { JA_REPORT_LOGO } from "@/lib/reports/pdf/report-assets";
import { AllocationChart, ValueChart } from "@/lib/reports/pdf/report-charts";
import {
  CoverPage,
  KpiBand,
  ReportPageShell,
  SectionTitle,
  SubsectionTitle,
  BulletList,
} from "@/lib/reports/pdf/report-layout";
import { reportStyles } from "@/lib/reports/pdf/report-theme";

const FIRM_ADDRESS =
  "WC L, 190 Elgin Avenue, George Town, Grand Cayman, Cayman Islands, KY-1 9008";

function formatTxDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function ClientDetailsGrid({ data }: { data: InvestmentReportData }) {
  const cityLine = [data.address.city, data.address.region, data.address.postalCode]
    .filter(Boolean)
    .join(" ");

  return (
    <View style={reportStyles.detailGrid}>
      <View style={reportStyles.detailCol}>
        <Text style={reportStyles.detailLabel}>Prepared for</Text>
        <Text style={reportStyles.detailValue}>{data.clientName}</Text>
        {data.address.line1 ? (
          <Text style={reportStyles.detailValue}>{data.address.line1}</Text>
        ) : null}
        {data.address.line2 ? (
          <Text style={reportStyles.detailValue}>{data.address.line2}</Text>
        ) : null}
        {cityLine ? <Text style={reportStyles.detailValue}>{cityLine}</Text> : null}
        {data.address.country ? (
          <Text style={reportStyles.detailValue}>{data.address.country}</Text>
        ) : null}
      </View>
      <View style={reportStyles.detailCol}>
        <Text style={reportStyles.detailLabel}>Statement</Text>
        {data.reportKindTitle ? (
          <Text style={reportStyles.detailValue}>{data.reportKindTitle}</Text>
        ) : null}
        <Text style={reportStyles.detailValue}>{data.statementPeriodLabel}</Text>
        <Text style={reportStyles.detailLabel}>Statement reference</Text>
        <Text style={reportStyles.detailValue}>{data.reference}</Text>
        <Text style={reportStyles.detailLabel}>Client reference</Text>
        <Text style={reportStyles.detailValue}>{data.clientNumber}</Text>
        <Text style={reportStyles.detailLabel}>Currency</Text>
        <Text style={reportStyles.detailValue}>{data.currency}</Text>
      </View>
    </View>
  );
}

function OverviewTable({ data }: { data: InvestmentReportData }) {
  const invested = data.overviewRows.filter((r) => r.bucket !== "coa");
  const totalPrevious = data.overviewRows.reduce((s, r) => s + r.previousValueUsd, 0);
  const totalCurrent = data.overviewRows.reduce((s, r) => s + r.currentValueUsd, 0);
  const totalChange = invested.reduce((s, r) => s + r.periodChangeUsd, 0);

  return (
    <View style={reportStyles.table}>
      <View style={reportStyles.tableHeader}>
        <Text style={[reportStyles.tableHeaderText, { width: "24%" }]}>Asset class</Text>
        <Text style={[reportStyles.tableHeaderText, { width: "19%", textAlign: "right" }]}>
          Previous{"\n"}({data.previousStatementLabel})
        </Text>
        <Text style={[reportStyles.tableHeaderText, { width: "19%", textAlign: "right" }]}>
          Current{"\n"}({data.currentStatementLabel})
        </Text>
        <Text style={[reportStyles.tableHeaderText, { width: "19%", textAlign: "right" }]}>
          Change during period
        </Text>
        <Text style={[reportStyles.tableHeaderText, { width: "19%", textAlign: "right" }]}>
          % change{"\n"}year to date
        </Text>
      </View>
      {data.overviewRows.map((row, i) => (
        <View
          key={row.bucket}
          style={[reportStyles.tableRow, i % 2 === 1 ? reportStyles.tableRowAlt : {}]}
        >
          <Text style={[reportStyles.tableCell, { width: "24%" }]}>{row.label}</Text>
          <Text style={[reportStyles.tableCellRight, { width: "19%" }]}>
            {formatUsd(row.previousValueUsd)}
          </Text>
          <Text style={[reportStyles.tableCellRight, { width: "19%" }]}>
            {formatUsd(row.currentValueUsd)}
          </Text>
          <Text style={[reportStyles.tableCellRight, { width: "19%" }]}>
            {row.bucket === "coa" ? "N/A" : formatUsd(row.periodChangeUsd, true)}
          </Text>
          <Text style={[reportStyles.tableCellRight, { width: "19%" }]}>
            {row.bucket === "coa" || row.ytdPct == null
              ? "N/A"
              : formatPct(row.ytdPct, true)}
          </Text>
        </View>
      ))}
      <View style={reportStyles.tableTotal}>
        <Text style={[reportStyles.tableTotalText, { width: "24%" }]}>Total</Text>
        <Text style={[reportStyles.tableTotalText, { width: "19%", textAlign: "right" }]}>
          {formatUsd(totalPrevious)}
        </Text>
        <Text style={[reportStyles.tableTotalText, { width: "19%", textAlign: "right" }]}>
          {formatUsd(totalCurrent)}
        </Text>
        <Text style={[reportStyles.tableTotalText, { width: "19%", textAlign: "right" }]}>
          {formatUsd(totalChange, true)}
        </Text>
        <Text style={[reportStyles.tableTotalText, { width: "19%", textAlign: "right" }]}>
          {formatPct(data.periodReturnPct, true)}
        </Text>
      </View>
    </View>
  );
}

function PeriodPerformanceTable({ data }: { data: InvestmentReportData }) {
  const invested = data.overviewRows.filter((r) => r.bucket !== "coa");

  return (
    <View style={reportStyles.table}>
      <View style={reportStyles.tableHeader}>
        <Text style={[reportStyles.tableHeaderText, { width: "40%" }]}>Asset class</Text>
        <Text style={[reportStyles.tableHeaderText, { width: "30%", textAlign: "right" }]}>
          Period change
        </Text>
        <Text style={[reportStyles.tableHeaderText, { width: "30%", textAlign: "right" }]}>
          % change YTD
        </Text>
      </View>
      {invested.map((row, i) => (
        <View
          key={row.bucket}
          style={[reportStyles.tableRow, i % 2 === 1 ? reportStyles.tableRowAlt : {}]}
        >
          <Text style={[reportStyles.tableCell, { width: "40%" }]}>{row.label}</Text>
          <Text style={[reportStyles.tableCellRight, { width: "30%" }]}>
            {formatUsd(row.periodChangeUsd, true)}
          </Text>
          <Text style={[reportStyles.tableCellRight, { width: "30%" }]}>
            {row.ytdPct == null ? "N/A" : formatPct(row.ytdPct, true)}
          </Text>
        </View>
      ))}
      <View style={reportStyles.tableTotal}>
        <Text style={[reportStyles.tableTotalText, { width: "40%" }]}>Portfolio total</Text>
        <Text style={[reportStyles.tableTotalText, { width: "30%", textAlign: "right" }]}>
          {formatUsd(data.periodGainUsd, true)}
        </Text>
        <Text style={[reportStyles.tableTotalText, { width: "30%", textAlign: "right" }]}>
          {formatPct(data.periodReturnPct, true)}
        </Text>
      </View>
    </View>
  );
}

function InceptionPerformanceTable({ data }: { data: InvestmentReportData }) {
  const performanceTotalGain = data.performanceRows.reduce(
    (s, r) => s + (r.inceptionGainUsd ?? 0),
    0,
  );

  return (
    <View style={reportStyles.table}>
      <View style={reportStyles.tableHeader}>
        <Text style={[reportStyles.tableHeaderText, { width: "28%" }]}>Asset class</Text>
        <Text style={[reportStyles.tableHeaderText, { width: "24%", textAlign: "right" }]}>
          Gain since inception
        </Text>
        <Text style={[reportStyles.tableHeaderText, { width: "24%", textAlign: "right" }]}>
          % change since inception
        </Text>
        <Text style={[reportStyles.tableHeaderText, { width: "24%", textAlign: "right" }]}>
          % annualised return
        </Text>
      </View>
      {data.performanceRows.map((row, i) => (
        <View
          key={row.bucket}
          style={[reportStyles.tableRow, i % 2 === 1 ? reportStyles.tableRowAlt : {}]}
        >
          <Text style={[reportStyles.tableCell, { width: "28%" }]}>{row.label}</Text>
          <Text style={[reportStyles.tableCellRight, { width: "24%" }]}>
            {row.inceptionGainUsd == null ? "N/A" : formatUsd(row.inceptionGainUsd, true)}
          </Text>
          <Text style={[reportStyles.tableCellRight, { width: "24%" }]}>
            {row.inceptionPct == null ? "N/A" : formatPct(row.inceptionPct, true)}
          </Text>
          <Text style={[reportStyles.tableCellRight, { width: "24%" }]}>
            {row.annualizedReturnPct == null
              ? "N/A"
              : formatPct(row.annualizedReturnPct, true)}
          </Text>
        </View>
      ))}
      <View style={reportStyles.tableTotal}>
        <Text style={[reportStyles.tableTotalText, { width: "28%" }]}>Total</Text>
        <Text style={[reportStyles.tableTotalText, { width: "24%", textAlign: "right" }]}>
          {formatUsd(performanceTotalGain, true)}
        </Text>
        <Text style={[reportStyles.tableTotalText, { width: "24%", textAlign: "right" }]} />
        <Text style={[reportStyles.tableTotalText, { width: "24%", textAlign: "right" }]} />
      </View>
    </View>
  );
}

function AllocationBreakdownTable({ data }: { data: InvestmentReportData }) {
  return (
    <View style={reportStyles.table}>
      <View style={reportStyles.tableHeader}>
        <Text style={[reportStyles.tableHeaderText, { width: "40%" }]}>Asset class</Text>
        <Text style={[reportStyles.tableHeaderText, { width: "30%", textAlign: "right" }]}>
          Value
        </Text>
        <Text style={[reportStyles.tableHeaderText, { width: "30%", textAlign: "right" }]}>
          Allocation
        </Text>
      </View>
      {data.allocationSlices.map((slice, i) => (
        <View
          key={slice.bucket}
          style={[reportStyles.tableRow, i % 2 === 1 ? reportStyles.tableRowAlt : {}]}
        >
          <Text style={[reportStyles.tableCell, { width: "40%" }]}>{slice.label}</Text>
          <Text style={[reportStyles.tableCellRight, { width: "30%" }]}>
            {formatUsd(slice.valueUsd)}
          </Text>
          <Text style={[reportStyles.tableCellRight, { width: "30%" }]}>
            {slice.allocationPct.toFixed(1)}%
          </Text>
        </View>
      ))}
      <View style={reportStyles.tableTotal}>
        <Text style={[reportStyles.tableTotalText, { width: "40%" }]}>Total portfolio</Text>
        <Text style={[reportStyles.tableTotalText, { width: "30%", textAlign: "right" }]}>
          {formatUsd(data.totalPortfolioValueUsd)}
        </Text>
        <Text style={[reportStyles.tableTotalText, { width: "30%", textAlign: "right" }]}>
          100.0%
        </Text>
      </View>
    </View>
  );
}

function TransactionsTable({
  rows,
  emptyMessage,
}: {
  rows: ReportTransactionRow[];
  emptyMessage: string;
}) {
  if (rows.length === 0) {
    return <Text style={reportStyles.emptyRow}>{emptyMessage}</Text>;
  }

  return (
    <View style={reportStyles.table}>
      <View style={reportStyles.tableHeader}>
        <Text style={[reportStyles.tableHeaderText, { width: "25%" }]}>Date</Text>
        <Text style={[reportStyles.tableHeaderText, { width: "22%", textAlign: "right" }]}>
          Amount
        </Text>
        <Text style={[reportStyles.tableHeaderText, { width: "53%", paddingLeft: 8 }]}>
          Description
        </Text>
      </View>
      {rows.map((tx, i) => (
        <View
          key={tx.id}
          style={[reportStyles.tableRow, i % 2 === 1 ? reportStyles.tableRowAlt : {}]}
        >
          <Text style={[reportStyles.tableCell, { width: "25%" }]}>{formatTxDate(tx.date)}</Text>
          <Text style={[reportStyles.tableCellRight, { width: "22%" }]}>
            {formatUsd(tx.amountUsd)}
          </Text>
          <Text style={[reportStyles.tableCell, { width: "53%", paddingLeft: 8 }]}>
            {tx.description}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function InvestmentReportDocument({
  data,
  logoSrc = JA_REPORT_LOGO,
}: {
  data: InvestmentReportData;
  logoSrc?: string;
}) {
  return (
    <Document>
      <CoverPage data={data} logoSrc={logoSrc} />

      <ReportPageShell clientName={data.clientName} clientNumber={data.clientNumber} pageNumber={2}>
        <Text style={reportStyles.level1}>Executive Summary</Text>
        <ClientDetailsGrid data={data} />
        <KpiBand
          items={[
            { label: "Total portfolio value", value: formatUsd(data.totalPortfolioValueUsd) },
            { label: "Period gain", value: formatUsd(data.periodGainUsd, true) },
            { label: "Period return (YTD)", value: formatPct(data.periodReturnPct, true) },
          ]}
        />
        <Text style={reportStyles.bodyText}>{data.executiveSummary}</Text>
        <SubsectionTitle>Period performance</SubsectionTitle>
        <PeriodPerformanceTable data={data} />
        <Text style={reportStyles.footnote}>
          Percentage change reflects returns on invested capital and excludes uninvested cash on
          account unless noted. All values in {data.currency}.
        </Text>
      </ReportPageShell>

      <ReportPageShell clientName={data.clientName} clientNumber={data.clientNumber} pageNumber={3}>
        <Text style={reportStyles.level1}>Portfolio Overview</Text>
        <SubsectionTitle>Portfolio summary</SubsectionTitle>
        <OverviewTable data={data} />
        <SubsectionTitle>Portfolio allocation</SubsectionTitle>
        <View style={reportStyles.chartBox}>
          <AllocationChart slices={data.allocationSlices} />
        </View>
        <SubsectionTitle>Allocation breakdown</SubsectionTitle>
        <AllocationBreakdownTable data={data} />
      </ReportPageShell>

      <ReportPageShell clientName={data.clientName} clientNumber={data.clientNumber} pageNumber={4}>
        <Text style={reportStyles.level1}>Performance</Text>
        <SubsectionTitle>Portfolio value over time</SubsectionTitle>
        <View style={reportStyles.chartBox}>
          <ValueChart points={data.historyPoints} />
        </View>
        <SubsectionTitle>Period performance</SubsectionTitle>
        <PeriodPerformanceTable data={data} />
        <SubsectionTitle>Cumulative performance since inception</SubsectionTitle>
        <InceptionPerformanceTable data={data} />
      </ReportPageShell>

      <ReportPageShell clientName={data.clientName} clientNumber={data.clientNumber} pageNumber={5}>
        <Text style={reportStyles.level1}>Transactions & Activity</Text>
        <SubsectionTitle>Recent transactions</SubsectionTitle>
        <TransactionsTable
          rows={data.transactions}
          emptyMessage="No transactions recorded for this statement period."
        />
        {data.transactionsNote ? (
          <Text style={reportStyles.footnote}>{data.transactionsNote}</Text>
        ) : null}
        <SubsectionTitle>Contributions</SubsectionTitle>
        <TransactionsTable
          rows={data.contributions}
          emptyMessage="No contributions recorded for this statement period."
        />
        <SubsectionTitle>Withdrawals</SubsectionTitle>
        <TransactionsTable
          rows={data.withdrawals}
          emptyMessage="No withdrawals recorded for this statement period."
        />
        <SubsectionTitle>Other portfolio activity</SubsectionTitle>
        <TransactionsTable
          rows={data.otherActivity}
          emptyMessage="No other activity recorded for this statement period."
        />
      </ReportPageShell>

      <ReportPageShell clientName={data.clientName} clientNumber={data.clientNumber} pageNumber={6}>
        <Text style={reportStyles.level1}>Important Information</Text>
        {data.advisor ? (
          <>
            <SubsectionTitle>Your wealth manager</SubsectionTitle>
            <Text style={reportStyles.bodyText}>{data.advisor.fullName}</Text>
            {data.advisor.title ? (
              <Text style={reportStyles.muted}>{data.advisor.title}</Text>
            ) : null}
            <Text style={reportStyles.bodyText}>{data.advisor.email}</Text>
            {data.advisor.phone ? (
              <Text style={reportStyles.bodyText}>{data.advisor.phone}</Text>
            ) : null}
          </>
        ) : (
          <>
            <SubsectionTitle>Your wealth manager</SubsectionTitle>
            <Text style={reportStyles.muted}>
              Contact hello@jagroup.co for advisor details.
            </Text>
          </>
        )}
        <SubsectionTitle>Important notices</SubsectionTitle>
        <BulletList items={data.importantNotices} />
        <SubsectionTitle>{data.disclaimerTitle}</SubsectionTitle>
        <Text style={[reportStyles.bodyText, { fontSize: 7.5, lineHeight: 1.5, textAlign: "justify" }]}>
          {data.disclaimerBody}
        </Text>
        <View style={{ marginTop: 20, paddingTop: 12, borderTopWidth: 0.5, borderTopColor: "#e8e4dc" }}>
          <Text style={reportStyles.muted}>JA Wealth</Text>
          <Text style={reportStyles.muted}>{FIRM_ADDRESS}</Text>
          <Text style={reportStyles.muted}>hello@jagroup.co | jagroup.co</Text>
        </View>
      </ReportPageShell>
    </Document>
  );
}
