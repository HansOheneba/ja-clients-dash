"use client";

import { GoalCard } from "@/components/goals/goal-card";
import { GoalsAnalyticsSection } from "@/components/goals/goals-analytics";
import { ClientEmptyState } from "@/components/ui/empty-state";
import {
  DashCard,
  DashCardContent,
} from "@/components/ui/dash-card";
import { Muted } from "@/components/ui/typography";
import { useCurrency } from "@/lib/currency-context";
import type { Goal } from "@/lib/data/goals";
import { computeGoalsAnalytics } from "@/lib/data/goals-analytics";

type ClientGoalsViewProps = {
  goals: Goal[];
};

function ClientGoalsView({ goals }: ClientGoalsViewProps) {
  const { format } = useCurrency();
  const { onTrackCount, aheadCount } = computeGoalsAnalytics(goals);
  const onTrack = onTrackCount + aheadCount;

  if (goals.length === 0) {
    return (
      <DashCard>
        <DashCardContent>
          <ClientEmptyState
            variant="goals"
            title="No goals yet"
            description="Your wealth manager has not added goals yet. When they do, target amounts and dates will appear here."
          />
        </DashCardContent>
      </DashCard>
    );
  }

  return (
    <>
      <Muted>
        {onTrack} of {goals.length} goals on track. Your advisor reviews these with you.
      </Muted>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {goals.map((goal) => (
          <GoalCard key={goal.id} goal={goal} variant="client" formatValue={format} />
        ))}
      </div>

      <GoalsAnalyticsSection goals={goals} formatValue={format} />
    </>
  );
}

export { ClientGoalsView };
