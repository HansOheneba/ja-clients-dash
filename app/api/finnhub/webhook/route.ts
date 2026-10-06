import { after, NextResponse } from "next/server";

import { finnhubWebhookAuthorized, ingestFinnhubWebhook } from "@/lib/market/finnhub-webhook";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!process.env.FINNHUB_WEBHOOK_SECRET?.trim()) {
    return NextResponse.json({ error: "Webhook secret is not configured" }, { status: 500 });
  }

  if (!finnhubWebhookAuthorized(request.headers.get("x-finnhub-secret"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const raw = await request.text();
  after(() => {
    ingestFinnhubWebhook(raw);
  });

  return NextResponse.json({ ok: true });
}
