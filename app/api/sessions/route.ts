import { NextResponse } from "next/server";

import {
  insertSession,
  listSessionRequests,
  listSessions,
  updateSessionRecap,
} from "@/lib/wealth/wm-queries";
import { getClientById } from "@/lib/wealth/queries";
import { getAdvisorApiSession } from "@/lib/wealth/session";

export async function GET(request: Request) {
  const session = await getAdvisorApiSession();
  if (!session.ok) return session.response;

  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("clientId");

  const sessions = await listSessions(session.profile.advisor_id, clientId);
  const requests = await listSessionRequests(session.profile.advisor_id, clientId);
  return NextResponse.json({ sessions, requests });
}

export async function POST(request: Request) {
  const session = await getAdvisorApiSession();
  if (!session.ok) return session.response;

  const body = await request.json().catch(() => ({}));
  const clientId = String(body.clientId ?? "");
  const client = await getClientById(clientId);
  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

  const advisorId = client.advisor_id ?? session.profile.advisor_id;
  if (!advisorId) {
    return NextResponse.json({ error: "No advisor assigned" }, { status: 400 });
  }

  const row = await insertSession({
    clientId,
    advisorId,
    sessionRequestId: body.sessionRequestId ?? null,
    title: String(body.title ?? "Advisory session"),
    scheduledAt: String(body.scheduledAt),
    format: String(body.format ?? "video"),
  });

  return NextResponse.json({ session: row });
}

export async function PATCH(request: Request) {
  const session = await getAdvisorApiSession();
  if (!session.ok) return session.response;

  const body = await request.json().catch(() => ({}));
  const sessionId = String(body.sessionId ?? "");
  if (!sessionId) {
    return NextResponse.json({ error: "sessionId required" }, { status: 400 });
  }

  const updated = await updateSessionRecap(sessionId, {
    topics: Array.isArray(body.topics) ? body.topics.map(String) : [],
    decisions: Array.isArray(body.decisions) ? body.decisions.map(String) : [],
    actionItems: Array.isArray(body.actionItems) ? body.actionItems.map(String) : [],
    nextSteps: Array.isArray(body.nextSteps) ? body.nextSteps.map(String) : [],
  });

  return NextResponse.json({ session: updated });
}
