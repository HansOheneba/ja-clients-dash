import { NextResponse } from "next/server";

import { bulkTagReviewDue } from "@/lib/wealth/wm-queries";
import { getAdvisorApiSession } from "@/lib/wealth/session";

export async function POST(request: Request) {
  const session = await getAdvisorApiSession();
  if (!session.ok) return session.response;

  const body = await request.json().catch(() => ({}));
  const clientIds = Array.isArray(body.clientIds) ? (body.clientIds as string[]) : [];
  if (clientIds.length === 0) {
    return NextResponse.json({ error: "No clients selected" }, { status: 400 });
  }

  const count = await bulkTagReviewDue(clientIds);
  return NextResponse.json({ ok: true, count });
}
