import { NextResponse } from "next/server";

import { inviteClientToPortal } from "@/lib/wealth/client-service";
import { getClientById } from "@/lib/wealth/queries";
import { canAccessClient, getAdvisorApiSession } from "@/lib/wealth/session";

export async function POST(
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

  try {
    const result = await inviteClientToPortal(id, session.userId);
    return NextResponse.json({ ok: true, authUserId: result.authUserId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invite failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
