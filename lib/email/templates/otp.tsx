import { Section, Text } from "react-email";

import {
  EmailBodyText,
  EmailFooterNote,
  EmailHeading,
  EmailShell,
  emailColors,
} from "@/lib/email/shell";

export type OtpEmailProps = {
  token: string;
};

export function OtpEmail({ token }: OtpEmailProps) {
  return (
    <EmailShell
      preview="Your JA Wealth sign-in code. It expires in 10 minutes."
      footer={
        <EmailFooterNote contactLine="If you did not request this code, you can ignore this email." />
      }
    >
      <EmailHeading>Your sign-in code</EmailHeading>
      <EmailBodyText>
        Use this one-time code to sign in to your portal. It expires in 10
        minutes.
      </EmailBodyText>
      <Section
        style={{
          backgroundColor: emailColors.cream,
          padding: "16px 12px",
          margin: "0 0 18px",
          textAlign: "center",
        }}
      >
        <Text
          style={{
            fontSize: "32px",
            fontWeight: 600,
            letterSpacing: "0.3em",
            color: emailColors.navy,
            margin: 0,
          }}
        >
          {token}
        </Text>
      </Section>
    </EmailShell>
  );
}

OtpEmail.PreviewProps = {
  token: "482193",
} satisfies OtpEmailProps;

export default OtpEmail;
