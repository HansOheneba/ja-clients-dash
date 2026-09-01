import { Button } from "react-email";

import {
  EmailBodyText,
  EmailFooterNote,
  EmailHeading,
  EmailShell,
  emailButtonStyle,
} from "@/lib/email/shell";

export type AdvisorInviteEmailProps = {
  firstName: string;
  loginUrl: string;
  isAdmin?: boolean;
};

export function AdvisorInviteEmail({
  firstName,
  loginUrl,
  isAdmin,
}: AdvisorInviteEmailProps) {
  const roleLabel = isAdmin ? "admin" : "wealth manager";

  return (
    <EmailShell
      preview="Your JA Wealth wealth manager portal is ready."
      footer={
        <EmailFooterNote contactLine="After signing in with a one-time code, you will add your contact details, introduction, and when clients can book sessions with you." />
      }
    >
      <EmailHeading>Welcome, {firstName}</EmailHeading>
      <EmailBodyText>
        You have been invited as a JA Wealth {roleLabel}. Sign in to complete
        your profile, share your availability for client sessions, and access
        your client book.
      </EmailBodyText>
      <Button href={loginUrl} style={emailButtonStyle}>
        Complete your onboarding
      </Button>
    </EmailShell>
  );
}

AdvisorInviteEmail.PreviewProps = {
  firstName: "Alex",
  loginUrl: "https://example.com/login",
  isAdmin: false,
} satisfies AdvisorInviteEmailProps;

export default AdvisorInviteEmail;
