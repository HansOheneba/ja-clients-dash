import { NextResponse } from "next/server";

import {
  getClientById,
  insertClientUpdate,
  insertSessionRequest,
} from "@/lib/wealth/queries";
import {
  insertSession,
  listSessionRequests,
  updateSessionRequest,
} from "@/lib/wealth/wm-queries";
import { getAdvisorApiSession, getApiSession, getClientApiSession } from "@/lib/wealth/session";

export async function GET(request: Request) {
  const clientSession = await getClientApiSession();
  if (clientSession.ok) {
    const requests = await listSessionRequests(null, clientSession.profile.client_id);
    return NextResponse.json({ requests });
  }

  const session = await getAdvisorApiSession();
  if (!session.ok) return session.response;

  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("clientId");
  const requests = await listSessionRequests(session.profile.advisor_id, clientId);
  return NextResponse.json({ requests });
}

export async function POST(request: Request) {
  const session = await getApiSession();
  if (!session.ok) return session.response;
  if (session.profile.role !== "client" || !session.profile.client_id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const topic = String(body.topic ?? "").trim();
  const preferredTimes = String(body.preferredTimes ?? "").trim();

  if (!topic || !preferredTimes) {
    return NextResponse.json(
      { error: "Topic and preferred times are required" },
      { status: 400 },
    );
  }

  const client = await getClientById(session.profile.client_id);
  if (!client?.advisor_id) {
    return NextResponse.json(
      { error: "No wealth manager assigned to your account yet" },
      { status: 400 },
    );
  }

  const row = await insertSessionRequest({
    clientId: client.id,
    advisorId: client.advisor_id,
    topic,
    preferredTimes,
  });

  await insertClientUpdate({
    clientId: client.id,
    kind: "general",
    title: "Session request sent",
    body: `You requested a session: ${topic}`,
    createdBy: session.userId,
  });

  return NextResponse.json({ id: row.id });
}

export async function PATCH(request: Request) {
  const session = await getAdvisorApiSession();
  if (!session.ok) return session.response;

  const body = await request.json().catch(() => ({}));
  const id = String(body.id ?? "");
  const action = String(body.action ?? "");

  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  if (action === "accept") {
    const scheduledAt = String(body.scheduledAt ?? "");
    if (!scheduledAt) {
      return NextResponse.json({ error: "scheduledAt required" }, { status: 400 });
    }
    const existing = (await listSessionRequests(session.profile.advisor_id)).find(
      (r) => r.id === id,
    );
    if (!existing) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }
    const client = await getClientById(existing.client_id);
    const advisorId = client?.advisor_id ?? session.profile.advisor_id;
    if (!advisorId) {
      return NextResponse.json({ error: "No advisor" }, { status: 400 });
    }
    const wmSession = await insertSession({
      clientId: existing.client_id,
      advisorId,
      sessionRequestId: id,
      title: existing.topic,
      scheduledAt,
    });
    const updated = await updateSessionRequest(id, {
      status: "accepted",
      sessionId: wmSession.id,
      responseNote: body.note ? String(body.note) : undefined,
    });

    await insertClientUpdate({
      clientId: existing.client_id,
      kind: "general",
      title: "Session confirmed",
      body: `Your wealth manager confirmed a session: ${existing.topic}. Scheduled for ${new Date(scheduledAt).toLocaleString("en-GB")}.`,
      createdBy: session.userId,
    });

    return NextResponse.json({ request: updated, session: wmSession });
  }

  if (action === "decline") {
    const updated = await updateSessionRequest(id, {
      status: "declined",
      responseNote: body.note ? String(body.note) : undefined,
    });
    return NextResponse.json({ request: updated });
  }

  if (action === "reschedule") {
    const existing = (await listSessionRequests(session.profile.advisor_id)).find(
      (r) => r.id === id,
    );
    const updated = await updateSessionRequest(id, {
      status: "rescheduled",
      proposedTimes: String(body.proposedTimes ?? ""),
      responseNote: body.note ? String(body.note) : undefined,
    });

    if (existing) {
      await insertClientUpdate({
        clientId: existing.client_id,
        kind: "general",
        title: "Session reschedule proposed",
        body: `Your wealth manager proposed new times for: ${existing.topic}.`,
        createdBy: session.userId,
      });
    }

    return NextResponse.json({ request: updated });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
