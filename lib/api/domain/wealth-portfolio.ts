import {
  getClientAddress,
  getClientById,
  getPortfolioHistory,
  getPortfolioSnapshots,
  getStatementPeriodsForClient,
  listClients,
} from "@/lib/wealth/queries";
import { BUCKET_LABELS } from "@/lib/wealth/constants";
import type { PortfolioBucket } from "@/lib/wealth/types";
import { JOHN_DOE_CLIENT_ID } from "@/lib/wealth/types";

export interface JaBucketOverview {
  id: PortfolioBucket;
  label: string;
  totalUSD: number;
  allocationPct: number;
  ytdPct: number | null;
  history: { month: string; value: number }[];
}

export interface JaPortfolioSummary {
  totalUSD: number;
  periodGainUsd: number;
  periodReturnPct: number;
  ytdPct: number;
  buckets: JaBucketOverview[];
  history: { month: string; value: number }[];
}

export async function getJaPortfolioForClient(
  clientId: string = JOHN_DOE_CLIENT_ID,
): Promise<JaPortfolioSummary | null> {
  const periods = await getStatementPeriodsForClient(clientId);
  if (periods.length === 0) return null;

  const period = periods[0];
  const [snapshots, history] = await Promise.all([
    getPortfolioSnapshots(clientId, period.id),
    getPortfolioHistory(clientId),
  ]);

  const totalUSD = snapshots.reduce((s, snap) => s + snap.current_value_usd, 0);
  const invested = snapshots.filter((s) => s.bucket !== "coa");
  const previousInvested = invested.reduce((s, snap) => s + snap.previous_value_usd, 0);
  const currentInvested = invested.reduce((s, snap) => s + snap.current_value_usd, 0);
  const periodGainUsd = currentInvested - previousInvested;
  const periodReturnPct =
    previousInvested > 0 ? (periodGainUsd / previousInvested) * 100 : 0;
  const ytdValues = snapshots
    .map((s) => s.ytd_pct)
    .filter((v): v is number => v != null);
  const ytdPct =
    ytdValues.length > 0
      ? ytdValues.reduce((a, b) => a + b, 0) / ytdValues.length
      : periodReturnPct;

  const buckets: JaBucketOverview[] = snapshots.map((snap) => ({
    id: snap.bucket,
    label: BUCKET_LABELS[snap.bucket],
    totalUSD: snap.current_value_usd,
    allocationPct: totalUSD > 0 ? (snap.current_value_usd / totalUSD) * 100 : 0,
    ytdPct: snap.ytd_pct,
    history: [],
  }));

  const consolidatedHistory = history.map((h) => ({
    month: new Date(h.recorded_on).toLocaleDateString("en-GB", { month: "short", year: "2-digit" }),
    value: h.total_value_usd,
  }));

  return { totalUSD, periodGainUsd, periodReturnPct, ytdPct, buckets, history: consolidatedHistory };
}

export async function getJaClientProfile(clientId: string = JOHN_DOE_CLIENT_ID) {
  const [client, address] = await Promise.all([
    getClientById(clientId),
    getClientAddress(clientId),
  ]);
  if (!client) return null;

  return {
    fullName: client.full_name,
    clientNumber: client.client_number,
    referenceCode: client.client_number,
    email: client.email,
    currency: client.currency,
    address: address
      ? `${address.line1}, ${address.city}${address.region ? `, ${address.region}` : ""} ${address.postal_code ?? ""}`.trim()
      : null,
  };
}

export async function getJaClients() {
  const clients = await listClients();
  return clients.map((c) => ({
    id: c.id,
    name: c.full_name,
    email: c.email,
    clientNumber: c.client_number,
  }));
}

export { JOHN_DOE_CLIENT_ID, JOHN_DOE_PERIOD_ID } from "@/lib/wealth/types";
