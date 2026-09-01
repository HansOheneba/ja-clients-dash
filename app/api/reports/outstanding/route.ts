import { NextResponse } from "next/server";

import { getClientById } from "@/lib/wealth/queries";
import { canAccessClient, getAdvisorApiSession } from "@/lib/wealth/session";
import { listOutstandingReports } from "@/lib/wealth/wm-queries";

export async function GET(request: Request) {
  const session = await getAdvisorApiSession();
  if (!session.ok) return session.response;

  const clientId = new URL(request.url).searchParams.get("clientId");
  if (clientId) {
    const client = await getClientById(clientId);
    if (!client) return NextResponse.json({ items: [] });
    if (!canAccessClient(session.profile, client.id, client.advisor_id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const advisorId = clientId ? null : session.profile.advisor_id;
  const items = await listOutstandingReports(advisorId, clientId);
  return NextResponse.json({ items });
}
