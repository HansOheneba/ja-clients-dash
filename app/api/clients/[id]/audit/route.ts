import { NextResponse } from "next/server";

import { listAuditLogForClient } from "@/lib/wealth/wm-queries";
import { getClientById } from "@/lib/wealth/queries";
import { canAccessClient, getAdvisorApiSession } from "@/lib/wealth/session";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdvisorApiSession();
  if (!session.ok) return session.response;

  const { id } = await params;
  const client = await getClientById(id);
  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!canAccessClient(session.profile, client.id, client.advisor_id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const entries = await listAuditLogForClient(id);
  return NextResponse.json({ entries });
}
