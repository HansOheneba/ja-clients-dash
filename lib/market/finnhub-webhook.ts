import { timingSafeEqual } from "node:crypto";

import { rememberTradePrice } from "@/lib/market/finnhub";

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function symbolFrom(record: Record<string, unknown>): string | null {
  for (const key of ["s", "symbol", "ticker"]) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

function priceFrom(record: Record<string, unknown>): number | null {
  for (const key of ["p", "price", "lastPrice"]) {
    const value = Number(record[key]);
    if (Number.isFinite(value) && value > 0) return value;
  }
  return null;
}

export function finnhubWebhookAuthorized(provided: string | null): boolean {
  const expected = process.env.FINNHUB_WEBHOOK_SECRET?.trim() ?? "";
  const header = provided?.trim() ?? "";
  if (!expected || !header) return false;

  const expectedBuf = Buffer.from(expected);
  const headerBuf = Buffer.from(header);
  if (expectedBuf.length !== headerBuf.length) return false;
  return timingSafeEqual(expectedBuf, headerBuf);
}

/** Apply any trade prices in a Finnhub webhook body. Safe to run after the 2xx response. */
export function ingestFinnhubWebhook(raw: string) {
  let parsed: unknown = null;
  try {
    parsed = raw.trim() ? JSON.parse(raw) : null;
  } catch {
    console.info("Finnhub webhook acknowledged: unparsed body");
    return;
  }

  const root = asRecord(parsed);
  const items = Array.isArray(root?.data) ? root.data : root ? [root] : [];
  let updated = 0;

  for (const item of items) {
    const record = asRecord(item);
    if (!record) continue;
    const symbol = symbolFrom(record);
    const price = priceFrom(record);
    if (symbol && price != null && rememberTradePrice(symbol, price)) updated += 1;
  }

  const type = typeof root?.type === "string" ? root.type : "event";
  console.info(`Finnhub webhook acknowledged: ${type}, prices updated: ${updated}`);
}
