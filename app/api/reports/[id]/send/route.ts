import { NextResponse } from "next/server";

import { queryDb } from "@/lib/supabase/db";
import { getAdvisorApiSession } from "@/lib/wealth/session";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdvisorApiSession();
  if (!session.ok) return session.response;

  const { id } = await params;
  const rows = await queryDb<{ id: string; sent_at: string }>(
    `UPDATE wealth.reports SET sent_at = now()
     WHERE id = $1
     RETURNING id, sent_at::text`,
    [id],
  );

  if (!rows[0]) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, sentAt: rows[0].sent_at });
}
