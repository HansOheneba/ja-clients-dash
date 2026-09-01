import { NextResponse } from "next/server";

import { createWealthClient } from "@/lib/wealth/client-service";
import { listClientsWithPortfolio } from "@/lib/wealth/queries";
import { getAdvisorApiSession } from "@/lib/wealth/session";
import type { PortfolioBucket, ReviewCadence } from "@/lib/wealth/types";

export async function GET() {
  const session = await getAdvisorApiSession();
  if (!session.ok) return session.response;

  const clients = await listClientsWithPortfolio(null);
  return NextResponse.json({ clients });
}

export async function POST(request: Request) {
  const session = await getAdvisorApiSession();
  if (!session.ok) return session.response;

  const body = await request.json().catch(() => null);
  if (!body?.fullName || !body?.email) {
    return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
  }

  const address = body.address ?? {};
  if (!String(address.line1 ?? "").trim() || !String(address.city ?? "").trim()) {
    return NextResponse.json(
      { error: "Statement address line and city are required for the investment report" },
      { status: 400 },
    );
  }

  try {
    const result = await createWealthClient({
      fullName: String(body.fullName),
      email: String(body.email),
      phone: body.phone ? String(body.phone) : undefined,
      currency: body.currency ? String(body.currency) : "USD",
      inceptionDate: body.inceptionDate ? String(body.inceptionDate) : undefined,
      status: body.status ?? "onboarding",
      riskProfile: body.riskProfile,
      investmentHorizon: body.investmentHorizon,
      primaryObjective: body.primaryObjective,
      advisorNotes: body.advisorNotes,
      dateOfBirth: body.dateOfBirth ? String(body.dateOfBirth) : undefined,
      maritalStatus: body.maritalStatus ? String(body.maritalStatus) : undefined,
      dependents:
        body.dependents === undefined || body.dependents === ""
          ? undefined
          : Number(body.dependents),
      estateStatus: body.estateStatus ? String(body.estateStatus) : undefined,
      financialGoals: body.financialGoals ? String(body.financialGoals) : undefined,
      address: body.address,
      buckets: body.buckets as Partial<
        Record<PortfolioBucket, { previous: number; current: number }>
      >,
      sendInvite: body.sendInvite !== false,
      createdBy: session.userId,
      advisorId: body.advisorId
          ? String(body.advisorId)
          : session.profile.advisor_id,
      reviewCadence: body.reviewCadence
        ? (String(body.reviewCadence) as ReviewCadence)
        : undefined,
    });

    return NextResponse.json({
      client: result.client,
      periodId: result.period.id,
      inviteError: result.inviteError,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not create client";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
