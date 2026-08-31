import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;

function resolveFromEmail() {
  const raw = process.env.RESEND_FROM_EMAIL?.trim();
  if (!raw || !raw.includes("@")) {
    return "JA Wealth <noreply@no-reply.celerey.co>";
  }
  if (raw.includes("<")) return raw;
  return `JA Wealth <${raw}>`;
}

export const resendFromEmail = resolveFromEmail();

export function getResendClient() {
  if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY");
  }
  return new Resend(apiKey);
}

function wrapEmail(inner: string) {
  return `
    <div style="font-family: Georgia, serif; max-width: 520px; margin: 0 auto; color: #1a1a1a;">
      <p style="color: #b2936b; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase;">JA Wealth</p>
      ${inner}
    </div>
  `;
}

type OtpEmailParams = {
  to: string;
  token: string;
};

export async function sendOtpEmail({ to, token }: OtpEmailParams) {
  const resend = getResendClient();

  const { error } = await resend.emails.send({
    from: resendFromEmail,
    to,
    subject: "Your JA Wealth sign-in code",
    html: `
      <div style="font-family: Georgia, serif; max-width: 520px; margin: 0 auto; color: #1a1a1a;">
        <p style="color: #b2936b; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase;">JA Wealth</p>
        <h1 style="font-size: 24px; color: #202356; margin-bottom: 8px;">Your sign-in code</h1>
        <p style="font-size: 15px; line-height: 1.6; color: #444;">
          Use this one-time code to sign in to your client portal. It expires in 10 minutes.
        </p>
        <p style="font-size: 32px; font-weight: bold; letter-spacing: 0.3em; color: #202356; margin: 24px 0;">
          ${token}
        </p>
        <p style="font-size: 13px; line-height: 1.5; color: #666;">
          If you did not request this code, you can ignore this email.
        </p>
      </div>
    `,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function sendPortalInviteEmail(params: {
  to: string;
  clientName: string;
  clientNumber: string;
  loginUrl: string;
}) {
  const resend = getResendClient();
  const { error } = await resend.emails.send({
    from: resendFromEmail,
    to: params.to,
    subject: "Your JA Wealth client portal is ready",
    html: wrapEmail(`
      <h1 style="font-size: 24px; color: #202356; margin-bottom: 8px;">Welcome, ${params.clientName}</h1>
      <p style="font-size: 15px; line-height: 1.6; color: #444;">
        Your JA Wealth client portal is ready. Sign in with this email address to view your portfolio and download investment reports.
      </p>
      <p style="font-size: 14px; color: #555;">Client number: <strong>${params.clientNumber}</strong></p>
      <p style="margin: 24px 0;">
        <a href="${params.loginUrl}" style="background: #202356; color: #fff; padding: 12px 20px; text-decoration: none; border-radius: 6px; font-size: 14px;">
          Sign in to your portal
        </a>
      </p>
      <p style="font-size: 13px; line-height: 1.5; color: #666;">
        We will email you a one-time sign-in code. If you did not expect this invitation, you can ignore this message.
      </p>
    `),
  });
  if (error) throw new Error(error.message);
}

export async function sendAdvisorPortalInviteEmail(params: {
  to: string;
  advisorName: string;
  loginUrl: string;
  isAdmin?: boolean;
}) {
  const resend = getResendClient();
  const roleLabel = params.isAdmin ? "admin" : "wealth manager";
  const { error } = await resend.emails.send({
    from: resendFromEmail,
    to: params.to,
    subject: "Your JA Wealth wealth manager portal is ready",
    html: wrapEmail(`
      <h1 style="font-size: 24px; color: #202356; margin-bottom: 8px;">Welcome, ${params.advisorName}</h1>
      <p style="font-size: 15px; line-height: 1.6; color: #444;">
        You have been invited as a JA Wealth ${roleLabel}. Sign in to complete your profile, share your availability for client sessions, and access your client book.
      </p>
      <p style="margin: 24px 0;">
        <a href="${params.loginUrl}" style="background: #202356; color: #fff; padding: 12px 20px; text-decoration: none; border-radius: 6px; font-size: 14px;">
          Complete your onboarding
        </a>
      </p>
      <p style="font-size: 13px; line-height: 1.5; color: #666;">
        After signing in with a one-time code, you will add your contact details, introduction, and when clients can book sessions with you.
      </p>
    `),
  });
  if (error) throw new Error(error.message);
}

export async function sendClientUpdateEmail(params: {
  to: string;
  clientName: string;
  title: string;
  body: string;
  loginUrl: string;
}) {
  const resend = getResendClient();
  const { error } = await resend.emails.send({
    from: resendFromEmail,
    to: params.to,
    subject: params.title,
    html: wrapEmail(`
      <h1 style="font-size: 22px; color: #202356; margin-bottom: 8px;">${params.title}</h1>
      <p style="font-size: 15px; line-height: 1.6; color: #444;">Hello ${params.clientName},</p>
      <p style="font-size: 15px; line-height: 1.6; color: #444;">${params.body}</p>
      <p style="margin: 24px 0;">
        <a href="${params.loginUrl}" style="background: #202356; color: #fff; padding: 12px 20px; text-decoration: none; border-radius: 6px; font-size: 14px;">
          Open your portal
        </a>
      </p>
    `),
  });
  if (error) throw new Error(error.message);
}
