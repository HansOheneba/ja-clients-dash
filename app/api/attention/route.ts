import { NextResponse } from "next/server";

import { getAttentionFeed } from "@/lib/wealth/wm-queries";
import { getAdvisorApiSession } from "@/lib/wealth/session";

export async function GET() {
  const session = await getAdvisorApiSession();
  if (!session.ok) return session.response;

  const advisorId = session.profile.advisor_id;
  const items = await getAttentionFeed(advisorId);
  return NextResponse.json({ items });
}
