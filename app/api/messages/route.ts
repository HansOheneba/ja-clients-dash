import { NextResponse } from "next/server";

import {
  getOrCreateThread,
  insertMessage,
  listMessageThreads,
  listMessages,
  markThreadReadByAdvisor,
  markThreadReadByClient,
} from "@/lib/wealth/wm-queries";
import { getClientById } from "@/lib/wealth/queries";
import { canParticipateInMessageThread, getApiSession } from "@/lib/wealth/session";

export async function GET(request: Request) {
  const session = await getApiSession();
  if (!session.ok) return session.response;

  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get("clientId");

  if (clientId) {
    const client = await getClientById(clientId);
    if (!client?.advisor_id) {
      return NextResponse.json({ error: "No advisor" }, { status: 400 });
    }
    if (!canParticipateInMessageThread(session.profile, clientId, client.advisor_id)) {
      return NextResponse.json(
        { error: "This client is assigned to another wealth manager" },
        { status: 403 },
      );
    }
    const thread = await getOrCreateThread(clientId, client.advisor_id);
    const messages = await listMessages(thread.id);
    if (session.profile.role === "advisor") {
      await markThreadReadByAdvisor(thread.id);
    } else if (session.profile.role === "client") {
      await markThreadReadByClient(thread.id);
    }
    return NextResponse.json({ thread, messages });
  }

  if (session.profile.role !== "advisor" && session.profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const threads = await listMessageThreads(session.profile.advisor_id);
  return NextResponse.json({ threads });
}

export async function POST(request: Request) {
  const session = await getApiSession();
  if (!session.ok) return session.response;

  const body = await request.json().catch(() => ({}));
  const clientId = String(body.clientId ?? "");
  const text = String(body.body ?? "").trim();
  if (!clientId || !text) {
    return NextResponse.json({ error: "clientId and body required" }, { status: 400 });
  }

  const client = await getClientById(clientId);
  if (!client?.advisor_id) {
    return NextResponse.json({ error: "No advisor assigned" }, { status: 400 });
  }
  if (!canParticipateInMessageThread(session.profile, clientId, client.advisor_id)) {
    return NextResponse.json(
      { error: "This client is assigned to another wealth manager" },
      { status: 403 },
    );
  }

  const thread = await getOrCreateThread(clientId, client.advisor_id);
  const senderRole =
    session.profile.role === "client" ? "client" : "advisor";

  const message = await insertMessage({
    threadId: thread.id,
    senderRole,
    senderId: session.userId,
    body: text,
    attachmentType: body.attachmentType ? String(body.attachmentType) : null,
    attachmentId: body.attachmentId ? String(body.attachmentId) : null,
  });

  return NextResponse.json({ message, threadId: thread.id });
}
