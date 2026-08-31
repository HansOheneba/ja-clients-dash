import { NextResponse } from "next/server";

import { getUpdatesForClient, markUpdatesRead } from "@/lib/wealth/queries";
import { getApiSession } from "@/lib/wealth/session";

export async function GET() {
  const session = await getApiSession();
  if (!session.ok) return session.response;
  if (session.profile.role !== "client" || !session.profile.client_id) {
    return NextResponse.json({ updates: [] });
  }
  const updates = await getUpdatesForClient(session.profile.client_id);
  return NextResponse.json({ updates });
}

export async function POST() {
  const session = await getApiSession();
  if (!session.ok) return session.response;
  if (session.profile.role === "client" && session.profile.client_id) {
    await markUpdatesRead(session.profile.client_id);
  }
  return NextResponse.json({ ok: true });
}
