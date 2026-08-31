import { NextResponse } from "next/server";

import { getJaClientProfile, getJaPortfolioForClient } from "@/lib/api/domain/wealth-portfolio";
import { canAccessClient, getApiSession } from "@/lib/wealth/session";
import { getClientById } from "@/lib/wealth/queries";

export async function GET(request: Request) {
  try {
    const session = await getApiSession();
    if (!session.ok) return session.response;

    const { searchParams } = new URL(request.url);
    const requestedId = searchParams.get("clientId");
    const clientId =
      session.profile.role === "client"
        ? session.profile.client_id
        : requestedId ?? session.profile.client_id;

    if (!clientId) {
      return NextResponse.json({ error: "No client selected" }, { status: 400 });
    }

    const client = await getClientById(clientId);
    if (!client) {
      return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });
    }
    if (!canAccessClient(session.profile, client.id, client.advisor_id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [portfolio, profile] = await Promise.all([
      getJaPortfolioForClient(clientId),
      getJaClientProfile(clientId),
    ]);

    if (!portfolio) {
      return NextResponse.json({ error: "Portfolio not found" }, { status: 404 });
    }

    return NextResponse.json({ portfolio, profile });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load portfolio";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
