import { NextResponse } from "next/server";

import { formatSessionDateTime } from "@/lib/sessions/datetime";
import {
  getClientById,
  insertClientUpdate,
} from "@/lib/wealth/queries";
import {
  getSessionRequestById,
  insertSession,
  insertSessionProposal,
  listSessionRequests,
  updateSessionRequest,
  updateSessionSchedule,
} from "@/lib/wealth/wm-queries";
import type { SessionParty } from "@/lib/wealth/wm-types";
import { getAdvisorApiSession, getApiSession, getClientApiSession } from "@/lib/wealth/session";

async function finalizeConfirmedSession(request: Awaited<ReturnType<typeof getSessionRequestById>>) {
  if (!request?.proposed_at) return null;

  if (request.session_id) {
    return updateSessionSchedule(request.session_id, {
      scheduledAt: request.proposed_at,
      status: "confirmed",
      title: request.topic,
      format: request.format,
    });
  }

  return insertSession({
    clientId: request.client_id,
    advisorId: request.advisor_id,
    sessionRequestId: request.id,
    title: request.topic,
    scheduledAt: request.proposed_at,
    format: request.format,
    status: "confirmed",
  });
}

async function notifyClient(
  clientId: string,
  title: string,
  body: string,
  createdBy: string,
) {
  await insertClientUpdate({ clientId, kind: "general", title, body, createdBy });
}

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

  const body = await request.json().catch(() => ({}));
  const topic = String(body.topic ?? "").trim();
  const proposedAt = String(body.proposedAt ?? "");
  const format = String(body.format ?? "video");

  if (!topic || !proposedAt) {
    return NextResponse.json({ error: "Topic and date/time are required" }, { status: 400 });
  }

  let clientId: string | null = null;
  let proposedBy: SessionParty;

  if (session.profile.role === "client" && session.profile.client_id) {
    clientId = session.profile.client_id;
    proposedBy = "client";
  } else if (session.profile.role === "advisor" || session.profile.role === "admin") {
    clientId = String(body.clientId ?? "");
    proposedBy = "advisor";
  } else {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!clientId) {
    return NextResponse.json({ error: "clientId required" }, { status: 400 });
  }

  const client = await getClientById(clientId);
  if (!client?.advisor_id) {
    return NextResponse.json({ error: "No wealth manager assigned" }, { status: 400 });
  }

  const requestRow = await insertSessionProposal({
    clientId: client.id,
    advisorId: client.advisor_id,
    topic,
    proposedAt,
    proposedBy,
    format,
    preferredTimesLabel: formatSessionDateTime(proposedAt),
  });

  const actorLabel = proposedBy === "client" ? "Your client" : "Your wealth manager";
  await notifyClient(
    client.id,
    proposedBy === "client" ? "Session request sent" : "Session suggested",
    proposedBy === "client"
      ? `You requested a session: ${topic} on ${formatSessionDateTime(proposedAt)}.`
      : `${actorLabel} suggested a session: ${topic} on ${formatSessionDateTime(proposedAt)}. Please confirm or suggest another time.`,
    session.userId,
  );

  return NextResponse.json({ request: requestRow });
}

export async function PATCH(request: Request) {
  const session = await getApiSession();
  if (!session.ok) return session.response;

  const body = await request.json().catch(() => ({}));
  const id = String(body.id ?? "");
  const action = String(body.action ?? "");

  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const existing = await getSessionRequestById(id);
  if (!existing) {
    return NextResponse.json({ error: "Request not found" }, { status: 404 });
  }

  const party: SessionParty | null =
    session.profile.role === "client" && session.profile.client_id === existing.client_id
      ? "client"
      : session.profile.role === "advisor" || session.profile.role === "admin"
        ? "advisor"
        : null;

  if (!party) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (action === "agree") {
    const now = new Date().toISOString();
    const updated = await updateSessionRequest(id, {
      ...(party === "client" ? { clientAgreedAt: now } : { advisorAgreedAt: now }),
      status: "pending",
    });
    if (!updated) {
      return NextResponse.json({ error: "Could not update request" }, { status: 500 });
    }

    const bothAgreed = Boolean(updated.client_agreed_at && updated.advisor_agreed_at);
    if (!bothAgreed) {
      await notifyClient(
        existing.client_id,
        "Session confirmation pending",
        party === "client"
          ? `You agreed to ${existing.topic}. Waiting for your wealth manager to confirm.`
          : `Your wealth manager agreed to ${existing.topic}. Please confirm the time.`,
        session.userId,
      );
      return NextResponse.json({ request: updated });
    }

    const wmSession = await finalizeConfirmedSession(updated);
    const accepted = await updateSessionRequest(id, {
      status: "accepted",
      sessionId: wmSession?.id,
    });

    await notifyClient(
      existing.client_id,
      "Session confirmed",
      `Your session "${existing.topic}" is confirmed for ${formatSessionDateTime(updated.proposed_at!)}.`,
      session.userId,
    );

    return NextResponse.json({ request: accepted, session: wmSession });
  }

  if (action === "propose") {
    const proposedAt = String(body.proposedAt ?? "");
    if (!proposedAt) {
      return NextResponse.json({ error: "proposedAt required" }, { status: 400 });
    }

    const now = new Date().toISOString();
    const updated = await updateSessionRequest(id, {
      proposedAt,
      proposedBy: party,
      preferredTimesLabel: formatSessionDateTime(proposedAt),
      clientAgreedAt: party === "client" ? now : null,
      advisorAgreedAt: party === "advisor" ? now : null,
      status: "rescheduled",
      format: body.format ? String(body.format) : undefined,
    });

    if (existing.session_id) {
      await updateSessionSchedule(existing.session_id, {
        scheduledAt: proposedAt,
        status: "requested",
      });
    }

    await notifyClient(
      existing.client_id,
      "Session time updated",
      `${party === "client" ? "Your client" : "Your wealth manager"} proposed a new time for ${existing.topic}: ${formatSessionDateTime(proposedAt)}.`,
      session.userId,
    );

    return NextResponse.json({ request: updated });
  }

  if (action === "decline") {
    if (party !== "advisor") {
      return NextResponse.json({ error: "Only advisors can decline requests" }, { status: 403 });
    }

    const updated = await updateSessionRequest(id, {
      status: "declined",
      responseNote: body.note ? String(body.note) : undefined,
    });

    await notifyClient(
      existing.client_id,
      "Session request declined",
      `Your wealth manager could not take the session request for ${existing.topic}.`,
      session.userId,
    );

    return NextResponse.json({ request: updated });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
