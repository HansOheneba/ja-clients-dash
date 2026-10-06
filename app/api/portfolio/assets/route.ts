import { NextResponse } from "next/server";

import { valueHoldings } from "@/lib/market/value-holdings";
import { canAccessClient, getApiSession } from "@/lib/wealth/session";
import { getClientById, getCurrentPortfolioHoldings } from "@/lib/wealth/queries";

export async function GET(request: Request) {
  try {
    const session = await getApiSession();
    if (!session.ok) return session.response;

    const requestedId = new URL(request.url).searchParams.get("clientId");
    const clientId =
      session.profile.role === "client"
        ? session.profile.client_id
        : requestedId ?? session.profile.client_id;

    if (!clientId) {
      return NextResponse.json({ error: "No client selected" }, { status: 400 });
    }

    const client = await getClientById(clientId);
    if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (!canAccessClient(session.profile, client.id, client.advisor_id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const holdings = await getCurrentPortfolioHoldings(clientId);
    const assets = await valueHoldings(holdings);
    return NextResponse.json({ assets });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load assets";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
