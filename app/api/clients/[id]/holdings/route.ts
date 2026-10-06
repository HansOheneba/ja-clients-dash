import { NextResponse } from "next/server";

import { getMarketQuote, publicMarketError } from "@/lib/market/finnhub";
import {
  getClientById,
  getLatestPeriodForClient,
  getStatementPeriod,
  replacePortfolioHoldings,
  saveTrackedHolding,
} from "@/lib/wealth/queries";
import { canAccessClient, getAdvisorApiSession } from "@/lib/wealth/session";
import { HOLDINGS_BUCKETS } from "@/lib/wealth/constants";
import type { PortfolioBucket } from "@/lib/wealth/types";

function roundUsd(value: number): number {
  return Math.round(value * 100) / 100;
}

const HOLDINGS_BUCKET_SET = new Set<PortfolioBucket>(HOLDINGS_BUCKETS);
const SYMBOL_PATTERN = /^[A-Za-z0-9.:-]+$/;

export async function POST(
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
  const bucket = body.bucket as PortfolioBucket;
  const ticker = String(body.ticker ?? "").trim().toUpperCase();
  const quantity = Number(body.quantity);
  let name = String(body.investment_name ?? "").trim();

  if (!HOLDINGS_BUCKET_SET.has(bucket)) {
    return NextResponse.json({ error: "Choose a portfolio for this asset" }, { status: 400 });
  }
  if (!ticker || ticker.length > 32 || !SYMBOL_PATTERN.test(ticker)) {
    return NextResponse.json({ error: "Choose an asset from the trackable list" }, { status: 400 });
  }
  if (!Number.isFinite(quantity) || quantity <= 0) {
    return NextResponse.json({ error: "Enter how many shares or units the client holds" }, { status: 400 });
  }

  let market: number | null = null;
  let warning: string | null = null;
  try {
    const quote = await getMarketQuote(ticker);
    market = roundUsd(quantity * quote.priceUsd);
    if (!name) name = quote.name ?? ticker;
  } catch (error) {
    warning = publicMarketError(error);
    if (!name) name = ticker;
  }

  const saved = await saveTrackedHolding(id, {
    bucket,
    investment_name: name,
    ticker,
    quantity,
    market_value_usd: market,
  });

  return NextResponse.json({ ok: true, ...saved, warning });
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
    quantity: number | null;
    original_value_usd: number;
    market_value_usd: number;
  }>;

  const rows = [];
  const warnings: string[] = [];
  for (const row of incoming) {
    if (!HOLDINGS_BUCKET_SET.has(row.bucket)) {
      return NextResponse.json({ error: `Invalid bucket: ${row.bucket}` }, { status: 400 });
    }
    let name = String(row.investment_name ?? "").trim();
    const ticker = String(row.ticker ?? "").trim();
    if (!ticker) {
      return NextResponse.json({ error: "Each holding needs a ticker" }, { status: 400 });
    }

    let quantity: number | null = null;
    if (row.quantity != null) {
      quantity = Number(row.quantity);
      if (!Number.isFinite(quantity) || quantity < 0) {
        return NextResponse.json(
          { error: "Quantity must be a number of shares or units" },
          { status: 400 },
        );
      }
      if (quantity === 0) quantity = null;
    }

    const original = Number(row.original_value_usd);
    let market = Number(row.market_value_usd);
    if (!Number.isFinite(original) || original < 0 || !Number.isFinite(market) || market < 0) {
      return NextResponse.json({ error: "Holdings values must be valid USD amounts" }, { status: 400 });
    }

    if (quantity != null && quantity > 0) {
      try {
        const quote = await getMarketQuote(ticker);
        market = roundUsd(quantity * quote.priceUsd);
        if (!name && quote.name) name = quote.name;
      } catch (error) {
        warnings.push(`${ticker}: ${publicMarketError(error)}`);
      }
    }

    if (!name) name = ticker;

    rows.push({
      bucket: row.bucket,
      investment_name: name,
      ticker,
      quantity,
      original_value_usd: original,
      market_value_usd: market,
    });
  }

  const holdings = await replacePortfolioHoldings(id, periodId, rows);
  return NextResponse.json({ ok: true, periodId, holdings, warnings });
}
