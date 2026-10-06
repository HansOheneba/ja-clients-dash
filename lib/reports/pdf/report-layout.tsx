import React from "react";
import { Image, Page, Text, View } from "@react-pdf/renderer";

import type { InvestmentReportData } from "@/lib/reports/types";
import {
  BACK_COVER_PATTERN,
  COVER_SKYLINE,
  JA_REPORT_LOGO_DARK,
} from "@/lib/reports/pdf/report-assets";
import {
  FIRM_ADDRESS,
  REPORT_COVER_TITLE,
  REPORT_DOCUMENT_TITLE,
  reportStyles,
} from "@/lib/reports/pdf/report-theme";

export function ReferenceFooter({
  logoSrc = JA_REPORT_LOGO_DARK,
}: {
  pageNumber?: number;
  logoSrc?: string;
}) {
  return (
    <View style={reportStyles.referenceFooter} fixed>
      <Text
        style={reportStyles.referencePageNumber}
        render={({ pageNumber: printed }) => `${printed} | ${REPORT_DOCUMENT_TITLE}`}
      />
      <Image src={logoSrc} style={reportStyles.footerLogo} />
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
      <View style={reportStyles.pageHeaderRow} fixed>
        <View style={reportStyles.pageHeaderMeta}>
          <Text style={reportStyles.pageHeaderLine}>
            <Text style={reportStyles.pageHeaderLabel}>Client: </Text>
            {clientName}
          </Text>
          <Text style={reportStyles.pageHeaderLine}>
            <Text style={reportStyles.pageHeaderLabel}>Our Ref: </Text>
            {reference}
          </Text>
          <Text style={reportStyles.pageHeaderLine}>
            <Text style={reportStyles.pageHeaderLabel}>Client Number: </Text>
            {clientNumber}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          {pageTitle ? <Text style={reportStyles.pageTitleLandscape}>{pageTitle}</Text> : null}
          <View style={reportStyles.titleRule} />
        </View>
      </View>
      <View>{children}</View>
      <View style={reportStyles.footerRule} fixed />
      <ReferenceFooter pageNumber={pageNumber} />
    </Page>
  );
}

export function CoverPage({
  data,
  logoSrc,
  photoSrc = COVER_SKYLINE,
}: {
  data: InvestmentReportData;
  logoSrc: string;
  photoSrc?: string;
}) {
  return (
    <Page size="A4" orientation="landscape" style={reportStyles.coverPage}>
      <Image src={photoSrc} style={reportStyles.coverPhoto} />
      <View style={reportStyles.coverPanel}>
        <Text style={reportStyles.coverClientName}>{data.clientName}</Text>
        <Text style={reportStyles.coverTitle}>{REPORT_COVER_TITLE}</Text>
        <Text style={reportStyles.coverDate}>{data.currentStatementLabel}</Text>
        <Image src={logoSrc} style={reportStyles.coverLogo} />
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
