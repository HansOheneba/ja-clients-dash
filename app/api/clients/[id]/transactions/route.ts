import { NextResponse } from "next/server";

import { notifyClient } from "@/lib/wealth/client-service";
import {
  getClientById,
  getStatementPeriod,
  getTransactionsPage,
  insertTransaction,
} from "@/lib/wealth/queries";
import { canAccessClient, getAdvisorApiSession, getApiSession } from "@/lib/wealth/session";
import type { PortfolioBucket, TransactionType } from "@/lib/wealth/types";

export async function GET(
  request: Request,
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

  const { searchParams } = new URL(request.url);
  const periodId = searchParams.get("periodId");
  const page = Number(searchParams.get("page") ?? "1");
  const limit = Number(searchParams.get("limit") ?? "10");

  let periodStart: string | undefined;
  let periodEnd: string | undefined;
  if (periodId) {
    const period = await getStatementPeriod(periodId);
    if (!period) {
      return NextResponse.json({ error: "Statement period not found" }, { status: 404 });
    }
    periodStart = period.period_start;
    periodEnd = period.period_end;
  }

  const result = await getTransactionsPage(id, {
    periodStart,
    periodEnd,
    page,
    pageSize: limit,
  });
  return NextResponse.json(result);
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

  const body = await request.json().catch(() => ({}));
  if (!body.occurredOn || body.amountUsd == null || !body.description) {
    return NextResponse.json({ error: "Date, amount, and description are required" }, { status: 400 });
  }

  const transaction = await insertTransaction({
    clientId: id,
    bucket: (body.bucket as PortfolioBucket | null) ?? null,
    occurredOn: String(body.occurredOn),
    amountUsd: Number(body.amountUsd),
    description: String(body.description),
    transactionType: (body.transactionType as TransactionType) ?? "other",
  });

  await notifyClient({
    clientId: id,
    kind: "transaction",
    title: "New transaction recorded",
    body: `${transaction.description} (${transaction.amount_usd.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })}).`,
    createdBy: session.userId,
    email: Boolean(body.notifyClient),
  });

  return NextResponse.json({ transaction });
}
