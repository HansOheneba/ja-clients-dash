import { NextResponse } from "next/server";

import { getJaPortfolioForClient } from "@/lib/api/domain/wealth-portfolio";
import {
  getAdvisorById,
  getClientAddress,
  getClientById,
  getClientGoals,
  getPortfolioSnapshots,
  getStatementPeriodsForClient,
  getTransactionsForClient,
  getUpdatesForClient,
  setClientAdvisor,
  updateClientFields,
  upsertClientAddress,
} from "@/lib/wealth/queries";
import { canAccessClient, getApiSession, getAdvisorApiSession } from "@/lib/wealth/session";

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

  const [address, periods, portfolio, transactions, updates, goals] = await Promise.all([
    getClientAddress(id),
    getStatementPeriodsForClient(id),
    getJaPortfolioForClient(id),
    getTransactionsForClient(id),
    getUpdatesForClient(id),
    getClientGoals(id),
  ]);
  const latestPeriod = periods[0] ?? null;
  const snapshots = latestPeriod
    ? await getPortfolioSnapshots(id, latestPeriod.id)
    : [];

  const assignedAdvisor = client.advisor_id
    ? await getAdvisorById(client.advisor_id)
    : null;

  return NextResponse.json({
    client,
    assignedAdvisor,
    address,
    periods,
    portfolio,
    snapshots,
    transactions,
    updates,
    goals,
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdvisorApiSession();
  if (!session.ok) return session.response;

  const { id } = await params;
  const existing = await getClientById(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!canAccessClient(session.profile, existing.id, existing.advisor_id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));

  if (body.advisorId !== undefined) {
    const advisorId = body.advisorId ? String(body.advisorId) : null;
    if (advisorId) {
      const advisor = await getAdvisorById(advisorId);
      if (!advisor || !advisor.is_active) {
        return NextResponse.json(
          { error: "Choose an active advisor" },
          { status: 400 },
        );
      }
    }
    await setClientAdvisor(id, advisorId);
  }

  const client = await updateClientFields(id, {
    full_name: body.fullName,
    email: body.email,
    phone: body.phone,
    status: body.status,
    currency: body.currency,
    inception_date: body.inceptionDate,
    risk_profile: body.riskProfile,
    investment_horizon: body.investmentHorizon,
    primary_objective: body.primaryObjective,
    advisor_notes: body.advisorNotes,
    marital_status: body.maritalStatus,
    dependents: body.dependents,
    estate_status: body.estateStatus,
    financial_goals: body.financialGoals,
    date_of_birth: body.dateOfBirth,
  });

  if (body.address) {
    await upsertClientAddress(id, {
      line1: body.address.line1 ?? "",
      line2: body.address.line2 ?? null,
      city: body.address.city ?? "",
      region: body.address.region ?? null,
      postal_code: body.address.postal_code ?? null,
      country: body.address.country ?? "US",
    });
  }

  return NextResponse.json({ client });
}
