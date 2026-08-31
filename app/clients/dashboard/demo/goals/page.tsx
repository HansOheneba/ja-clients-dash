"use client";

import { PageShell } from "@/components/layout/page-shell";
import { GoalCard } from "@/components/goals/goal-card";
import { GoalsAnalyticsSection } from "@/components/goals/goals-analytics";
import { H1, Muted } from "@/components/ui/typography";
import { useCurrency } from "@/lib/currency-context";
import { goals } from "@/lib/data/goals";

export default function ClientGoalsPage() {
  const { format } = useCurrency();

  return (
    <PageShell className="flex flex-col gap-(--spacing-section)">
      <header className="flex flex-col gap-1">
        <H1>My Goals</H1>
        <Muted>
          Sample goals with placeholder amounts. Live client goals are entered by your
          wealth manager on the client record.
        </Muted>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {goals.map((goal) => (
          <GoalCard key={goal.id} goal={goal} variant="client" formatValue={format} />
        ))}
      </div>

      <GoalsAnalyticsSection goals={goals} formatValue={format} />
    </PageShell>
  );
}
