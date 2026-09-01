import { Button, Column, Link, Row, Section, Text } from "react-email";

import {
  EmailBodyText,
  EmailFooterNote,
  EmailHeading,
  EmailShell,
  emailButtonStyle,
  emailColors,
} from "@/lib/email/shell";

export type ReportReadyEmailProps = {
  firstName: string;
  periodLabel: string;
  kindTitle: string;
  asOfLabel: string;
  reportUrl: string;
  portalUrl: string;
  advisorEmail: string | null;
  advisorName: string | null;
  clientNumber: string;
};

function HighlightCard({
  label,
  value,
  background,
  labelColor,
}: {
  label: string;
  value: string;
  background: string;
  labelColor: string;
}) {
  return (
    <Section
      style={{
        backgroundColor: background,
        padding: "12px",
      }}
    >
      <Text
        style={{
          fontSize: "11px",
          color: labelColor,
          margin: "0 0 3px",
          letterSpacing: "0.04em",
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontSize: "17px",
          fontWeight: 500,
          margin: 0,
          color: emailColors.ink,
        }}
      >
        {value}
      </Text>
    </Section>
  );
}

export function ReportReadyEmail({
  firstName,
  periodLabel,
  kindTitle,
  asOfLabel,
  reportUrl,
  portalUrl,
  advisorEmail,
  advisorName,
  clientNumber,
}: ReportReadyEmailProps) {
  const contactName = advisorName ?? "your wealth manager";
  const contactLine = advisorEmail ? (
    <>
      Questions about this report? Reach {contactName} directly at{" "}
      <Link href={`mailto:${advisorEmail}`} style={{ color: emailColors.navy }}>
        {advisorEmail}
      </Link>
      .
    </>
  ) : (
    <>
      Questions about this report? Message {contactName} from your JA Wealth
      portal.
    </>
  );

  return (
    <EmailShell
      preview={`Your ${periodLabel} report is ready in the JA Wealth portal. Open it to review the full statement.`}
      footer={
        <EmailFooterNote contactLine={contactLine} clientNumber={clientNumber} />
      }
    >
      <EmailHeading>Your {periodLabel} report is ready</EmailHeading>
      <EmailBodyText>
        Hello {firstName}, here's your {kindTitle.toLowerCase()} as of {asOfLabel}.
      </EmailBodyText>

      <Row style={{ marginBottom: "16px" }}>
        <Column style={{ width: "50%", paddingRight: "5px", verticalAlign: "top" }}>
          <HighlightCard
            label="PERIOD"
            value={periodLabel}
            background={emailColors.cream}
            labelColor={emailColors.creamLabel}
          />
        </Column>
        <Column style={{ width: "50%", paddingLeft: "5px", verticalAlign: "top" }}>
          <HighlightCard
            label="STATUS"
            value="Ready to view"
            background={emailColors.sage}
            labelColor={emailColors.sageLabel}
          />
        </Column>
      </Row>

      <EmailBodyText
        style={{ color: "#333333", margin: "0 0 18px" }}
      >
        Open your portal for the full breakdown, performance, and transaction
        history.
      </EmailBodyText>

      <Button href={reportUrl} style={emailButtonStyle}>
        View your report
      </Button>
      <Text style={{ fontSize: "12px", margin: "8px 0 0" }}>
        <Link href={portalUrl} style={{ color: emailColors.muted }}>
          Or view it in your JA Wealth portal
        </Link>
      </Text>
    </EmailShell>
  );
}

ReportReadyEmail.PreviewProps = {
  firstName: "John",
  periodLabel: "Q2 2026",
  kindTitle: "Quarterly statement",
  asOfLabel: "30 June",
  reportUrl: "https://example.com/clients/dashboard/documents",
  portalUrl: "https://example.com/clients/dashboard",
  advisorEmail: "hello@jagroup.co",
  advisorName: "your wealth manager",
  clientNumber: "CN000",
} satisfies ReportReadyEmailProps;

export default ReportReadyEmail;
