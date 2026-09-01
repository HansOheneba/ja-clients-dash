import React from "react";
import { Image, Page, Text, View } from "@react-pdf/renderer";

import type { InvestmentReportData } from "@/lib/reports/types";
import { JA_REPORT_LOGO } from "@/lib/reports/pdf/report-assets";
import { colors, fonts, reportStyles } from "@/lib/reports/pdf/report-theme";

export function RunningHeader({ clientName }: { clientName: string }) {
  return (
    <View style={reportStyles.runningHeader} fixed>
      <Text style={reportStyles.runningHeaderText}>
        JA Wealth | Wealth Report | {clientName} | Confidential
      </Text>
    </View>
  );
}

export function RunningFooter({
  clientNumber,
  pageNumber,
  totalPages,
}: {
  clientNumber: string;
  pageNumber: number;
  totalPages: number;
}) {
  return (
    <View style={reportStyles.runningFooter} fixed>
      <Text style={reportStyles.footerText}>
        JA Wealth{"\n"}
        hello@jagroup.co | jagroup.co
      </Text>
      <Text style={reportStyles.footerCenter}>Confidential</Text>
      <Text style={reportStyles.footerText}>
        {clientNumber} · Page {pageNumber} of {totalPages}
      </Text>
    </View>
  );
}

export function ReportPageShell({
  clientName,
  clientNumber,
  pageNumber,
  totalPages,
  children,
}: {
  clientName: string;
  clientNumber: string;
  pageNumber: number;
  totalPages: number;
  children: React.ReactNode;
}) {
  return (
    <Page size="A4" style={reportStyles.page}>
      <RunningHeader clientName={clientName} />
      <View>{children}</View>
      <RunningFooter
        clientNumber={clientNumber}
        pageNumber={pageNumber}
        totalPages={totalPages}
      />
    </Page>
  );
}

export function CoverPage({
  data,
  logoSrc,
}: {
  data: InvestmentReportData;
  logoSrc: string;
}) {
  return (
    <Page size="A4" style={reportStyles.coverPage}>
      <View style={{ paddingTop: 36, paddingHorizontal: 40 }}>
        <Text
          style={{
            fontFamily: fonts.body,
            fontSize: 10,
            color: colors.gold,
            letterSpacing: 1.4,
            textTransform: "uppercase",
          }}
        >
          Prosper With Purpose
        </Text>
      </View>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "flex-start",
          paddingTop: 48,
          paddingHorizontal: 40,
        }}
      >
        <Image src={logoSrc} style={reportStyles.coverLogo} />
        <View style={reportStyles.coverRule} />
        <Text style={reportStyles.coverTitle}>Wealth Report</Text>
        <Text style={reportStyles.coverSubtitle}>{data.clientName}</Text>
        {data.reportKindTitle ? (
          <Text style={reportStyles.coverSubtitle}>{data.reportKindTitle}</Text>
        ) : null}
        <Text style={reportStyles.coverSubtitle}>{data.statementPeriodLabel}</Text>
        <Text style={reportStyles.coverMeta}>Prepared on {data.preparedOn}</Text>
        <Text style={reportStyles.coverMeta}>Reference {data.reference}</Text>
      </View>
      <View style={reportStyles.runningFooter}>
        <Text style={{ fontSize: 6.5, color: "rgba(255,255,255,0.5)", fontFamily: fonts.body }}>
          JA Wealth
        </Text>
        <Text style={{ fontSize: 6.5, color: "rgba(255,255,255,0.5)", fontFamily: fonts.body }}>
          Confidential
        </Text>
        <Text style={{ fontSize: 6.5, color: "rgba(255,255,255,0.5)", fontFamily: fonts.body }}>
          {data.clientNumber} · Page 1 of {data.totalPages}
        </Text>
      </View>
    </Page>
  );
}

export function SectionTitle({ children }: { children: string }) {
  return <Text style={reportStyles.level2}>{children}</Text>;
}

export function SubsectionTitle({ children }: { children: string }) {
  return <Text style={reportStyles.level3}>{children}</Text>;
}

export function KpiBand({
  items,
}: {
  items: { label: string; value: string }[];
}) {
  return (
    <View style={reportStyles.kpiBand}>
      {items.map((item) => (
        <View key={item.label} style={reportStyles.kpiCell}>
          <Text style={reportStyles.kpiLabel}>{item.label}</Text>
          <Text style={reportStyles.kpiValue}>{item.value}</Text>
        </View>
      ))}
    </View>
  );
}

export function BulletList({ items }: { items: string[] }) {
  return (
    <View>
      {items.map((item) => (
        <View key={item} style={reportStyles.bulletRow}>
          <View style={reportStyles.bulletDot} />
          <Text style={reportStyles.bodyText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}
