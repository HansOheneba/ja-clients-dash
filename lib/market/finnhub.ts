const FINNHUB_BASE = "https://finnhub.io/api/v1";
const FRANKFURTER_RATES = "https://api.frankfurter.dev/v2/rates";

export class FinnhubError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "FinnhubError";
  }
}

type CacheEntry<T> = { expires: number; value: T };

const successCache = new Map<string, CacheEntry<unknown>>();
const fxCache = new Map<string, CacheEntry<number>>();
let authFailure: { message: string; until: number } | null = null;

export type MarketQuote = {
  symbol: string;
  name: string | null;
  priceUsd: number;
  quotedPrice: number;
  quotedCurrency: string;
  changePercent: number | null;
  asOf: string | null;
};

export type MarketHistoryPoint = {
  date: string;
  close: number;
};

function normalizeSymbol(symbol: string): string {
  return symbol.trim().toUpperCase();
}

function readCache<T>(key: string): T | null {
  const hit = successCache.get(key);
  if (!hit || hit.expires <= Date.now()) {
    if (hit) successCache.delete(key);
    return null;
  }
  return hit.value as T;
}

function writeCache<T>(key: string, value: T, ttlMs: number) {
  successCache.set(key, { expires: Date.now() + ttlMs, value });
}

function apiKey(): string {
  const key = process.env.FINNHUB_API_KEY?.trim();
  if (!key) {
    throw new FinnhubError("Finnhub API key is not configured.", 401);
  }
  return key;
}

async function finnhubGet<T>(path: string, params: Record<string, string>): Promise<T> {
  if (authFailure && authFailure.until > Date.now()) {
    throw new FinnhubError(authFailure.message, 401);
  }

  const url = new URL(`${FINNHUB_BASE}${path}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  url.searchParams.set("token", apiKey());

  const response = await fetch(url, { cache: "no-store" });
  const body = (await response.json().catch(() => null)) as (T & { error?: string }) | null;
  const upstream = body && typeof body === "object" && "error" in body ? String(body.error ?? "") : "";

  if (response.status === 401 || /api key/i.test(upstream)) {
    const message = "Finnhub rejected the API key.";
    authFailure = { message, until: Date.now() + 60_000 };
    throw new FinnhubError(message, 401);
  }

  if (!response.ok || upstream) {
    if (/access|permission|premium/i.test(upstream)) {
      throw new FinnhubError("Price history is not available on this Finnhub plan.", 403);
    }
    throw new FinnhubError("Could not load market data for this symbol.", response.status || 502);
  }

  return body as T;
}

type RawQuote = {
  c?: number;
  dp?: number | null;
  t?: number;
};

type RawProfile = {
  name?: string;
  currency?: string;
  ticker?: string;
};

type RawCandles = {
  c?: number[];
  t?: number[];
  s?: string;
};

async function usdPerUnit(currency: string): Promise<number> {
  const code = currency.trim().toUpperCase();
  if (!code || code === "USD") return 1;
  if (code === "GBX") return (await usdPerUnit("GBP")) / 100;

  const cached = fxCache.get(code);
  if (cached && cached.expires > Date.now()) return cached.value;

  const response = await fetch(
    `${FRANKFURTER_RATES}?base=${encodeURIComponent(code)}&quotes=USD`,
    { cache: "no-store" },
  );
  const data = (await response.json().catch(() => null)) as
    | { quote?: string; rate?: number }[]
    | null;
  const rate = Array.isArray(data) ? data.find((row) => row.quote === "USD")?.rate : null;
  if (!response.ok || !rate || !Number.isFinite(rate)) {
    throw new FinnhubError(`No USD rate for ${code}.`, 502);
  }

  fxCache.set(code, { expires: Date.now() + 60 * 60_000, value: rate });
  return rate;
}

async function getProfile(symbol: string): Promise<RawProfile | null> {
  const cacheKey = `profile:${symbol}`;
  const cached = readCache<RawProfile | null>(cacheKey);
  if (cached !== null) return cached;

  try {
    const profile = await finnhubGet<RawProfile>("/stock/profile2", { symbol });
    const value = profile?.name || profile?.currency ? profile : null;
    writeCache(cacheKey, value, 24 * 60 * 60_000);
    return value;
  } catch (error) {
    if (error instanceof FinnhubError && (error.status === 401 || error.status === 403)) throw error;
    writeCache(cacheKey, null, 10 * 60_000);
    return null;
  }
}

export function publicMarketError(error: unknown): string {
  if (error instanceof FinnhubError) {
    if (error.status === 401 || error.status === 403 || error.status === 404) return error.message;
  }
  return "Could not load market data for this symbol.";
}

type RawSearchHit = {
  description?: string;
  displaySymbol?: string;
  symbol?: string;
  type?: string;
};

const SEARCHABLE_TYPES = new Set(["Common Stock", "ETP", "ETF", "ADR"]);

export async function searchMarketSymbols(
  query: string,
): Promise<{ symbol: string; name: string; kind: "Stock" | "ETF" }[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const cacheKey = `search:${q.toLowerCase()}`;
  const cached = readCache<{ symbol: string; name: string; kind: "Stock" | "ETF" }[]>(cacheKey);
  if (cached) return cached;

  const body = await finnhubGet<{ result?: RawSearchHit[] }>("/search", { q });
  const rows = (body.result ?? [])
    .filter((hit) => hit.symbol && hit.description && SEARCHABLE_TYPES.has(hit.type ?? ""))
    .slice(0, 12)
    .map((hit) => ({
      symbol: (hit.displaySymbol || hit.symbol || "").toUpperCase(),
      name: hit.description?.trim() || hit.symbol || "",
      kind: hit.type === "ETP" || hit.type === "ETF" ? ("ETF" as const) : ("Stock" as const),
    }))
    .filter((hit) => hit.symbol && hit.name);

  writeCache(cacheKey, rows, 60 * 60_000);
  return rows;
}

export async function getMarketQuote(symbolInput: string): Promise<MarketQuote> {
  const symbol = normalizeSymbol(symbolInput);
  if (!symbol) throw new FinnhubError("Enter a ticker symbol.", 400);

  const cacheKey = `quote:${symbol}`;
  const cached = readCache<MarketQuote>(cacheKey);
  if (cached) return cached;

  const [quote, profile] = await Promise.all([
    finnhubGet<RawQuote>("/quote", { symbol }),
    getProfile(symbol),
  ]);

  const quotedPrice = Number(quote.c);
  if (!Number.isFinite(quotedPrice) || quotedPrice <= 0) {
    throw new FinnhubError(`No live price for ${symbol}.`, 404);
  }

  const quotedCurrency = profile?.currency?.trim().toUpperCase() || "USD";
  const priceUsd = quotedPrice * (await usdPerUnit(quotedCurrency));
  const result: MarketQuote = {
    symbol,
    name: profile?.name?.trim() || null,
    priceUsd,
    quotedPrice,
    quotedCurrency,
    changePercent: quote.dp == null || !Number.isFinite(Number(quote.dp)) ? null : Number(quote.dp),
    asOf: quote.t ? new Date(quote.t * 1000).toISOString() : null,
  };

  writeCache(cacheKey, result, 5 * 60_000);
  return result;
}

/** Refresh a quote Finnhub already priced, using a webhook trade price in the listing currency. */
export function rememberTradePrice(symbolInput: string, price: number): boolean {
  const symbol = normalizeSymbol(symbolInput);
  if (!symbol || !Number.isFinite(price) || price <= 0) return false;

  const cacheKey = `quote:${symbol}`;
  const existing = readCache<MarketQuote>(cacheKey);
  if (!existing || existing.quotedPrice <= 0) return false;

  const rate = existing.priceUsd / existing.quotedPrice;
  writeCache(
    cacheKey,
    {
      ...existing,
      quotedPrice: price,
      priceUsd: price * rate,
      asOf: new Date().toISOString(),
    },
    5 * 60_000,
  );
  return true;
}

function monthEndCloses(points: MarketHistoryPoint[]): MarketHistoryPoint[] {
  const byMonth = new Map<string, MarketHistoryPoint>();
  for (const point of points) {
    byMonth.set(point.date.slice(0, 7), point);
  }
  return [...byMonth.values()];
}

async function fetchCandles(symbol: string, resolution: "D" | "W" | "M", from: number, to: number) {
  const body = await finnhubGet<RawCandles>("/stock/candle", {
    symbol,
    resolution,
    from: String(from),
    to: String(to),
  });
  if (body.s !== "ok" || !Array.isArray(body.c) || !Array.isArray(body.t)) return [];

  return body.t
    .map((timestamp, index) => ({
      date: new Date(timestamp * 1000).toISOString().slice(0, 10),
      close: Number(body.c?.[index]),
    }))
    .filter((point) => Number.isFinite(point.close) && point.close > 0);
}

export async function getMarketHistory(symbolInput: string): Promise<MarketHistoryPoint[]> {
  const symbol = normalizeSymbol(symbolInput);
  const cacheKey = `history:${symbol}`;
  const cached = readCache<MarketHistoryPoint[]>(cacheKey);
  if (cached) return cached;

  const to = Math.floor(Date.now() / 1000);
  const from = to - 400 * 24 * 60 * 60;
  let points: MarketHistoryPoint[] = [];

  for (const resolution of ["M", "W", "D"] as const) {
    try {
      points = await fetchCandles(symbol, resolution, from, to);
    } catch (error) {
      if (error instanceof FinnhubError && error.status === 401) throw error;
      points = [];
    }
    if (points.length >= 2) break;
  }

  const monthly = monthEndCloses(points);
  if (monthly.length >= 2) {
    writeCache(cacheKey, monthly, 6 * 60 * 60_000);
  }
  return monthly;
}
