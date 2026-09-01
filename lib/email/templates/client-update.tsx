import { Button } from "react-email";

import {
  EmailBodyText,
  EmailFooterNote,
  EmailHeading,
  EmailShell,
  emailButtonStyle,
} from "@/lib/email/shell";

export type ClientUpdateEmailProps = {
  firstName: string;
  title: string;
  body: string;
  loginUrl: string;
};

export function ClientUpdateEmail({
  firstName,
  title,
  body,
  loginUrl,
}: ClientUpdateEmailProps) {
  return (
    <EmailShell
      preview={title}
      footer={
        <EmailFooterNote contactLine="Sign in to your portal to read the full update." />
      }
    >
      <EmailHeading>{title}</EmailHeading>
      <EmailBodyText>Hello {firstName},</EmailBodyText>
      <EmailBodyText style={{ color: "#333333" }}>{body}</EmailBodyText>
      <Button href={loginUrl} style={emailButtonStyle}>
        Open your portal
      </Button>
    </EmailShell>
  );
}

ClientUpdateEmail.PreviewProps = {
  firstName: "John",
  title: "A note from your wealth manager",
  body: "Please review the latest documents in your portal when you have a moment.",
  loginUrl: "https://example.com/clients/dashboard",
} satisfies ClientUpdateEmailProps;

export default ClientUpdateEmail;
