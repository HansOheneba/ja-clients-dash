import { clients, getClientById, type AdvisorClient } from "@/lib/advisor-clients-data";
import { ALL_BUCKETS } from "@/lib/wealth/constants";
import type { PortfolioBucket } from "@/lib/wealth/types";

export type DemoSnapshotInput = {
  bucket: PortfolioBucket;
  previous_value_usd: number;
  current_value_usd: number;
  period_change_pct: number | null;
  ytd_pct: number | null;
  inception_gain_usd: number | null;
  inception_pct: number | null;
  annualized_return_pct: number | null;
};

const ASSET_TO_BUCKET: Record<string, PortfolioBucket> = {
  "Income Portfolio": "income",
  "Growth Portfolio": "growth",
  "Venture Portfolio": "venture",
  "Treasury Portfolio": "treasury",
  "Cash On Account": "coa",
  Cash: "coa",
  Equities: "growth",
  "Fixed Income": "income",
  Commodities: "venture",
  "Digital Assets": "venture",
  "Real Estate": "treasury",
};

const JOHN_DOE_SNAPSHOTS: DemoSnapshotInput[] = [
  {
    bucket: "income",
    previous_value_usd: 625000,
    current_value_usd: 642000,
    period_change_pct: 2.7,
    ytd_pct: 8.1,
    inception_gain_usd: 487838,
    inception_pct: 89,
    annualized_return_pct: 8,
  },
  {
    bucket: "growth",
    previous_value_usd: 462000,
    current_value_usd: 498000,
    period_change_pct: 7.8,
    ytd_pct: 13.2,
    inception_gain_usd: 108000,
    inception_pct: 18.5,
    annualized_return_pct: 8,
  },
  {
    bucket: "venture",
    previous_value_usd: 1548000,
    current_value_usd: 1605000,
    period_change_pct: 3.7,
    ytd_pct: 9.8,
    inception_gain_usd: 135000,
    inception_pct: 9.2,
    annualized_return_pct: 8,
  },
  {
    bucket: "treasury",
    previous_value_usd: 0,
    current_value_usd: 0,
    period_change_pct: null,
    ytd_pct: null,
    inception_gain_usd: 100000,
    inception_pct: 12,
    annualized_return_pct: 8,
  },
  {
    bucket: "coa",
    previous_value_usd: 272521,
    current_value_usd: 259521,
    period_change_pct: null,
    ytd_pct: null,
    inception_gain_usd: null,
    inception_pct: null,
    annualized_return_pct: null,
  },
];

function emptySnapshot(bucket: PortfolioBucket): DemoSnapshotInput {
  return {
    bucket,
    previous_value_usd: 0,
    current_value_usd: 0,
    period_change_pct: null,
    ytd_pct: null,
    inception_gain_usd: null,
    inception_pct: null,
    annualized_return_pct: null,
  };
}

function parseYtd(value: string): number | null {
  if (!value || value === "N/A") return null;
  const n = Number(value.replace("%", "").replace("+", "").trim());
  return Number.isFinite(n) ? n : null;
}

function snapshotsFromClient(client: AdvisorClient): DemoSnapshotInput[] {
  if (client.id === "john-doe") return JOHN_DOE_SNAPSHOTS.map((row) => ({ ...row }));

  const byBucket = new Map<PortfolioBucket, DemoSnapshotInput>(
    ALL_BUCKETS.map((bucket) => [bucket, emptySnapshot(bucket)]),
  );

  const last = client.portfolio.history.at(-1)?.value ?? client.portfolio.total;
  const previousTotal =
    client.portfolio.history.at(-2)?.value ?? client.portfolio.inceptionValue;
  const ratio = last > 0 ? previousTotal / last : 1;

  for (const asset of client.portfolio.assets) {
    const bucket = ASSET_TO_BUCKET[asset.name];
    if (!bucket) continue;
    const row = byBucket.get(bucket) ?? emptySnapshot(bucket);
    const current = row.current_value_usd + asset.value;
    const ytd = parseYtd(asset.ytd);
    row.current_value_usd = current;
    row.previous_value_usd = Math.round(current * ratio);
    row.ytd_pct = ytd;
    row.period_change_pct = ytd;
    const inceptionShare = client.portfolio.inceptionValue * (asset.allocation / 100);
    row.inception_gain_usd = Math.round(current - inceptionShare);
    row.inception_pct =
      inceptionShare > 0
        ? Math.round(((current - inceptionShare) / inceptionShare) * 1000) / 10
        : null;
    row.annualized_return_pct = ytd == null ? null : 8;
    byBucket.set(bucket, row);
  }

  return ALL_BUCKETS.map((bucket) => byBucket.get(bucket) ?? emptySnapshot(bucket));
}

export function listDemoReportClients() {
  return clients.map((client) => ({
    id: client.id,
    name: client.name,
    initials: client.initials,
    status: client.status,
    aum: client.portfolio.total,
  }));
}

export function getDemoSnapshots(clientId: string): DemoSnapshotInput[] {
  const client = getClientById(clientId);
  if (!client) throw new Error("Demo client not found");
  return snapshotsFromClient(client);
}
