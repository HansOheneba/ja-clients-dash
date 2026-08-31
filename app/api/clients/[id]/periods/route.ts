import { NextResponse } from "next/server";

import { ALL_BUCKETS } from "@/lib/wealth/constants";
import { calendarMonthBounds } from "@/lib/wealth/period-calendar";
import {
  getClientById,
  getPeriodEndingBefore,
  getPortfolioSnapshots,
  insertStatementPeriod,
  upsertSnapshots,
} from "@/lib/wealth/queries";
import { getAdvisorApiSession } from "@/lib/wealth/session";

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
  const year = Number(body.year);
  const month = Number(body.month);

  let periodStart: string;
  let periodEnd: string;
  let label: string;

  if (Number.isInteger(year) && Number.isInteger(month) && month >= 1 && month <= 12) {
    const bounds = calendarMonthBounds(year, month - 1);
    periodStart = bounds.start;
    periodEnd = bounds.end;
    label = bounds.label;
  } else if (body.periodStart && body.periodEnd && body.label) {
    periodStart = String(body.periodStart);
    periodEnd = String(body.periodEnd);
    label = String(body.label);
  } else {
    return NextResponse.json({ error: "Choose a calendar month" }, { status: 400 });
  }

  const previous = await getPeriodEndingBefore(id, periodStart);

  const period = await insertStatementPeriod({
    clientId: id,
    periodStart,
    periodEnd,
    label,
  });

  const existingSnaps = await getPortfolioSnapshots(id, period.id);
  if (existingSnaps.length === 0) {
    const priorSnaps = previous ? await getPortfolioSnapshots(id, previous.id) : [];
    const priorMap = new Map(priorSnaps.map((s) => [s.bucket, s.current_value_usd]));

    await upsertSnapshots(
      id,
      period.id,
      ALL_BUCKETS.map((bucket) => {
        const current = Number(priorMap.get(bucket) ?? 0);
        return {
          bucket,
          previous_value_usd: current,
          current_value_usd: current,
          period_change_pct: bucket === "coa" ? null : 0,
          ytd_pct: bucket === "coa" ? null : 0,
          inception_gain_usd: 0,
          inception_pct: 0,
          annualized_return_pct: 0,
        };
      }),
    );
  }

  return NextResponse.json({ period });
}
