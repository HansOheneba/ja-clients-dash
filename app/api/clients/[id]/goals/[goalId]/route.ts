import { NextResponse } from "next/server";

import { parseGoalWrite } from "@/lib/wealth/goals";
import {
  deleteClientGoal,
  getClientById,
  getClientGoalById,
  updateClientGoal,
} from "@/lib/wealth/queries";
import { canAccessClient, getAdvisorApiSession } from "@/lib/wealth/session";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; goalId: string }> },
) {
  const session = await getAdvisorApiSession();
  if (!session.ok) return session.response;

  const { id, goalId } = await params;
  const client = await getClientById(id);
  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!canAccessClient(session.profile, client.id, client.advisor_id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const existing = await getClientGoalById(id, goalId);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const parsed = parseGoalWrite(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const goal = await updateClientGoal(id, goalId, parsed.value);
  return NextResponse.json({ goal });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; goalId: string }> },
) {
  const session = await getAdvisorApiSession();
  if (!session.ok) return session.response;

  const { id, goalId } = await params;
  const client = await getClientById(id);
  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!canAccessClient(session.profile, client.id, client.advisor_id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const deleted = await deleteClientGoal(id, goalId);
  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
