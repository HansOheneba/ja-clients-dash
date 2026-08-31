import { NextResponse } from "next/server";

import { parseGoalWrite } from "@/lib/wealth/goals";
import { getClientById, getClientGoals, insertClientGoal } from "@/lib/wealth/queries";
import { canAccessClient, getAdvisorApiSession, getApiSession } from "@/lib/wealth/session";
import { notifyClient } from "@/lib/wealth/client-service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getApiSession();
  if (!session.ok) return session.response;

  const { id } = await params;
  const client = await getClientById(id);
  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!canAccessClient(session.profile, client.id, client.advisor_id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const goals = await getClientGoals(id);
  return NextResponse.json({ goals });
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
  if (!canAccessClient(session.profile, client.id, client.advisor_id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const parsed = parseGoalWrite(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const goal = await insertClientGoal(id, parsed.value);
  await notifyClient({
    clientId: id,
    kind: "note",
    title: "Goal added",
    body: `${goal.name}: target ${goal.target_usd.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    })}.`,
    createdBy: session.userId,
  });

  return NextResponse.json({ goal });
}
