import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Section,
  Text,
} from "react-email";
import type { CSSProperties, ReactNode } from "react";

import { emailLogoUrl } from "@/lib/email/assets";

export const emailColors = {
  navy: "#0a1f3d",
  gold: "#c9a227",
  page: "#eef0f4",
  white: "#ffffff",
  ink: "#111111",
  muted: "#666666",
  faint: "#888888",
  hairline: "#e6e2d8",
  cream: "#f7f4ea",
  creamLabel: "#8a6d1a",
  sage: "#f0f5ec",
  sageLabel: "#3b6d11",
};

export const emailFont =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif';

export const emailButtonStyle: CSSProperties = {
  backgroundColor: emailColors.navy,
  color: emailColors.white,
  fontSize: "14px",
  padding: "11px 22px",
  borderRadius: "0",
  textDecoration: "none",
};

function EmailPreheader({ text }: { text: string }) {
  return (
    <div
      style={{
        fontSize: "1px",
        lineHeight: "1px",
        color: emailColors.page,
        maxHeight: 0,
        maxWidth: 0,
        opacity: 0,
        overflow: "hidden",
      }}
    >
      {text}
    </div>
  );
}

export function EmailShell({
  preview,
  children,
  footer,
}: {
  preview: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <Html lang="en">
      <Head>
        <title>{preview}</title>
      </Head>
      <Body
        style={{
          backgroundColor: emailColors.page,
          fontFamily: emailFont,
          margin: 0,
          padding: "28px 12px",
        }}
      >
        <EmailPreheader text={preview} />
        <Container
          style={{
            maxWidth: "460px",
            margin: "0 auto",
          }}
        >
          <Section
            style={{
              backgroundColor: emailColors.navy,
              padding: "20px 24px",
            }}
          >
            <Img
              src={emailLogoUrl()}
              alt="JA Wealth"
              width="150"
              height="26"
              style={{ display: "block", border: "none", outline: "none" }}
            />
          </Section>
          <Section
            style={{
              backgroundColor: emailColors.white,
              padding: "24px",
            }}
          >
            {children}
            {footer}
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export function EmailHeading({ children }: { children: ReactNode }) {
  return (
    <Text
      style={{
        fontSize: "17px",
        fontWeight: 500,
        margin: "0 0 4px",
        color: emailColors.ink,
      }}
    >
      {children}
    </Text>
  );
}

export function EmailBodyText({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <Text
      style={{
        fontSize: "13px",
        color: emailColors.muted,
        lineHeight: "1.5",
        margin: "0 0 18px",
        ...style,
      }}
    >
      {children}
    </Text>
  );
}

export function EmailFooterNote({
  contactLine,
  clientNumber,
}: {
  contactLine: ReactNode;
  clientNumber?: string;
}) {
  return (
    <>
      <Hr
        style={{
          border: "none",
          borderTop: `1px solid ${emailColors.hairline}`,
          margin: "22px 0 16px",
        }}
      />
      <Text
        style={{
          fontSize: "12px",
          color: emailColors.faint,
          margin: "0 0 4px",
          lineHeight: "1.5",
        }}
      >
        {contactLine}
      </Text>
      <Text
        style={{
          fontSize: "11px",
          color: "#aaaaaa",
          margin: "12px 0 0",
          lineHeight: "1.5",
        }}
      >
        JA Wealth will never ask for your password by email.
        {clientNumber
          ? ` This message was sent to the address on file for client ${clientNumber}.`
          : " If you did not expect this message, you can ignore it."}
      </Text>
    </>
  );
}
