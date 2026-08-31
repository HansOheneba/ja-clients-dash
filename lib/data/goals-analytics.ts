import type { Goal } from "@/lib/data/goals";

export type GoalFundingRow = {
  id: string;
  name: string;
  category: string;
  pct: number;
  gapUSD: number;
  status: Goal["status"];
  probabilityPct: number;
};

export type GoalsAnalytics = {
  totalTargetUSD: number;
  totalCurrentUSD: number;
  totalGapUSD: number;
  overallProgressPct: number;
  avgProbabilityPct: number;
  onTrackCount: number;
  atRiskCount: number;
  inProgressCount: number;
  aheadCount: number;
  fundingByGoal: GoalFundingRow[];
  largestGaps: GoalFundingRow[];
};

function computeGoalsAnalytics(goals: Goal[]): GoalsAnalytics {
  const totalTargetUSD = goals.reduce((s, g) => s + g.targetUSD, 0);
  const totalCurrentUSD = goals.reduce((s, g) => s + g.currentUSD, 0);
  const totalGapUSD = Math.max(0, totalTargetUSD - totalCurrentUSD);
  const overallProgressPct =
    totalTargetUSD > 0 ? Math.round((totalCurrentUSD / totalTargetUSD) * 100) : 0;
  const avgProbabilityPct =
    goals.length > 0
      ? Math.round(goals.reduce((s, g) => s + g.probabilityPct, 0) / goals.length)
      : 0;

  const fundingByGoal: GoalFundingRow[] = goals
    .map((g) => ({
      id: g.id,
      name: g.name,
      category: g.category,
      pct: g.targetUSD > 0 ? Math.min(100, Math.round((g.currentUSD / g.targetUSD) * 100)) : 0,
      gapUSD: Math.max(0, g.targetUSD - g.currentUSD),
      status: g.status,
      probabilityPct: g.probabilityPct,
    }))
    .sort((a, b) => b.pct - a.pct);

  const largestGaps = [...fundingByGoal]
    .filter((g) => g.gapUSD > 0)
    .sort((a, b) => b.gapUSD - a.gapUSD)
    .slice(0, 4);

  return {
    totalTargetUSD,
    totalCurrentUSD,
    totalGapUSD,
    overallProgressPct,
    avgProbabilityPct,
    onTrackCount: goals.filter((g) => g.status === "on-track").length,
    atRiskCount: goals.filter((g) => g.status === "at-risk").length,
    inProgressCount: goals.filter((g) => g.status === "in-progress").length,
    aheadCount: goals.filter((g) => g.status === "ahead").length,
    fundingByGoal,
    largestGaps,
  };
}

export { computeGoalsAnalytics };
