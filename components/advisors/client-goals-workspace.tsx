"use client";

import { useCallback, useEffect, useState } from "react";

import { AddGoalSheet } from "@/components/advisors/add-goal-sheet";
import { AdvisorGoalCard } from "@/components/advisors/advisor-goal-card";
import {
  goalFormToPayload,
  type GoalFormState,
} from "@/components/advisors/goal-form-fields";
import { GoalsAnalyticsSection } from "@/components/goals/goals-analytics";
import { Muted } from "@/components/ui/typography";
import { PageSpinner } from "@/components/ui/page-spinner";
import { formatUsd } from "@/lib/wealth/constants";
import { clientGoalToGoal } from "@/lib/wealth/goals";
import type { ClientGoal } from "@/lib/wealth/types";

function formatGoalUsd(usd: number, opts?: { compact?: boolean }) {
  if (opts?.compact) {
    if (usd >= 1_000_000) return `$${(usd / 1_000_000).toFixed(2)}m`;
    if (usd >= 1_000) return `$${(usd / 1_000).toFixed(1)}k`;
  }
  return formatUsd(usd);
}

type ClientGoalsWorkspaceProps = {
  clientId: string;
  clientName: string;
};

async function readError(res: Response) {
  const data = await res.json().catch(() => ({}));
  return data.error ?? "Could not save goal";
}

function ClientGoalsWorkspace({ clientId, clientName }: ClientGoalsWorkspaceProps) {
  const [goals, setGoals] = useState<ClientGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch(`/api/clients/${clientId}/goals`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not load goals");
      setGoals(data.goals ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load goals");
      setGoals([]);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    load();
  }, [load]);

  async function createGoal(values: GoalFormState) {
    const res = await fetch(`/api/clients/${clientId}/goals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(goalFormToPayload(values)),
    });
    if (!res.ok) throw new Error(await readError(res));
    await load();
  }

  async function saveGoal(goalId: string, values: GoalFormState) {
    const res = await fetch(`/api/clients/${clientId}/goals/${goalId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(goalFormToPayload(values)),
    });
    if (!res.ok) throw new Error(await readError(res));
    await load();
  }

  async function removeGoal(goalId: string) {
    const res = await fetch(`/api/clients/${clientId}/goals/${goalId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error(await readError(res));
    await load();
  }

  const uiGoals = goals.map(clientGoalToGoal);

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <Muted className="max-w-xl">
          Each Add goal creates one goal: name, target amount, current amount, and
          date. Add as many as you need. This is what the client sees on My Goals.
        </Muted>
        <AddGoalSheet clientName={clientName} onCreate={createGoal} />
      </div>

      {loading ? <PageSpinner /> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {!loading && goals.length === 0 ? (
        <Muted>No goals yet. Add the first one, then add more if they have several.</Muted>
      ) : null}

      {!loading && goals.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {goals.map((goal) => (
              <AdvisorGoalCard
                key={goal.id}
                goal={goal}
                formatValue={formatGoalUsd}
                onSave={(values) => saveGoal(goal.id, values)}
                onRemove={() => removeGoal(goal.id)}
              />
            ))}
          </div>
          <GoalsAnalyticsSection goals={uiGoals} formatValue={formatGoalUsd} />
        </>
      ) : null}
    </div>
  );
}

export { ClientGoalsWorkspace };
