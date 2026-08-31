import { NextResponse } from "next/server";

import { getClientById, insertClientUpdate, insertSessionRequest } from "@/lib/wealth/queries";
import { getApiSession } from "@/lib/wealth/session";

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
