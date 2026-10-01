import { AdvisorOverview } from "@/components/advisors/advisor-overview";
import { advisorSurface } from "@/components/advisors/advisor-surface";
import { PageShell } from "@/components/layout/page-shell";
import {
  aggregateAttentionGroups,
  enforceReviewDueStatus,
  getAttentionFeed,
  getBookAllocation,
  getBookAumHistory,
  getClientPrimaryBuckets,
  listClientsExtended,
  listOutstandingReports,
  listRecentBookActivity,
  listUpcomingSessions,
} from "@/lib/wealth/wm-queries";
import { requireAdvisor } from "@/lib/wealth/session";

function attentionBreakdownLabel(groups: ReturnType<typeof aggregateAttentionGroups>) {
  const reports = groups
    .filter((g) => g.key.includes("statements"))
    .reduce((sum, g) => sum + g.count, 0);
  const reviews = groups.find((g) => g.key === "reviews")?.count ?? 0;
  const other = groups
    .filter((g) => !g.key.includes("statements") && g.key !== "reviews")
    .reduce((sum, g) => sum + g.count, 0);

  const parts: string[] = [];
  if (reports > 0) parts.push(`${reports} reports`);
  if (reviews > 0) parts.push(`${reviews} reviews`);
  if (other > 0) parts.push(`${other} other items`);
  return parts.join(" · ");
}

function bookWeightedYtd(clients: { aum: number; period_return_pct: number | null }[]) {
  let weighted = 0;
  let weight = 0;
  for (const client of clients) {
    if (client.period_return_pct == null || client.aum <= 0) continue;
    weighted += client.period_return_pct * client.aum;
    weight += client.aum;
  }
  if (weight <= 0) return null;
  return weighted / weight;
}

export default async function AdvisorDashboardPage() {
  const session = await requireAdvisor();
  await enforceReviewDueStatus();

  const advisorId = session.profile.advisor_id;
  const [
    clients,
    attentionItems,
    outstanding,
    aumHistory,
    allocation,
    primaryBuckets,
    upcomingSessions,
    recentActivity,
  ] = await Promise.all([
    listClientsExtended(advisorId),
    getAttentionFeed(advisorId),
    listOutstandingReports(advisorId),
    getBookAumHistory(advisorId),
    getBookAllocation(advisorId),
    getClientPrimaryBuckets(advisorId),
    listUpcomingSessions(advisorId, 4),
    listRecentBookActivity(advisorId, 6),
  ]);

  const attentionGroups = aggregateAttentionGroups(attentionItems, outstanding);
  const attentionTotal = attentionGroups.reduce((sum, g) => sum + g.count, 0);
  const firstName = session.profile.full_name?.split(" ")[0] ?? "there";
  const primaryBucketRecord = Object.fromEntries(primaryBuckets);

  return (
    <PageShell className={advisorSurface.pageGap}>
      <AdvisorOverview
        firstName={firstName}
        clients={clients}
        primaryBuckets={primaryBucketRecord}
        aumHistory={aumHistory}
        allocation={allocation}
        attentionTotal={attentionTotal}
        attentionBreakdown={attentionBreakdownLabel(attentionGroups)}
        attentionGroups={attentionGroups}
        upcomingSessions={upcomingSessions}
        recentActivity={recentActivity}
        ytdPct={bookWeightedYtd(clients)}
      />
    </PageShell>
  );
}
