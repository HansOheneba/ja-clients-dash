import { NextResponse } from "next/server";

import { getAdvisorById, bulkSetClientAdvisor } from "@/lib/wealth/queries";
import { getAdvisorApiSession } from "@/lib/wealth/session";

export async function POST(request: Request) {
  const session = await getAdvisorApiSession();
  if (!session.ok) return session.response;

  const body = await request.json().catch(() => ({}));
  const clientIds = Array.isArray(body.clientIds) ? (body.clientIds as string[]) : [];
  const advisorId = body.advisorId ? String(body.advisorId) : null;

  if (clientIds.length === 0) {
    return NextResponse.json({ error: "No clients selected" }, { status: 400 });
  }

  if (advisorId) {
    const advisor = await getAdvisorById(advisorId);
    if (!advisor || !advisor.is_active) {
      return NextResponse.json({ error: "Choose an active wealth manager" }, { status: 400 });
    }
  }

  const count = await bulkSetClientAdvisor(clientIds, advisorId);
  return NextResponse.json({ ok: true, count });
}
