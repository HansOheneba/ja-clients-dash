import { NextResponse } from "next/server";

import { getClientOverviewData } from "@/lib/wealth/client-overview";
import { getClientApiSession } from "@/lib/wealth/session";

export async function GET() {
  try {
    const session = await getClientApiSession();
    if (!session.ok) return session.response;

    const overview = await getClientOverviewData(session.profile.client_id);
    if (!overview) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json({ overview });
  } catch (error) {
    console.error("[client/overview]", error);
    return NextResponse.json({ error: "Could not load dashboard" }, { status: 500 });
  }
}
