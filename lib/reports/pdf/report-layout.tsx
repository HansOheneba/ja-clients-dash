import React from "react";
import { Image, Page, Text, View } from "@react-pdf/renderer";

import type { InvestmentReportData } from "@/lib/reports/types";
import { BACK_COVER_PATTERN, JA_REPORT_LOGO } from "@/lib/reports/pdf/report-assets";
import {
  FIRM_ADDRESS,
  REPORT_COVER_TITLE,
  REPORT_DOCUMENT_TITLE,
  fonts,
  reportStyles,
} from "@/lib/reports/pdf/report-theme";

export function ReferenceFooter({
  clientName,
  reference,
  clientNumber,
  pageNumber,
}: {
  clientName: string;
  reference: string;
  clientNumber: string;
  pageNumber: number;
}) {
  return (
    <View style={reportStyles.referenceFooter} fixed>
      <View style={reportStyles.referenceFooterMeta}>
        <Text style={reportStyles.referenceFooterLine}>Client: {clientName}</Text>
        <Text style={reportStyles.referenceFooterLine}>Our Ref: {reference}</Text>
        <Text style={reportStyles.referenceFooterLine}>Client Number: {clientNumber}</Text>
      </View>
      <Text style={reportStyles.referencePageNumber}>
        {pageNumber} | {REPORT_DOCUMENT_TITLE}
      </Text>
    </View>
  );
}

export function ReportPageShell({
  clientName,
  clientNumber,
  reference,
  pageNumber,
  pageTitle,
  children,
}: {
  clientName: string;
  clientNumber: string;
  reference: string;
  pageNumber: number;
  pageTitle?: string;
  children: React.ReactNode;
}) {
  return (
    <Page size="A4" orientation="landscape" style={reportStyles.pageLandscape}>
      {pageTitle ? <Text style={reportStyles.pageTitleLandscape}>{pageTitle}</Text> : null}
      <View>{children}</View>
      <ReferenceFooter
        clientName={clientName}
        reference={reference}
        clientNumber={clientNumber}
        pageNumber={pageNumber}
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
    <Page size="A4" orientation="landscape" style={reportStyles.coverPage}>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "flex-start",
          paddingHorizontal: 48,
        }}
      >
        <Image src={logoSrc} style={reportStyles.coverLogo} />
        <View style={reportStyles.coverRule} />
        <Text style={reportStyles.coverClientName}>{data.clientName}</Text>
        <Text style={reportStyles.coverTitle}>{REPORT_COVER_TITLE}</Text>
        <Text style={reportStyles.coverDate}>{data.currentStatementLabel}</Text>
      </View>
      <View style={reportStyles.referenceFooter}>
        <Text style={{ fontSize: 6.5, color: "rgba(255,255,255,0.5)", fontFamily: fonts.body }}>
          JA Wealth
        </Text>
        <Text style={{ fontSize: 6.5, color: "rgba(255,255,255,0.5)", fontFamily: fonts.body }}>
          1 | {REPORT_DOCUMENT_TITLE}
        </Text>
      </View>
    </Page>
  );
}

export function BackCoverPage({
  logoSrc,
  patternSrc = BACK_COVER_PATTERN,
}: {
  logoSrc: string;
  patternSrc?: string;
}) {
  return (
    <Page size="A4" orientation="landscape" style={reportStyles.backCoverPage}>
      <View style={reportStyles.backCoverPattern} fixed>
        <Image src={patternSrc} style={reportStyles.backCoverPatternImage} />
      </View>
      <View style={reportStyles.backCoverContent}>
        <View style={reportStyles.backCoverCenter}>
          <Image src={logoSrc} style={reportStyles.backCoverLogo} />
          <Text style={reportStyles.backCoverTagline}>Prosper With Purpose</Text>
          <View style={reportStyles.backCoverRule} />
        </View>
        <View style={reportStyles.backCoverFooter}>
          <Text style={reportStyles.backCoverFooterText}>JA Wealth</Text>
          <Text style={reportStyles.backCoverFooterText}>{FIRM_ADDRESS}</Text>
          <Text style={reportStyles.backCoverFooterText}>hello@jagroup.co | jagroup.co</Text>
        </View>
      </View>
    </Page>
  );
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

export function ReportFootnote({ children }: { children: React.ReactNode }) {
  return <Text style={reportStyles.footnote}>+ {children}</Text>;
}
