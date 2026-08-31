import { Webhook } from "standardwebhooks";

import { sendOtpEmail } from "@/lib/email/resend";

type SendEmailHookPayload = {
  user: { email: string };
  email_data: {
    token: string;
    email_action_type: string;
  };
};

export async function POST(request: Request) {
  const secret = process.env.SUPABASE_AUTH_HOOK_SECRET;
  if (!secret) {
    return Response.json(
      { error: "SUPABASE_AUTH_HOOK_SECRET is not configured" },
      { status: 500 },
    );
  }

  const payload = await request.text();
  const headers = Object.fromEntries(request.headers.entries());
  const base64Secret = secret.replace(/^v1,whsec_/, "");

  try {
    const wh = new Webhook(base64Secret);
    const { user, email_data } = wh.verify(payload, headers) as SendEmailHookPayload;

    await sendOtpEmail({
      to: user.email,
      token: email_data.token,
    });

    return new Response(JSON.stringify({}), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Hook failed";
    return Response.json({ error: message }, { status: 401 });
  }
}
