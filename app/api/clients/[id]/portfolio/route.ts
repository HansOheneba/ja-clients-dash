import { NextResponse } from "next/server";

import { notifyClient } from "@/lib/wealth/client-service";
import {
  getClientById,
  getLatestPeriodForClient,
  getPortfolioSnapshots,
  getStatementPeriod,
  upsertHistoryPoint,
  upsertSnapshots,
} from "@/lib/wealth/queries";
import { insertAuditLog, syncGoalsFromPortfolio } from "@/lib/wealth/wm-queries";
import { ALL_BUCKETS } from "@/lib/wealth/constants";
import { canAccessClient, getAdvisorApiSession, getApiSession } from "@/lib/wealth/session";
import type { PortfolioBucket } from "@/lib/wealth/types";

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
  const period = periodId
    ? await getStatementPeriod(periodId)
    : await getLatestPeriodForClient(id);
  if (!period) return NextResponse.json({ snapshots: [], period: null });

  const snapshots = await getPortfolioSnapshots(id, period.id);
  return NextResponse.json({ period, snapshots });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdvisorApiSession();
  if (!session.ok) return session.response;

  const { id } = await params;
  const client = await getClientById(id);
  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const periodId = body.periodId as string | undefined;
  const period = periodId
    ? await getStatementPeriod(periodId)
    : await getLatestPeriodForClient(id);
  if (!period) {
    return NextResponse.json({ error: "No statement period" }, { status: 400 });
  }

  const previousSnapshots = await getPortfolioSnapshots(id, period.id);
  const previousByBucket = Object.fromEntries(
    previousSnapshots.map((s) => [s.bucket, s.current_value_usd]),
  ) as Partial<Record<PortfolioBucket, number>>;

  const incoming = (body.snapshots ?? []) as Array<{
    bucket: PortfolioBucket;
    previous_value_usd: number;
    current_value_usd: number;
    period_change_pct: number | null;
    ytd_pct: number | null;
    inception_gain_usd: number | null;
    inception_pct: number | null;
    annualized_return_pct: number | null;
  }>;

  const byBucket = new Map(incoming.map((s) => [s.bucket, s]));
  const rows = ALL_BUCKETS.map((bucket) => {
    const s = byBucket.get(bucket);
    const previous = Number(s?.previous_value_usd ?? 0);
    const current = Number(s?.current_value_usd ?? 0);
    const changePct =
      s?.period_change_pct != null
        ? Number(s.period_change_pct)
        : bucket === "coa" || previous === 0
          ? null
          : ((current - previous) / previous) * 100;
    return {
      bucket,
      previous_value_usd: previous,
      current_value_usd: current,
      period_change_pct: changePct,
      ytd_pct: s?.ytd_pct != null ? Number(s.ytd_pct) : changePct,
      inception_gain_usd:
        s?.inception_gain_usd != null ? Number(s.inception_gain_usd) : current - previous,
      inception_pct: s?.inception_pct != null ? Number(s.inception_pct) : changePct,
      annualized_return_pct:
        s?.annualized_return_pct != null ? Number(s.annualized_return_pct) : changePct,
    };
  });

  await upsertSnapshots(id, period.id, rows);
  const total = rows.reduce((sum, r) => sum + r.current_value_usd, 0);
  await upsertHistoryPoint(id, period.period_end, total);

  const bucketValues = Object.fromEntries(
    rows.map((r) => [r.bucket, r.current_value_usd]),
  ) as Partial<Record<PortfolioBucket, number>>;
  await syncGoalsFromPortfolio(id, bucketValues);

  const auditNote = body.auditNote ? String(body.auditNote) : null;
  if (auditNote || body.quickUpdate) {
    await insertAuditLog({
      actorId: session.userId,
      action: "portfolio_update",
      targetType: "client",
      targetId: id,
      beforeValue: { buckets: previousByBucket },
      afterValue: { buckets: bucketValues },
      note: auditNote,
    });
  }

  await notifyClient({
    clientId: id,
    kind: "portfolio",
    title: "Portfolio updated",
    body: `Your advisor updated portfolio values for ${period.label}.`,
    createdBy: session.userId,
    email: Boolean(body.notifyClient),
  });

  return NextResponse.json({ ok: true, period, snapshots: rows, total });
}
