import { NextResponse } from "next/server";

import { getClientById } from "@/lib/wealth/queries";
import {
  insertClientAdvisorNote,
  listClientAdvisorNotes,
} from "@/lib/wealth/wm-queries";
import { canMessageClient, getAdvisorApiSession } from "@/lib/wealth/session";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdvisorApiSession();
  if (!session.ok) return session.response;

  const { id } = await params;
  const client = await getClientById(id);
  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!canMessageClient(session.profile, client.advisor_id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const notes = await listClientAdvisorNotes(id);
  return NextResponse.json({ notes });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdvisorApiSession();
  if (!session.ok) return session.response;

  const { id } = await params;
  const client = await getClientById(id);
  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!canMessageClient(session.profile, client.advisor_id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const text = String(body.body ?? "").trim();
  if (!text) {
    return NextResponse.json({ error: "Note body is required" }, { status: 400 });
  }

  const attachmentIds = Array.isArray(body.attachmentIds)
    ? body.attachmentIds.map(String)
    : [];

  const note = await insertClientAdvisorNote({
    clientId: id,
    authorUserId: session.userId,
    authorAdvisorId: session.profile.advisor_id,
    body: text,
    attachmentIds,
  });

  return NextResponse.json({ note });
}
