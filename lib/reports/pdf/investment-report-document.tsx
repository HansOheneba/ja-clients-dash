import React from "react";
import { Document, Image, Page, Text, View } from "@react-pdf/renderer";

import type {
  InvestmentReportData,
  ReportHoldingsBreakdown,
  ReportTransactionRow,
} from "@/lib/reports/types";
import { formatPct, formatUsd } from "@/lib/wealth/constants";
import { ALLOCATION_DESK, JA_REPORT_LOGO, JA_REPORT_LOGO_DARK } from "@/lib/reports/pdf/report-assets";
import { AllocationChart, ValueChart } from "@/lib/reports/pdf/report-charts";
import {
  BackCoverPage,
  BulletList,
  CoverPage,
  KpiBand,
  ReportFootnote,
  ReportPageShell,
  SubsectionTitle,
} from "@/lib/reports/pdf/report-layout";
import { REPORT_DOCUMENT_TITLE, reportStyles } from "@/lib/reports/pdf/report-theme";

const NOT_APPLICABLE = "Not applicable";

function formatTxDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function holdingGainPct(original: number, market: number): number | null {
  if (original <= 0) return null;
  return ((market - original) / original) * 100;
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
        <Text style={[reportStyles.tableHeaderTextLandscape, { width: "22%" }]}>
          Asset class
        </Text>
        <Text
          style={[reportStyles.tableHeaderTextLandscape, { width: "20%", textAlign: "right" }]}
        >
          Previous statement value{"\n"}({data.previousStatementLabel})
        </Text>
        <Text
          style={[reportStyles.tableHeaderTextLandscape, { width: "20%", textAlign: "right" }]}
        >
          Current statement value{"\n"}({data.currentStatementLabel})
        </Text>
        <Text
          style={[reportStyles.tableHeaderTextLandscape, { width: "19%", textAlign: "right" }]}
        >
          Change during period
        </Text>
        <Text
          style={[reportStyles.tableHeaderTextLandscape, { width: "19%", textAlign: "right" }]}
        >
          % change{"\n"}year to date
        </Text>
      </View>
      {data.overviewRows.map((row, i) => (
        <View
          key={row.bucket}
          style={[reportStyles.tableRow, i % 2 === 1 ? reportStyles.tableRowAlt : {}]}
        >
          <Text style={[reportStyles.tableCellLandscape, { width: "22%" }]}>{row.label}</Text>
          <Text style={[reportStyles.tableCellRightLandscape, { width: "20%" }]}>
            {formatUsd(row.previousValueUsd)}
          </Text>
          <Text style={[reportStyles.tableCellRightLandscape, { width: "20%" }]}>
            {formatUsd(row.currentValueUsd)}
          </Text>
          <Text style={[reportStyles.tableCellRightLandscape, { width: "19%" }]}>
            {row.bucket === "coa" ? NOT_APPLICABLE : formatUsd(row.periodChangeUsd, true)}
          </Text>
          <Text style={[reportStyles.tableCellRightLandscape, { width: "19%" }]}>
            {row.bucket === "coa" || row.ytdPct == null
              ? NOT_APPLICABLE
              : formatPct(row.ytdPct, true)}
          </Text>
        </View>
      ))}
      <View style={reportStyles.tableTotal}>
        <Text style={[reportStyles.tableTotalTextLandscape, { width: "22%" }]}>Total</Text>
        <Text
          style={[reportStyles.tableTotalTextLandscape, { width: "20%", textAlign: "right" }]}
        >
          {formatUsd(totalPrevious)}
        </Text>
        <Text
          style={[reportStyles.tableTotalTextLandscape, { width: "20%", textAlign: "right" }]}
        >
          {formatUsd(totalCurrent)}
        </Text>
        <Text
          style={[reportStyles.tableTotalTextLandscape, { width: "19%", textAlign: "right" }]}
        >
          {formatUsd(totalChange, true)}
        </Text>
        <Text
          style={[reportStyles.tableTotalTextLandscape, { width: "19%", textAlign: "right" }]}
        >
          {formatPct(data.periodReturnPct, true)}
        </Text>
      </View>
    </View>
  );
}

function HoldingsBreakdownTable({ breakdown }: { breakdown: ReportHoldingsBreakdown }) {
  const totalOriginal = breakdown.rows.reduce((s, r) => s + r.originalValueUsd, 0);
  const totalMarket = breakdown.rows.reduce((s, r) => s + r.marketValueUsd, 0);
  const totalGain = totalMarket - totalOriginal;
  const totalPct = holdingGainPct(totalOriginal, totalMarket);

  return (
    <View style={reportStyles.table}>
      <View style={reportStyles.tableHeader}>
        <Text style={[reportStyles.tableHeaderTextLandscape, { width: "22%" }]}>
          Investment name
        </Text>
        <Text style={[reportStyles.tableHeaderTextLandscape, { width: "10%" }]}>Ticker</Text>
        <Text
          style={[reportStyles.tableHeaderTextLandscape, { width: "14%", textAlign: "right" }]}
        >
          Original value
        </Text>
        <Text
          style={[reportStyles.tableHeaderTextLandscape, { width: "14%", textAlign: "right" }]}
        >
          Market value
        </Text>
        <Text
          style={[reportStyles.tableHeaderTextLandscape, { width: "18%", textAlign: "right" }]}
        >
          Unrealised gain/loss
        </Text>
        <Text
          style={[reportStyles.tableHeaderTextLandscape, { width: "12%", textAlign: "right" }]}
        >
          % gain/loss
        </Text>
      </View>
      {breakdown.rows.map((row, i) => {
        const gain = row.marketValueUsd - row.originalValueUsd;
        const pct = holdingGainPct(row.originalValueUsd, row.marketValueUsd);
        return (
          <View
            key={row.id}
            style={[reportStyles.tableRow, i % 2 === 1 ? reportStyles.tableRowAlt : {}]}
          >
            <Text style={[reportStyles.tableCellLandscape, { width: "22%" }]}>{row.name}</Text>
            <Text style={[reportStyles.tableCellLandscape, { width: "10%" }]}>{row.ticker}</Text>
            <Text style={[reportStyles.tableCellRightLandscape, { width: "14%" }]}>
              {formatUsd(row.originalValueUsd)}
            </Text>
            <Text style={[reportStyles.tableCellRightLandscape, { width: "14%" }]}>
              {formatUsd(row.marketValueUsd)}
            </Text>
            <Text style={[reportStyles.tableCellRightLandscape, { width: "18%" }]}>
              {formatUsd(gain, true)}
            </Text>
            <Text style={[reportStyles.tableCellRightLandscape, { width: "12%" }]}>
              {pct == null ? NOT_APPLICABLE : formatPct(pct, true)}
            </Text>
          </View>
        );
      })}
      <View style={reportStyles.tableTotal}>
        <Text style={[reportStyles.tableTotalTextLandscape, { width: "22%" }]}>Total</Text>
        <Text style={[reportStyles.tableTotalTextLandscape, { width: "10%" }]} />
        <Text
          style={[reportStyles.tableTotalTextLandscape, { width: "14%", textAlign: "right" }]}
        >
          {formatUsd(totalOriginal)}
        </Text>
        <Text
          style={[reportStyles.tableTotalTextLandscape, { width: "14%", textAlign: "right" }]}
        >
          {formatUsd(totalMarket)}
        </Text>
        <Text
          style={[reportStyles.tableTotalTextLandscape, { width: "18%", textAlign: "right" }]}
        >
          {formatUsd(totalGain, true)}
        </Text>
        <Text
          style={[reportStyles.tableTotalTextLandscape, { width: "12%", textAlign: "right" }]}
        >
          {totalPct == null ? NOT_APPLICABLE : formatPct(totalPct, true)}
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
        <Text style={[reportStyles.tableHeaderTextLandscape, { width: "40%" }]}>
          Asset class
        </Text>
        <Text
          style={[reportStyles.tableHeaderTextLandscape, { width: "30%", textAlign: "right" }]}
        >
          Period change
        </Text>
        <Text
          style={[reportStyles.tableHeaderTextLandscape, { width: "30%", textAlign: "right" }]}
        >
          % change YTD
        </Text>
      </View>
      {invested.map((row, i) => (
        <View
          key={row.bucket}
          style={[reportStyles.tableRow, i % 2 === 1 ? reportStyles.tableRowAlt : {}]}
        >
          <Text style={[reportStyles.tableCellLandscape, { width: "40%" }]}>{row.label}</Text>
          <Text style={[reportStyles.tableCellRightLandscape, { width: "30%" }]}>
            {formatUsd(row.periodChangeUsd, true)}
          </Text>
          <Text style={[reportStyles.tableCellRightLandscape, { width: "30%" }]}>
            {row.ytdPct == null ? NOT_APPLICABLE : formatPct(row.ytdPct, true)}
          </Text>
        </View>
      ))}
      <View style={reportStyles.tableTotal}>
        <Text style={[reportStyles.tableTotalTextLandscape, { width: "40%" }]}>
          Portfolio total
        </Text>
        <Text
          style={[reportStyles.tableTotalTextLandscape, { width: "30%", textAlign: "right" }]}
        >
          {formatUsd(data.periodGainUsd, true)}
        </Text>
        <Text
          style={[reportStyles.tableTotalTextLandscape, { width: "30%", textAlign: "right" }]}
        >
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
        <Text style={[reportStyles.tableHeaderTextLandscape, { width: "28%" }]}>
          Asset class
        </Text>
        <Text
          style={[reportStyles.tableHeaderTextLandscape, { width: "24%", textAlign: "right" }]}
        >
          Gain since inception
        </Text>
        <Text
          style={[reportStyles.tableHeaderTextLandscape, { width: "24%", textAlign: "right" }]}
        >
          % change since inception
        </Text>
        <Text
          style={[reportStyles.tableHeaderTextLandscape, { width: "24%", textAlign: "right" }]}
        >
          % annualised return
        </Text>
      </View>
      {data.performanceRows.map((row, i) => (
        <View
          key={row.bucket}
          style={[reportStyles.tableRow, i % 2 === 1 ? reportStyles.tableRowAlt : {}]}
        >
          <Text style={[reportStyles.tableCellLandscape, { width: "28%" }]}>{row.label}</Text>
          <Text style={[reportStyles.tableCellRightLandscape, { width: "24%" }]}>
            {row.inceptionGainUsd == null ? NOT_APPLICABLE : formatUsd(row.inceptionGainUsd, true)}
          </Text>
          <Text style={[reportStyles.tableCellRightLandscape, { width: "24%" }]}>
            {row.inceptionPct == null ? NOT_APPLICABLE : formatPct(row.inceptionPct, true)}
          </Text>
          <Text style={[reportStyles.tableCellRightLandscape, { width: "24%" }]}>
            {row.annualizedReturnPct == null
              ? NOT_APPLICABLE
              : formatPct(row.annualizedReturnPct, true)}
          </Text>
        </View>
      ))}
      <View style={reportStyles.tableTotal}>
        <Text style={[reportStyles.tableTotalTextLandscape, { width: "28%" }]}>Total</Text>
        <Text
          style={[reportStyles.tableTotalTextLandscape, { width: "24%", textAlign: "right" }]}
        >
          {formatUsd(performanceTotalGain, true)}
        </Text>
        <Text style={[reportStyles.tableTotalTextLandscape, { width: "24%", textAlign: "right" }]} />
        <Text style={[reportStyles.tableTotalTextLandscape, { width: "24%", textAlign: "right" }]} />
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
        <Text style={[reportStyles.tableHeaderTextLandscape, { width: "20%" }]}>Date</Text>
        <Text
          style={[reportStyles.tableHeaderTextLandscape, { width: "18%", textAlign: "right" }]}
        >
          Amount
        </Text>
        <Text
          style={[reportStyles.tableHeaderTextLandscape, { width: "62%", paddingLeft: 8 }]}
        >
          Description
        </Text>
      </View>
      {rows.map((tx, i) => (
        <View
          key={tx.id}
          style={[reportStyles.tableRow, i % 2 === 1 ? reportStyles.tableRowAlt : {}]}
        >
          <Text style={[reportStyles.tableCellLandscape, { width: "20%" }]}>
            {formatTxDate(tx.date)}
          </Text>
          <Text style={[reportStyles.tableCellRightLandscape, { width: "18%" }]}>
            {formatUsd(tx.amountUsd)}
          </Text>
          <Text style={[reportStyles.tableCellLandscape, { width: "62%", paddingLeft: 8 }]}>
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
  const shellProps = {
    clientName: data.clientName,
    clientNumber: data.clientNumber,
    reference: data.reference,
  };

  // Page 1: cover (portrait). Content pages start at 2.
  let pageNumber = 1;

  return (
    <Document>
      <CoverPage data={data} logoSrc={logoSrc} />

      <ReportPageShell
        {...shellProps}
        pageNumber={++pageNumber}
        pageTitle="Disclaimer"
      >
        <Text style={reportStyles.disclaimerTitle}>{data.disclaimerTitle}</Text>
        <Text style={reportStyles.disclaimerBody}>{data.disclaimerBody}</Text>
      </ReportPageShell>

      <ReportPageShell
        {...shellProps}
        pageNumber={++pageNumber}
        pageTitle="Executive Summary"
      >
        <ClientDetailsGrid data={data} />
        <KpiBand
          items={[
            { label: "Total portfolio value", value: formatUsd(data.totalPortfolioValueUsd) },
            { label: "Period gain", value: formatUsd(data.periodGainUsd, true) },
            { label: "Period return (YTD)", value: formatPct(data.periodReturnPct, true) },
          ]}
        />
        <Text style={reportStyles.bodyText}>{data.executiveSummary}</Text>
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
        ) : null}
        <SubsectionTitle>Important notices</SubsectionTitle>
        <BulletList items={data.importantNotices} />
        <View wrap={false}>
          <SubsectionTitle>Period performance</SubsectionTitle>
          <PeriodPerformanceTable data={data} />
          <ReportFootnote>
            Percentage change reflects returns on invested capital and excludes uninvested cash on
            account unless noted. All values in {data.currency}.
          </ReportFootnote>
        </View>
      </ReportPageShell>

      <ReportPageShell
        {...shellProps}
        pageNumber={++pageNumber}
        pageTitle="Portfolio Overview"
      >
        <OverviewTable data={data} />
        <ReportFootnote>
          Percentage change only reflects returns on invested capital and ignores the cash held on
          account.
        </ReportFootnote>
      </ReportPageShell>

      {data.holdingsBreakdowns.map((breakdown) => (
        <ReportPageShell
          key={breakdown.bucket}
          {...shellProps}
          pageNumber={++pageNumber}
          pageTitle={breakdown.label}
        >
          <HoldingsBreakdownTable breakdown={breakdown} />
        </ReportPageShell>
      ))}

      <Page size="A4" orientation="landscape" style={reportStyles.allocationSplitPage}>
        <Image src={ALLOCATION_DESK} style={reportStyles.allocationPhoto} />
        <View style={reportStyles.allocationPanel}>
          <Text style={reportStyles.pageTitleLandscape}>Portfolio Allocation</Text>
          <View style={reportStyles.titleRule} />
          <AllocationChart slices={data.allocationSlices} size={200} />
          <View style={reportStyles.allocationFooterRule} />
          <View style={reportStyles.allocationFooter}>
            <Text
              style={reportStyles.referencePageNumber}
              render={({ pageNumber: printed }) => `${printed} | ${REPORT_DOCUMENT_TITLE}`}
            />
            <Image src={JA_REPORT_LOGO_DARK} style={reportStyles.footerLogo} />
          </View>
        </View>
      </Page>

      <ReportPageShell
        {...shellProps}
        pageNumber={++pageNumber}
        pageTitle="Recent Transactions"
      >
        <TransactionsTable
          rows={data.transactions}
          emptyMessage="No transactions recorded for this statement period."
        />
        {data.transactionsNote ? (
          <Text style={reportStyles.footnote}>{data.transactionsNote}</Text>
        ) : null}
      </ReportPageShell>

      <ReportPageShell
        {...shellProps}
        pageNumber={++pageNumber}
        pageTitle="Performance"
      >
        <SubsectionTitle>Portfolio value over time</SubsectionTitle>
        <View style={reportStyles.chartBoxLandscape}>
          <ValueChart points={data.historyPoints} />
        </View>
      </ReportPageShell>

      <ReportPageShell
        {...shellProps}
        pageNumber={++pageNumber}
        pageTitle="Performance"
      >
        <SubsectionTitle>Period performance</SubsectionTitle>
        <PeriodPerformanceTable data={data} />
      </ReportPageShell>

      <ReportPageShell
        {...shellProps}
        pageNumber={++pageNumber}
        pageTitle="Performance"
      >
        <SubsectionTitle>Cumulative performance since inception</SubsectionTitle>
        <InceptionPerformanceTable data={data} />
      </ReportPageShell>

      <BackCoverPage logoSrc={logoSrc} />
    </Document>
  );
}
