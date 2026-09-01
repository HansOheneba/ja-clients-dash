import { Button, Text } from "react-email";

import {
  EmailBodyText,
  EmailFooterNote,
  EmailHeading,
  EmailShell,
  emailButtonStyle,
  emailColors,
} from "@/lib/email/shell";

export type PortalInviteEmailProps = {
  firstName: string;
  clientNumber: string;
  loginUrl: string;
};

export function PortalInviteEmail({
  firstName,
  clientNumber,
  loginUrl,
}: PortalInviteEmailProps) {
  return (
    <EmailShell
      preview="Your JA Wealth client portal is ready. Sign in to view your portfolio and reports."
      footer={
        <EmailFooterNote
          contactLine="We will email you a one-time sign-in code. If you did not expect this invitation, you can ignore this message."
          clientNumber={clientNumber}
        />
      }
    >
      <EmailHeading>Welcome, {firstName}</EmailHeading>
      <EmailBodyText>
        Your JA Wealth client portal is ready. Sign in with this email address
        to view your portfolio and download wealth reports.
      </EmailBodyText>
      <Text
        style={{
          fontSize: "13px",
          color: emailColors.muted,
          margin: "0 0 18px",
        }}
      >
        Client number: {clientNumber}
      </Text>
      <Button href={loginUrl} style={emailButtonStyle}>
        Sign in to your portal
      </Button>
    </EmailShell>
  );
}

PortalInviteEmail.PreviewProps = {
  firstName: "John",
  clientNumber: "CN000",
  loginUrl: "https://example.com/login",
} satisfies PortalInviteEmailProps;

export default PortalInviteEmail;
