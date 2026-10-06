import { getMarketHistory, getMarketQuote, publicMarketError } from "@/lib/market/finnhub";
import { BUCKET_LABELS } from "@/lib/wealth/constants";
import type { PortfolioHolding } from "@/lib/wealth/types";

export type TrackedAssetHistoryPoint = {
  month: string;
  value: number;
};

export type TrackedAsset = {
  id: string;
  bucket: PortfolioHolding["bucket"];
  bucketLabel: string;
  name: string;
  ticker: string;
  quantity: number | null;
  costBasisUsd: number;
  marketValueUsd: number;
  live: boolean;
  priceUsd: number | null;
  quotedCurrency: string | null;
  dayChangePct: number | null;
  rangeChangePct: number | null;
  history: TrackedAssetHistoryPoint[];
  priceError: string | null;
};

type PricedSymbol = {
  priceUsd: number;
  quotedPrice: number;
  quotedCurrency: string;
  name: string | null;
  changePercent: number | null;
  closesUsd: number[];
  dates: string[];
};

function monthLabel(isoDate: string): string {
  return new Date(`${isoDate}T12:00:00Z`).toLocaleDateString("en-GB", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function roundUsd(value: number): number {
  return Math.round(value * 100) / 100;
}

async function priceSymbol(symbol: string): Promise<PricedSymbol> {
  const quote = await getMarketQuote(symbol);
  const rate = quote.quotedPrice > 0 ? quote.priceUsd / quote.quotedPrice : 1;
  const history = await getMarketHistory(symbol).catch((error) => {
    if (publicMarketError(error).includes("API key")) throw error;
    return [];
  });

  return {
    priceUsd: quote.priceUsd,
    quotedPrice: quote.quotedPrice,
    quotedCurrency: quote.quotedCurrency,
    name: quote.name,
    changePercent: quote.changePercent,
    closesUsd: history.map((point) => point.close * rate),
    dates: history.map((point) => point.date),
  };
}

async function mapPool<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;

  async function worker() {
    while (next < items.length) {
      const index = next;
      next += 1;
      results[index] = await fn(items[index]);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
  return results;
}

export async function valueHoldings(holdings: PortfolioHolding[]): Promise<TrackedAsset[]> {
  const symbols = [
    ...new Set(
      holdings
        .filter((row) => row.quantity != null && row.quantity > 0 && row.ticker.trim())
        .map((row) => row.ticker.trim().toUpperCase()),
    ),
  ];

  const priced = new Map<string, PricedSymbol | { error: string }>();
  if (symbols.length > 0) {
    const rows = await mapPool(symbols, 4, async (symbol) => {
      try {
        return [symbol, await priceSymbol(symbol)] as const;
      } catch (error) {
        return [symbol, { error: publicMarketError(error) }] as const;
      }
    });
    for (const [symbol, value] of rows) priced.set(symbol, value);
  }

  const today = new Date().toISOString().slice(0, 10);

  return holdings.map((row) => {
    const quantity = row.quantity != null && row.quantity > 0 ? row.quantity : null;
    const symbol = row.ticker.trim().toUpperCase();
    const base = {
      id: row.id,
      bucket: row.bucket,
      bucketLabel: BUCKET_LABELS[row.bucket],
      name: row.investment_name,
      ticker: row.ticker,
      quantity: row.quantity,
      costBasisUsd: row.original_value_usd,
      marketValueUsd: row.market_value_usd,
      live: false,
      priceUsd: null as number | null,
      quotedCurrency: null as string | null,
      dayChangePct: null as number | null,
      rangeChangePct: null as number | null,
      history: [] as TrackedAssetHistoryPoint[],
      priceError: null as string | null,
    };

    if (!quantity) return base;

    const quote = priced.get(symbol);
    if (!quote) return { ...base, priceError: "Could not load market data for this symbol." };
    if ("error" in quote) return { ...base, priceError: quote.error };

    const marketValueUsd = roundUsd(quantity * quote.priceUsd);
    const history: TrackedAssetHistoryPoint[] = quote.dates.map((date, index) => ({
      month: monthLabel(date),
      value: roundUsd(quantity * quote.closesUsd[index]),
    }));

    const todayLabel = monthLabel(today);
    if (history.length > 0 && history[history.length - 1].month === todayLabel) {
      history[history.length - 1] = { month: todayLabel, value: marketValueUsd };
    } else if (history.length > 0) {
      history.push({ month: todayLabel, value: marketValueUsd });
    }

    const first = history[0]?.value ?? 0;
    const last = history[history.length - 1]?.value ?? 0;
    const rangeChangePct =
      history.length >= 2 && first > 0 ? ((last - first) / first) * 100 : null;

    return {
      ...base,
      name: row.investment_name.trim() || quote.name || row.investment_name,
      quantity,
      marketValueUsd,
      live: true,
      priceUsd: quote.priceUsd,
      quotedCurrency: quote.quotedCurrency,
      dayChangePct: quote.changePercent,
      rangeChangePct,
      history,
      priceError: null,
    };
  });
}
