import { NextResponse } from "next/server";

import {
  getClientById,
  getLatestPeriodForClient,
  getStatementPeriod,
  replacePortfolioHoldings,
} from "@/lib/wealth/queries";
import { canAccessClient, getAdvisorApiSession } from "@/lib/wealth/session";
import { HOLDINGS_BUCKETS } from "@/lib/wealth/constants";
import type { PortfolioBucket } from "@/lib/wealth/types";

const HOLDINGS_BUCKET_SET = new Set<PortfolioBucket>(HOLDINGS_BUCKETS);

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdvisorApiSession();
  if (!session.ok) return session.response;

  const { id } = await params;
  const client = await getClientById(id);
  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!canAccessClient(session.profile, client.id, client.advisor_id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const periodId =
    (body.periodId as string | undefined) ?? (await getLatestPeriodForClient(id))?.id;
  if (!periodId) {
    return NextResponse.json({ error: "No statement period" }, { status: 400 });
  }

  const period = await getStatementPeriod(periodId);
  if (!period || period.client_id !== id) {
    return NextResponse.json({ error: "Statement period not found" }, { status: 404 });
  }

  const incoming = (body.holdings ?? []) as Array<{
    bucket: PortfolioBucket;
    investment_name: string;
    ticker: string;
    original_value_usd: number;
    market_value_usd: number;
  }>;

  const rows = [];
  for (const row of incoming) {
    if (!HOLDINGS_BUCKET_SET.has(row.bucket)) {
      return NextResponse.json({ error: `Invalid bucket: ${row.bucket}` }, { status: 400 });
    }
    const name = String(row.investment_name ?? "").trim();
    const ticker = String(row.ticker ?? "").trim();
    if (!name || !ticker) {
      return NextResponse.json(
        { error: "Each holding needs an investment name and ticker" },
        { status: 400 },
      );
    }
    const original = Number(row.original_value_usd);
    const market = Number(row.market_value_usd);
    if (!Number.isFinite(original) || !Number.isFinite(market) || original < 0 || market < 0) {
      return NextResponse.json({ error: "Holdings values must be valid USD amounts" }, { status: 400 });
    }
    rows.push({
      bucket: row.bucket,
      investment_name: name,
      ticker,
      original_value_usd: original,
      market_value_usd: market,
    });
  }

  const holdings = await replacePortfolioHoldings(id, periodId, rows);
  return NextResponse.json({ ok: true, periodId, holdings });
}
