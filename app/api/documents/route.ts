import { NextResponse } from "next/server";

import {
  insertDocumentRequest,
  listDocumentRequests,
  listExpiringDocuments,
} from "@/lib/wealth/wm-queries";
import { getAdvisorApiSession } from "@/lib/wealth/session";

export async function GET(request: Request) {
  const session = await getAdvisorApiSession();
  if (!session.ok) return session.response;

  const { searchParams } = new URL(request.url);
  const view = searchParams.get("view");

  if (view === "expiring") {
    const documents = await listExpiringDocuments(session.profile.advisor_id);
    return NextResponse.json({ documents });
  }

  const requests = await listDocumentRequests(session.profile.advisor_id);
  return NextResponse.json({ requests });
}

export async function POST(request: Request) {
  const session = await getAdvisorApiSession();
  if (!session.ok) return session.response;

  const body = await request.json().catch(() => ({}));
  const clientId = String(body.clientId ?? "");
  const title = String(body.title ?? "").trim();
  if (!clientId || !title) {
    return NextResponse.json({ error: "clientId and title required" }, { status: 400 });
  }

  const advisorId = session.profile.advisor_id;
  if (!advisorId) {
    return NextResponse.json({ error: "Advisor profile required" }, { status: 400 });
  }

  const row = await insertDocumentRequest({
    clientId,
    advisorId,
    title,
    description: String(body.description ?? ""),
    dueDate: body.dueDate ? String(body.dueDate) : null,
  });

  return NextResponse.json({ request: row });
}
