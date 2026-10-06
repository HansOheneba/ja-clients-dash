import { NextResponse } from "next/server";

import { FinnhubError, getMarketQuote, publicMarketError } from "@/lib/market/finnhub";
import { getAdvisorApiSession } from "@/lib/wealth/session";

const SYMBOL_PATTERN = /^[A-Za-z0-9.:-]+$/;

export async function GET(request: Request) {
  const session = await getAdvisorApiSession();
  if (!session.ok) return session.response;

  const symbol = new URL(request.url).searchParams.get("symbol")?.trim() ?? "";
  if (!symbol || symbol.length > 32 || !SYMBOL_PATTERN.test(symbol)) {
    return NextResponse.json({ error: "Enter a ticker symbol such as AAPL" }, { status: 400 });
  }

  try {
    const quote = await getMarketQuote(symbol);
    return NextResponse.json(quote);
  } catch (error) {
    const status = error instanceof FinnhubError && error.status === 404 ? 404 : 502;
    return NextResponse.json({ error: publicMarketError(error) }, { status });
  }
}
